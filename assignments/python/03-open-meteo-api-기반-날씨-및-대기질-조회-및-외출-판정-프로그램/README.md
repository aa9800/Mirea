# Open-Meteo API 기반 날씨 및 대기질 조회 및 외출 판정 프로그램

- 과목: Python
- 날짜: 2026-08-19
- 태그: python, requests, api, open-meteo, multithreading

## 설명

Open-Meteo 공개 API 및 Python의 requests 라이브러리를 활용하여 특정 도시의 위치 정보, 날씨 예보, 대기질 데이터를 조회하는 학습 과제입니다. 기초적인 HTTP GET 요청 및 JSON 응답 데이터 파싱 과정부터 시작하여, 도시 이름을 좌표로 변환하는 지오코딩 API 활용법을 실습합니다. 나아가 ThreadPoolExecutor를 이용해 날씨 API와 대기질 API를 병렬로 동시 호출하고 타임아웃 예외 처리를 적용했습니다. 네트워크 지연이나 장애 발생 시에도 프로그램이 멈추지 않도록 안전장치를 마련하고 정보를 부분적으로 활용하게 구성했습니다. 최종적으로 기온, 강수확률, 미세먼지 수치를 종합 계산하여 외출 적합성을 한 줄로 자동 판정하는 CLI 애플리케이션을 완성했습니다.

## 원본 파일

업로드한 프로젝트의 원본 파일 10개가 폴더 구조 그대로 [source/](./source/)에 보관되어 있습니다.

- [air.py](./source/air.py)
- [air.py](./source/air.py)
- [app.py](./source/app.py)
- [app.py](./source/app.py)
- [first_call.py](./source/first_call.py)
- [first_call.py](./source/first_call.py)
- [show_json.py](./source/show_json.py)
- [show_json.py](./source/show_json.py)
- [weather.py](./source/weather.py)
- [weather.py](./source/weather.py)

## 코드

<details>
<summary><strong>air.py</strong> — Open-Meteo 지오코딩 API와 대기질 API를 호출하여 입력받은 도시의 미세먼지(PM2.5, PM10) 농도를 조회하는 스크립트입니다. PM2.5 농도 수치를 기반으로 GOOD, CAUTION, BAD 3단계 등급을 판정하여 출력합니다.</summary>

```python
import sys
import requests

GEO = "https://geocoding-api.open-meteo.com/v1/search"          # 도시이름 -> 좌표 변환용 API
AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"   # 미세먼지/대기질 데이터 받는 API
TIMEOUT = 5  # 5초 넘으면 그냥 포기

def find_city(name):
    r = requests.get(GEO, params={"name": name, "count": 1}, timeout=TIMEOUT)
    hit = r.json()["results"][0]  # 검색결과 여러개 나올수도 있는데 그냥 첫번째꺼 씀
    return hit["latitude"], hit["longitude"], hit["name"] + ", " + hit["country_code"]
    # 위도, 경도, "도시이름, 국가코드" 형태로 묶어서 반환

# 인자로 도시 넘기면 그거 쓰고 아니면 그냥 서울 기본값
city = sys.argv[1] if len(sys.argv) > 1 else "Seoul"
lat, lon, label = find_city(city)

params = {"latitude": lat, "longitude":lon, "current": "pm2_5,pm10"}
cur = requests.get(AIR, params=params, timeout=TIMEOUT).json()["current"]

pm25 = cur["pm2_5"]
grade="GOOD" if pm25 <= 15 else ("CAUTION" if pm25 <= 35 else "BAD")

print("city     :", label)
print("pm2.5        :", pm25, "ug/m3")
print("pm10     :", cur["pm10"], "ug/m3")
print("grade     :", grade)
```

</details>

<details>
<summary><strong>app.py</strong> — 날씨 API와 대기질 API를 ThreadPoolExecutor로 병렬 호출하고 타임아웃 및 한글 도시명 매핑을 처리하는 종합 CLI 애플리케이션입니다. 수집된 기온, 강수확률, PM2.5 수치를 종합 평가하여 최종 외출 가능 여부를 판정해 줍니다.</summary>

```python
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
```

</details>

<details>
<summary><strong>first_call.py</strong> — requests 라이브러리를 이용해 Open-Meteo 예보 API에 첫 HTTP GET 요청을 보내보는 기초 입문 스크립트입니다. 응답 상태 코드(status_code), 성공 여부(ok), 응답 본문 텍스트의 일부를 확인합니다.</summary>

```python
import requests #http요청을 보내기 위한 requests라이브러리 불러오기

URL = "https://api.open-meteo.com/v1/forecast"
params={
    "latitude": 37.55,
    "longitude": 127.0,
    "current": "temperature_2m, precipitation"
}
#api요청시 함께 보낼 파라미터들을 딕셔너리로 정의한다.

r = requests.get(URL, params=params, timeout=5)
#requests.get()으로 실제 get 요청을 보낸다.

print("status code : ", r.status_code)
#서버가 응답한 HTTP상태 코드를 출력합니다.
print("ok?      :", r.ok)
#r.ok는 상태 코드가 200~399사이이면 True, 아니면 false 를 반환
print("first 60 ch :", r.text[:60])
#서버가 응답으로 보낸 본문을 텍스트로 가져와서 그중 앞부분 60글자 출력. 에러메시지인지 확인하기 위함
```

</details>

<details>
<summary><strong>show_json.py</strong> — API 응답으로 전달받은 JSON 데이터를 파싱하고 json.dumps를 사용하여 들여쓰기가 적용된 형태로 구조화하여 출력하는 실습 코드입니다. 'current' 키 내부의 기온 데이터에 접근하여 값을 출력합니다.</summary>

```python
import requests  # http 요청을 보내기 위한 requests 라이브러리 불러오기
import json       # json 데이터를 보기 좋게 출력하기 위한 라이브러리

URL = "https://api.open-meteo.com/v1/forecast" # 요ㅕ청을 보낼 api주소를 url이라는 변수에 문자열로 저장한다
params={
    "latitude": 37.55,
    "longitude": 127.0,
    "current": "temperature_2m,precipitation"
}
#api에 함꼐 보낼 조건들을 {}로 정의한다
r= requests.get(URL, params=params, timeout=5)
#실제로 get 방식 http 요청을 보내는 줄
data=r.json()
#응답본몬 r이 json형태로 되어있는데 이를 파이썬이 다루기 쉬운 딕셔너리 형태로 변환해 data 저장하는 내용

print("key      :", list(data.keys()))#data가 가지고 있는 키 목록 반환, data안에 정보 확인 및 "current"키 존재 확인

print("current box: ")#다음 줄에 출력될 내용이 "current"관련 데이터 안내문구
print(json.dumps(data["current"], indent=2))#data딕셔너리에서"current"라는 키에 해당하는 값 꺼내기, 문자열 변환하되 들여쓰기 2칸적용
print("temperature :", data["current"]["temperature_2m"], "C")
```

</details>

<details>
<summary><strong>weather.py</strong> — 도시 이름을 입력받아 지오코딩 API로 위도와 경도를 얻은 후, 해당 좌표의 현재 기온과 강수확률을 조회하는 스크립트입니다. Command Line Argument가 주어지지 않을 경우 기본값으로 'Seoul'을 조회합니다.</summary>

```python
import sys
import requests

GEO = "https://geocoding-api.open-meteo.com/v1/search"  # 도시이름 -> 좌표 변환용 API
FORECAST = "https://api.open-meteo.com/v1/forecast"      # 진짜 날씨 데이터 받는 API
TIMEOUT = 5  # 5초 넘으면 그냥 포기


def find_city(name):
    """도시 이름 넣으면 위도 경도 이름 튜플로 반환해줌"""
    r = requests.get(GEO, params={"name": name, "count": 1}, timeout=TIMEOUT)
    hit = r.json()["results"][0]  # 검색결과 여러개 나올수도 있는데 그냥 첫번째꺼 씀

    label = hit["name"] + ", " + hit["country_code"]  # "Seoul, KR" 이런식으로 만들기

    return hit["latitude"], hit["longitude"], label


# 인자로 도시 넘기면 그거 쓰고 아니면 그냥 서울 기본값
city = sys.argv[1] if len(sys.argv) > 1 else "Seoul"
lat, lon, label = find_city(city)

params = {
    "latitude": lat,
    "longitude": lon,
    "current": "temperature_2m",              # 현재 기온
    "hourly": "precipitation_probability",    # 시간별 강수확률
    "forecast_days": 1,                       # 하루치만 받으면 충분함
}

r = requests.get(FORECAST, params=params, timeout=TIMEOUT)
data = r.json()

temp = data["current"]["temperature_2m"]
rain = data["hourly"]["precipitation_probability"][0]  # 일단 제일 가까운 시간대 값만

print("city     :", label)
print("temperature", temp, "C")
print("rain", rain, "%")
```

</details>

<details>
<summary><strong>air.py</strong> — 도시 이름을 입력받아 지오코딩 API로 위치 좌표를 얻고, Air Quality API를 호출하여 초미세먼지(PM2.5)와 미세먼지(PM10) 수치를 조회한 뒤 등급을 평가하여 출력합니다.</summary>

```python
import sys
import requests

GEO = "https://geocoding-api.open-meteo.com/v1/search"          # 도시이름 -> 좌표 변환용 API
AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"   # 미세먼지/대기질 데이터 받는 API
TIMEOUT = 5  # 5초 넘으면 그냥 포기

def find_city(name):
    r = requests.get(GEO, params={"name": name, "count": 1}, timeout=TIMEOUT)
    hit = r.json()["results"][0]  # 검색결과 여러개 나올수도 있는데 그냥 첫번째꺼 씀
    return hit["latitude"], hit["longitude"], hit["name"] + ", " + hit["country_code"]
    # 위도, 경도, "도시이름, 국가코드" 형태로 묶어서 반환

# 인자로 도시 넘기면 그거 쓰고 아니면 그냥 서울 기본값
city = sys.argv[1] if len(sys.argv) > 1 else "Seoul"
lat, lon, label = find_city(city)

params = {"latitude": lat, "longitude":lon, "current": "pm2_5,pm10"}
cur = requests.get(AIR, params=params, timeout=TIMEOUT).json()["current"]

pm25 = cur["pm2_5"]
grade="GOOD" if pm25 <= 15 else ("CAUTION" if pm25 <= 35 else "BAD")

print("city     :", label)
print("pm2.5        :", pm25, "ug/m3")
print("pm10     :", cur["pm10"], "ug/m3")
print("grade     :", grade)
```

</details>

<details>
<summary><strong>app.py</strong> — 한글 도시명 매핑, 멀티스레딩 병렬 API 호출, 타임아웃 예외 처리를 적용하여 기온, 강수확률, 미세먼지 농도를 바탕으로 외출 가능 여부를 종합 판정하는 실용 스크립트입니다.</summary>

```python
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
```

</details>

<details>
<summary><strong>first_call.py</strong> — requests 라이브러리를 사용하여 Open-Meteo Forecast API에 기본적인 HTTP GET 요청을 보내고, 응답 상태 코드 및 본문 텍스트를 확인하는 입문 예제입니다.</summary>

```python
import requests #http요청을 보내기 위한 requests라이브러리 불러오기

URL = "https://api.open-meteo.com/v1/forecast"
params={
    "latitude": 37.55,
    "longitude": 127.0,
    "current": "temperature_2m, precipitation"
}
#api요청시 함께 보낼 파라미터들을 딕셔너리로 정의한다.

r = requests.get(URL, params=params, timeout=5)
#requests.get()으로 실제 get 요청을 보낸다.

print("status code : ", r.status_code)
#서버가 응답한 HTTP상태 코드를 출력합니다.
print("ok?      :", r.ok)
#r.ok는 상태 코드가 200~399사이이면 True, 아니면 false 를 반환
print("first 60 ch :", r.text[:60])
#서버가 응답으로 보낸 본문을 텍스트로 가져와서 그중 앞부분 60글자 출력. 에러메시지인지 확인하기 위함
```

</details>

<details>
<summary><strong>show_json.py</strong> — API 응답인 JSON 텍스트 데이터를 파이썬 딕셔너리로 변환한 후 json.dumps()의 indent 옵션을 활용해 정돈된 형태로 출력하는 실습 코드입니다.</summary>

```python
import requests  # http 요청을 보내기 위한 requests 라이브러리 불러오기
import json       # json 데이터를 보기 좋게 출력하기 위한 라이브러리

URL = "https://api.open-meteo.com/v1/forecast" # 요ㅕ청을 보낼 api주소를 url이라는 변수에 문자열로 저장한다
params={
    "latitude": 37.55,
    "longitude": 127.0,
    "current": "temperature_2m,precipitation"
}
#api에 함꼐 보낼 조건들을 {}로 정의한다
r= requests.get(URL, params=params, timeout=5)
#실제로 get 방식 http 요청을 보내는 줄
data=r.json()
#응답본몬 r이 json형태로 되어있는데 이를 파이썬이 다루기 쉬운 딕셔너리 형태로 변환해 data 저장하는 내용

print("key      :", list(data.keys()))#data가 가지고 있는 키 목록 반환, data안에 정보 확인 및 "current"키 존재 확인

print("current box: ")#다음 줄에 출력될 내용이 "current"관련 데이터 안내문구
print(json.dumps(data["current"], indent=2))#data딕셔너리에서"current"라는 키에 해당하는 값 꺼내기, 문자열 변환하되 들여쓰기 2칸적용
print("temperature :", data["current"]["temperature_2m"], "C")
```

</details>

<details>
<summary><strong>weather.py</strong> — 입력받은 도시 이름을 지오코딩 API로 좌표 변환하고, 날씨 예보 API를 통해 현재 기온과 예상 강수확률을 가져와 보여주는 스크립트입니다.</summary>

```python
import sys
import requests

GEO = "https://geocoding-api.open-meteo.com/v1/search"  # 도시이름 -> 좌표 변환용 API
FORECAST = "https://api.open-meteo.com/v1/forecast"      # 진짜 날씨 데이터 받는 API
TIMEOUT = 5  # 5초 넘으면 그냥 포기


def find_city(name):
    """도시 이름 넣으면 위도 경도 이름 튜플로 반환해줌"""
    r = requests.get(GEO, params={"name": name, "count": 1}, timeout=TIMEOUT)
    hit = r.json()["results"][0]  # 검색결과 여러개 나올수도 있는데 그냥 첫번째꺼 씀

    label = hit["name"] + ", " + hit["country_code"]  # "Seoul, KR" 이런식으로 만들기

    return hit["latitude"], hit["longitude"], label


# 인자로 도시 넘기면 그거 쓰고 아니면 그냥 서울 기본값
city = sys.argv[1] if len(sys.argv) > 1 else "Seoul"
lat, lon, label = find_city(city)

params = {
    "latitude": lat,
    "longitude": lon,
    "current": "temperature_2m",              # 현재 기온
    "hourly": "precipitation_probability",    # 시간별 강수확률
    "forecast_days": 1,                       # 하루치만 받으면 충분함
}

r = requests.get(FORECAST, params=params, timeout=TIMEOUT)
data = r.json()

temp = data["current"]["temperature_2m"]
rain = data["hourly"]["precipitation_probability"][0]  # 일단 제일 가까운 시간대 값만

print("city     :", label)
print("temperature", temp, "C")
print("rain", rain, "%")
```

</details>

## 코드 파일

- [air.py](./code/1787119743990-34186354.py)
- [app.py](./code/1787119743991-534195316.py)
- [first_call.py](./code/1787119743992-470256325.py)
- [show_json.py](./code/1787119743994-279798593.py)
- [weather.py](./code/1787119743995-208911424.py)
- [air.py](./code/1787119743996-291558769.py)
- [app.py](./code/1787119743997-819957933.py)
- [first_call.py](./code/1787119743998-39287873.py)
- [show_json.py](./code/1787119743999-38007715.py)
- [weather.py](./code/1787119744000-277022394.py)

## 실행 결과

```
[위치] Seoul, South Korea  (위도 37.566, 경도 126.9784)
[기온] 21.5℃ (쾌적)
[강수확률] 10% (낮음)
[PM2.5] 12.0µg/㎥ (좋음)

>>> 🟢 외출하기 좋은 날씨입니다.
```

## 배운 점

requests 라이브러리를 활용한 REST API 호출 및 JSON 파싱 방법을 익히고, concurrent.futures.ThreadPoolExecutor를 사용하여 다중 API 요청을 병렬로 처리하고 타임아웃을 제어하는 비동기/멀티스레딩 개념을 학습했습니다.

## 어려웠던 점

한글 도시명을 영문 좌표로 변환할 때 지오코딩 API의 검색 제약을 극복하기 위해 영문 매핑 테이블을 구성하는 부분과, 두 개 이상의 외부 API 호출 시 발생할 수 있는 네트워크 지연 및 응답 실패에 대비한 타임아웃 예외 처리 로직을 설계하는 점이 까다로웠습니다.

---
_Study Archive에서 자동 생성됨 · 마지막 수정: 2026-08-19T06:09:04.012Z_