from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.node import Node
from app.models.connection import Connection, ConnectionType
from app.models.interaction_history import InteractionHistory
from app.schemas.node import NodeCreate, NodeResponse
from typing import List
from app.services.llm import LLMHelper

router = APIRouter()

@router.post("/", response_model=NodeResponse)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    """
    Create a new node and add an initial assistant interaction.

    This endpoint creates a new node in the database using the provided details,
    commits it to the database, and then adds an initial interaction from the assistant
    to the node's interaction history.

    Args:
        node (NodeCreate): The details of the node to be created.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        NodeResponse: The newly created node.
    """
    # Create the new node
    new_node = Node(
        whiteboard_id=node.whiteboard_id,
        name=node.name,
        prompt=node.prompt,
        subject_id=node.subject_id,
        position=node.position
    )
    db.add(new_node)
    db.commit()
    db.refresh(new_node)

    # Add the first interaction to the interaction history
    first_interaction = InteractionHistory(
        node_id=new_node.id,
        role="assistant",
        content="How can I help?"
    )
    db.add(first_interaction)
    db.commit()
    db.refresh(first_interaction)

    return new_node


@router.get("/{node_id}", response_model=NodeResponse)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a node by its ID.

    Args:
        node_id (int): The ID of the node to retrieve.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        NodeResponse: The node matching the provided ID.

    Raises:
        HTTPException: If the node is not found.
    """
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.get("/", response_model=List[NodeResponse])
def get_all_nodes(db: Session = Depends(get_db)):
    """
    Retrieve all nodes from the database.

    Args:
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        List[NodeResponse]: A list of all nodes.
    """
    nodes = db.query(Node).all()
    return nodes


@router.put("/{node_id}/position", response_model=NodeResponse)
def update_node_position(node_id: int, position: dict, db: Session = Depends(get_db)):
    """
    Update the position of a node.

    Validates the new position, updates the node's position, and returns the updated node.

    Args:
        node_id (int): The ID of the node to update.
        position (dict): A dictionary with keys 'x' and 'y' representing the new position.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        NodeResponse: The updated node.

    Raises:
        HTTPException: If the node is not found or if the position format is invalid.
    """
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    # Validate position format
    if not isinstance(position, dict) or "x" not in position or "y" not in position:
        raise HTTPException(status_code=400, detail="Position must be a dictionary with 'x' and 'y' keys.")

    # Update position
    node.position = position
    db.commit()
    db.refresh(node)
    return node


@router.post("/{node_id}/connect", response_model=dict)
def connect_node(
    node_id: int, 
    target_node_id: int, 
    type_of_connection: ConnectionType, 
    db: Session = Depends(get_db)
):
    """
    Connect a node to another node by creating a new connection.

    Validates that both source and target nodes exist, ensures that a node is not connecting to itself,
    and that the connection does not already exist.

    Args:
        node_id (int): The ID of the source node.
        target_node_id (int): The ID of the target node.
        type_of_connection (ConnectionType): The type of connection to establish.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        dict: A dictionary containing a success message and details of the created connection.

    Raises:
        HTTPException: If the source or target node is not found, if a node attempts to connect to itself,
                       or if the connection already exists.
    """
    # Validate source node
    source_node = db.query(Node).filter(Node.id == node_id).first()
    if not source_node:
        raise HTTPException(status_code=404, detail="Source node not found")

    # Validate target node
    target_node = db.query(Node).filter(Node.id == target_node_id).first()
    if not target_node:
        raise HTTPException(status_code=404, detail="Target node not found")

    # Ensure the source node and target node are not the same
    if node_id == target_node_id:
        raise HTTPException(status_code=400, detail="A node cannot connect to itself")

    # Check if the connection already exists
    existing_connection = db.query(Connection).filter(
        Connection.source_node_id == node_id,
        Connection.target_node_id == target_node_id
    ).first()
    if existing_connection:
        raise HTTPException(status_code=400, detail="Connection already exists")

    # Create a new connection for the source node
    new_connection = Connection(
        source_node_id=node_id,
        target_node_id=target_node_id,
        type_of_connection=type_of_connection
    )
    db.add(new_connection)
    db.commit()
    db.refresh(new_connection)

    return {
        "message": "Connections created successfully",
        "connections": [
            {
                "id": new_connection.id,
                "source_node_id": new_connection.source_node_id,
                "target_node_id": new_connection.target_node_id,
                "type_of_connection": new_connection.type_of_connection.value
            }
        ]
    }


@router.delete("/{node_id}", response_model=dict)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    """
    Delete a node and all its associated connections.

    This endpoint removes a node and any connections where the node is either the source or target.

    Args:
        node_id (int): The ID of the node to delete.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        dict: A message confirming deletion along with the ID of the deleted node.

    Raises:
        HTTPException: If the node is not found.
    """
    # Fetch the node
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Delete all connections where the node is either source or target
    db.query(Connection).filter(
        (Connection.source_node_id == node_id) | (Connection.target_node_id == node_id)
    ).delete()

    # Delete the node
    db.delete(node)
    db.commit()

    return {"message": f"Node with ID {node_id} and its connections were successfully deleted"}


@router.put("/{node_id}/name", response_model=NodeResponse)
def edit_node_name(node_id: int, new_name: str, db: Session = Depends(get_db)):
    """
    Edit the name of an existing node.

    Args:
        node_id (int): The ID of the node to update.
        new_name (str): The new name for the node.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        NodeResponse: The updated node with the new name.

    Raises:
        HTTPException: If the node is not found.
    """
    # Fetch the node
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Update the name
    node.name = new_name
    db.commit()
    db.refresh(node)

    return node


@router.post("/{node_id}/interact", response_model=dict)
def add_interaction(
    node_id: int,
    role: str,
    content: str,
    db: Session = Depends(get_db)
):
    """
    Add an interaction to a node's interaction history and generate a mock assistant response.

    This endpoint saves the user's interaction, creates a mock assistant response,
    and returns both interactions.

    Args:
        node_id (int): The ID of the node for the interaction.
        role (str): The role of the user initiating the interaction.
        content (str): The content of the interaction.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        dict: A dictionary containing a message and details of both the user and assistant interactions.

    Raises:
        HTTPException: If the node is not found.
    """
    # Validate the node
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Create and add the user's interaction
    user_interaction = InteractionHistory(node_id=node_id, role=role, content=content)
    db.add(user_interaction)
    db.commit()
    db.refresh(user_interaction)

    # Create a mock assistant response
    mock_assistant_response = f"Mock response for: {content}"  # Replace with actual logic if needed
    assistant_interaction = InteractionHistory(node_id=node_id, role="assistant", content=mock_assistant_response)
    db.add(assistant_interaction)
    db.commit()
    db.refresh(assistant_interaction)

    return {
        "message": "Interaction added successfully",
        "interactions": [
            {
                "id": user_interaction.id,
                "role": user_interaction.role,
                "content": user_interaction.content
            },
            {
                "id": assistant_interaction.id,
                "role": assistant_interaction.role,
                "content": assistant_interaction.content
            }
        ]
    }


@router.post("/{node_id}/generate-summary", response_model=NodeResponse)
def generate_node_summary(node_id: int, db: Session = Depends(get_db)):
    """
    Generate a summary and a descriptive title for a node using the LLM.

    This endpoint fetches all interaction history for the specified node, 
    combines them into a single text block, and uses the LLM to generate a summary 
    and a new title. The generated summary and title are then saved to the node.

    Args:
        node_id (int): The ID of the node for which to generate the summary.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        NodeResponse: The updated node with the new summary and title.

    Raises:
        HTTPException: If the node is not found, if there are no interactions, or if the LLM fails 
                       to generate a summary and title.
    """
    # Retrieve the node
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Fetch all interaction history associated with the node
    interactions = db.query(InteractionHistory).filter(InteractionHistory.node_id == node_id).all()
    
    if not interactions:
        raise HTTPException(status_code=400, detail="No interactions found for this node.")

    # Format the interaction history into a single string
    interaction_text = "\n".join([f"{interaction.role}: {interaction.content}" for interaction in interactions])

    # Generate the summary and a new title using the LLM
    llm_response = LLMHelper.generate_summary_and_title(interaction_text)

    if not llm_response or "summary" not in llm_response or "title" not in llm_response:
        raise HTTPException(status_code=500, detail="Failed to generate summary and title.")

    # Save the summary and new title into the node
    node.summary = llm_response["summary"]
    node.name = llm_response["title"]
    db.commit()
    db.refresh(node)

    return node
