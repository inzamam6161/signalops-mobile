export type IncidentSeverity = 'P1' | 'P2' | 'P3';

export type IncidentStatus =
  | 'ongoing'
  | 'investigating'
  | 'monitoring'
  | 'resolved';

export type IncidentEventType =
  | 'detected'
  | 'acknowledged'
  | 'resolved'
  | 'live-update';

export type IncidentTimelineEvent = {
  id: string;
  type: IncidentEventType;
  message: string;
  createdAt: string;
};

export type Incident = {
  id: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  detectedAt: string;
  timeline: IncidentTimelineEvent[];
};