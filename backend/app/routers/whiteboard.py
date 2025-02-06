from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.whiteboard import Whiteboard
from app.schemas.whiteboard import WhiteboardCreate, WhiteboardResponse
from typing import Optional

router = APIRouter()

@router.post("/", response_model=WhiteboardResponse)
def create_whiteboard(whiteboard: WhiteboardCreate, db: Session = Depends(get_db)):
    """
    Create a new whiteboard.

    This endpoint creates a new whiteboard using the provided name. The new whiteboard
    is saved to the database and returned in the response.

    Args:
        whiteboard (WhiteboardCreate): The whiteboard data, including the name.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        WhiteboardResponse: The newly created whiteboard.
    """
    new_whiteboard = Whiteboard(name=whiteboard.name)
    db.add(new_whiteboard)
    db.commit()
    db.refresh(new_whiteboard)
    return new_whiteboard

@router.get("/{whiteboard_id}", response_model=WhiteboardResponse)
def get_whiteboard(whiteboard_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a whiteboard by its ID.

    Args:
        whiteboard_id (int): The ID of the whiteboard to retrieve.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        WhiteboardResponse: The whiteboard corresponding to the provided ID.

    Raises:
        HTTPException: If the whiteboard is not found.
    """
    whiteboard = db.query(Whiteboard).filter(Whiteboard.id == whiteboard_id).first()
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    return whiteboard

@router.patch("/{whiteboard_id}/zoom")
def update_zoom(
    whiteboard_id: int,
    action: Optional[str] = "custom",  # Accept custom zoom levels
    scale: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Update the zoom level of a whiteboard.

    This endpoint allows updating the zoom scale of a whiteboard based on the provided action:
      - "in": Increase zoom by 0.1 (up to a maximum of 2.0).
      - "out": Decrease zoom by 0.1 (down to a minimum of 0.5).
      - "reset": Reset zoom to 1.0.
      - "custom": Set zoom to a custom scale value (must be provided and between 0.5 and 2.0).

    Args:
        whiteboard_id (int): The ID of the whiteboard to update.
        action (Optional[str], optional): The zoom action ("in", "out", "reset", or "custom"). Defaults to "custom".
        scale (Optional[float], optional): The custom scale value if action is "custom". Defaults to None.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        dict: A dictionary containing the whiteboard ID and the updated zoom scale.

    Raises:
        HTTPException: If the whiteboard is not found or if the provided action/scale is invalid.
    """
    whiteboard = db.query(Whiteboard).filter(Whiteboard.id == whiteboard_id).first()
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")

    if action == "in":
        whiteboard.scale = min(whiteboard.scale + 0.1, 2.0)  # Max zoom level
    elif action == "out":
        whiteboard.scale = max(whiteboard.scale - 0.1, 0.5)  # Min zoom level
    elif action == "reset":
        whiteboard.scale = 1.0  # Reset zoom level
    elif action == "custom" and scale is not None:
        whiteboard.scale = max(min(scale, 2.0), 0.5)  # Ensure scale is within bounds
    else:
        raise HTTPException(status_code=400, detail="Invalid action or missing scale")

    db.commit()
    db.refresh(whiteboard)
    return {"id": whiteboard.id, "scale": whiteboard.scale}
