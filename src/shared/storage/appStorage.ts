import {
  createAsyncStorage,
} from '@react-native-async-storage/async-storage';

export const appStorage =
  createAsyncStorage('signalOpsDatabase');

export const storageKeys = {
  preferences: 'preferences',
  incidents: 'incidents-v2',
} as const;
