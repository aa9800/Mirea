# Python 기초 문법 및 제어문과 리스트 활용 실습

- 과목: Python
- 날짜: 2026-08-14
- 태그: python, 제어문, 반복문, 리스트, 기초문법

## 설명

본 과제는 파이썬(Python)의 기본 연산 및 변수 활용법부터 조건문, 반복문, 리스트 응용까지 순차적으로 학습한 내용을 담고 있습니다. 사칙연산과 문자열 출력 등 기초 문법으로 시작하여 섭씨·화씨 온도 변환 및 원리금 계산과 같은 입출력 예제를 다룹니다. 이어서 조건문과 반복문을 활용한 로또 번호 생성기, 369 게임, 별 찍기 패턴, 소수 판별 프로그램 등을 작성합니다. 마지막으로 2차원 리스트를 활용한 영화관 좌석 예약 시스템과 메뉴 선택형 자판기 로직까지 구현해 봅니다.

## 코드

**jupyer/0810_1.ipynb**

파이썬의 기본적인 사칙연산, 변수 선언, 문자열 출력을 실습하는 노트입니다. 사용자로부터 입력을 받아 형변환을 수행하고, 섭씨-화씨 온도 변환 및 만기 원리금 계산 등 기초 공식을 활용한 프로그램을 작성합니다.

```python
print("hello world!")

2+2

50-5*6

(50-5*6)/4

17/3

17//3

17%3

X="홍길동"

x="내 이름은"
y="4"
print(x+y)

message="첫번째 줄 = doesn\'t\n두번째 줄 = \"Hello\""
print(message)

name = "홍길동"
age = "20"
add = "대구광역시"

print("***************************************")
print("*                                     *")
print("*        이름 :", name, "               *")
print("*        나이 :", age, "                   *")
print("*        주소 :", add, "           *")
print("*                                     *")
print("***************************************")

eng = 4.0
math = 3.5
kor = 2.0

avg = (eng * 2 + math * 3 + kor * 3) / 8

print(avg)

π = 3.14159
r = 3

원 = π * r**2
구 = 4/3 * π * r**3

print("원의 면적 :", 원)
print("구의 부피 :", 구)

num1 = input("첫번째 숫자를 입력하세요:")

print(num1)
print("변수 num1의 타입 =", type(num1))

num2 = input("두번째 숫자를 입력하세요:")

print(num1+num2)

num1=int(input("첫번째 숫자를 입력하세요:"))
print(num1)
print("변수 num1의 타입=",type(num1))

x, y = input("남학생과 여학생의 수를 입력하세요:").split()
print("남학생의 수:",x)
print("여학생의 수:",y)

C = num1 = int(input("현재 섭씨 온도를 입력하세요:"))
F=9/5*C+32
print("화씨  온도는: ",F)

M = num1 = int(input("원금을 입력하세요:"))
r = num2 = int(input("금리를 입력하세요:"))
y = num3 = int(input("만기를 입력하세요:"))

원리금 = M*(1+r/100)**y

print("만기에 지급받게 되는 원리금은 ",원리금,"원 입니다.")
```

**jupyer/0810_2.ipynb**

input() 함수로 입력받은 데이터의 타입을 확인하고 정수형으로 변환하는 기초 실습입니다. 온도 변환 및 원리금 계산 알고리즘을 재복습하며 파이썬 입출력 흐름을 다룹니다.

```python
num1 = input("첫번째 숫자를 입력하세요:")

print(num1)
print("변수 num1의 타입 =", type(num1))

num2 = input("두번째 숫자를 입력하세요:")

print(num1+num2)

num1=int(input("첫번째 숫자를 입력하세요:"))
print(num1)
print("변수 num1의 타입=",type(num1))

x, y = input("남학생과 여학생의 수를 입력하세요:").split()
print("남학생의 수:",x)
print("여학생의 수:",y)

C = num1 = int(input("현재 섭씨 온도를 입력하세요:"))
F=9/5*C+32
print("화씨  온도는: ",F)

M = num1 = int(input("원금을 입력하세요:"))
r = num2 = int(input("금리를 입력하세요:"))
y = num3 = int(input("만기를 입력하세요:"))

원리금 = M*(1+r/100)**y

print("만기에 지급받게 되는 원리금은 ",원리금,"원 입니다.")
```

**jupyer/0811_1.ipynb**

if 조건문과 while/for 반복문, random 모듈 및 리스트 응용을 폭넓게 다루는 노트입니다. 로또 번호 추첨, 369 게임, 소수 판별, 별 찍기 패턴, 상품 할인금액 계산 등 다양한 로직을 구현합니다.

```python
x,y = input("인터넷 속도와 동영상 크기를 입력:").split()
x = int(x)*2**20
y=float(y)*2**30*8

sec = int(y/x)
hour = sec//3600
sec = sec% 3600
min = sec // 60
sec = sec%60
print("소요시간 = %s시간%s분%s초"%(hour,min,sec))

age = 10
if age<19:print("미성년자 입니다.")

num = 10
if num%2==0:
    print("짝수입니다.")
else:
    print("홀수입니다.")

grade = 88
if grade>=90:
    print("A 학점입니다.")
elif grade >=80:
    print("B학점입니다.")
elif grade >=70:
    print("C학점입니다.")
else:
    print("다음 학기에는 열심히 공부합신다.")

num = 80
if(num<90):
    print("90보다 작습니다.")

num = 80
if(num<90):
    print("90보다 작습니다.")
    print("B학점을 받을 수 있습니다.")

num = 100
if(num<90):
    print("90보다 작습니다.")
print("항상 실행되는 명령입니다.")

count =1
while count<5:
    print("count의 값 =", count)
    count = count +1
print("반복문이 종료되었습니다.")

sum=0
num=1
while num <=10:
    sum = sum + num
    num = num + 1
print("1부터 100까지의 합=",sum)

num = 0
while num <10:
    num = num + 1
    if num%3 == 0 or num % 5 == 0:
        continue
    print(num)
print("반복문이 종료되었습니다.")

num=1
while num<6:
    print(num)
    num = num +1
else :
    print("num이 6이 되어 반복문을 종료합니다:")

num = 0
while num < 3 :
    passwd = input("암호를 입력하세요: ")
    if passwd == "1234" :
        print("환영합니다. 주인님...")
        break
    num = num + 1
else :
    print("암호 입력 횟수를 초과하였습니다")

for x in range(0, 10, 2):
    print(x ,end = " ")

n = int(input("양의 정수를 입력하세요:"))
sum = 0
for num in range(1, n+1):
    sum = sum + num
print("1부터 %s까지의 합 = %s"%(n,sum))

my_list = [1,2,3,4,5]
for i in range(len(my_list)):
    my_list[i]=my_list[i]*10
print(my_list)

num = int(input("정수 하나를 입력하세요: "))
if num > 0 :
    print("양수 입니다.")
elif num < 0:
    print("음수 입니다.")
else:
    print("0입니다.")

A=0
B=0
C=0
D=0
F=0

for i in range(5):
    score=int(input("학생 점수 입력 : "))

    if score>=90:
        A=A+1
    elif score>=80:
        B=B+1
    elif score>=70:
        C=C+1
    elif score>=60:
        D=D+1
    else:
        F=F+1

print("A :",A,"명")
print("B :",B,"명")
print("C :",C,"명")
print("D :",D,"명")
print("F :",F,"명")

양수=0
음수=0
합=0

for i in range(5):
    num=int(input("숫자를 입력하세요 : "))

    if num>0:
        양수=양수+1
    elif num<0:
        음수=음수+1

    합=합+num

평균=합/5

print("양수의 개수 :",양수)
print("음수의 개수 :",음수)
print("전체 합 :",합)
print("평균 :",평균)

num = int(input("몇 단을 출력할까요? "))

for i in range(1, 10):
    print(num, "x", i, "=", num*i)

양수 = 0
음수 = 0
합 = 0

num = int(input("숫자를 입력하세요: "))

while num != 0:

    if num > 0:
        print("양수입니다.")
        양수 = 양수 + 1

    else:
        print("음수입니다.")
        음수 = 음수 + 1

    합 = 합 + num

    num = int(input("숫자를 입력하세요: "))

print()
print("입력 종료!")
print("양수:", 양수, "개")
print("음수:", 음수, "개")
print("전체 합:", 합)

합 = 0

num = int(input("상품 가격을 입력하세요: "))

while num != 0:
    합 = 합 + num
    num = int(input("상품 가격을 입력하세요: "))

if 합 >= 50000:
    할인율 = 20
elif 합 >= 30000:
    할인율 = 10
elif 합 >= 10000:
    할인율 = 5
else:
    할인율 = 0

할인금액 = 합 * 할인율 / 100
최종금액 = 합 - 할인금액

print("할인 전 금액:", 합, "원")
print("할인율:", 할인율, "%")
print("할인 금액:", 할인금액, "원")
print("최종 결제 금액:", 최종금액, "원")

num = int(input("양의 정수를 입력하세요:"))
for i in range(2, num):
    if num %i==0:
        print("소수가 아닙니다.")
        break
else:
    print("소수 입니다.")

while True:
    num = int(input("양의 정수를 입력(종료는 -1):"))

    if num == -1:
        break

    i = 1
    factorial = 1

    while i <= num:
        factorial = factorial * i
        i = i + 1

    print("%s! = %s" %(num, factorial))

for x in range(2, 10):
    for y in range(1, 10):
        print("%s*%s=%s" % (x, y, x*y), end=" ")
    print()

for x in range(10):
    for y in range(10-x):
        print("*", end="")
    print()

for x in range(10):
    for y in range(9-x):
        print(" ", end="")
    for y in range(x+1):
        print("*", end="")
    print()

for x in range(10):
    for y in range(x):
        print(" ", end="")
    for y in range(10-x):
        print("*", end="")
    print()

statement = input("문장을 입력:")

for word in statement.split():
    for digit in "0123456789":
        if digit in word:
            break
    else:
        print(word, end=" ")

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]
C = []

for item in A:
    if item in B:
        C.append(item)

print(C)

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]
C = [x for x in A if x in B]
print(C)

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]
C = list(set(A).intersection(B))
print(C)

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]

D = []

for item in A:
    if item in B:
        D.append(item)

print(D)

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]

D = [x for x in A if x in B]

print(D)

A = [23, 15, 2, 14, 14, 16, 20, 14]
B = [2, 48, 15, 14, 26, 32, 47, 14]

D = list(set(A).intersection(B))

print(D)

testList = [0,1,2,3,4,5]
testList[:3]

testList[2:]

testList[:]

len(testList)

testList = [0, 1, 2, 3, 4, 5]
del testList[1]
testList

testList = [0, 1, 2, 3, 4, 5]
testList.remove(3)
testList

testList = [5, -1, 3, 2,]
testList.sort()
testList


testList = [5, -1, 3, 2,]
testList.sort(reverse = True)
testList

import random
def newLotto():
    lottoNumber = []
    while True:
        if len(lottoNumber) == 6:
            break
        newNumber = random.randint(1, 45)
        if newNumber not in lottoNumber:
            #print(newNumber)
            lottoNumber.append(newNumber)
        lottoNumber.sort()
        print(lottoNumber)
newLotto()

import random

def newLotto():
    lottoNumber = []

    while True:
        if len(lottoNumber) == 6:
            break

        newNumber = random.randint(1, 45)

        if newNumber not in lottoNumber:
            lottoNumber.append(newNumber)

    lottoNumber.sort()
    print(lottoNumber)

newLotto()

import random

def newLotto():
    lottoNumber = []

    while True:
        if len(lottoNumber) == 6:
            break

        newNumber = random.randint(1, 45)

        if newNumber not in lottoNumber:
            lottoNumber.append(newNumber)

    lottoNumber.sort()
    return lottoNumber


lucky = []

for i in range(6):
    num = int(input("1부터 45 사이의 숫자를 입력하세요: "))
    lucky.append(num)

lottoNumber = newLotto()

print("내 번호:", lucky)
print("로또 번호:", lottoNumber)

count = 0

for x in lucky:
    if x in lottoNumber:
        count = count + 1

if count == 6:
    print("1등")
elif count == 5:
    print("2등")
elif count == 4:
    print("3등")
elif count == 3:
    print("4등")
else:
    print("꽝")

password = "python123"
num = 0
while num < 3 :
    passwd = input("암호를 입력하세요: ")
    if passwd == "python123" :
        print("로그인 성공")
        break
    num = num + 1
    print("비밀번호가 틀렸습니다.")
else :
    print("로그인 실패")

while True:
    print("1. 콜라 1500원")
    print("2. 사이다 1200원")
    print("3. 물 800원")

    menu = int(input("메뉴 번호를 선택하세요: "))

    if menu == 1:
        price = 1500
    elif menu == 2:
        price = 1200
    elif menu == 3:
        price = 800
    else:
        print("잘못된 선택입니다.")
        continue

    money = int(input("투입 금액을 입력하세요: "))

    if money < price:
        print("금액이 부족합니다.")
    else:
        change = money - price
        print("구매 완료! 거스름돈:", change, "원")

    break

num = int(input("숫자를 입력하세요: "))

for i in range(1, num + 1):
    text = str(i)

    if "3" in text or "6" in text or "9" in text:
        print("짝", end=" ")
    else:
        print(i, end=" ")

num = int(input("숫자를 입력하세요: "))

count = 0

for i in range(2, num):
    if num % i == 0:
        count = count + 1

if count == 0:
    print("소수입니다.")
else:
    print("소수가 아닙니다.")

num = int(input("몇 단으로 쌓겠습니까?: "))

for x in range(num):
    for y in range(num-x-1):
        print(" ", end=" ")

    for y in range(x*2+1):
        
        print("*", end=" ")

    print()


num = int(input("몇단으로 만들까요: "))

for x in range(num):
    for y in range(num-x-1):
        print(" ", end=" ")

    for y in range(x*2+1):
        
        print("*", end=" ")

    print()
    
for x in range(1, num):
    for y in range(x):
        print(" ", end=" ")

    for y in range((num-x)*2-1):
        print("*", end=" ")

    print()

A = [10, 20, 30, 40, 50]
print(A)
B = []
i = 4

while i >= 0:
    B.append(A[i])
    i = i-1

print(B)

num = int(input("숫자를 입력하세요: "))
for i in range(1, num +1):
    print(i, ":", end=" ")

    if i % 2 == 1:
        for j in range(i):
            print("*", end" ")
        else:
```

**jupyer/0812_1.ipynb**

while 반복문과 break 문을 활용하여 최대 3회 비밀번호 입력을 시도하는 로그인 프로그램을 작성합니다. 메뉴 선택, 금액 투입, 거스름돈 계산 및 종료 기능을 포함한 대화형 자판기 로직을 구현합니다.

```python
password = "python123"
num = 0
while num < 3 :
    passwd = input("암호를 입력하세요: ")
    if passwd == "python123" :
        print("로그인 성공")
        break
    num = num + 1
    print("비밀번호가 틀렸습니다.")
else :
    print("로그인 실패")

while True:
    print("1. 콜라 1500원")
    print("2. 사이다 1200원")
    print("3. 물 800원")
    print("0. 종료")

    menu = int(input("메뉴 번호를 선택하세요: "))

    if menu == 0:
        print("자판기를 종료합니다.")
        break

    if menu == 1:
        price = 1500
    elif menu == 2:
        price = 1200
    elif menu == 3:
        price = 800
    else:
        print("잘못된 선택입니다.")
        continue

    money = int(input("투입 금액을 입력하세요: "))

    if money < price:
        print("금액이 부족합니다.")
    else:
        change = money - price
        print("구매 완료! 거스름돈:", change, "원")
```

**jupyer/0813_1.ipynb**

숫자의 짝수/홀수 여부에 따라 기호를 다르게 출력하는 반복문 패턴을 작성합니다. 2차원 리스트를 이용해 좌석 상태를 출력하고 지정된 위치를 예약 처리하는 간이 영화관 예약 시스템을 구현합니다.

```python
n = int(input("숫자 입력:"))

for i in range(1, n+1):
    print(i, end=": ")

    if i%2==0:
        for j in range(i):
            print("+",end="")
    else:
        for j in range(i):
            print("*",end="")

    print()

seats = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
]

for row in seats:
    for seat in row:
        if seat==0:
            print("[ ]",end="")
        else:
            print("[X]",end="")
    print()

row = int(input("행 입력: "))
col = int(input("열 입력: "))

if seats[row][col] == 0:
    seats[row][col] = 1
else:
    print("이미 예약된 좌석입니다.")

for row in seats:
    for seat in row:
        if seat==0:
            print("[ ]",end="")
        else:
            print("[X]",end="")
    print()
```

## 코드 파일

- [0810_1.ipynb](./code/1786693452429-685639810.ipynb)
- [0810_2.ipynb](./code/1786693452430-956695871.ipynb)
- [0811_1.ipynb](./code/1786693452431-745618689.ipynb)
- [0812_1.ipynb](./code/1786693452432-327829731.ipynb)
- [0813_1.ipynb](./code/1786693452433-683623941.ipynb)

## 실행 결과

```
[코드]
print("hello world!")
[결과]
hello world!

---

[코드]
2+2
[결과]
4

---

[코드]
50-5*6
[결과]
20

---

[코드]
(50-5*6)/4
[결과]
5.0

---

[코드]
17/3
[결과]
5.666666666666667

---

[코드]
17//3
[결과]
5

---

[코드]
17%3
[결과]
2

---

[코드]
x="내 이름은"
y="4"
print(x+y)
[결과]
내 이름은4

---

[코드]
message="첫번째 줄 = doesn\'t\n두번째 줄 = \"Hello\""
print(message)
[결과]
첫번째 줄 = doesn't
두번째 줄 = "Hello"

---

[코드]
name = "홍길동"
age = "20"
add = "대구광역시"

print("***************************************")
print("*                                     *")
print("*        이름 :", name, "               *")
print("*        나이 :", age, "                   *")
print("*        주소 :", add, "           *")
print("*                                     *")
print("***************************************")
[결과]
***************************************
*                                     *
*        이름 : 홍길동                *
*        나이 : 20                    *
*        주소 : 대구광역시            *
*                                     *
***************************************

---

[코드]
eng = 4.0
math = 3.5
kor = 2.0

avg = (eng * 2 + math * 3 + kor * 3) / 8

print(avg)
[결과]
3.0625

---

[코드]
π = 3.14159
r = 3

원 = π * r**2
구 = 4/3 * π * r**3

print("원의 면적 :", 원)
print("구의 부피 :", 구)
[결과]
원의 면적 : 28.27431
구의 부피 : 113.09723999999999

---

[코드]
num1 = input("첫번째 숫자를 입력하세요:")
[결과]
첫번째 숫자를 입력하세요: 23

---

[코드]
print(num1)
print("변수 num1의 타입 =", type(num1))
[결과]
23
변수 num1의 타입 = <class 'str'>

---

[코드]
num2 = input("두번째 숫자를 입력하세요:")
[결과]
두번째 숫자를 입력하세요: 20

---

[코드]
print(num1+num2)
[결과]
2320

---

[코드]
num1=int(input("첫번째 숫자를 입력하세요:"))
print(num1)
print("변수 num1의 타입=",type(num1))
[결과]
첫번째 숫자를 입력하세요: 23

23
변수 num1의 타입= <class 'int'>

---

[코드]
x, y = input("남학생과 여학생의 수를 입력하세요:").split()
print("남학생의 수:",x)
print("여학생의 수:",y)
[결과]
남학생과 여학생의 수를 입력하세요: 10 20

남학생의 수: 10
여학생의 수: 20

---

[코드]
C = num1 = int(input("현재 섭씨 온도를 입력하세요:"))
F=9/5*C+32
print("화씨  온도는: ",F)
[결과]
현재 섭씨 온도를 입력하세요: 30

화씨  온도는:  86.0

---

[코드]
M = num1 = int(input("원금을 입력하세요:"))
r = num2 = int(input("금리를 입력하세요:"))
y = num3 = int(input("만기를 입력하세요:"))

원리금 = M*(1+r/100)**y

print("만기에 지급받게 되는 원리금은 ",원리금,"원 입니다.")
[결과]
원금을 입력하세요: 100000
금리를 입력하세요: 10
만기를 입력하세요: 3

만기에 지급받게 되는 원리금은  133100.00000000003 원 입니다.
---
[코드]
x,y = input("인터넷 속도와 동영상 크기를 입력:").split()
x = int(x)*2**20
y=float(y)*2**30*8
[결과]
인터넷 속도와 동영상 크기를 입력: 100 4.7

---

[코드]
sec = int(y/x)
hour = sec//3600
sec = sec% 3600
min = sec // 60
sec = sec%60
print("소요시간 = %s시간%s분%s초"%(hour,min,sec))
[결과]
소요시간 = 0시간6분25초

---

[코드]
age = 10
if age<19:print("미성년자 입니다.")
[결과]
미성년자 입니다.

---

[코드]
num = 10
if num%2==0:
    print("짝수입니다.")
else:
    print("홀수입니다.")
[결과]
짝수입니다.

---

[코드]
grade = 88
if grade>=90:
    print("A 학점입니다.")
elif grade >=80:
    print("B학점입니다.")
elif grade >=70:
    print("C학점입니다.")
else:
    print("다음 학기에는 열심히 공부합신다.")
[결과]
B학점입니다.

---

[코드]
num = 100
if(num<90):
    print("90보다 작습니다.")
print("항상 실행되는 명령입니다.")
[결과]
항상 실행되는 명령입니다.

---

[코드]
count =1
while count<5:
    print("count의 값 =", count)
    count = count +1
print("반복문이 종료되었습니다.")
[결과]
count의 값 = 1
count의 값 = 2
count의 값 = 3
count의 값 = 4
반복문이 종료되었습니다.

---

[코드]
sum=0
num=1
while num <=10:
    sum = sum + num
    num = num + 1
print("1부터 100까지의 합=",sum)
[결과]
1부터 100까지의 합= 55

---

[코드]
num = 0
while num <10:
    num = num + 1
    if num%3 == 0 or num % 5 == 0:
        continue
    print(num)
print("반복문이 종료되었습니다.")
[결과]
1
2
4
7
8
반복문이 종료되었습니다.

---

[코드]
num=1
while num<6:
    print(num)
    num = num +1
else :
    print("num이 6이 되어 반복문을 종료합니다:")
[결과]
1
2
3
4
5
num이 6이 되어 반복문을 종료합니다:

---

[코드]
num = 0
while num < 3 :
    passwd = input("암호를 입력하세요: ")
    if passwd == "1234" :
        print("환영합니다. 주인님...")
        break
    num = num + 1
else :
    print("암호 입력 횟수를 초과하였습니다")
[결과]
암호를 입력하세요:  1234

환영합니다. 주인님...

---

[코드]
for x in range(0, 10, 2):
    print(x ,end = " ")
[결과]
0 2 4 6 8

---

[코드]
n = int(input("양의 정수를 입력하세요:"))
sum = 0
for num in range(1, n+1):
    sum = sum + num
print("1부터 %s
```

## 배운 점

파이썬의 기본 데이터 타입과 형변환을 다루고, 조건문과 반복문 및 리스트를 결합하여 실생활 문제 해결을 위한 기초 알고리즘을 구현하는 방법을 익혔습니다.

## 어려웠던 점

이중 반복문을 활용해 다채로운 별 찍기 패턴을 구성하거나, 2차원 리스트의 행과 열 인덱스에 접근하여 상태를 업데이트하는 논리적 구조를 설계하는 부분이 까다로웠을 수 있습니다.

---
_Study Archive에서 자동 생성됨 · 마지막 수정: 2026-08-14T07:44:12.434Z_