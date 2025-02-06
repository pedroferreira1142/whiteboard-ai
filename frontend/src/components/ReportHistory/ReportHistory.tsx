import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { AiOutlineClose } from "react-icons/ai";
import "./ReportHistory.styles.css";
import { fetchReportByIdAsync } from "../../redux/whiteboardSlice";

/**
 * Props for the ReportHistory component.
 */
interface ReportHistoryProps {
  /** Callback function to close the report history view */
  onClose: () => void;
}

/**
 * ReportHistory Component
 *
 * This component displays a history of reports. Users can view individual reports by selecting them.
 * It shows a list of report titles and provides a button to fetch and view each report.
 *
 * @param {ReportHistoryProps} props - The props for the component.
 * @returns {JSX.Element} The rendered ReportHistory component.
 */
const ReportHistory: React.FC<ReportHistoryProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const reports = useSelector((state: RootState) => state.whiteboard.reports);

  /**
   * Handles viewing a report.
   *
   * Dispatches an async action to fetch the report details based on the provided report ID.
   *
   * @param {number} reportId - The ID of the report to fetch.
   */
  const handleViewReport = async (reportId: number) => {
    await dispatch(fetchReportByIdAsync(reportId));
  };

  return (
    <div className="history-popup-overlay">
      <div className="history-popup">
        <div className="history-header">
          <h2>Report History</h2>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose size={20} />
          </button>
        </div>

        {reports.length > 0 ? (
          <ul className="history-list">
            {reports.map((report) => (
              <li key={report.id}>
                <span>{report.title}</span>
                <button
                  className="view-report-btn"
                  onClick={() => handleViewReport(report.id)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: "15px" }}>No previous reports available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;
