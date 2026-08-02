import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

export type PreferencesStatus =
  | 'loading'
  | 'ready'
  | 'error';

type AppState = {
  liveUpdatesEnabled: boolean;
  preferencesStatus: PreferencesStatus;
  preferencesError: string | null;
};

const initialState: AppState = {
  liveUpdatesEnabled: true,
  preferencesStatus: 'loading',
  preferencesError: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    beginPreferencesHydration: state => {
      state.preferencesStatus = 'loading';
      state.preferencesError = null;
    },

    hydratePreferences: (
      state,
      action: PayloadAction<{
        liveUpdatesEnabled: boolean;
      }>,
    ) => {
      state.liveUpdatesEnabled =
        action.payload.liveUpdatesEnabled;

      state.preferencesStatus = 'ready';
      state.preferencesError = null;
    },

    preferencesHydrationFailed: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.preferencesStatus = 'error';
      state.preferencesError = action.payload;
    },

    setLiveUpdatesEnabled: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.liveUpdatesEnabled = action.payload;
    },
  },
});

export const {
  beginPreferencesHydration,
  hydratePreferences,
  preferencesHydrationFailed,
  setLiveUpdatesEnabled,
} = appSlice.actions;

export default appSlice.reducer;