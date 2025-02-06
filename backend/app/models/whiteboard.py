from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base
from app.models.report import Report

class Whiteboard(Base):
    """
    SQLAlchemy model representing a whiteboard.

    This model stores information about a whiteboard, including its name, zoom scale,
    creation and update timestamps, and its relationships with nodes, subjects, and reports.

    Attributes:
        id (int): Primary key of the whiteboard.
        name (str): The name of the whiteboard.
        scale (float): Scale factor for zoom level, defaulting to 1.0.
        created_at (datetime): Timestamp when the whiteboard was created.
        updated_at (datetime): Timestamp when the whiteboard was last updated. Automatically updates on modification.
        nodes (list[Node]): A list of Node objects associated with this whiteboard.
        subjects (list[Subject]): A list of Subject objects associated with this whiteboard.
        reports (list[Report]): A list of Report objects associated with this whiteboard.
    """
    __tablename__ = "whiteboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    scale = Column(Float, default=1.0)  # Scale for zoom level
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    nodes = relationship("Node", back_populates="whiteboard")
    subjects = relationship("Subject", back_populates="whiteboard")
    reports = relationship("Report", back_populates="whiteboard", cascade="all, delete-orphan")
