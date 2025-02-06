import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { AiOutlineClose } from "react-icons/ai";
import './ReportPreview.css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReportPDFGenerator from './ReportDownload';

/**
 * Props for the ReportPreview component.
 */
interface ReportPreviewProps {
  /** Callback function to close the report preview popup */
  onClose: () => void;
}

/**
 * ReportPreview Component
 *
 * This component displays a preview of a report using Markdown.
 * It shows the report title, introduction, body, and conclusion sections.
 * Additionally, it includes a PDF generator for downloading the report.
 *
 * @param {ReportPreviewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered ReportPreview component.
 */
const ReportPreview: React.FC<ReportPreviewProps> = ({ onClose }) => {
  const report = useSelector((state: RootState) => state.whiteboard.activeReport);

  return (
    <div className="report-popup-overlay">
      <div className="report-popup">
        {/* Header with title and close button */}
        <div className="report-header">
          <h2>Report Preview</h2>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Render the report content if available */}
        {report ? (
          // This div holds the rendered Markdown along with custom styles.
          <div id="report-content" className="report-content">
            <h3>{report.title}</h3>
            <h4>Introduction</h4>
            <Markdown remarkPlugins={[remarkGfm]}>
              {report.introduction}
            </Markdown>
            <h4>Body</h4>
            <Markdown remarkPlugins={[remarkGfm]}>
              {report.body}
            </Markdown>
            <h4>Conclusion</h4>
            <Markdown remarkPlugins={[remarkGfm]}>
              {report.conclusion}
            </Markdown>
          </div>
        ) : (
          <p>No report found.</p>
        )}

        {/* Include the PDF generator component */}
        <ReportPDFGenerator />
      </div>
    </div>
  );
};

export default ReportPreview;
