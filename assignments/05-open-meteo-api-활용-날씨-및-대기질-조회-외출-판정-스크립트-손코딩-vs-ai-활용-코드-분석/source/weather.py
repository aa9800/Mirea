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