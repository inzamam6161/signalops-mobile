import {
  deriveServiceHealth,
  generatePostmortem,
  getIncidentSla,
  getOperationalMetrics,
} from '../src/features/incidents/lib/operations';
import type {
  Incident,
} from '../src/features/incidents/model/types';

function createIncident(
  overrides: Partial<Incident> = {},
): Incident {
  return {
    id: 'INC-TEST-1',
    title: 'Test incident',
    summary: 'Something failed.',
    severity: 'P1',
    status: 'ongoing',
    service: 'Checkout API',
    detectedAt: '10 minutes ago',
    createdAt: '2026-09-20T08:00:00.000Z',
    owner: 'On-call',
    team: 'Platform',
    impact: 'Checkout is slow.',
    affectedUsers: 100,
    runbook: [
      {
        id: 'step',
        label: 'Verify',
        completed: true,
      },
    ],
    timeline: [
      {
        id: 'event',
        type: 'detected',
        message: 'Detected',
        createdAt:
          '2026-09-20T08:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

describe('incident operations', () => {
  test('calculates SLA breach from real timestamps', () => {
    const incident = createIncident();

    const sla = getIncidentSla(
      incident,
      Date.parse('2026-09-20T08:20:00.000Z'),
    );

    expect(sla.acknowledgeBreached).toBe(true);
    expect(sla.resolutionBreached).toBe(false);
  });

  test('derives service health from active severity', () => {
    const health = deriveServiceHealth([
      createIncident({
        id: '1',
        severity: 'P1',
      }),
      createIncident({
        id: '2',
        service: 'Search',
        severity: 'P3',
      }),
      createIncident({
        id: '3',
        service: 'Users',
        status: 'resolved',
        resolvedAt:
          '2026-09-20T08:15:00.000Z',
      }),
    ]);

    expect(
      health.find(
        item =>
          item.service === 'Checkout API',
      )?.status,
    ).toBe('down');

    expect(
      health.find(
        item => item.service === 'Search',
      )?.status,
    ).toBe('degraded');

    expect(
      health.find(
        item => item.service === 'Users',
      )?.status,
    ).toBe('healthy');
  });

  test('calculates operational metrics', () => {
    const metrics = getOperationalMetrics(
      [
        createIncident({
          id: '1',
          acknowledgedAt:
            '2026-09-20T08:05:00.000Z',
        }),
        createIncident({
          id: '2',
          status: 'resolved',
          createdAt:
            '2026-09-20T07:00:00.000Z',
          acknowledgedAt:
            '2026-09-20T07:10:00.000Z',
          resolvedAt:
            '2026-09-20T08:00:00.000Z',
        }),
      ],
      Date.parse('2026-09-20T08:20:00.000Z'),
    );

    expect(metrics.active).toBe(1);
    expect(metrics.resolved).toBe(1);
    expect(metrics.mttr).toBe(60);
  });

  test('postmortem contains real incident values', () => {
    const report = generatePostmortem(
      createIncident({
        status: 'resolved',
        acknowledgedAt:
          '2026-09-20T08:05:00.000Z',
        resolvedAt:
          '2026-09-20T08:30:00.000Z',
        resolutionSummary:
          'Rolled back the release.',
      }),
    );

    expect(report).toContain('INC-TEST-1');
    expect(report).toContain(
      'Rolled back the release.',
    );
    expect(report).toContain(
      'Runbook completed: 1/1',
    );
  });
});
