from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.whiteboard import Whiteboard
from app.models.node import Node
from app.models.subject import Subject
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportResponse
from app.services.llm import LLMHelper
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ReportResponse)
def generate_report(report_data: ReportCreate, db: Session = Depends(get_db)):
    """
    Generate a detailed report for a given whiteboard.

    This endpoint creates a report that summarizes the whiteboard by grouping 
    nodes under subjects and structuring the content into an introduction, body sections, 
    and a conclusion. The report is generated using an LLM for introduction, body, and conclusion.

    Args:
        report_data (ReportCreate): The data required to create a report, including the whiteboard ID.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        ReportResponse: The newly created report with title, introduction, body, and conclusion.

    Raises:
        HTTPException: If the whiteboard is not found or no subjects are found for the whiteboard.
    """
    # Fetch the whiteboard
    whiteboard = db.query(Whiteboard).filter(Whiteboard.id == report_data.whiteboard_id).first()
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")

    # Fetch subjects for the whiteboard
    subjects = db.query(Subject).filter(Subject.whiteboard_id == report_data.whiteboard_id).all()
    if not subjects:
        raise HTTPException(status_code=404, detail="No subjects found for this whiteboard")

    # Generate an introduction using LLM based on the subjects' summaries
    subject_summaries = "\n".join([f"{subject.name}: {subject.summary}" for subject in subjects if subject.summary])
    introduction_prompt = f"Create an introduction for a report summarizing the following topics:\n\n{subject_summaries}"
    introduction = LLMHelper.generate_introduction(introduction_prompt)

    # Aggregate nodes into sections based on their relevance and connections
    all_nodes = db.query(Node).filter(Node.whiteboard_id == report_data.whiteboard_id).all()
    node_groups = group_nodes_by_relevance(all_nodes)

    # Generate content for each group using LLM and compile the report body
    sections = []
    for group in node_groups:
        group_content = "\n".join([f"{node.name}: {node.summary}" for node in group if node.summary])
        section_prompt = f"Summarize and explain the following concepts:\n\n{group_content}"
        section_text = LLMHelper.generate_body(section_prompt)
        sections.append(section_text)

    # Combine all sections to form the body of the report
    report_body = "\n\n".join(sections)

    # Generate a conclusion using LLM based on the introduction and body
    conclusion_prompt = f"Based on this report:\n{introduction}\n\n{report_body}\n\nWrite a strong conclusion."
    conclusion = LLMHelper.generate_body(conclusion_prompt)

    # Create and save the report
    new_report = Report(
        whiteboard_id=report_data.whiteboard_id,
        title=f"Report - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        introduction=introduction,
        body=report_body,
        conclusion=conclusion
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


def group_nodes_by_relevance(nodes: List[Node]) -> List[List[Node]]:
    """
    Group nodes into clusters based on their connections.

    Nodes with direct or indirect connections are grouped together. Each group represents 
    a section in the final report.

    Args:
        nodes (List[Node]): A list of nodes to be grouped.

    Returns:
        List[List[Node]]: A list of groups, where each group is a list of connected nodes.
    """
    from collections import defaultdict

    # Create a map of nodes by their ID for quick lookup.
    node_map = {node.id: node for node in nodes}
    adjacency_list = defaultdict(set)

    # Build the adjacency list from node connections.
    for node in nodes:
        for connection in node.connections:
            adjacency_list[node.id].add(connection.target_node_id)
            adjacency_list[connection.target_node_id].add(node.id)

    visited = set()
    groups = []

    def dfs(node_id: int, group: List[Node]):
        """
        Depth-first search to collect connected nodes.

        Args:
            node_id (int): The current node's ID.
            group (List[Node]): The group being built.
        """
        if node_id in visited:
            return
        visited.add(node_id)
        group.append(node_map[node_id])
        for neighbor in adjacency_list[node_id]:
            dfs(neighbor, group)

    # Perform DFS on each unvisited node to form groups.
    for node in nodes:
        if node.id not in visited:
            group = []
            dfs(node.id, group)
            groups.append(group)

    return groups


@router.get("/", response_model=List[ReportResponse])
def get_all_reports(db: Session = Depends(get_db)):
    """
    Retrieve all reports from the database.

    Args:
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        List[ReportResponse]: A list of all reports.

    Raises:
        HTTPException: If no reports are found.
    """
    reports = db.query(Report).all()
    if not reports:
        raise HTTPException(status_code=404, detail="No reports found")
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single report by its ID.

    Args:
        report_id (int): The ID of the report to retrieve.
        db (Session): The SQLAlchemy session provided by dependency injection.

    Returns:
        ReportResponse: The report corresponding to the provided ID.

    Raises:
        HTTPException: If the report is not found.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
