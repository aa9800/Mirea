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
