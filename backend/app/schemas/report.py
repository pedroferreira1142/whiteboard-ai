from pydantic import BaseModel
from typing import Optional

class ReportCreate(BaseModel):
    whiteboard_id: int

class ReportResponse(BaseModel):
    id: int
    whiteboard_id: int
    title: str
    introduction: Optional[str]
    body: Optional[str]
    conclusion: Optional[str]

    class Config:
        from_attributes = True
