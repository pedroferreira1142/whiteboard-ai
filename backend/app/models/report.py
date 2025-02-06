from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db import Base

class Report(Base):
    """
    SQLAlchemy model representing a report for a whiteboard.

    This model stores a report generated for a whiteboard, including its title,
    introduction, body, and conclusion. The introduction and conclusion are typically
    generated by an LLM, while the body contains aggregated and processed content.

    Attributes:
        id (int): Primary key of the report.
        whiteboard_id (int): Foreign key referencing the associated whiteboard's ID.
        title (str): The title of the report.
        introduction (str): The introduction section of the report (LLM-generated).
        body (str): The main content of the report, aggregated and processed.
        conclusion (str): The conclusion section of the report (LLM-generated).
        whiteboard (Whiteboard): Relationship to the associated whiteboard.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    whiteboard_id = Column(Integer, ForeignKey("whiteboards.id"), nullable=False)
    title = Column(String, nullable=False)  # Report title
    introduction = Column(Text, nullable=True)  # LLM-generated introduction
    body = Column(Text, nullable=True)  # Aggregated and processed content
    conclusion = Column(Text, nullable=True)  # LLM-generated conclusion

    whiteboard = relationship("Whiteboard", back_populates="reports")
