from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# 메모 생성 요청 시 들어오는 데이터 양식
class MemoCreate(BaseModel):
    content: str


# 서버에 저장되는 메모 (id, 생성 시각 포함)
class Memo(BaseModel):
    id: int
    content: str
    created_at: datetime


# 메모 저장소 (서버 껐다 켜면 초기화되는 임시 저장소)
memos: list[Memo] = []
next_id = 1


@app.get("/")
def root():
    return "안녕하세요"


# 메모 목록 조회
@app.get("/memos")
def get_memos():
    return memos


# 메모 저장
@app.post("/memos")
def create_memo(memo: MemoCreate):
    global next_id
    new_memo = Memo(id=next_id, content=memo.content, created_at=datetime.now())
    memos.append(new_memo)
    next_id += 1
    return new_memo
