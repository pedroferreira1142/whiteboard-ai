import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.node import Node
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.services.llm import LLMHelper

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

router = APIRouter()

@router.post("/", response_model=SubjectResponse)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    """
    Create a new subject for a whiteboard.

    This endpoint creates a new subject associated with the provided whiteboard.
    It ensures that only one subject exists per whiteboard and logs the creation process.

    Args:
        subject (SubjectCreate): The data required to create a subject, including the whiteboard ID.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        SubjectResponse: The newly created subject.

    Raises:
        HTTPException: If a subject already exists for the specified whiteboard.
    """
    logging.info(f"Attempting to create a subject for whiteboard ID {subject.whiteboard_id}")

    # Check if the whiteboard already has a subject
    existing_subject = db.query(Subject).filter(Subject.whiteboard_id == subject.whiteboard_id).first()
    if existing_subject:
        logging.error(f"Whiteboard ID {subject.whiteboard_id} already has a subject.")
        raise HTTPException(
            status_code=400, 
            detail=f"Whiteboard with ID {subject.whiteboard_id} already has a subject."
        )

    # Proceed with creating the new subject
    new_subject = Subject(**subject.dict())
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    logging.info(f"Successfully created subject ID {new_subject.id} for whiteboard ID {subject.whiteboard_id}")
    return new_subject

@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a subject by its ID.

    Args:
        subject_id (int): The ID of the subject to retrieve.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        SubjectResponse: The subject matching the provided ID.

    Raises:
        HTTPException: If the subject is not found.
    """
    logging.info(f"Fetching subject ID {subject_id}")

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        logging.warning(f"Subject ID {subject_id} not found")
        raise HTTPException(status_code=404, detail="Subject not found")

    logging.info(f"Successfully retrieved subject ID {subject_id}")
    return subject

@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(subject_id: int, subject: SubjectUpdate, db: Session = Depends(get_db)):
    """
    Update an existing subject.

    This endpoint updates the details of a subject using the provided data. Only the fields that are set in the request
    will be updated.

    Args:
        subject_id (int): The ID of the subject to update.
        subject (SubjectUpdate): The data to update for the subject.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        SubjectResponse: The updated subject.

    Raises:
        HTTPException: If the subject is not found.
    """
    logging.info(f"Attempting to update subject ID {subject_id}")

    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        logging.error(f"Subject ID {subject_id} not found for update")
        raise HTTPException(status_code=404, detail="Subject not found")

    for key, value in subject.dict(exclude_unset=True).items():
        setattr(db_subject, key, value)

    db.commit()
    db.refresh(db_subject)

    logging.info(f"Successfully updated subject ID {subject_id}")
    return db_subject

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    """
    Delete a subject by its ID.

    Args:
        subject_id (int): The ID of the subject to delete.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        dict: A message confirming that the subject was deleted successfully.

    Raises:
        HTTPException: If the subject is not found.
    """
    logging.info(f"Attempting to delete subject ID {subject_id}")

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        logging.warning(f"Subject ID {subject_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(subject)
    db.commit()

    logging.info(f"Successfully deleted subject ID {subject_id}")
    return {"message": "Subject deleted successfully"}

@router.get("/", response_model=List[SubjectResponse])
def get_all_subjects(whiteboard_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all subjects for a given whiteboard.

    Args:
        whiteboard_id (int): The ID of the whiteboard to filter subjects.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        List[SubjectResponse]: A list of subjects associated with the specified whiteboard.
    """
    logging.info(f"Fetching all subjects for whiteboard ID {whiteboard_id}")

    subjects = db.query(Subject).filter(Subject.whiteboard_id == whiteboard_id).all()
    
    logging.info(f"Found {len(subjects)} subjects for whiteboard ID {whiteboard_id}")
    return subjects

@router.post("/create-summary", response_model=SubjectResponse)
def create_summary(subject_id: int = Body(...), text: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Generate and update the summary for a subject.

    This endpoint concatenates node summaries and existing subject summary with new text, then generates an
    updated summary using an LLM. The updated summary is saved to the subject.

    Args:
        subject_id (int): The ID of the subject to update.
        text (str): Additional text to include in the summary generation.
        db (Session): The SQLAlchemy database session dependency.

    Returns:
        SubjectResponse: The updated subject with the new summary.

    Raises:
        HTTPException: If the subject is not found or if the LLM fails to generate an updated summary.
    """
    logging.info(f"Generating summary for subject ID {subject_id}")

    # Retrieve the subject by ID
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        logging.error(f"Subject ID {subject_id} not found for summary generation")
        raise HTTPException(status_code=404, detail="Subject not found")

    # Fetch all nodes from the whiteboard where this subject belongs
    nodes = db.query(Node).filter(Node.whiteboard_id == subject.whiteboard_id).all()
    if not nodes:
        logging.warning(f"No nodes found for whiteboard ID {subject.whiteboard_id}")

    # Extract summaries from nodes
    existing_summaries = [node.summary for node in nodes if node.summary]
    
    # Log the summaries found
    logging.info(f"Fetched {len(existing_summaries)} node summaries for whiteboard ID {subject.whiteboard_id}")

    # Combine existing summaries with new text and the current subject summary (if any)
    combined_text = "\n".join(existing_summaries) + f"\n{subject.summary or ''}\n{text}"
    logging.info(f"Combined text for LLM summary generation:\n{combined_text}")

    # Generate the updated summary using LLM
    updated_summary = LLMHelper.generate_summary(combined_text)
    if not updated_summary:
        logging.error(f"Failed to generate summary for subject ID {subject_id}")
        raise HTTPException(status_code=500, detail="Failed to generate updated summary.")

    # Save the updated summary into the subject
    subject.summary = updated_summary
    db.commit()
    db.refresh(subject)

    logging.info(f"Successfully updated summary for subject ID {subject_id}")
    return subject
