import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { InteractionType } from "../../types/whiteboardTypes";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { fetchNodesAsync, sendPromptAsync, generateNodeSummaryAsync } from "../../redux/whiteboardSlice";
import { CircularProgress } from "@mui/material"; // Material-UI Spinner
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

/**
 * Props for the ExpandedChat component.
 */
interface ExpandedChatProps {
  /** Callback function to close the expanded chat view */
  onClose: () => void;
  /** The unique identifier of the node */
  nodeId: string;
  /** Title of the chat or node */
  title: string;
  /** Interaction history containing messages between the user and assistant */
  interactionHistory: InteractionType[];
}

/**
 * ExpandedChat Component
 *
 * This component displays an expanded chat view for a node. It includes the title, interaction history rendered as Markdown,
 * an input field to send messages, and a button to scroll to the bottom of the chat.
 *
 * @param {ExpandedChatProps} props - The props for the ExpandedChat component.
 * @returns {JSX.Element} The rendered ExpandedChat component.
 */
const ExpandedChat: React.FC<ExpandedChatProps> = ({
  onClose,
  nodeId,
  title,
  interactionHistory,
}) => {
  const [input, setInput] = useState<string>("");
  const dispatch: AppDispatch = useDispatch();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for requests

  /**
   * Handles changes in the input field.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  /**
   * Sends the prompt/message to the backend.
   * Dispatches actions to send the prompt, generate a node summary, and refresh the nodes.
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true); // Set loading state

    await dispatch(sendPromptAsync({ nodeId: Number(nodeId), prompt: input }));
    await dispatch(generateNodeSummaryAsync({ nodeId: Number(nodeId) }));
    await dispatch(fetchNodesAsync());

    setInput("");
    setIsLoading(false); // Reset loading state
  };

  /**
   * Handles key down events in the input field.
   * Triggers sending the message when the Enter key is pressed.
   *
   * @param {KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  /**
   * Scrolls the chat body to the bottom.
   */
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Show the scroll button briefly when new messages are added
    setShowScrollButton(true);
    const timeout = setTimeout(() => setShowScrollButton(false), 4000);
    return () => clearTimeout(timeout);
  }, [interactionHistory]);

  return (
    <div
      className="expanded-chat-popup"
      style={{
        position: "absolute",
        top: "2.5%",
        left: "2.5%",
        width: "95%",
        height: "95%",
        backgroundColor: "white",
        zIndex: 1000,
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with title and close button */}
      <div
        className="card-header bg-secondary text-white d-flex justify-content-between align-items-center p-3"
        style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
      >
        <h4 className="mb-0">{title}</h4>
        <button className="btn btn-sm btn-light" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Chat body containing the message list */}
      <div
        ref={chatBodyRef}
        className="card-body flex-grow-1 p-3"
        style={{ overflowY: "auto", position: "relative", scrollbarColor: '#d4d4d4 white' }}
      >
        <ul className="list-group" style={{ maxWidth: '60vw', margin: 'auto' }}>
          {interactionHistory.map((msg, index) => (
            <div
              key={index}
              style={{
                overflow: 'hidden',
                fontSize: 13,
                scrollbarColor: 'grey white',
                overflowX: 'hidden',
                marginBottom: 10,
                marginTop: 15,
                borderRadius: 8,
                border: msg.role === "assistant" ? '1px solid #d4d4d4' : '',
                background: msg.role === "assistant" ? '#f9f9f9' : '',
                padding: 10,
              }}
              className={` markdown-node ${msg.role === "user" ? "text-end user-content" : "text-start"} `}
            >
              <strong style={{ fontSize: 14 }}>
                {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:
              </strong>
              <Markdown remarkPlugins={[remarkGfm]}>
                {msg.content || "No summary available yet. Start an interaction to create a dynamic summary."}
              </Markdown>
            </div>
          ))}
        </ul>
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="btn btn-light"
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1001,
              border: "1px solid #ddd",
              borderRadius: "50%",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            ↓
          </button>
        )}
      </div>

      {/* Chat footer with input field and send button */}
      <div className="card-footer p-3" style={{ maxWidth: '60vw', width: '60vw', margin: 'auto' }}>
        <div className="input-group chat-input">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading} // Disable input while loading
          />
          <button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <CircularProgress size={18} color="inherit" /> : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpandedChat;
