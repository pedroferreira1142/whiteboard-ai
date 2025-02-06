/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  WhiteboardState,
  NodeType,
  SubjectType,
  InteractionType,
  ConnectionDetailType,
  WhiteboardType,
  ReportType,
} from '../types/whiteboardTypes';
import { Edge, Node } from 'reactflow';

const initialState: WhiteboardState = {
  whiteboards: [], // ✅ Add whiteboards array
  nodes: [],
  subjects: [],
  connections: [],
  scale: 1,
  selectedNodeId: null, // ID of the currently selected node
  highlightedNodeIds: [], // IDs of highlighted nodes
  isExpanded: false,
  expandedNodeId: null,
  reports: [],
  activeReport: null,
  showReport: false,
  showReportHistory: false,
  isCreatingReport: false,
};

/**
 * Async action to create a node using the API.
 *
 * @async
 * @function addNodeAsync
 * @param {Omit<NodeType, 'id'>} newNode - The new node object without an ID.
 * @returns {Promise<NodeType>} The created node with an ID.
 */
export const addNodeAsync = createAsyncThunk<
  NodeType, // Return type of the thunk
  Omit<NodeType, 'id'> // Argument type (Node without the 'id')
>('whiteboard/addNode', async (newNode, thunkAPI) => {
  try {
    const response = await axios.post('http://0.0.0.0:8000/api/node', newNode);
    return response.data as NodeType; // Ensure the response is typed correctly
  } catch (error: any) {
    console.error('Failed to create node:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to create node');
  }
});

/**
 * Async action to fetch all nodes using the API.
 *
 * @async
 * @function fetchNodesAsync
 * @returns {Promise<NodeType[]>} The list of nodes.
 */
export const fetchNodesAsync = createAsyncThunk<
  NodeType[], // Return type of the thunk
  void // No arguments required
>('whiteboard/fetchNodes', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://0.0.0.0:8000/api/node');
    return response.data as NodeType[];
  } catch (error: any) {
    console.error('Failed to fetch nodes:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch nodes');
  }
});

/**
 * Async action to update the position of a node.
 *
 * @async
 * @function updateNodePositionAsync
 * @param {{ id: number; position: { x: number; y: number } }} param0 - The node ID and new position.
 * @returns {Promise<NodeType>} The updated node.
 */
export const updateNodePositionAsync = createAsyncThunk<
  NodeType, // Return type
  { id: number; position: { x: number; y: number } } // Argument type
>('whiteboard/updateNodePosition', async ({ id, position }, thunkAPI) => {
  try {
    const response = await axios.put(`http://0.0.0.0:8000/api/node/${id}/position`, position);
    return response.data as NodeType;
  } catch (error: any) {
    console.error('Failed to update node position:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to update node position');
  }
});

/**
 * Async action to update zoom level.
 *
 * @async
 * @function updateZoomAsync
 * @param {{ id: number; action: 'in' | 'out' | 'reset' | 'custom'; scale?: number }} param0 - The whiteboard ID and zoom action.
 * @returns {Promise<{ id: number; scale: number }>} The updated zoom scale.
 */
export const updateZoomAsync = createAsyncThunk<
  { id: number; scale: number }, // Return type
  { id: number; action: 'in' | 'out' | 'reset' | 'custom'; scale?: number }
>('whiteboard/updateZoom', async ({ id, action }, thunkAPI) => {
  try {
    const response = await axios.patch(
      `http://0.0.0.0:8000/api/whiteboard/${id}/zoom?action=` + action
    );
    return response.data as { id: number; scale: number };
  } catch (error: any) {
    console.error('Failed to update zoom:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to update zoom');
  }
});

/**
 * Async action to connect nodes using the API.
 *
 * @async
 * @function connectNodesAsync
 * @param {{ sourceId: number; targetId: number; type_of_connection: 'main_connection' | 'sub_connection' }} param0 - The connection details.
 * @returns {Promise<ConnectionDetailType>} The connection details.
 */
export const connectNodesAsync = createAsyncThunk<
  ConnectionDetailType, // Return type of the thunk
  { sourceId: number; targetId: number; type_of_connection: 'main_connection' | 'sub_connection' }
>('whiteboard/connectNodes', async ({ sourceId, targetId, type_of_connection }, thunkAPI) => {
  try {
    const response = await axios.post(
      `http://0.0.0.0:8000/api/node/${sourceId}/connect?target_node_id=${targetId}&type_of_connection=${type_of_connection}`
    );
    return response.data as ConnectionDetailType; // Return connection details
  } catch (error: any) {
    console.error('Failed to connect nodes:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to connect nodes');
  }
});

/**
 * Async action to delete a node using the API.
 *
 * @async
 * @function deleteNodeAsync
 * @param {number} nodeId - The ID of the node to delete.
 * @returns {Promise<number>} The ID of the deleted node.
 */
export const deleteNodeAsync = createAsyncThunk<
  number, // Return type (ID of the deleted node)
  number, // Argument type (ID of the node to delete)
  { rejectValue: string } // Rejection value type
>('whiteboard/deleteNode', async (nodeId, thunkAPI) => {
  try {
    await axios.delete(`http://0.0.0.0:8000/api/node/${nodeId}`);
    return nodeId; // Return the ID of the deleted node
  } catch (error: any) {
    console.error('Failed to delete node:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to delete node');
  }
});

/**
 * Async action to edit a node's name.
 *
 * @async
 * @function editNodeNameAsync
 * @param {{ id: number; newName: string }} param0 - The node ID and new name.
 * @returns {Promise<NodeType>} The updated node.
 */
export const editNodeNameAsync = createAsyncThunk<
  NodeType, // Return type of the thunk
  { id: number; newName: string }, // Argument type (ID and new name)
  { rejectValue: string } // Rejection value type
>("whiteboard/editNodeName", async ({ id, newName }, thunkAPI) => {
  try {
    const response = await axios.put(
      `http://0.0.0.0:8000/api/node/${id}/name?new_name=` + newName
    );
    return response.data as NodeType; // Return updated node
  } catch (error: any) {
    console.error("Failed to edit node name:", error);
    return thunkAPI.rejectWithValue(error.response?.data || "Failed to edit node name");
  }
});

/**
 * Async action to add interaction history to a node.
 *
 * @async
 * @function addInteractionAsync
 * @param {{ nodeId: number; role: 'user' | 'assistant'; content: string }} param0 - The node ID and interaction details.
 * @returns {Promise<{ nodeId: number; interaction: InteractionType }>} The node ID and new interaction.
 */
export const addInteractionAsync = createAsyncThunk<
  { nodeId: number; interaction: InteractionType }, // Return type of the thunk
  { nodeId: number; role: 'user' | 'assistant'; content: string }, // Argument type (node ID and interaction details)
  { rejectValue: string } // Rejection value type
>("whiteboard/addInteraction", async ({ nodeId, role, content }, thunkAPI) => {
  try {
    const response = await axios.post<InteractionType>(
      `http://0.0.0.0:8000/api/node/${nodeId}/interact?role=${role}&content=${content}`
    );
    return { nodeId, interaction: response.data }; // Return the node ID and interaction
  } catch (error: any) {
    console.error("Failed to add interaction:", error);
    return thunkAPI.rejectWithValue(error.response?.data || "Failed to add interaction");
  }
});

/**
 * Async action to fetch all connections using the API.
 *
 * @async
 * @function fetchConnectionsAsync
 * @returns {Promise<ConnectionDetailType[]>} The list of connections.
 */
export const fetchConnectionsAsync = createAsyncThunk<
  ConnectionDetailType[], // Return type of the thunk
  void, // No arguments required
  { rejectValue: string } // Rejection value type
>('whiteboard/fetchConnections', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://0.0.0.0:8000/api/connection');
    return response.data as ConnectionDetailType[]; // Return the list of connections
  } catch (error: any) {
    console.error('Failed to fetch connections:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch connections');
  }
});

/**
 * Async action to delete a connection using the API.
 *
 * @async
 * @function deleteConnectionAsync
 * @param {number} connectionId - The ID of the connection to delete.
 * @returns {Promise<number>} The ID of the deleted connection.
 */
export const deleteConnectionAsync = createAsyncThunk<
  number, // Return type (ID of the deleted connection)
  number, // Argument type (ID of the connection to delete)
  { rejectValue: string } // Rejection value type
>('whiteboard/deleteConnection', async (connectionId, thunkAPI) => {
  try {
    await axios.delete(`http://0.0.0.0:8000/api/connection/${connectionId}`);
    return connectionId; // Return the ID of the deleted connection
  } catch (error: any) {
    console.error('Failed to delete connection:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to delete connection');
  }
});

/**
 * Async action to create a subject using the API.
 *
 * @async
 * @function createSubjectAsync
 * @param {Omit<SubjectType, 'id'>} newSubject - The new subject without an ID.
 * @returns {Promise<SubjectType>} The created subject.
 */
export const createSubjectAsync = createAsyncThunk<
  SubjectType, // Return type of the thunk
  Omit<SubjectType, 'id'>, // Argument type (Subject without the 'id')
  { rejectValue: string } // Rejection value type
>('whiteboard/createSubject', async (newSubject, thunkAPI) => {
  try {
    const response = await axios.post('http://0.0.0.0:8000/api/subject', newSubject);
    return response.data as SubjectType; // Ensure the response is typed correctly
  } catch (error: any) {
    console.error('Failed to create subject:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to create subject');
  }
});

/**
 * Async action to fetch all subjects using the API.
 *
 * @async
 * @function fetchSubjectsAsync
 * @param {number} whiteboard_id - The ID of the whiteboard.
 * @returns {Promise<SubjectType[]>} The list of subjects.
 */
export const fetchSubjectsAsync = createAsyncThunk<
  SubjectType[], // Return type of the thunk
  number, // Whiteboard ID argument
  { rejectValue: string } // Rejection value type
>('whiteboard/fetchSubjects', async (whiteboard_id, thunkAPI) => {
  try {
    const response = await axios.get(`http://0.0.0.0:8000/api/subject?whiteboard_id=${whiteboard_id}`);
    return response.data as SubjectType[]; // Return the list of subjects
  } catch (error: any) {
    console.error('Failed to fetch subjects:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch subjects');
  }
});

/**
 * Async action to delete a subject using the API.
 *
 * @async
 * @function deleteSubjectAsync
 * @param {number} subjectId - The ID of the subject to delete.
 * @returns {Promise<number>} The ID of the deleted subject.
 */
export const deleteSubjectAsync = createAsyncThunk<
  number, // Return type (ID of the deleted subject)
  number, // Argument type (ID of the subject to delete)
  { rejectValue: string } // Rejection value type
>('whiteboard/deleteSubject', async (subjectId, thunkAPI) => {
  try {
    await axios.delete(`http://0.0.0.0:8000/api/subject/${subjectId}`);
    return subjectId; // Return the ID of the deleted subject
  } catch (error: any) {
    console.error('Failed to delete subject:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to delete subject');
  }
});

/**
 * Async action to create a summary using the API.
 *
 * @async
 * @function createSummaryAsync
 * @param {{ text: string, subject_id: number }} param0 - The text for the summary and subject ID.
 * @returns {Promise<{ summary: string }>} The generated summary.
 */
export const createSummaryAsync = createAsyncThunk<
  { summary: string }, // Return type of the thunk
  { text: string; subject_id: number }, // Argument type
  { rejectValue: string } // Rejection value type
>('whiteboard/createSummary', async ({ text, subject_id }, thunkAPI) => {
  try {
    const response = await axios.post('http://0.0.0.0:8000/api/subject/create-summary', { text, subject_id });
    return response.data; // { summary: string }
  } catch (error: any) {
    console.error('Failed to create summary:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to create summary');
  }
});

/**
 * Async action to send a prompt to the LLM and retrieve the response.
 *
 * @async
 * @function sendPromptAsync
 * @param {{ nodeId: number; prompt: string }} param0 - The node ID and prompt.
 * @returns {Promise<{ user_prompt: string; context_used: string; llm_response: string }>} The prompt details and LLM response.
 */
export const sendPromptAsync = createAsyncThunk<
  { user_prompt: string; context_used: string; llm_response: string }, // Return type
  { nodeId: number; prompt: string }, // Argument type
  { rejectValue: string } // Rejection value type
>('whiteboard/sendPrompt', async ({ nodeId, prompt }, thunkAPI) => {
  try {
    const response = await axios.post('http://0.0.0.0:8000/api/interaction_history/send-prompt', {
      node_id: nodeId,
      prompt,
    });
    return response.data; // Expected { user_prompt, context_used, llm_response }
  } catch (error: any) {
    console.error('Failed to send prompt:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to send prompt');
  }
});

/**
 * Async action to generate and save a summary for a node.
 *
 * @async
 * @function generateNodeSummaryAsync
 * @param {{ nodeId: number }} param0 - The node ID.
 * @returns {Promise<NodeType>} The updated node with the generated summary.
 */
export const generateNodeSummaryAsync = createAsyncThunk<
  NodeType, // Return type
  { nodeId: number }, // Argument type
  { rejectValue: string } // Rejection value type
>('whiteboard/generateNodeSummary', async ({ nodeId }, thunkAPI) => {
  try {
    const response = await axios.post(`http://0.0.0.0:8000/api/node/${nodeId}/generate-summary`);
    return response.data; // { summary: string }
  } catch (error: any) {
    console.error('Failed to generate node summary:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to generate node summary');
  }
});

/**
 * Async action to fetch all whiteboards from the API.
 *
 * @async
 * @function fetchWhiteboardsAsync
 * @returns {Promise<WhiteboardType[]>} The list of whiteboards.
 */
export const fetchWhiteboardsAsync = createAsyncThunk<
  WhiteboardType[], // Expected response type
  void, // No arguments required
  { rejectValue: string } // Rejection value type
>('whiteboard/fetchWhiteboards', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://0.0.0.0:8000/api/whiteboards'); // Adjust endpoint if needed
    return response.data; // Expected: [{ id: 1, name: "Project Board" }, { id: 2, name: "Risk Board" }]
  } catch (error: any) {
    console.error('Failed to fetch whiteboards:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch whiteboards');
  }
});

/**
 * Async action to create a report for a whiteboard.
 *
 * @async
 * @function createReportAsync
 * @param {{ whiteboard_id: number }} param0 - The whiteboard ID.
 * @returns {Promise<ReportType>} The generated report.
 */
export const createReportAsync = createAsyncThunk<
  ReportType, // Return type
  { whiteboard_id: number }, // Argument type
  { rejectValue: string } // Rejection type
>('whiteboard/createReport', async ({ whiteboard_id }, thunkAPI) => {
  try {
    const response = await axios.post('http://0.0.0.0:8000/api/report', { whiteboard_id });
    return response.data; // The generated report data
  } catch (error: any) {
    console.error('Failed to create report:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to create report');
  }
});

/**
 * Async action to fetch all reports from the API.
 *
 * @async
 * @function fetchReportsAsync
 * @returns {Promise<ReportType[]>} The list of reports.
 */
export const fetchReportsAsync = createAsyncThunk<
  ReportType[], // Return type (list of reports)
  void, // No arguments required
  { rejectValue: string } // Rejection value type
>('whiteboard/fetchReports', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://0.0.0.0:8000/api/report'); // Adjust the endpoint if needed
    return response.data as ReportType[];
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch reports');
  }
});

/**
 * Async action to fetch a report by ID.
 *
 * @async
 * @function fetchReportByIdAsync
 * @param {number} reportId - The ID of the report.
 * @returns {Promise<ReportType>} The fetched report.
 */
export const fetchReportByIdAsync = createAsyncThunk<
  ReportType, // Expected return type
  number, // Report ID
  { rejectValue: string } // Rejection value type
>('whiteboard/fetchReportById', async (reportId, thunkAPI) => {
  try {
    const response = await axios.get(`http://0.0.0.0:8000/api/report/${reportId}`);
    return response.data; // Return the fetched report
  } catch (error: any) {
    console.error(`Failed to fetch report with ID ${reportId}:`, error);
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch report');
  }
});

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    /**
     * Toggles the expanded state of a node.
     *
     * @param {WhiteboardState} state - The current state.
     * @param {PayloadAction<{ isExpanded: boolean; nodeId: string | null }>} action - The payload with expanded state and node ID.
     */
    toggleExpandedState: (
      state,
      action: PayloadAction<{ isExpanded: boolean; nodeId: string | null }>
    ) => {
      state.isExpanded = action.payload.isExpanded;
      state.expandedNodeId = Number(action.payload.nodeId);
    },
    /**
     * Toggles the visibility of the report preview.
     *
     * @param {WhiteboardState} state - The current state.
     */
    toggleShowReport: (state) => {
      state.showReport = !state.showReport;
    },
    /**
     * Sets the visibility of the report history.
     *
     * @param {WhiteboardState} state - The current state.
     * @param {PayloadAction<boolean>} action - The new visibility state.
     */
    toggleShowReportHistory: (state, action: PayloadAction<boolean>) => {
      state.showReportHistory = action.payload;
    },
    /**
     * Sets the state indicating if a report is being created.
     *
     * @param {WhiteboardState} state - The current state.
     * @param {PayloadAction<boolean>} action - The new creation state.
     */
    isCreatingReport: (state, action: PayloadAction<boolean>) => {
      state.isCreatingReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNodeAsync.fulfilled, (/* state, action: PayloadAction<NodeType> */) => {
      // Add the newly created node to the state
      // state.nodes.push(action.payload);
    });
    builder.addCase(fetchNodesAsync.fulfilled, (state, action: PayloadAction<NodeType[]>) => {
      state.nodes = action.payload.map((node): Node => ({
        id: node.id.toString(), // Ensure each node has a unique string ID
        type: 'chatNode', // Map the node type (customize if needed)
        position: node.position, // {x, y} coordinates
        data: {
          label: node.name,
          interaction_history: node.interaction_history,
          connections: node.connections,
          summary: node.summary,
        },
      }));
    });
    builder.addCase(updateNodePositionAsync.fulfilled, (state, action: PayloadAction<NodeType>) => {
      const index = state.nodes.findIndex((n) => Number(n.id) === action.payload.id);
      if (index >= 0) {
        state.nodes[index].position = action.payload.position;
      }
    });
    builder.addCase(updateZoomAsync.fulfilled, (state, action: PayloadAction<{ id: number; scale: number }>) => {
      state.scale = action.payload.scale; // Update the scale in the Redux store
    });
    builder.addCase(connectNodesAsync.fulfilled, (state, action: PayloadAction<ConnectionDetailType>) => {
      // Add the new connection to the Redux store
      state.connections.push({
        id: String(action.payload.id),
        source: String(action.payload.source_node_id),
        target: String(action.payload.target_node_id),
      });
    });
    builder.addCase(deleteNodeAsync.fulfilled, (state, action: PayloadAction<number>) => {
      // Remove the deleted node and its connections
      state.nodes = state.nodes.filter((node) => Number(node.id) !== action.payload);
      state.connections = state.connections.filter(
        (conn) => Number(conn.source) !== action.payload && Number(conn.target) !== action.payload
      );
    });
    builder.addCase(editNodeNameAsync.fulfilled, (state, action: PayloadAction<NodeType>) => {
      const index = state.nodes.findIndex((node) => Number(node.id) === action.payload.id);
      if (index >= 0) {
        state.nodes[index].data.label = action.payload.name; // Update the node name in the Redux store
      }
    });
    builder.addCase(addInteractionAsync.fulfilled, (state, action) => {
      const { nodeId, interaction } = action.payload;
      const node = state.nodes.find((n) => Number(n.id) === nodeId);
      if (node) {
        node.data.interaction_history.push(interaction); // Add the new interaction to the node's history
      }
    });
    builder.addCase(fetchConnectionsAsync.fulfilled, (state, action: PayloadAction<ConnectionDetailType[]>) => {
      state.connections = action.payload.map((connection): Edge => ({
        id: connection.id.toString(), // Ensure the ID is a string
        source: connection.source_node_id.toString(), // Source node ID
        target: connection.target_node_id.toString(), // Target node ID
      }));
    });
    builder.addCase(deleteConnectionAsync.fulfilled, (state, action: PayloadAction<number>) => {
      const connectionId = action.payload;
      // Remove the deleted connection from the state
      state.connections = state.connections.filter((conn) => Number(conn.id) !== connectionId);
    });
    builder.addCase(createSubjectAsync.fulfilled, (state, action: PayloadAction<SubjectType>) => {
      state.subjects.push(action.payload); // Add the newly created subject to the state
    });
    builder.addCase(fetchSubjectsAsync.fulfilled, (state, action: PayloadAction<SubjectType[]>) => {
      state.subjects = action.payload; // Update the subjects in the Redux store
    });
    builder.addCase(deleteSubjectAsync.fulfilled, (state, action: PayloadAction<number>) => {
      // Remove the deleted subject from the Redux store
      state.subjects = state.subjects.filter((subject) => subject.id !== action.payload);
    });
    builder.addCase(createSummaryAsync.fulfilled, (_state, action: PayloadAction<{ summary: string }>) => {
      console.log('Summary generated:', action.payload.summary);
      // Add additional state updates here if you want to save the summary in the Redux store
    });
    builder.addCase(sendPromptAsync.fulfilled, (state, action) => {
      const { user_prompt, llm_response } = action.payload;
      // Find the node to which this interaction belongs
      const node = state.nodes.find((n) => Number(n.id) === state.expandedNodeId);
      if (node) {
        node.data.interaction_history.push(
          { role: 'user', content: user_prompt },
          { role: 'assistant', content: llm_response }
        );
      }
    });
    builder.addCase(generateNodeSummaryAsync.fulfilled, (state, action) => {
      const { summary, name } = action.payload;
      // Find the node that corresponds to the generated summary
      const node = state.nodes.find((n) => Number(n.id) === state.expandedNodeId);
      if (node) {
        node.data.label = name;
        node.data.summary = summary; // Update the node's summary in the Redux store
      }
    });
    builder.addCase(fetchWhiteboardsAsync.fulfilled, (state, action) => {
      state.whiteboards = action.payload; // ✅ Store fetched whiteboards in Redux
    });
    builder.addCase(createReportAsync.fulfilled, (state, action) => {
      // const { id, whiteboard_id, title, introduction, body, conclusion } = action.payload;
      state.activeReport = action.payload; // ✅ Store report in Redux
      // state.showReport = true;
    });
    builder.addCase(fetchReportsAsync.fulfilled, (state, action: PayloadAction<ReportType[]>) => {
      state.reports = action.payload; // ✅ Store fetched reports in Redux
    });
    builder.addCase(fetchReportByIdAsync.fulfilled, (state, action) => {
      state.activeReport = action.payload; // Store the fetched report in Redux
      state.showReport = true;
      state.showReportHistory = false;
    });
  },
});

export const {
  toggleExpandedState,
  toggleShowReport,
  toggleShowReportHistory,
  isCreatingReport,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
