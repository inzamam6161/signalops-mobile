import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { mockIncidents } from './data/mockIncidents';
import type {
  Incident,
  IncidentEventType,
  IncidentStatus,
} from './model/types';

type IncidentsState = {
  items: Incident[];
  simulationCursor: number;
};

type StatusUpdatePayload = {
  incidentId: string;
  status: IncidentStatus;
  eventId: string;
  changedAt: string;
  actor: string;
};

type SimulationPayload = {
  eventId: string;
  receivedAt: string;
};

const initialState: IncidentsState = {
  items: mockIncidents,
  simulationCursor: 0,
};

function getEventType(
  status: IncidentStatus,
): IncidentEventType {
  switch (status) {
    case 'investigating':
      return 'acknowledged';

    case 'resolved':
      return 'resolved';

    default:
      return 'live-update';
  }
}

function getStatusMessage(
  status: IncidentStatus,
  actor: string,
) {
  switch (status) {
    case 'investigating':
      return `${actor} acknowledged the incident.`;

    case 'monitoring':
      return `${actor} moved the incident to monitoring.`;

    case 'resolved':
      return `${actor} resolved the incident.`;

    default:
      return `${actor} updated the incident.`;
  }
}

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    updateIncidentStatus: (
      state,
      action: PayloadAction<StatusUpdatePayload>,
    ) => {
      const incident = state.items.find(
        item => item.id === action.payload.incidentId,
      );

      if (
        !incident ||
        incident.status === action.payload.status
      ) {
        return;
      }

      incident.status = action.payload.status;

      incident.timeline.unshift({
        id: action.payload.eventId,
        type: getEventType(action.payload.status),
        message: getStatusMessage(
          action.payload.status,
          action.payload.actor,
        ),
        createdAt: action.payload.changedAt,
      });
    },

    simulateIncidentUpdate: (
      state,
      action: PayloadAction<SimulationPayload>,
    ) => {
      const activeIncidentIndexes = state.items
        .map((incident, index) => ({
          incident,
          index,
        }))
        .filter(
          item => item.incident.status !== 'resolved',
        );

      if (activeIncidentIndexes.length === 0) {
        return;
      }

      const candidate =
        activeIncidentIndexes[
          state.simulationCursor %
            activeIncidentIndexes.length
        ];

      const incident = state.items[candidate.index];

      incident.detectedAt = 'Just now';

      incident.timeline.unshift({
        id: action.payload.eventId,
        type: 'live-update',
        message:
          'A new monitoring signal was received for this incident.',
        createdAt: action.payload.receivedAt,
      });

      const [updatedIncident] = state.items.splice(
        candidate.index,
        1,
      );

      state.items.unshift(updatedIncident);
      state.simulationCursor += 1;
    },
  },
});

export const {
  simulateIncidentUpdate,
  updateIncidentStatus,
} = incidentsSlice.actions;

export default incidentsSlice.reducer;