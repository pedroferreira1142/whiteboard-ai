from sqlalchemy import Column, Integer, ForeignKey, Enum
from app.db import Base
import enum

class ConnectionType(enum.Enum):
    """
    Enum for connection types between nodes.

    Attributes:
        MAIN (str): Represents a main connection.
        SUB (str): Represents a sub connection.
    """
    MAIN = "main_connection"
    SUB = "sub_connection"

class Connection(Base):
    """
    SQLAlchemy model representing a connection between nodes.

    Attributes:
        id (int): Primary key of the connection.
        source_node_id (int): Foreign key referencing the source node's ID.
        target_node_id (int): Foreign key referencing the target node's ID.
        type_of_connection (ConnectionType): Enum specifying the type of connection.
            Defaults to MAIN connection.
    """
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    type_of_connection = Column(Enum(ConnectionType), default=ConnectionType.MAIN)
