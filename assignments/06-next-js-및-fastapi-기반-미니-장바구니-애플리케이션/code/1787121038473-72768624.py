from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db

app = FastAPI(title="미니 장바구니 API")

# Next.js(개발 서버, 기본 3000번 포트)에서의 요청을 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ---------- 요청 바디 스키마 ----------
class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = 1


class CartUpdateRequest(BaseModel):
    quantity: int


# ---------- 상품 목록 ----------
@app.get("/products")
def get_products():
    conn = get_connection()
    rows = conn.execute("SELECT id, name, price FROM products").fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ---------- 장바구니 조회 ----------
@app.get("/cart")
def get_cart():
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT cart.id AS id,
               products.id AS product_id,
               products.name AS name,
               products.price AS price,
               cart.quantity AS quantity
        FROM cart
        JOIN products ON cart.product_id = products.id
        ORDER BY cart.id
        """
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ---------- 장바구니에 상품 추가 ----------
@app.post("/cart")
def add_to_cart(item: CartAddRequest):
    conn = get_connection()
    cur = conn.cursor()

    # 상품 존재 확인
    product = cur.execute(
        "SELECT id FROM products WHERE id = ?", (item.product_id,)
    ).fetchone()
    if product is None:
        conn.close()
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    # 도전과제 Lv.2: 이미 장바구니에 있는 상품이면 수량만 증가
    existing = cur.execute(
        "SELECT id, quantity FROM cart WHERE product_id = ?", (item.product_id,)
    ).fetchone()

    if existing:
        cur.execute(
            "UPDATE cart SET quantity = quantity + ? WHERE id = ?",
            (item.quantity, existing["id"]),
        )
    else:
        cur.execute(
            "INSERT INTO cart (product_id, quantity) VALUES (?, ?)",
            (item.product_id, item.quantity),
        )

    conn.commit()
    conn.close()
    return {"message": "장바구니에 추가되었습니다."}


# ---------- 장바구니 상품 수량 변경 (도전과제 Lv.1) ----------
@app.patch("/cart/{cart_id}")
def update_cart_item(cart_id: int, item: CartUpdateRequest):
    if item.quantity < 1:
        raise HTTPException(status_code=400, detail="수량은 1 이상이어야 합니다.")

    conn = get_connection()
    cur = conn.cursor()
    existing = cur.execute("SELECT id FROM cart WHERE id = ?", (cart_id,)).fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다.")

    cur.execute("UPDATE cart SET quantity = ? WHERE id = ?", (item.quantity, cart_id))
    conn.commit()
    conn.close()
    return {"message": "수량이 변경되었습니다."}


# ---------- 장바구니 비우기 (도전과제 Lv.3) ----------
@app.delete("/cart/clear")
def clear_cart():
    conn = get_connection()
    conn.execute("DELETE FROM cart")
    conn.commit()
    conn.close()
    return {"message": "장바구니를 비웠습니다."}


# ---------- 장바구니 상품 삭제 ----------
@app.delete("/cart/{cart_id}")
def delete_cart_item(cart_id: int):
    conn = get_connection()
    cur = conn.cursor()
    existing = cur.execute("SELECT id FROM cart WHERE id = ?", (cart_id,)).fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다.")

    cur.execute("DELETE FROM cart WHERE id = ?", (cart_id,))
    conn.commit()
    conn.close()
    return {"message": "삭제되었습니다."}
