#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
app.py - 도시 이름으로 날씨(기온, 강수확률) + 대기질(PM2.5)을 조회해서
          "지금 외출해도 되는지" 한 줄로 판정해주는 스크립트.

사용한 공개 API (Open-Meteo, API 키 불필요):
  1) Geocoding API      : https://geocoding-api.open-meteo.com/v1/search
  2) Weather Forecast API: https://api.open-meteo.com/v1/forecast
  3) Air Quality API     : https://air-quality-api.open-meteo.com/v1/air-quality

설계 포인트:
  - 날씨 API와 대기질 API는 서로 무관하므로 스레드로 "동시에" 호출한다.
  - 모든 네트워크 호출에는 (연결, 응답) 타임아웃을 걸어서, 한쪽 API가
    느리거나 응답이 없어도 프로그램이 멈추지 않고 나머지 정보만으로 계속 진행한다.
  - 실패/타임아웃난 항목은 "정보 없음"으로 표시하고, 나머지 값으로 최대한 판정한다.

사용법:
  python app.py 서울
  python app.py            # 실행 후 도시 이름을 입력하라는 프롬프트가 뜸
"""

import sys
import argparse
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

import requests

# Windows 콘솔(cp949 등)에서도 한글/특수문자(µ 등) 출력이 깨지거나 죽지 않도록 강제로 UTF-8 사용.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

# (connect timeout, read timeout) 초 단위. 응답이 늦어도 이 시간이 지나면 포기하고 계속 진행한다.
REQUEST_TIMEOUT = (3, 5)
# 스레드 결과를 기다리는 최대 시간(REQUEST_TIMEOUT보다 넉넉하게 잡아 안전장치 역할만 함)
FUTURE_TIMEOUT = 10

# Open-Meteo 지오코딩 API는 GeoNames 기반이라 한글 지명을 거의 인식하지 못하고
# 로마자(영문) 표기만 검색된다. 자주 쓰는 한글 도시명은 영문으로 미리 매핑해준다.
KOREAN_CITY_ALIASES = {
    "서울": "Seoul", "서울특별시": "Seoul",
    "부산": "Busan", "부산광역시": "Busan",
    "인천": "Incheon", "인천광역시": "Incheon",
    "대구": "Daegu", "대구광역시": "Daegu",
    "대전": "Daejeon", "대전광역시": "Daejeon",
    "광주": "Gwangju", "광주광역시": "Gwangju",
    "울산": "Ulsan", "울산광역시": "Ulsan",
    "세종": "Sejong", "제주": "Jeju", "제주도": "Jeju",
    "수원": "Suwon", "성남": "Seongnam", "고양": "Goyang",
    "용인": "Yongin", "청주": "Cheongju", "전주": "Jeonju",
    "천안": "Cheonan", "안양": "Anyang", "포항": "Pohang",
    "창원": "Changwon", "김해": "Gimhae", "춘천": "Chuncheon",
    "강릉": "Gangneung", "여수": "Yeosu", "목포": "Mokpo",
    "도쿄": "Tokyo", "오사카": "Osaka", "후쿠오카": "Fukuoka",
    "뉴욕": "New York", "런던": "London", "파리": "Paris",
    "베이징": "Beijing", "상하이": "Shanghai", "방콕": "Bangkok",
}


def geocode_city(city_name):
    """도시 이름 -> (표시이름, 위도, 경도). 실패 시 None."""
    query = KOREAN_CITY_ALIASES.get(city_name.strip(), city_name)
    contains_hangul = any("가" <= ch <= "힣" for ch in city_name)

    for params in (
        {"name": query, "count": 1, "language": "ko", "format": "json"},
        {"name": query, "count": 1, "format": "json"},  # ko 검색 실패 시 기본 언어로 재시도
    ):
        try:
            resp = requests.get(GEOCODING_URL, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            results = resp.json().get("results")
            if results:
                r = results[0]
                display = r.get("name")
                if r.get("admin1") and r.get("admin1") != display:
                    display = f"{display} ({r['admin1']})"
                if r.get("country"):
                    display = f"{display}, {r['country']}"
                return display, r["latitude"], r["longitude"]
        except requests.exceptions.RequestException as e:
            print(f"[경고] 위치 검색 중 오류: {e}", file=sys.stderr)

    if contains_hangul and query == city_name:
        print(
            "[안내] 이 도시의 한글 지명은 인식하지 못했습니다. "
            "영문(로마자) 이름으로 다시 시도해 보세요. 예: Seoul, Busan, Tokyo",
            file=sys.stderr,
        )
    return None


def fetch_weather(lat, lon):
    """기온(현재), 강수확률(현재 시각대)을 담은 dict. 실패/타임아웃 시 None."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m",
        "hourly": "precipitation_probability",
        "timezone": "auto",
        "forecast_days": 1,
    }
    try:
        resp = requests.get(WEATHER_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        temperature = data.get("current", {}).get("temperature_2m")

        # 강수확률은 hourly로만 제공되므로, 현재 시각과 같은 시간대 값을 찾는다.
        precip_prob = None
        current_time = data.get("current", {}).get("time")  # 예: "2026-08-19T13:15"
        hourly = data.get("hourly", {})
        hourly_times = hourly.get("time", [])
        hourly_probs = hourly.get("precipitation_probability", [])
        if current_time and hourly_times:
            current_hour = current_time[:13]  # "YYYY-MM-DDTHH"
            for t, p in zip(hourly_times, hourly_probs):
                if t[:13] == current_hour:
                    precip_prob = p
                    break
        if precip_prob is None and hourly_probs:
            precip_prob = hourly_probs[0]  # 못 찾으면 첫 값으로 대체

        return {"temperature": temperature, "precipitation_probability": precip_prob}
    except requests.exceptions.RequestException as e:
        print(f"[경고] 날씨 정보를 가져오지 못했습니다(계속 진행합니다): {e}", file=sys.stderr)
        return None


def fetch_air_quality(lat, lon):
    """PM2.5 농도를 담은 dict. 실패/타임아웃 시 None."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "pm2_5",
        "timezone": "auto",
    }
    try:
        resp = requests.get(AIR_QUALITY_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        pm25 = data.get("current", {}).get("pm2_5")
        return {"pm2_5": pm25}
    except requests.exceptions.RequestException as e:
        print(f"[경고] 대기질 정보를 가져오지 못했습니다(계속 진행합니다): {e}", file=sys.stderr)
        return None


def fetch_all(lat, lon):
    """날씨 API와 대기질 API를 동시에 호출. 한쪽이 늦어도 다른 쪽을 기다리며 멈추지 않는다."""
    with ThreadPoolExecutor(max_workers=2) as executor:
        weather_future = executor.submit(fetch_weather, lat, lon)
        air_future = executor.submit(fetch_air_quality, lat, lon)

        try:
            weather = weather_future.result(timeout=FUTURE_TIMEOUT)
        except FutureTimeoutError:
            print("[경고] 날씨 응답이 너무 늦어 건너뜁니다.", file=sys.stderr)
            weather = None

        try:
            air_quality = air_future.result(timeout=FUTURE_TIMEOUT)
        except FutureTimeoutError:
            print("[경고] 대기질 응답이 너무 늦어 건너뜁니다.", file=sys.stderr)
            air_quality = None

    return weather, air_quality


def grade_pm25(pm25):
    """PM2.5(㎍/㎥) -> (등급, 점수). 점수가 높을수록 나쁨. (한국 환경부 기준 근사치)"""
    if pm25 is None:
        return None, 0
    if pm25 <= 15:
        return "좋음", 0
    if pm25 <= 35:
        return "보통", 1
    if pm25 <= 75:
        return "나쁨", 2
    return "매우 나쁨", 3


def grade_precip(prob):
    """강수확률(%) -> (등급, 점수)."""
    if prob is None:
        return None, 0
    if prob >= 70:
        return "높음", 2
    if prob >= 40:
        return "보통", 1
    return "낮음", 0


def grade_temperature(temp):
    """기온(℃) -> (등급, 점수). 폭염/한파만 걸러내는 용도."""
    if temp is None:
        return None, 0
    if temp >= 33 or temp <= -10:
        return "위험", 2
    if temp >= 28 or temp <= 0:
        return "주의", 1
    return "쾌적", 0


def judge(weather, air_quality):
    """모은 정보를 바탕으로 최종 한 줄 판정을 만든다."""
    temperature = weather.get("temperature") if weather else None
    precip_prob = weather.get("precipitation_probability") if weather else None
    pm25 = air_quality.get("pm2_5") if air_quality else None

    pm25_grade, pm25_score = grade_pm25(pm25)
    precip_grade, precip_score = grade_precip(precip_prob)
    temp_grade, temp_score = grade_temperature(temperature)

    total_score = pm25_score + precip_score + temp_score
    have_any_data = any(v is not None for v in (temperature, precip_prob, pm25))

    if not have_any_data:
        verdict = "❓ 판정 불가 (모든 API 응답을 받지 못했습니다)"
    elif total_score >= 3:
        verdict = "🔴 외출 비추천 — 실내에 머무는 것을 권장합니다."
    elif total_score >= 1:
        verdict = "🟡 외출 가능하나 주의 필요 (마스크/우산 등 대비하세요)."
    else:
        verdict = "🟢 외출하기 좋은 날씨입니다."

    return verdict, {
        "temperature": temperature,
        "temp_grade": temp_grade,
        "precipitation_probability": precip_prob,
        "precip_grade": precip_grade,
        "pm2_5": pm25,
        "pm25_grade": pm25_grade,
    }


def fmt(value, unit="", grade=None, none_label="정보 없음(응답 지연/실패)"):
    if value is None:
        return none_label
    text = f"{value}{unit}"
    if grade:
        text += f" ({grade})"
    return text


def main():
    parser = argparse.ArgumentParser(description="도시 이름으로 날씨/대기질을 조회해 외출 가능 여부를 판정합니다.")
    parser.add_argument("city", nargs="?", help="도시 이름 (예: 서울, Tokyo, New York)")
    args = parser.parse_args()

    city_name = args.city or input("도시 이름을 입력하세요: ").strip()
    if not city_name:
        print("도시 이름이 입력되지 않았습니다.", file=sys.stderr)
        sys.exit(1)

    location = geocode_city(city_name)
    if location is None:
        print(f"'{city_name}'의 위치 정보를 찾을 수 없습니다. (검색 실패 또는 응답 없음)", file=sys.stderr)
        sys.exit(1)

    display_name, lat, lon = location
    print(f"\n[위치] {display_name}  (위도 {lat}, 경도 {lon})")

    weather, air_quality = fetch_all(lat, lon)
    verdict, details = judge(weather, air_quality)

    print(f"[기온] {fmt(details['temperature'], '℃', details['temp_grade'])}")
    print(f"[강수확률] {fmt(details['precipitation_probability'], '%', details['precip_grade'])}")
    print(f"[PM2.5] {fmt(details['pm2_5'], 'µg/㎥', details['pm25_grade'])}")
    print(f"\n>>> {verdict}\n")


if __name__ == "__main__":
    main()
