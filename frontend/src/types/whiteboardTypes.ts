 
// src/types/whiteboardTypes.ts
import  { Edge, Node, } from 'reactflow';
export interface InteractionType {
  id: number; // Unique ID for the interaction
  node_id: number; // The ID of the node this interaction belongs to
  role: 'user' | 'assistant'; // The role in the interaction
  content: string; // The content of the message
  timestamp: string; // ISO timestamp for when the interaction occurred
}


export interface NodeType {
  id: number; // The ID is returned from the backend
  name: string;
  prompt: string;
  subject_id: number | null;
  connections: ConnectionDetailType[]; // Updated to include connection details
  interaction_history: InteractionType[]; 
  position: {
    x: number;
    y: number;
  };
  whiteboard_id: number; // The ID of the whiteboard this node belongs to
  summary: string;
}

export interface SubjectType {
  id: number;
  name: string;
  summary: string;
  whiteboard_id: number;
}

export interface ConnectionType {
  source: number; // node id
  target: number; // node id
}

export interface ConnectionDetailType {
  id: number; // Unique ID for the connection
  source_node_id: number; // Source node ID
  target_node_id: number; // Target node ID
  type_of_connection: 'main_connection' | 'sub_connection'; // Type of connection
}

export interface WhiteboardType {
  id: number;
  name: string;
  scale: number;
}

export interface ReportType {
  id: number; // Unique report ID
  whiteboard_id: number; // The whiteboard this report belongs to
  title: string; // Report title
  introduction: string; // Introduction generated by LLM
  body: string; // The main body of the report, structured from nodes
  conclusion: string; // LLM-generated conclusion
}


export interface WhiteboardState {
  nodes: Node[];
  subjects: SubjectType[];
  connections: Edge[];
  scale: number;
  highlightedNodeIds: number[]; // Stores IDs of nodes to be highlighted
  selectedNodeId: number | null; // Stores the currently selected node ID
  isExpanded: boolean;
  expandedNodeId: number | null;
  whiteboards: WhiteboardType[];
  reports: ReportType[];
  activeReport: ReportType | null;
  showReport: boolean;
  showReportHistory: boolean;
  isCreatingReport: boolean;
}


export interface RootState {
  whiteboard: WhiteboardState;
}
