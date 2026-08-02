import type {
  Incident,
  IncidentTimelineEvent,
} from '../model/types';

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

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2026-001',
    title: 'Checkout latency spike',
    summary:
      'Checkout requests are taking longer than the configured performance threshold.',
    severity: 'P1',
    status: 'ongoing',
    service: 'Checkout API',
    detectedAt: '2 minutes ago',
    timeline: [
      createDetectedEvent(
        'INC-2026-001',
        '2026-07-31T04:24:00.000Z',
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
    detectedAt: '18 minutes ago',
    timeline: [
      createDetectedEvent(
        'INC-2026-002',
        '2026-07-31T04:08:00.000Z',
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
    detectedAt: '45 minutes ago',
    timeline: [
      createDetectedEvent(
        'INC-2026-003',
        '2026-07-31T03:41:00.000Z',
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
    detectedAt: '2 hours ago',
    timeline: [
      createDetectedEvent(
        'INC-2026-004',
        '2026-07-31T02:26:00.000Z',
      ),
    ],
  },
  {
    id: 'INC-2026-005',
    title: 'User profile update errors',
    summary:
      'A small percentage of profile updates are failing validation.',
    severity: 'P2',
    status: 'resolved',
    service: 'User Service',
    detectedAt: '4 hours ago',
    timeline: [
      createDetectedEvent(
        'INC-2026-005',
        '2026-07-31T00:26:00.000Z',
      ),
    ],
  },
];