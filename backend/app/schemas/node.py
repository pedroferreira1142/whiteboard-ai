from pydantic import BaseModel
from typing import List, Optional, Dict

class InteractionHistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    node_id: int

    class Config:
        orm_mode = True

# Base schema for Connection
class ConnectionBase(BaseModel):
    target_node_id: int  # ID of the connected node
    type_of_connection: str  # Type of connection: "main_connection" or "sub_connection"


# Schema for creating a new Connection
class ConnectionCreate(ConnectionBase):
    pass  # No additional fields for now


# Schema for returning a Connection in responses
class ConnectionResponse(ConnectionBase):
    id: int  # ID of the connection
    source_node_id: int  # ID of the source node

    class Config:
        orm_mode = True


# Base schema for Node
class NodeBase(BaseModel):
    name: Optional[str] = "New Node"  # Default name if not provided
    prompt: Optional[str] = None  # The prompt content for this node
    subject_id: Optional[int] = None  # Optional reference to a subject
    position: Dict[str, int] = {"x": 0, "y": 0}  # Default position


# Schema for creating a new Node
class NodeCreate(NodeBase):
    whiteboard_id: int  # Required field for associating the node with a whiteboard
    interaction_history: Optional[List[InteractionHistoryResponse]] = None


# Schema for updating an existing Node
class NodeUpdate(BaseModel):
    name: Optional[str] = None
    prompt: Optional[str] = None
    subject_id: Optional[int] = None
    position: Optional[Dict[str, int]] = None  # Position can also be updated


# Schema for returning a Node in responses
class NodeResponse(NodeBase):
    id: int  # ID of the node
    whiteboard_id: int  # Reference to the parent whiteboard
    interaction_history: List[InteractionHistoryResponse]
    connections: List[ConnectionResponse] = []  # List of connections
    position: dict
    summary: Optional[str]

    class Config:
        orm_mode = True


