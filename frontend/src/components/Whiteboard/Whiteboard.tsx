import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Node,
  EdgeChange,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import {
  fetchNodesAsync,
  fetchConnectionsAsync,
  fetchSubjectsAsync,
  updateNodePositionAsync,
  connectNodesAsync,
  deleteConnectionAsync,
  toggleExpandedState,
  updateZoomAsync,
  toggleShowReport,
} from '../../redux/whiteboardSlice';
import ChatNode from '../Node/CustomNode';
import ExpandedChat from '../Node/ExpandedChat';
import SubjectComponent from '../Subject/SubjectComponent';
import './Whiteboard.styles.css';
import ReportPreview from '../ReportPreview/ReportPreview';
import Tools from '../Tools/Tools';

/**
 * Enum for background variants used in ReactFlow.
 */
enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
  Cross = 'cross',
}

/**
 * Object mapping custom node types to their corresponding components.
 */
const nodeTypes = {
  chatNode: ChatNode,
};

/**
 * Whiteboard Component
 *
 * This component renders the main whiteboard view. It integrates with ReactFlow to display nodes,
 * connections, and subjects. It also provides zoom controls, and conditionally renders expanded chats,
 * report previews, and additional tools.
 *
 * @returns {JSX.Element} The rendered Whiteboard component.
 */
function Whiteboard() {
  // Retrieve required state from Redux store.
  const { nodes, connections, subjects, isExpanded, expandedNodeId, scale, showReport } = useSelector(
    (state: RootState) => state.whiteboard
  );
  const dispatch: AppDispatch = useDispatch();
  const [nodesR, setNodes, onNodesChange] = useNodesState([]);
  const { zoomIn, zoomOut, fitView } = useReactFlow(); // Get ReactFlow zoom controls

  /**
   * Synchronizes the ReactFlow nodes state with the Redux store nodes.
   */
  useEffect(() => {
    setNodes(nodes);
  }, [setNodes, nodes]);

  /**
   * Fetches nodes, connections, and subjects when the component mounts.
   */
  useEffect(() => {
    dispatch(fetchNodesAsync());
    dispatch(fetchConnectionsAsync());
    dispatch(fetchSubjectsAsync(1));
  }, [dispatch]);

  /**
   * Handles changes to the edges.
   *
   * Removes edges that are deleted and dispatches actions to update the state.
   *
   * @param {EdgeChange[]} changes - Array of changes to the edges.
   */
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const deletedEdges = changes.filter((change) => change.type === 'remove');
      deletedEdges.forEach((edge) => {
        if (edge.id) {
          dispatch(deleteConnectionAsync(Number(edge.id)));
        }
      });
    },
    [dispatch]
  );

  /**
   * Handles connecting nodes.
   *
   * Dispatches an action to connect two nodes and then fetches the updated connections.
   *
   * @param {Connection} params - The connection parameters.
   */
  const onConnect = useCallback(
    async (params: Connection) => {
      try {
        await dispatch(
          connectNodesAsync({
            sourceId: Number(params.source),
            targetId: Number(params.target),
            type_of_connection: 'sub_connection',
          })
        );
        await dispatch(fetchConnectionsAsync());
      } catch (error) {
        console.error('Failed to connect nodes or fetch connections:', error);
      }
    },
    [dispatch]
  );

  /**
   * Handles the event when a node drag stops.
   *
   * Dispatches an action to update the node's position and then refetches the nodes.
   *
   * @param {React.MouseEvent<Element, MouseEvent>} _event - The mouse event.
   * @param {Node} node - The node that was dragged.
   */
  const onNodeDragStop = async (_event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    await dispatch(updateNodePositionAsync({ id: Number(node.id), position: node.position }));
    await dispatch(fetchNodesAsync());
  };

  /**
   * Closes the expanded chat view.
   */
  const handleCloseExpandedChat = () => {
    dispatch(toggleExpandedState({ isExpanded: false, nodeId: null }));
  };

  // Find the node that is currently expanded.
  const expandedNode = nodes.find((node) => Number(node.id) === expandedNodeId);

  /**
   * Handles zooming in the view.
   *
   * Triggers ReactFlow's zoom in function and updates the Redux state.
   */
  const handleZoomIn = () => {
    zoomIn(); // ReactFlow zoom in
    dispatch(updateZoomAsync({ id: 1, action: 'in' })); // Update Redux state
  };

  /**
   * Handles zooming out the view.
   *
   * Triggers ReactFlow's zoom out function and updates the Redux state.
   */
  const handleZoomOut = () => {
    zoomOut(); // ReactFlow zoom out
    dispatch(updateZoomAsync({ id: 1, action: 'out' })); // Update Redux state
  };

  /**
   * Resets the zoom to fit the view.
   *
   * Triggers ReactFlow's fitView function and updates the Redux state.
   */
  const handleResetZoom = () => {
    fitView(); // Reset view
    dispatch(updateZoomAsync({ id: 1, action: 'reset' })); // Update Redux state
  };

  console.log(showReport);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodesR}
        edges={connections}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        defaultViewport={{ x: 0, y: 0, zoom: scale }}
      >
        <Controls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitView={handleResetZoom} />
        <Background variant={BackgroundVariant.Cross} gap={10} size={1} />
      </ReactFlow>

      {subjects.map((subject) => (
        <SubjectComponent key={subject.id} subject={subject} />
      ))}

      {isExpanded && expandedNode && (
        <ExpandedChat
          onClose={handleCloseExpandedChat}
          nodeId={expandedNode.id}
          title={expandedNode.data.label}
          interactionHistory={expandedNode.data.interaction_history}
        />
      )}

      {showReport && (
        <ReportPreview onClose={() => dispatch(toggleShowReport())} />
      )}

      <Tools />
    </div>
  );
}

export default Whiteboard;
