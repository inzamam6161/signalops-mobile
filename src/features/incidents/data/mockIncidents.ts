import type {
  Incident,
  IncidentTimelineEvent,
  RunbookItem,
} from '../model/types';

function isoMinutesAgo(minutes: number) {
  return new Date(
    Date.now() - minutes * 60_000,
  ).toISOString();
}

function createRunbook(): RunbookItem[] {
  return [
    {
      id: 'verify-monitoring',
      label: 'Verify monitoring signal',
      completed: true,
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

function createDetectedEvent(
  incidentId: string,
  createdAt: string,
): IncidentTimelineEvent {
  return {
    id: `${incidentId}-detected`,
    type: 'detected',
    message: 'Incident detected by monitoring rules.',
    createdAt,
  };
}

const incident1CreatedAt = isoMinutesAgo(8);
const incident2CreatedAt = isoMinutesAgo(34);
const incident3CreatedAt = isoMinutesAgo(78);
const incident4CreatedAt = isoMinutesAgo(150);
const incident5CreatedAt = isoMinutesAgo(320);

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2026-001',
    title: 'Checkout latency spike',
    summary:
      'Checkout requests are taking longer than the configured performance threshold.',
    severity: 'P1',
    status: 'ongoing',
    service: 'Checkout API',
    detectedAt: '8 minutes ago',
    createdAt: incident1CreatedAt,
    owner: 'Unassigned',
    team: 'Commerce',
    impact: 'Customers may experience slow checkout confirmation.',
    affectedUsers: 1840,
    runbook: createRunbook(),
    timeline: [
      createDetectedEvent(
        'INC-2026-001',
        incident1CreatedAt,
      ),
    ],
  },
  {
    id: 'INC-2026-002',
    title: 'Payment gateway timeouts',
    summary:
      'Some payment requests are timing out before receiving a gateway response.',
    severity: 'P2',
    status: 'investigating',
    service: 'Payments',
    detectedAt: '34 minutes ago',
    createdAt: incident2CreatedAt,
    acknowledgedAt: isoMinutesAgo(22),
    owner: 'Alex Morgan',
    team: 'Payments',
    impact: 'A subset of card payments require retry.',
    affectedUsers: 620,
    runbook: createRunbook().map(item =>
      item.id === 'check-deployments'
        ? { ...item, completed: true }
        : item,
    ),
    timeline: [
      {
        id: 'INC-2026-002-ack',
        type: 'acknowledged',
        message: 'Alex Morgan acknowledged the incident.',
        createdAt: isoMinutesAgo(22),
      },
      createDetectedEvent(
        'INC-2026-002',
        incident2CreatedAt,
      ),
    ],
  },
  {
    id: 'INC-2026-003',
    title: 'Search responses are slow',
    summary:
      'Search response time has increased for users in multiple regions.',
    severity: 'P3',
    status: 'monitoring',
    service: 'Search Service',
    detectedAt: '78 minutes ago',
    createdAt: incident3CreatedAt,
    acknowledgedAt: isoMinutesAgo(62),
    monitoringAt: isoMinutesAgo(18),
    owner: 'Sam Lee',
    team: 'Discovery',
    impact: 'Search results load more slowly than the target latency.',
    affectedUsers: 430,
    runbook: createRunbook().map(item => ({
      ...item,
      completed:
        item.id !== 'monitor-recovery',
    })),
    timeline: [
      {
        id: 'INC-2026-003-monitor',
        type: 'status-changed',
        message: 'Sam Lee moved the incident to monitoring.',
        createdAt: isoMinutesAgo(18),
      },
      {
        id: 'INC-2026-003-ack',
        type: 'acknowledged',
        message: 'Sam Lee acknowledged the incident.',
        createdAt: isoMinutesAgo(62),
      },
      createDetectedEvent(
        'INC-2026-003',
        incident3CreatedAt,
      ),
    ],
  },
  {
    id: 'INC-2026-004',
    title: 'Email delivery delays',
    summary:
      'Transactional emails are being delivered later than expected.',
    severity: 'P3',
    status: 'monitoring',
    service: 'Notification Worker',
    detectedAt: '2h 30m ago',
    createdAt: incident4CreatedAt,
    acknowledgedAt: isoMinutesAgo(128),
    monitoringAt: isoMinutesAgo(45),
    owner: 'Priya Shah',
    team: 'Messaging',
    impact: 'Password-reset and receipt emails may arrive late.',
    affectedUsers: 210,
    runbook: createRunbook(),
    timeline: [
      {
        id: 'INC-2026-004-monitor',
        type: 'status-changed',
        message:
          'Priya Shah moved the incident to monitoring.',
        createdAt: isoMinutesAgo(45),
      },
      createDetectedEvent(
        'INC-2026-004',
        incident4CreatedAt,
      ),
    ],
  },
  {
    id: 'INC-2026-005',
    title: 'User profile update errors',
    summary:
      'A small percentage of profile updates were failing validation.',
    severity: 'P2',
    status: 'resolved',
    service: 'User Service',
    detectedAt: '5h 20m ago',
    createdAt: incident5CreatedAt,
    acknowledgedAt: isoMinutesAgo(300),
    monitoringAt: isoMinutesAgo(235),
    resolvedAt: isoMinutesAgo(205),
    owner: 'Jordan Kim',
    team: 'Identity',
    impact: 'Some users could not save profile changes.',
    affectedUsers: 96,
    resolutionSummary:
      'Rolled back the validation rule and confirmed normal profile update success rates.',
    runbook: createRunbook().map(item => ({
      ...item,
      completed: true,
    })),
    timeline: [
      {
        id: 'INC-2026-005-resolved',
        type: 'resolved',
        message:
          'Jordan Kim resolved the incident after rollback validation.',
        createdAt: isoMinutesAgo(205),
      },
      createDetectedEvent(
        'INC-2026-005',
        incident5CreatedAt,
      ),
    ],
  },
];
