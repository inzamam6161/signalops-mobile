import reducer, {
  addIncidentNote,
  createIncident,
  toggleRunbookItem,
  updateIncidentStatus,
} from '../src/features/incidents/incidentsSlice';

describe('incidents reducer', () => {
  test('supports create -> acknowledge -> monitor -> resolve', () => {
    let state = reducer(
      undefined,
      createIncident({
        id: 'INC-NEW',
        title: 'API outage',
        summary: 'API is returning errors.',
        severity: 'P1',
        service: 'API',
        owner: 'On-call',
        team: 'Platform',
        impact: 'Requests are failing.',
        affectedUsers: 500,
        createdAt:
          '2026-09-20T08:00:00.000Z',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-NEW',
        status: 'investigating',
        eventId: 'ack',
        changedAt:
          '2026-09-20T08:05:00.000Z',
        actor: 'On-call',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-NEW',
        status: 'monitoring',
        eventId: 'monitor',
        changedAt:
          '2026-09-20T08:20:00.000Z',
        actor: 'On-call',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-NEW',
        status: 'resolved',
        eventId: 'resolved',
        changedAt:
          '2026-09-20T08:30:00.000Z',
        actor: 'On-call',
        resolutionSummary:
          'Rolled back the release.',
      }),
    );

    const incident = state.items.find(
      item => item.id === 'INC-NEW',
    );

    expect(incident?.status).toBe('resolved');
    expect(incident?.acknowledgedAt).toBeDefined();
    expect(incident?.monitoringAt).toBeDefined();
    expect(incident?.resolvedAt).toBeDefined();
    expect(incident?.resolutionSummary).toBe(
      'Rolled back the release.',
    );
  });

  test('records notes and runbook actions in timeline', () => {
    let state = reducer(
      undefined,
      createIncident({
        id: 'INC-NOTE',
        title: 'Queue issue',
        summary: 'Queue depth is increasing.',
        severity: 'P2',
        service: 'Worker',
        owner: 'On-call',
        team: 'Platform',
        impact: 'Jobs are delayed.',
        affectedUsers: 30,
        createdAt:
          '2026-09-20T08:00:00.000Z',
      }),
    );

    state = reducer(
      state,
      addIncidentNote({
        incidentId: 'INC-NOTE',
        note: 'Scaled workers to 10.',
        eventId: 'note',
        createdAt:
          '2026-09-20T08:05:00.000Z',
        actor: 'On-call',
      }),
    );

    const runbookItem =
      state.items[0].runbook[0];

    state = reducer(
      state,
      toggleRunbookItem({
        incidentId: 'INC-NOTE',
        runbookItemId: runbookItem.id,
        eventId: 'runbook',
        createdAt:
          '2026-09-20T08:06:00.000Z',
        actor: 'On-call',
      }),
    );

    expect(
      state.items[0].timeline.some(
        event => event.type === 'note',
      ),
    ).toBe(true);

    expect(
      state.items[0].runbook[0].completed,
    ).toBe(true);
  });
});
