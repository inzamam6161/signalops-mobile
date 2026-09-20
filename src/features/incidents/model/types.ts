export type IncidentSeverity = 'P1' | 'P2' | 'P3';

export type IncidentStatus =
  | 'ongoing'
  | 'investigating'
  | 'monitoring'
  | 'resolved';

export type IncidentEventType =
  | 'detected'
  | 'acknowledged'
  | 'status-changed'
  | 'assignment'
  | 'note'
  | 'runbook'
  | 'resolved'
  | 'live-update';

export type IncidentTimelineEvent = {
  id: string;
  type: IncidentEventType;
  message: string;
  createdAt: string;
};

export type RunbookItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type Incident = {
  id: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  detectedAt: string;
  createdAt: string;
  owner: string;
  team: string;
  impact: string;
  affectedUsers: number;
  acknowledgedAt?: string;
  monitoringAt?: string;
  resolvedAt?: string;
  resolutionSummary?: string;
  runbook: RunbookItem[];
  timeline: IncidentTimelineEvent[];
};

export type CreateIncidentPayload = {
  id: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  service: string;
  owner: string;
  team: string;
  impact: string;
  affectedUsers: number;
  createdAt: string;
};
