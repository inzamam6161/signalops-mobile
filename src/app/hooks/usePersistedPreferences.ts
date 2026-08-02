import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';
import {
  beginPreferencesHydration,
  hydratePreferences,
  preferencesHydrationFailed,
} from '../store/appSlice';
import {
  appStorage,
  storageKeys,
} from '../../shared/storage/appStorage';

type StoredPreferences = {
  liveUpdatesEnabled: boolean;
};

function parsePreferences(
  rawValue: string | null,
): StoredPreferences {
  if (!rawValue) {
    return {
      liveUpdatesEnabled: true,
    };
  }

  const parsedValue: unknown =
    JSON.parse(rawValue);

  if (
    typeof parsedValue === 'object' &&
    parsedValue !== null &&
    'liveUpdatesEnabled' in parsedValue &&
    typeof parsedValue.liveUpdatesEnabled ===
      'boolean'
  ) {
    return {
      liveUpdatesEnabled:
        parsedValue.liveUpdatesEnabled,
    };
  }

  return {
    liveUpdatesEnabled: true,
  };
}

export function usePersistedPreferences() {
  const dispatch = useAppDispatch();

  const preferencesStatus = useAppSelector(
    state => state.app.preferencesStatus,
  );

  const preferencesError = useAppSelector(
    state => state.app.preferencesError,
  );

  const liveUpdatesEnabled = useAppSelector(
    state => state.app.liveUpdatesEnabled,
  );

  const [loadAttempt, setLoadAttempt] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      dispatch(beginPreferencesHydration());

      try {
        const storedValue =
          await appStorage.getItem(
            storageKeys.preferences,
          );

        if (cancelled) {
          return;
        }

        dispatch(
          hydratePreferences(
            parsePreferences(storedValue),
          ),
        );
      } catch {
        if (cancelled) {
          return;
        }

        dispatch(
          preferencesHydrationFailed(
            'SignalOps could not load your saved preferences.',
          ),
        );
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [dispatch, loadAttempt]);

  useEffect(() => {
    if (preferencesStatus !== 'ready') {
      return;
    }

    const preferences: StoredPreferences = {
      liveUpdatesEnabled,
    };

    void appStorage
      .setItem(
        storageKeys.preferences,
        JSON.stringify(preferences),
      )
      .catch(error => {
        console.warn(
          'Unable to save SignalOps preferences.',
          error,
        );
      });
  }, [
    liveUpdatesEnabled,
    preferencesStatus,
  ]);

  const retry = useCallback(() => {
    setLoadAttempt(current => current + 1);
  }, []);

  return {
    status: preferencesStatus,
    error: preferencesError,
    retry,
  };
}