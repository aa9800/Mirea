import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "shop.db"

# 초기 상품 데이터 (실습 PDF 기준)
INITIAL_PRODUCTS = [
    ("노트북", 1_200_000),
    ("키보드", 80_000),
    ("마우스", 40_000),
    ("헤드셋", 100_000),
]


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # products 테이블
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL
        )
        """
    )

    # cart 테이블
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
        """
    )

    # 상품이 비어있으면 초기 데이터 삽입
    cur.execute("SELECT COUNT(*) FROM products")
    count = cur.fetchone()[0]
    if count == 0:
        cur.executemany(
            "INSERT INTO products (name, price) VALUES (?, ?)", INITIAL_PRODUCTS
        )

    conn.commit()
    conn.close()
