from pydantic import BaseModel
from datetime import datetime


class WhiteboardCreate(BaseModel):
    name: str


class WhiteboardResponse(WhiteboardCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
