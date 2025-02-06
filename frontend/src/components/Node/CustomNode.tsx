import { useState, KeyboardEvent, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { AiOutlineExpandAlt, AiOutlineClose } from "react-icons/ai"; // Icons
import { CircularProgress } from "@mui/material"; // Material-UI Spinner
import {
    sendPromptAsync,
    generateNodeSummaryAsync,
    deleteNodeAsync,
    fetchNodesAsync,
    fetchConnectionsAsync,
    editNodeNameAsync,
    toggleExpandedState
} from "../../redux/whiteboardSlice";
import { ConnectionDetailType, InteractionType } from '../../types/whiteboardTypes';
import 'reactflow/dist/style.css';
import "./NodeComponent.styles.css";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Interface for the data passed into a ChatNode.
 */
interface ChatNodeData {
    label: string;
    interaction_history: InteractionType[];
    connections: ConnectionDetailType[];
    summary: string;
}

/**
 * ChatNode Component
 *
 * This component represents a chat node within a React Flow diagram.
 * It displays a title, a summary rendered as Markdown, and an input to send prompts.
 * It also provides actions to expand the node, delete it, or edit its title.
 *
 * @param {object} props - The component props.
 * @param {string | number} props.id - The unique identifier for the node.
 * @param {ChatNodeData} props.data - The data object for the node, including label, interactions, connections, and summary.
 * @returns {JSX.Element} The rendered ChatNode component.
 */
function ChatNode({ id, data }: NodeProps<ChatNodeData>): JSX.Element {
    const dispatch: AppDispatch = useDispatch();
    const [input, setInput] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(data.label || "New Node");
    const [isLoading, setIsLoading] = useState(false); // Loading state for requests

    useEffect(() => {
        setTitle(data.label);
    }, [data]);

    /**
     * Handles sending a prompt to the language model.
     * Prevents empty inputs and multiple simultaneous requests.
     */
    const handleSend = async () => {
        if (!input.trim() || isLoading) return; // Prevent sending empty prompts or multiple clicks

        setIsLoading(true); // Set loading state

        try {
            await dispatch(
                sendPromptAsync({
                    nodeId: Number(id),
                    prompt: input,
                })
            );

            setInput("");
            await dispatch(generateNodeSummaryAsync({ nodeId: Number(id) }));
            await dispatch(fetchNodesAsync());
            await dispatch(fetchConnectionsAsync());
        } catch (error) {
            console.error("Error handling interaction:", error);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    /**
     * Handles deleting the node.
     */
    const handleDeleteNode = () => {
        dispatch(deleteNodeAsync(Number(id)));
    };

    /**
     * Handles expanding the node.
     */
    const handleExpand = () => {
        dispatch(toggleExpandedState({ isExpanded: true, nodeId: id }));
    };

    /**
     * Handles saving the edited node title.
     */
    const handleSaveTitle = async () => {
        await dispatch(editNodeNameAsync({ id: Number(id), newName: title }));
        setEditingTitle(false);
    };

    /**
     * Handles key down events in the input field.
     * Triggers sending the prompt when the Enter key is pressed.
     *
     * @param {KeyboardEvent<HTMLInputElement>} e - The key event.
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div
            className="node-container"
            style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 10,
                width: 350,
                backgroundColor: '#fff',
                position: 'relative'
            }}
        >
            <div>
                <div className="node-header">
                    {editingTitle ? (
                        <div className="node-title-edit">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexFlow: 'row' }}>
                            <h4 className="node-title" title={title} style={{ fontWeight: 'bold' }}>
                                <span className="node-title-text">{title}</span>
                            </h4>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <AiOutlineExpandAlt
                            className="expand-icon"
                            onClick={handleExpand}
                            title="Expand Chat"
                            style={{
                                border: '1px solid grey',
                                borderRadius: 2,
                                fontSize: 20
                            }}
                        />
                        <AiOutlineClose
                            className="delete-icon"
                            onClick={handleDeleteNode}
                            title="Delete Node"
                            style={{
                                marginLeft: 15,
                                border: '1px solid red',
                                fontSize: 20,
                                color: "red",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        />
                    </div>
                </div>
                <div style={{
                    maxHeight: 300,
                    overflow: 'scroll',
                    fontSize: 13,
                    scrollbarColor: 'grey white',
                    overflowX: 'hidden',
                    marginBottom: 10,
                    marginTop: 15
                }}
                    className='markdown-node'
                >
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {data.summary || "No summary available yet. Start an interaction to create a dynamic summary."}
                    </Markdown>
                </div>
                <div className="chat-input" style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter your prompt..."
                        onKeyDown={handleKeyDown}
                        disabled={isLoading} // Disable input while loading
                    />
                    <button onClick={handleSend} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={18} color="inherit" /> : "Send"}
                    </button>
                </div>
            </div>

            {/* Target Handle (where other nodes should connect) */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#ff4d4d', width: 12, height: 8, borderRadius: '30%', marginLeft: -8 }}
                className="handle-source"
            />

            {/* Source Handle (where this node connects to others) */}
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#4d94ff', width: 12, height: 8, borderRadius: '30%', marginRight: -8 }}
                className="handle-source"
            />
        </div>
    );
}

export default ChatNode;
