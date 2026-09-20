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
  hydrateIncidents,
} from '../../features/incidents/incidentsSlice';
import type {
  Incident,
} from '../../features/incidents/model/types';
import {
  appStorage,
  storageKeys,
} from '../../shared/storage/appStorage';

type WorkspaceStatus =
  | 'loading'
  | 'ready'
  | 'error';

function isStoredIncidentArray(
  value: unknown,
): value is Incident[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'title' in item &&
        'status' in item &&
        'timeline' in item,
    )
  );
}

export function usePersistedIncidents() {
  const dispatch = useAppDispatch();
  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const [status, setStatus] =
    useState<WorkspaceStatus>('loading');
  const [error, setError] = useState<
    string | undefined
  >();
  const [loadAttempt, setLoadAttempt] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      setStatus('loading');
      setError(undefined);

      try {
        const storedValue =
          await appStorage.getItem(
            storageKeys.incidents,
          );

        if (cancelled) {
          return;
        }

        if (storedValue) {
          const parsed: unknown =
            JSON.parse(storedValue);

          if (isStoredIncidentArray(parsed)) {
            dispatch(hydrateIncidents(parsed));
          }
        }

        setStatus('ready');
      } catch {
        if (cancelled) {
          return;
        }

        setError(
          'SignalOps could not load the saved incident workspace.',
        );
        setStatus('error');
      }
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [dispatch, loadAttempt]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    void appStorage
      .setItem(
        storageKeys.incidents,
        JSON.stringify(incidents),
      )
      .catch(storageError => {
        console.warn(
          'Unable to save the SignalOps incident workspace.',
          storageError,
        );
      });
  }, [incidents, status]);

  const retry = useCallback(() => {
    setLoadAttempt(current => current + 1);
  }, []);

  return {
    status,
    error,
    retry,
  };
}
