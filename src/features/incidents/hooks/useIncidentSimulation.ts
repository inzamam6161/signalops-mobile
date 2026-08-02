import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../app/store/hooks';
import { simulateIncidentUpdate } from '../incidentsSlice';

const UPDATE_INTERVAL = 12_000;

export function useIncidentSimulation() {
  const dispatch = useAppDispatch();

  const enabled = useAppSelector(
    state => state.app.liveUpdatesEnabled,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timer:
      | ReturnType<typeof setInterval>
      | undefined;

    const dispatchUpdate = () => {
      dispatch(
        simulateIncidentUpdate({
          eventId: `live-${Date.now()}`,
          receivedAt: new Date().toISOString(),
        }),
      );
    };

    const start = () => {
      if (timer) {
        return;
      }

      timer = setInterval(
        dispatchUpdate,
        UPDATE_INTERVAL,
      );
    };

    const stop = () => {
      if (!timer) {
        return;
      }

      clearInterval(timer);
      timer = undefined;
    };

    const subscription = AppState.addEventListener(
      'change',
      nextState => {
        if (nextState === 'active') {
          start();
        } else {
          stop();
        }
      },
    );

    if (AppState.currentState === 'active') {
      start();
    }

    return () => {
      stop();
      subscription.remove();
    };
  }, [dispatch, enabled]);
}