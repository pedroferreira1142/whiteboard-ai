from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.connection import Connection
from typing import List

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_all_connections(db: Session = Depends(get_db)):
    """
    Retrieve all connection records from the database.

    This endpoint queries the database for all Connection records and returns a list
    of dictionaries containing connection details, including the connection ID,
    source node ID, target node ID, and the type of connection.

    Args:
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        List[dict]: A list of dictionaries, each representing a connection.
                    Returns an empty list if no connections are found.
    """
    connections = db.query(Connection).all()
    if not connections:
        return []
    return [
        {
            "id": connection.id,
            "source_node_id": connection.source_node_id,
            "target_node_id": connection.target_node_id,
            "type_of_connection": connection.type_of_connection.value,
        }
        for connection in connections
    ]

@router.delete("/{connection_id}", response_model=dict)
def delete_connection(connection_id: int, db: Session = Depends(get_db)):
    """
    Delete a connection from the database by its ID.

    This endpoint deletes the connection record with the specified connection_id.
    If the connection is not found, it raises an HTTPException with a 404 status code.

    Args:
        connection_id (int): The unique identifier of the connection to delete.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        dict: A dictionary containing a success message and the ID of the deleted connection.
    """
    connection = db.query(Connection).filter(Connection.id == connection_id).first()

    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    db.delete(connection)
    db.commit()

    return {"message": "Connection deleted successfully", "id": connection_id}
