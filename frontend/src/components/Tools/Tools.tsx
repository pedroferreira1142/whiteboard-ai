/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  createReportAsync,
  fetchReportsAsync,
  fetchReportByIdAsync,
  isCreatingReport,
  toggleShowReportHistory,
} from "../../redux/whiteboardSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Tools.styles.css";
import { AiOutlineFileText, AiOutlineHistory } from "react-icons/ai";
import ReportHistory from "../ReportHistory/ReportHistory";
import { CircularProgress } from "@mui/material";

/**
 * Tools Component
 *
 * This component renders a set of tools for report management. It includes
 * buttons to create a new report and view report history. When creating a report,
 * a toast notification is displayed with an option to view the created report.
 *
 * @returns {JSX.Element} The rendered Tools component.
 */
const Tools: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const showReportHistory = useSelector((state: RootState) => state.whiteboard.showReportHistory);
  const isCreating = useSelector((state: RootState) => state.whiteboard.isCreatingReport);

  /**
   * Handles closing the report history view.
   */
  const handleOnClose = () => {
    dispatch(toggleShowReportHistory(false));
  };

  /**
   * Handles creating a new report.
   *
   * Dispatches an action to indicate that report creation is in progress,
   * then dispatches an async action to create the report. If the creation is
   * successful, a toast notification with a "View Report" button is shown.
   * In case of an error, an error toast is displayed.
   */
  const handleCreateReport = async () => {
    try {
      await dispatch(isCreatingReport(true));
      const response = await dispatch(createReportAsync({ whiteboard_id: 1 }));

      if (createReportAsync.fulfilled.match(response)) {
        const reportId = response.payload.id;
        console.log(reportId);

        // Show success toast with button to open report
        toast.success(
          <div>
            <p>Report successfully created!</p>
            <button
              onClick={async () => {
                await dispatch(fetchReportByIdAsync(reportId));
                toast.dismiss(); // Dismiss the toast after clicking
              }}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "5px 10px",
                marginTop: "5px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              📄 View Report
            </button>
          </div>,
          {
            position: "bottom-right",
            autoClose: false, // Keep toast open until the user clicks
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    } catch (error) {
      toast.error("❌ Failed to create report. Please try again!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      await dispatch(isCreatingReport(false));
    }
  };

  /**
   * Handles displaying the report history.
   *
   * Dispatches actions to fetch the reports and to show the report history popup.
   */
  const handleShowHistory = () => {
    dispatch(fetchReportsAsync());
    dispatch(toggleShowReportHistory(true));
  };

  return (
    <>
      <div className="tools-container">
        <button className="tool-button" onClick={handleCreateReport}>
          <AiOutlineFileText size={20} />
          {isCreating ? (
            <CircularProgress style={{ margin: "auto" }} size={18} color="inherit" />
          ) : (
            "Create Report"
          )}
        </button>
        <button className="tool-button" onClick={handleShowHistory}>
          <AiOutlineHistory size={20} />
          View History
        </button>
      </div>

      {showReportHistory && <ReportHistory onClose={handleOnClose} />}
    </>
  );
};

export default Tools;
