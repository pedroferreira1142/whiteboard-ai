import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSubjectAsync, createSummaryAsync } from '../../redux/whiteboardSlice';
import { SubjectType } from '../../types/whiteboardTypes';
import './SubjectComponent.styles.css';
import { AppDispatch } from '../../redux/store';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Props for the SubjectComponent.
 */
interface SubjectComponentProps {
  /** The subject object containing details such as id, name, and summary */
  subject: SubjectType;
}

/**
 * SubjectComponent
 *
 * This component displays a subject with its name and summary rendered as Markdown.
 * It provides buttons to update (generate a new summary) and delete the subject.
 *
 * @param {SubjectComponentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SubjectComponent.
 */
const SubjectComponent: React.FC<SubjectComponentProps> = ({ subject }) => {
  const dispatch: AppDispatch = useDispatch();
  const [summary, setSummary] = useState(subject.summary);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  /**
   * Handles deleting the subject.
   */
  const handleDelete = () => {
    dispatch(deleteSubjectAsync(subject.id));
  };

  /**
   * Handles generating an updated summary for the subject.
   * Dispatches an async action to create a new summary and updates the local state with the result.
   */
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await dispatch(
        createSummaryAsync({ text: summary, subject_id: subject.id })
      ).unwrap();
      setSummary(response.summary); // Update the summary with the generated result
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div
      className="subject-container"
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Subject Header */}
      <div className="subject-header">
        <h4 style={{ fontWeight: 'bold' }}>{subject.name}:</h4>
      </div>

      {/* Subject Summary rendered as Markdown */}
      <div
        style={{
          maxHeight: 300,
          overflow: 'scroll',
          fontSize: 13,
          scrollbarColor: 'grey white',
          overflowX: 'hidden',
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
      </div>

      {/* Action Buttons for updating and deleting the subject */}
      <div className="subject-actions">
        <button onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
          {isGeneratingSummary ? 'Updating...' : 'Update'}
        </button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default SubjectComponent;
