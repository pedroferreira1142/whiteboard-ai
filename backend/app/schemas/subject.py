from pydantic import BaseModel
from typing import Optional, Dict


class SubjectBase(BaseModel):
    name: str
    summary: Optional[str] = None
    whiteboard_id: int


class SubjectCreate(SubjectBase):
    whiteboard_id: int


class SubjectUpdate(SubjectBase):
    pass


class SubjectResponse(SubjectBase):
    id: int
    whiteboard_id: int

    class Config:
        orm_mode = True
