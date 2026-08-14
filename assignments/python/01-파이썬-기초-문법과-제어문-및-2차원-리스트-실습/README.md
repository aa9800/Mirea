# 파이썬 기초 문법과 제어문 및 2차원 리스트 실습

- 과목: Python
- 날짜: 2026-08-14
- 태그: python, 조건문, 반복문, 입출력, 2차원리스트

## 설명

본 과제는 파이썬의 기본적인 산술 연산 및 변수 활용부터 조건문, 반복문, 2차원 리스트까지의 기초 제어 흐름을 단계별로 학습한 실습 코드 모음입니다. 날짜별 주피터 노트북(0810~0813)으로 구성되어 있으며, 섭씨·화씨 변환, 원리금 계산, 인터넷 다운로드 시간 계산과 같은 기본 입출력 문제부터 시작합니다. 이어서 조건문과 반복문을 활용한 학점 계산기, 할인율 계산, 별 찍기 패턴, 소수 판별 및 팩토리얼 계산 등 다양한 기초 알고리즘을 구현하였습니다. 또한 로그인 및 자판기 시뮬레이션 프로그램을 작성하고, 2차원 배열 구조를 활용해 영화관 좌석 예약 시스템을 시뮬레이션해 봅니다. 이 과제를 통해 파이썬 기초 제어 구조와 사용자 입력값 처리를 실전 예제를 통해 체계적으로 익힐 수 있습니다.

## 코드

**jupyer/0810_1.ipynb**

파이썬의 기본 산술 연산자, 문자열 포맷팅, 변수 할당 및 input() 함수를 통한 입력 처리를 익히는 기초 실습 파일입니다. 원의 넓이와 구의 부피 계산, 섭씨-화씨 온도 변환, 복리 원리금 계산 등의 기초 수학 연산 예제를 다룹니다.

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

사용자로부터 입력받은 문자열 데이터의 형변환(int)과 split()을 활용한 다중 입력 처리 방식을 다룹니다. 온도를 변환하거나 원금·금리·만기 년수를 입력받아 만기 원리금을 산출하는 입력 중심 예제로 구성되어 있습니다.

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

if-elif-else 조건문과 while/for 반복문을 다양하게 응용하는 실습 파일입니다. 학점 계산, 양수/음수/합계/평균 구하기, 구구단, 할인율 적용 금액 계산, 소수 판별, 팩토리얼 계산 및 중첩 루프 기반 별 찍기 패턴 등 다채로운 기본 예제를 다룹니다.

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

while 루프와 break/else 문을 활용해 3회 제한 로그인 비밀번호 검증 프로그램을 구현합니다. 또한 무한 루프와 조건문을 결합해 메뉴 선택, 금액 투입, 잔돈 계산 기능이 포함된 자판기 프로그램을 실습합니다.

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

반복문과 조건문을 조합해 숫자별 패턴 기호를 출력하고, 2차원 리스트를 이용해 좌석 현황판을 구성하는 실습 파일입니다. 사용자로부터 행과 열을 입력받아 예약을 진행하고 좌석 상태([ ] -> [X])를 업데이트하여 다시 출력하는 기초 예약 시스템을 다룹니다.

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

- [0810_1.ipynb](./code/1786689662479-560121989.ipynb)
- [0810_2.ipynb](./code/1786689662480-565922965.ipynb)
- [0811_1.ipynb](./code/1786689662481-511314465.ipynb)
- [0812_1.ipynb](./code/1786689662485-896756287.ipynb)
- [0813_1.ipynb](./code/1786689662486-362674503.ipynb)

## 실행 결과

```
hello world!

4
20
5.0
5.666666666666667
5
2
내 이름은4

첫번째 줄 = doesn't
두번째 줄 = "Hello"

***************************************
*                                     *
*        이름 : 홍길동                *
*        나이 : 20                    *
*        주소 : 대구광역시            *
*                                     *
***************************************

3.0625

원의 면적 : 28.27431
구의 부피 : 113.09723999999999

첫번째 숫자를 입력하세요: 23

23
변수 num1의 타입 = <class 'str'>

두번째 숫자를 입력하세요: 20

2320

첫번째 숫자를 입력하세요: 23

23
변수 num1의 타입= <class 'int'>

남학생과 여학생의 수를 입력하세요: 10 20

남학생의 수: 10
여학생의 수: 20

현재 섭씨 온도를 입력하세요: 30

화씨  온도는:  86.0

원금을 입력하세요: 100000
금리를 입력하세요: 10
만기를 입력하세요: 3

만기에 지급받게 되는 원리금은  133100.00000000003 원 입니다.
---
인터넷 속도와 동영상 크기를 입력: 100 4.7

소요시간 = 0시간6분25초

미성년자 입니다.

짝수입니다.

B학점입니다.

항상 실행되는 명령입니다.

count의 값 = 1
count의 값 = 2
count의 값 = 3
count의 값 = 4
반복문이 종료되었습니다.

1부터 100까지의 합= 55

1
2
4
7
8
반복문이 종료되었습니다.

1
2
3
4
5
num이 6이 되어 반복문을 종료합니다:

암호를 입력하세요:  1234

환영합니다. 주인님...

0 2 4 6 8 
양의 정수를 입력하세요: 100

1부터 100까지의 합 = 5050

[10, 20, 30, 40, 50]

정수 하나를 입력하세요:  -2

음수 입니다.

학생 점수 입력 :  95
학생 점수 입력 :  82
학생 점수 입력 :  76
학생 점수 입력 :  55
학생 점수 입력 :  91

A : 2 명
B : 1 명
C : 1 명
D : 0 명
F : 1 명

숫자를 입력하세요 :  10
숫자를 입력하세요 :  -5
숫자를 입력하세요 :  20
숫자를 입력하세요 :  -3
숫자를 입력하세요 :  8

양수의 개수 : 3
음수의 개수 : 2
전체 합 : 30
평균 : 6.0

몇 단을 출력할까요?  9

9 x 1 = 9
9 x 2 = 18
9 x 3 = 27
9 x 4 = 36
9 x 5 = 45
9 x 6 = 54
9 x 7 = 63
9 x 8 = 72
9 x 9 = 81

숫자를 입력하세요:  1

양수입니다.

숫자를 입력하세요:  3

양수입니다.

숫자를 입력하세요:  2

양수입니다.

숫자를 입력하세요:  1

양수입니다.

숫자를 입력하세요:  3

양수입니다.

숫자를 입력하세요:  0


입력 종료!
양수: 5 개
음수: 0 개
전체 합: 10

상품 가격을 입력하세요:  500
상품 가격을 입력하세요:  100
상품 가격을 입력하세요:  3000
상품 가격을 입력하세요:  400
상품 가격을 입력하세요:  500
상품 가격을 입력하세요:  100
상품 가격을 입력하세요:  200
상품 가격을 입력하세요:  0

할인 전 금액: 4800 원
할인율: 0 %
할인 금액: 0.0 원
최종 결제 금액: 4800.0 원

양의 정수를 입력하세요: 17

소수 입니다.

양의 정수를 입력(종료는 -1): 30

30! = 265252859812191058636308480000000

양의 정수를 입력(종료는 -1): 20

20! = 2432902008176640000

양의 정수를 입력(종료는 -1): -1

2*1=2 2*2=4 2*3=6 2*4=8 2*5=10 2*6=12 2*7=14 2*8=16 2*9=18 
3*1=3 3*2=6 3*3=9 3*4=12 3*5=15 3*6=18 3*7=21 3*8=24 3*9=27 
4*1=4 4*2=8 4*3=12 4*4=16 4*5=20 4*6=24 4*7=28 4*8=32 4*9=36 
5*1=5 5*2=10 5*3=15 5*4=20 5*5=25 5*6=30 5*7=35 5*8=40 5*9=45 
6*1=6 6*2=12 6*3=18 6*4=24 6*5=30 6*6=36 6*7=42 6*8=48 6*9=54 
7*1=7 7*2=14 7*3=21 7*4=28 7*5=35 7*6=42 7*7=49 7*8=56 7*9=63 
8*1=8 8*2=16 8*3=24 8*4=32 8*5=40 8*6=48 8*7=56 8*8=64 8*9=72 
9*1=9 9*2=18 9*3=27 9*4=36 9*5=45 9*6=54 9*7=63 9*8=72 9*9=81 

**********
*********
********
*******
******
*****
****
***
**
*

         *
        **
       ***
      ****
     *****
    ******
   *******
  ********
 *********
**********

**********
 *********
  ********
   *******
    ******
     *****
      ****
       ***
        **
         *

문장을 입력: 나이는 23세이고, 주소는A아파트 12동 20호 입니다.

나이는 주소는A아파트 입니다. 
[15, 2, 14, 14, 14]

[15, 2, 14, 14, 14]

[2, 14, 15]

[15, 2, 14, 14, 14]

[15, 2, 14, 14, 14]

[2, 14, 15]

[0, 1, 2]
[2, 3, 4, 5]
[0, 1, 2, 3, 4, 5]
6
[0, 2, 3, 4, 5]
[0, 1, 2, 4, 5]
[-1, 2, 3, 5]
[5, 3, 2, -1]
[36]
[2, 36]
[2, 7, 36]
[2, 7, 15, 36]
[2, 3, 7, 15, 36]
[2, 3, 7, 15, 26, 36]

[2, 5, 15, 27, 38, 43]

1부터 45 사이의 숫자를 입력하세요:  34
1부터 45 사이의 숫자를 입력하세요:  145
1부터 45 사이의 숫자를 입력하세요:  5
1부터 45 사이의 숫자를 입력하세요:  1
1부터 45 사이의 숫자를 입력하세요:  4
1부터 45 사이의 숫자를 입력하세요:  5

내 번호: [34, 145, 5, 1, 4, 5]
로또 번호: [11, 20, 35, 38, 40, 45]
꽝

암호를 입력하세요:  doafsd

비밀번호가 틀렸습니다.

암호를 입력하세요:  234

비밀번호가 틀렸습니다.

암호를 입력하세요:  253

비밀번호가 틀렸습니다.
로그인 실패

1. 콜라 1500원
2. 사이다 1200원
3. 물 800원

메뉴 번호를 선택하세요:  3
투입 금액을 입력하세요:  3

금액이 부족합니다.

숫자를 입력하세요:  3

1 2 짝 
숫자를 입력하세요:  3

소수입니다.

몇 단으로 쌓겠습니까?:  15

                            * 
                          * * * 
                        * * * * * 
                      * * * * * * * 
                    * * * * * * * * * 
                  * * * * * * * * * * * 
                * * * * * * * * * * * * * 
              * * * * * * * * * * * * * * * 
            * * * * * * * * * * * * * * * * * 
          * * * * * * * * * * * * * * * * * *
```

## 배운 점

파이썬의 기본 산술 연산과 입출력, if-elif-else 조건문 및 while/for 반복문의 흐름 제어를 익히고, 2차원 리스트를 이용해 데이터를 구조화하고 제어하는 방법을 학습했습니다.

## 어려웠던 점

중첩 루프를 활용한 별 찍기 패턴 구현 시 인덱스 변화 규칙을 잡는 부분이나, 2차원 리스트의 행·열 인덱스를 활용해 좌석 상태를 선택 및 변경 출력하는 논리를 구상하는 데 어려움이 있었을 수 있습니다.

---
_Study Archive에서 자동 생성됨 · 마지막 수정: 2026-08-14T06:41:02.487Z_