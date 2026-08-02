import { configureStore } from '@reduxjs/toolkit';

import incidentsReducer from '../../features/incidents/incidentsSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    incidents: incidentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;