import type {
  Incident,
  IncidentSeverity,
} from '../model/types';

const slaMinutes: Record<
  IncidentSeverity,
  { acknowledge: number; resolve: number }
> = {
  P1: { acknowledge: 15, resolve: 120 },
  P2: { acknowledge: 30, resolve: 240 },
  P3: { acknowledge: 60, resolve: 480 },
};

export type IncidentSla = {
  acknowledgeTargetMinutes: number;
  resolutionTargetMinutes: number;
  minutesOpen: number;
  acknowledgeMinutes: number | null;
  resolutionMinutes: number | null;
  acknowledgeRemainingMinutes: number;
  resolutionRemainingMinutes: number;
  acknowledgeBreached: boolean;
  resolutionBreached: boolean;
};

function minutesBetween(
  start: string,
  endMs: number,
) {
  return Math.max(
    0,
    Math.round(
      (endMs - Date.parse(start)) / 60_000,
    ),
  );
}

export function getIncidentSla(
  incident: Incident,
  nowMs = Date.now(),
): IncidentSla {
  const target = slaMinutes[incident.severity];
  const acknowledgeEndMs = incident.acknowledgedAt
    ? Date.parse(incident.acknowledgedAt)
    : nowMs;

  const resolutionEndMs = incident.resolvedAt
    ? Date.parse(incident.resolvedAt)
    : nowMs;

  const minutesOpen = minutesBetween(
    incident.createdAt,
    resolutionEndMs,
  );

  const acknowledgeMinutes =
    incident.acknowledgedAt
      ? minutesBetween(
          incident.createdAt,
          acknowledgeEndMs,
        )
      : null;

  const resolutionMinutes =
    incident.resolvedAt
      ? minutesBetween(
          incident.createdAt,
          resolutionEndMs,
        )
      : null;

  const currentAckMinutes = minutesBetween(
    incident.createdAt,
    acknowledgeEndMs,
  );

  const currentResolutionMinutes = minutesBetween(
    incident.createdAt,
    resolutionEndMs,
  );

  return {
    acknowledgeTargetMinutes: target.acknowledge,
    resolutionTargetMinutes: target.resolve,
    minutesOpen,
    acknowledgeMinutes,
    resolutionMinutes,
    acknowledgeRemainingMinutes:
      target.acknowledge - currentAckMinutes,
    resolutionRemainingMinutes:
      target.resolve - currentResolutionMinutes,
    acknowledgeBreached:
      currentAckMinutes > target.acknowledge,
    resolutionBreached:
      currentResolutionMinutes > target.resolve,
  };
}

export function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining === 0
    ? `${hours}h`
    : `${hours}h ${remaining}m`;
}

export function getOperationalMetrics(
  incidents: Incident[],
  nowMs = Date.now(),
) {
  const active = incidents.filter(
    incident => incident.status !== 'resolved',
  );

  const resolved = incidents.filter(
    incident => incident.status === 'resolved',
  );

  const critical = active.filter(
    incident => incident.severity === 'P1',
  ).length;

  const breached = active.filter(incident => {
    const sla = getIncidentSla(incident, nowMs);

    return (
      (!incident.acknowledgedAt &&
        sla.acknowledgeBreached) ||
      sla.resolutionBreached
    );
  }).length;

  const acknowledged = incidents.filter(
    incident => incident.acknowledgedAt,
  );

  const mtta =
    acknowledged.length === 0
      ? 0
      : Math.round(
          acknowledged.reduce((sum, incident) => {
            const value = getIncidentSla(
              incident,
              nowMs,
            ).acknowledgeMinutes;

            return sum + (value ?? 0);
          }, 0) / acknowledged.length,
        );

  const mttr =
    resolved.length === 0
      ? 0
      : Math.round(
          resolved.reduce((sum, incident) => {
            const value = getIncidentSla(
              incident,
              nowMs,
            ).resolutionMinutes;

            return sum + (value ?? 0);
          }, 0) / resolved.length,
        );

  return {
    active: active.length,
    resolved: resolved.length,
    critical,
    breached,
    mtta,
    mttr,
  };
}

export type ServiceHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'down';

export type DerivedServiceHealth = {
  service: string;
  status: ServiceHealthStatus;
  activeIncidentCount: number;
  highestSeverity?: IncidentSeverity;
};

const severityWeight: Record<IncidentSeverity, number> = {
  P1: 3,
  P2: 2,
  P3: 1,
};

export function deriveServiceHealth(
  incidents: Incident[],
): DerivedServiceHealth[] {
  const services = Array.from(
    new Set(
      incidents.map(incident => incident.service),
    ),
  );

  return services
    .map(service => {
      const active = incidents.filter(
        incident =>
          incident.service === service &&
          incident.status !== 'resolved',
      );

      const highestSeverity = active
        .map(incident => incident.severity)
        .sort(
          (a, b) =>
            severityWeight[b] - severityWeight[a],
        )[0];

      const status: ServiceHealthStatus =
        highestSeverity === 'P1'
          ? 'down'
          : highestSeverity
            ? 'degraded'
            : 'healthy';

      return {
        service,
        status,
        activeIncidentCount: active.length,
        highestSeverity,
      };
    })
    .sort((first, second) => {
      const statusWeight: Record<
        ServiceHealthStatus,
        number
      > = {
        down: 3,
        degraded: 2,
        healthy: 1,
      };

      return (
        statusWeight[second.status] -
        statusWeight[first.status]
      );
    });
}

export function generatePostmortem(
  incident: Incident,
) {
  const sla = getIncidentSla(incident);

  const timeline = [...incident.timeline]
    .reverse()
    .map(
      event =>
        `- ${new Date(
          event.createdAt,
        ).toLocaleString()}: ${event.message}`,
    )
    .join('\n');

  const runbookDone = incident.runbook.filter(
    item => item.completed,
  ).length;

  return [
    `SignalOps Incident Report — ${incident.id}`,
    '',
    `Title: ${incident.title}`,
    `Severity: ${incident.severity}`,
    `Service: ${incident.service}`,
    `Status: ${incident.status}`,
    `Owner: ${incident.owner}`,
    `Team: ${incident.team}`,
    `Impact: ${incident.impact}`,
    `Affected users: ${incident.affectedUsers.toLocaleString()}`,
    '',
    `Time to acknowledge: ${
      sla.acknowledgeMinutes === null
        ? 'Not acknowledged'
        : formatDuration(sla.acknowledgeMinutes)
    }`,
    `Time to resolve: ${
      sla.resolutionMinutes === null
        ? 'Not resolved'
        : formatDuration(sla.resolutionMinutes)
    }`,
    `Runbook completed: ${runbookDone}/${incident.runbook.length}`,
    '',
    'Resolution summary:',
    incident.resolutionSummary ||
      'No resolution summary was recorded.',
    '',
    'Timeline:',
    timeline || '- No timeline events',
  ].join('\n');
}
