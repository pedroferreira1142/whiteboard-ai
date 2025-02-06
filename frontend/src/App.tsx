// src/App.tsx
import React from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import Whiteboard from "./components/Whiteboard/Whiteboard";
import { ReactFlowProvider } from "reactflow"; // ✅ Import ReactFlowProvider
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
	return (
		<>
			<ReactFlowProvider>
				<Toolbar />
				<Whiteboard />
			</ReactFlowProvider>
			<ToastContainer
				position="bottom-right" 
				autoClose={5000} 
				hideProgressBar={false} 
				newestOnTop={false} 
				closeOnClick 
				pauseOnHover 
				draggable 
				theme="light" 
			/>
		</>
	);
};

export default App;
