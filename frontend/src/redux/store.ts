// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import whiteboardReducer from './whiteboardSlice';

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardReducer
  }
});

// Export the store's type
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

