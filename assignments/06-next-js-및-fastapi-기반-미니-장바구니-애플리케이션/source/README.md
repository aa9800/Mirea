# 미니 장바구니 만들기

Next.js + FastAPI + SQLite로 구현한 미니 쇼핑몰 장바구니 실습 프로젝트입니다.

## 구조

```
backend/    FastAPI + SQLite (API 서버)
frontend/   Next.js (화면)
```

## 구현한 기능

- 기능 1~4: 상품 목록 표시, 장바구니 추가/삭제, 총 금액 자동 계산 (SQLite 연동)
- API: `GET /products`, `GET /cart`, `POST /cart`, `DELETE /cart/{id}`
- 도전 과제
  - Lv.1 수량 변경: `PATCH /cart/{id}` + 화면의 `-`/`+` 버튼
  - Lv.2 중복 상품 처리: 이미 담긴 상품을 다시 담으면 수량만 +1
  - Lv.3 장바구니 비우기: `DELETE /cart/clear` + 화면의 [장바구니 비우기] 버튼

## 실행 방법

### 1. 백엔드 (FastAPI)

```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

- API 문서: http://localhost:8001/docs
- 최초 실행 시 `shop.db`가 자동 생성되고 상품 4종(노트북/키보드/마우스/헤드셋)이 시딩됩니다.

### 2. 프론트엔드 (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- 화면: http://localhost:3000
- `frontend/.env.local`의 `NEXT_PUBLIC_API_URL`이 백엔드 주소(기본 `http://localhost:8001`)를 가리킵니다.

> 참고: 로컬 환경에 이미 8000번 포트를 쓰는 프로세스가 있어 백엔드 포트를 8001로 사용했습니다. 8000번이 비어 있다면 `--port 8000`으로 바꾸고 `.env.local`도 함께 수정하세요.

## 데이터베이스 스키마

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
```
