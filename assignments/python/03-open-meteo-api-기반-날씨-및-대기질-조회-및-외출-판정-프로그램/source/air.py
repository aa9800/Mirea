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