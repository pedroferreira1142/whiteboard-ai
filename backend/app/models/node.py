from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db import Base

class Node(Base):
    """
    SQLAlchemy model representing a node within a whiteboard.

    This model stores information about a node, including its position, name, prompt, summary,
    subject association, and its relationships with connections, interaction history, and the whiteboard.

    Attributes:
        id (int): Primary key of the node.
        whiteboard_id (int): Foreign key referencing the associated whiteboard's ID.
        name (str): The name of the node. Defaults to "New Node".
        prompt (str): The prompt associated with the node.
        summary (str): A summary of the node. This field is optional.
        subject_id (int): Foreign key referencing the associated subject's ID (if any).
        position (dict): A JSON object representing the node's position with x and y coordinates.
        connections (list[Connection]): List of connections where this node is the source.
        connected_from (list[Connection]): List of connections where this node is the target.
        interaction_history (list[InteractionHistory]): List of interaction history records for this node.
        whiteboard (Whiteboard): The whiteboard to which this node belongs.
    """
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    whiteboard_id = Column(Integer, ForeignKey("whiteboards.id"))
    name = Column(String, default="New Node")
    prompt = Column(String)
    summary = Column(Text, nullable=True)  # New summary column
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    position = Column(JSON, default={"x": 0, "y": 0})  # Position of the node

    # Relationships
    connections = relationship(
        "Connection",
        foreign_keys="[Connection.source_node_id]",
        backref="source_node",
    )
    connected_from = relationship(
        "Connection",
        foreign_keys="[Connection.target_node_id]",
        backref="target_node",
    )
    interaction_history = relationship(
        "InteractionHistory",
        back_populates="node",
        cascade="all, delete-orphan"
    )
    whiteboard = relationship("Whiteboard", back_populates="nodes")
