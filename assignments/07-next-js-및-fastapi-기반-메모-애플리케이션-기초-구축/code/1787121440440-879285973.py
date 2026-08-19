import sqlite3

# DB 파일에 연결 (없으면 자동 생성됨)
conn = sqlite3.connect("memos.db")
cursor = conn.cursor()

# memos 표 생성 (이미 있으면 건너뜀)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL
    )
""")

# 메모 두 개 삽입
cursor.executemany(
    "INSERT INTO memos (content) VALUES (?)",
    [
        ("첫 번째 메모입니다.",),
        ("두 번째 메모입니다.",),
    ],
)
conn.commit()

# 저장된 메모 전체 조회
cursor.execute("SELECT id, content FROM memos")
rows = cursor.fetchall()

print("저장된 메모 목록:")
for row in rows:
    print(f"- id={row[0]}, content={row[1]}")

conn.close()
