import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { mockIncidents } from './data/mockIncidents';
import type {
  CreateIncidentPayload,
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
  resolutionSummary?: string;
};

type SimulationPayload = {
  eventId: string;
  receivedAt: string;
};

type NotePayload = {
  incidentId: string;
  note: string;
  eventId: string;
  createdAt: string;
  actor: string;
};

type AssignmentPayload = {
  incidentId: string;
  owner: string;
  team: string;
  eventId: string;
  createdAt: string;
};

type RunbookPayload = {
  incidentId: string;
  runbookItemId: string;
  eventId: string;
  createdAt: string;
  actor: string;
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
      return 'status-changed';
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

function buildDefaultRunbook() {
  return [
    {
      id: 'verify-monitoring',
      label: 'Verify monitoring signal',
      completed: false,
    },
    {
      id: 'check-deployments',
      label: 'Check recent deployments',
      completed: false,
    },
    {
      id: 'notify-stakeholders',
      label: 'Notify stakeholders',
      completed: false,
    },
    {
      id: 'apply-mitigation',
      label: 'Apply mitigation',
      completed: false,
    },
    {
      id: 'monitor-recovery',
      label: 'Monitor recovery',
      completed: false,
    },
  ];
}

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    hydrateIncidents: (
      state,
      action: PayloadAction<Incident[]>,
    ) => {
      if (action.payload.length > 0) {
        state.items = action.payload;
      }
    },

    resetIncidents: state => {
      state.items = mockIncidents;
      state.simulationCursor = 0;
    },

    createIncident: (
      state,
      action: PayloadAction<CreateIncidentPayload>,
    ) => {
      const payload = action.payload;

      state.items.unshift({
        ...payload,
        status: 'ongoing',
        detectedAt: 'Just now',
        runbook: buildDefaultRunbook(),
        timeline: [
          {
            id: `${payload.id}-detected`,
            type: 'detected',
            message:
              'Incident created in the SignalOps command center.',
            createdAt: payload.createdAt,
          },
        ],
      });
    },

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

      if (
        action.payload.status === 'investigating' &&
        !incident.acknowledgedAt
      ) {
        incident.acknowledgedAt =
          action.payload.changedAt;
      }

      if (action.payload.status === 'monitoring') {
        incident.monitoringAt =
          action.payload.changedAt;
      }

      if (action.payload.status === 'resolved') {
        incident.resolvedAt =
          action.payload.changedAt;
        incident.resolutionSummary =
          action.payload.resolutionSummary ||
          incident.resolutionSummary ||
          'Incident resolved after mitigation and monitoring.';
      }

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

    addIncidentNote: (
      state,
      action: PayloadAction<NotePayload>,
    ) => {
      const incident = state.items.find(
        item => item.id === action.payload.incidentId,
      );

      if (!incident) {
        return;
      }

      incident.timeline.unshift({
        id: action.payload.eventId,
        type: 'note',
        message: `${action.payload.actor}: ${action.payload.note}`,
        createdAt: action.payload.createdAt,
      });
    },

    assignIncident: (
      state,
      action: PayloadAction<AssignmentPayload>,
    ) => {
      const incident = state.items.find(
        item => item.id === action.payload.incidentId,
      );

      if (!incident) {
        return;
      }

      incident.owner = action.payload.owner;
      incident.team = action.payload.team;

      incident.timeline.unshift({
        id: action.payload.eventId,
        type: 'assignment',
        message: `Incident assigned to ${action.payload.owner} · ${action.payload.team}.`,
        createdAt: action.payload.createdAt,
      });
    },

    toggleRunbookItem: (
      state,
      action: PayloadAction<RunbookPayload>,
    ) => {
      const incident = state.items.find(
        item => item.id === action.payload.incidentId,
      );

      if (!incident) {
        return;
      }

      const runbookItem = incident.runbook.find(
        item =>
          item.id === action.payload.runbookItemId,
      );

      if (!runbookItem) {
        return;
      }

      runbookItem.completed =
        !runbookItem.completed;

      incident.timeline.unshift({
        id: action.payload.eventId,
        type: 'runbook',
        message: `${action.payload.actor} ${
          runbookItem.completed
            ? 'completed'
            : 'reopened'
        } runbook step: ${runbookItem.label}.`,
        createdAt: action.payload.createdAt,
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
  addIncidentNote,
  assignIncident,
  createIncident,
  hydrateIncidents,
  resetIncidents,
  simulateIncidentUpdate,
  toggleRunbookItem,
  updateIncidentStatus,
} = incidentsSlice.actions;

export default incidentsSlice.reducer;
