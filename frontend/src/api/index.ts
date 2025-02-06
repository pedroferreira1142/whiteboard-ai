// src/api/index.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api' // Adjust as necessary
});

export const queryLLM = async (input: string, context: { role: string; content: string }[]) => {
    const response = await axios.post('/api/llm/query', {
      prompt: input,
      context,
    });
  
    // Assuming the response from the server includes a 'content' field for the LLM reply
    return response.data.response || ''; // Adjust based on your API structure
  };

// Example usage: Subject refinement
export const refineSubject = async (subjectSummary: string) => {
  const response = await api.post('/llm/refine', { summary: subjectSummary });
  return response.data;
};

export default api;
