import reducer, {
  addIncidentNote,
  assignIncident,
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

  test('auto-assigns an unassigned incident when acknowledged', () => {
    let state = reducer(
      undefined,
      createIncident({
        id: 'INC-AUTO-ASSIGN',
        title: 'Checkout unavailable',
        summary: 'Checkout requests are failing.',
        severity: 'P1',
        service: 'Checkout',
        owner: 'Unassigned',
        team: 'Commerce',
        impact: 'Customers cannot complete checkout.',
        affectedUsers: 1000,
        createdAt:
          '2026-09-20T08:00:00.000Z',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-AUTO-ASSIGN',
        status: 'investigating',
        eventId: 'ack-auto',
        changedAt:
          '2026-09-20T08:04:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    const incident = state.items.find(
      item => item.id === 'INC-AUTO-ASSIGN',
    );

    expect(incident?.owner).toBe(
      'On-call engineer',
    );

    expect(
      incident?.timeline.some(
        event => event.type === 'assignment',
      ),
    ).toBe(true);
  });

  test('resolved incidents reject further mutations', () => {
    let state = reducer(
      undefined,
      createIncident({
        id: 'INC-LOCKED',
        title: 'Worker failure',
        summary: 'Workers stopped processing jobs.',
        severity: 'P2',
        service: 'Worker',
        owner: 'On-call engineer',
        team: 'Platform',
        impact: 'Jobs are delayed.',
        affectedUsers: 50,
        createdAt:
          '2026-09-20T08:00:00.000Z',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-LOCKED',
        status: 'investigating',
        eventId: 'locked-ack',
        changedAt:
          '2026-09-20T08:05:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-LOCKED',
        status: 'monitoring',
        eventId: 'locked-monitor',
        changedAt:
          '2026-09-20T08:15:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-LOCKED',
        status: 'resolved',
        eventId: 'locked-resolved',
        changedAt:
          '2026-09-20T08:20:00.000Z',
        actor: 'On-call engineer',
        resolutionSummary:
          'Restarted the workers.',
      }),
    );

    const before = state.items.find(
      item => item.id === 'INC-LOCKED',
    );

    if (!before) {
      throw new Error('Test incident missing');
    }

    const timelineLength = before.timeline.length;
    const runbookState = before.runbook[0].completed;
    const originalOwner = before.owner;

    state = reducer(
      state,
      addIncidentNote({
        incidentId: 'INC-LOCKED',
        note: 'This should not be added.',
        eventId: 'late-note',
        createdAt:
          '2026-09-20T08:25:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    state = reducer(
      state,
      toggleRunbookItem({
        incidentId: 'INC-LOCKED',
        runbookItemId: before.runbook[0].id,
        eventId: 'late-runbook',
        createdAt:
          '2026-09-20T08:26:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    state = reducer(
      state,
      assignIncident({
        incidentId: 'INC-LOCKED',
        owner: 'Different engineer',
        team: 'Other team',
        eventId: 'late-assignment',
        createdAt:
          '2026-09-20T08:27:00.000Z',
      }),
    );

    state = reducer(
      state,
      updateIncidentStatus({
        incidentId: 'INC-LOCKED',
        status: 'monitoring',
        eventId: 'late-status',
        changedAt:
          '2026-09-20T08:28:00.000Z',
        actor: 'On-call engineer',
      }),
    );

    const after = state.items.find(
      item => item.id === 'INC-LOCKED',
    );

    expect(after?.status).toBe('resolved');
    expect(after?.owner).toBe(originalOwner);
    expect(after?.timeline).toHaveLength(
      timelineLength,
    );
    expect(after?.runbook[0].completed).toBe(
      runbookState,
    );
  });

});
