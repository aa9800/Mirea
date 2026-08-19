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
