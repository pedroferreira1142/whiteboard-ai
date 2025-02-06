from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db import Base

class InteractionHistory(Base):
    """
    SQLAlchemy model representing the interaction history of a node.

    This model stores the conversation history for each node, recording
    messages exchanged between the user and the assistant.

    Attributes:
        id (int): Primary key of the interaction record.
        node_id (int): Foreign key referencing the associated node's ID.
        role (str): Role of the message sender, e.g., 'user' or 'assistant'.
        content (str): The content of the message.
        timestamp (datetime): The timestamp when the message was created.
        node (Node): Relationship to the Node model, representing the node to which the interaction belongs.
    """
    __tablename__ = "interaction_history"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    role = Column(String, nullable=False)  # Role can be 'user' or 'assistant'
    content = Column(Text, nullable=False)  # Message content
    timestamp = Column(DateTime, server_default=func.now())

    # Relationships
    node = relationship("Node", back_populates="interaction_history")
