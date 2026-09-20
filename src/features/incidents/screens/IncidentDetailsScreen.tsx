import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../../../app/navigation/types';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import {
  addIncidentNote,
  assignIncident,
  toggleRunbookItem,
  updateIncidentStatus,
} from '../incidentsSlice';
import {
  formatDuration,
  generatePostmortem,
  getIncidentSla,
} from '../lib/operations';
import {
  severityColors,
  statusColors,
} from '../lib/presentation';
import type {
  IncidentStatus,
  IncidentTimelineEvent,
} from '../model/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'IncidentDetails'
>;

const actor = 'On-call engineer';

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineItem({
  event,
}: {
  event: IncidentTimelineEvent;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineMessage}>
          {event.message}
        </Text>

        <Text style={styles.timelineTime}>
          {formatTimestamp(event.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export function IncidentDetailsScreen({
  route,
}: Props) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState('');
  const [resolutionSummary, setResolutionSummary] =
    useState('');

  const incident = useAppSelector(state =>
    state.incidents.items.find(
      item => item.id === route.params.incidentId,
    ),
  );

  const sla = useMemo(
    () =>
      incident
        ? getIncidentSla(incident)
        : null,
    [incident],
  );

  const changeStatus = (
    status: IncidentStatus,
  ) => {
    if (!incident) {
      return;
    }

    const now = new Date().toISOString();

    dispatch(
      updateIncidentStatus({
        incidentId: incident.id,
        status,
        eventId: `${incident.id}-${Date.now()}`,
        changedAt: now,
        actor,
        resolutionSummary:
          status === 'resolved'
            ? resolutionSummary.trim() ||
              undefined
            : undefined,
      }),
    );

    if (status === 'resolved') {
      setResolutionSummary('');
    }
  };

  const addNote = () => {
    if (!incident || note.trim().length < 3) {
      return;
    }

    dispatch(
      addIncidentNote({
        incidentId: incident.id,
        note: note.trim(),
        eventId: `${incident.id}-note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        actor,
      }),
    );

    setNote('');
  };

  const assignToMe = () => {
    if (!incident) {
      return;
    }

    dispatch(
      assignIncident({
        incidentId: incident.id,
        owner: actor,
        team: incident.team,
        eventId: `${incident.id}-assign-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }),
    );
  };

  const toggleRunbook = (
    runbookItemId: string,
  ) => {
    if (!incident) {
      return;
    }

    dispatch(
      toggleRunbookItem({
        incidentId: incident.id,
        runbookItemId,
        eventId: `${incident.id}-runbook-${Date.now()}`,
        createdAt: new Date().toISOString(),
        actor,
      }),
    );
  };

  if (!incident || !sla) {
    return (
      <Screen
        title="Incident not found"
        subtitle={route.params.incidentId}
        edges={['left', 'right', 'bottom']}
      >
        <View style={styles.card}>
          <Text style={styles.description}>
            This incident is no longer available.
          </Text>
        </View>
      </Screen>
    );
  }

  const nextStatus:
    | IncidentStatus
    | undefined =
    incident.status === 'ongoing'
      ? 'investigating'
      : incident.status === 'investigating'
        ? 'monitoring'
        : incident.status === 'monitoring'
          ? 'resolved'
          : undefined;

  const nextStatusLabel =
    nextStatus === 'investigating'
      ? 'Acknowledge incident'
      : nextStatus === 'monitoring'
        ? 'Start monitoring'
        : nextStatus === 'resolved'
          ? 'Resolve incident'
          : undefined;

  const completedRunbook =
    incident.runbook.filter(
      item => item.completed,
    ).length;

  const sharePostmortem = () => {
    void Share.share({
      message: generatePostmortem(incident),
      title: `${incident.id} postmortem`,
    });
  };

  return (
    <Screen
      title={incident.title}
      subtitle={incident.id}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.severityBadge,
                {
                  backgroundColor:
                    severityColors[incident.severity],
                },
              ]}
            >
              <Text style={styles.severityText}>
                {incident.severity}
              </Text>
            </View>

            <Text
              style={[
                styles.status,
                {
                  color:
                    statusColors[incident.status],
                },
              ]}
            >
              {incident.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.description}>
            {incident.summary}
          </Text>

          <View style={styles.commandGrid}>
            <InfoTile
              label="Owner"
              value={incident.owner}
            />
            <InfoTile
              label="Team"
              value={incident.team}
            />
            <InfoTile
              label="Affected users"
              value={incident.affectedUsers.toLocaleString()}
            />
            <InfoTile
              label="Open duration"
              value={formatDuration(
                sla.minutesOpen,
              )}
            />
          </View>

          {incident.owner === 'Unassigned' &&
          incident.status !== 'resolved' ? (
            <Pressable
              accessibilityRole="button"
              onPress={assignToMe}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonLabel}>
                Assign to on-call engineer
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            SLA status
          </Text>

          <View style={styles.slaRow}>
            <SlaTile
              label="Acknowledge"
              target={`${sla.acknowledgeTargetMinutes}m target`}
              value={
                sla.acknowledgeMinutes === null
                  ? sla.acknowledgeBreached
                    ? 'Breached'
                    : `${Math.max(
                        0,
                        sla.acknowledgeRemainingMinutes,
                      )}m left`
                  : `${sla.acknowledgeMinutes}m`
              }
              breached={
                sla.acknowledgeBreached &&
                !incident.acknowledgedAt
              }
            />

            <SlaTile
              label="Resolve"
              target={`${sla.resolutionTargetMinutes}m target`}
              value={
                sla.resolutionMinutes === null
                  ? sla.resolutionBreached
                    ? 'Breached'
                    : `${Math.max(
                        0,
                        sla.resolutionRemainingMinutes,
                      )}m left`
                  : formatDuration(
                      sla.resolutionMinutes,
                    )
              }
              breached={
                sla.resolutionBreached &&
                !incident.resolvedAt
              }
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Customer impact
          </Text>

          <Text style={styles.sectionValue}>
            {incident.impact}
          </Text>

          <Text style={styles.sectionLabel}>
            Affected service
          </Text>

          <Text style={styles.sectionValue}>
            {incident.service}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Response runbook
            </Text>

            <View style={styles.runbookMeta}>
              {incident.status === 'resolved' ? (
                <Text style={styles.readOnlyLabel}>
                  Read only
                </Text>
              ) : null}

              <Text style={styles.progressText}>
                {completedRunbook}/{incident.runbook.length}
              </Text>
            </View>
          </View>

          {incident.runbook.map(item => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: item.completed,
                disabled:
                  incident.status === 'resolved',
              }}
              disabled={
                incident.status === 'resolved'
              }
              key={item.id}
              onPress={() =>
                toggleRunbook(item.id)
              }
              style={styles.runbookRow}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed &&
                    styles.checkboxComplete,
                ]}
              >
                <Text style={styles.checkboxLabel}>
                  {item.completed ? '✓' : ''}
                </Text>
              </View>

              <Text
                style={[
                  styles.runbookText,
                  item.completed &&
                    styles.runbookTextComplete,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {incident.status !== 'resolved' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Operator note
            </Text>

            <TextInput
              accessibilityLabel="Operator note"
              multiline
              onChangeText={setNote}
              placeholder="Add mitigation, investigation or stakeholder update..."
              placeholderTextColor={colors.textMuted}
              style={styles.noteInput}
              value={note}
            />

            <Pressable
              accessibilityRole="button"
              disabled={note.trim().length < 3}
              onPress={addNote}
              style={[
                styles.secondaryButton,
                note.trim().length < 3 &&
                  styles.disabled,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>
                Add note to timeline
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Incident timeline
          </Text>

          {incident.timeline.map(event => (
            <TimelineItem
              key={event.id}
              event={event}
            />
          ))}
        </View>

        {nextStatus === 'resolved' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Resolution summary
            </Text>

            <TextInput
              accessibilityLabel="Resolution summary"
              multiline
              onChangeText={setResolutionSummary}
              placeholder="What fixed the incident?"
              placeholderTextColor={colors.textMuted}
              style={styles.noteInput}
              value={resolutionSummary}
            />
          </View>
        ) : null}

        {nextStatus && nextStatusLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={nextStatusLabel}
            onPress={() =>
              changeStatus(nextStatus)
            }
            style={({ pressed }) => [
              styles.primaryButton,
              nextStatus === 'resolved' &&
                styles.resolveButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>
              {nextStatusLabel}
            </Text>
          </Pressable>
        ) : null}

        {incident.status === 'resolved' ? (
          <View style={styles.resolvedSection}>
            <View style={styles.resolvedBanner}>
              <Text style={styles.resolvedText}>
                Incident resolved
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Postmortem report
              </Text>

              <Text style={styles.description}>
                {incident.resolutionSummary ||
                  'Resolution recorded.'}
              </Text>

              <View style={styles.reportStats}>
                <InfoTile
                  label="MTTA"
                  value={
                    sla.acknowledgeMinutes === null
                      ? '—'
                      : formatDuration(
                          sla.acknowledgeMinutes,
                        )
                  }
                />
                <InfoTile
                  label="MTTR"
                  value={
                    sla.resolutionMinutes === null
                      ? '—'
                      : formatDuration(
                          sla.resolutionMinutes,
                        )
                  }
                />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={sharePostmortem}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonLabel}>
                  Share incident report
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>
        {label}
      </Text>
      <Text style={styles.infoTileValue}>
        {value}
      </Text>
    </View>
  );
}

function SlaTile({
  label,
  target,
  value,
  breached,
}: {
  label: string;
  target: string;
  value: string;
  breached: boolean;
}) {
  return (
    <View style={styles.slaTile}>
      <Text style={styles.slaLabel}>{label}</Text>
      <Text
        style={[
          styles.slaValue,
          breached && styles.slaValueBreached,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.slaTarget}>
        {target}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  severityText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  infoTile: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    minWidth: '46%',
    padding: spacing.md,
  },
  infoTileLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoTileValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.lg,
    textTransform: 'uppercase',
  },
  sectionValue: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  slaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  slaTile: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    flex: 1,
    padding: spacing.md,
  },
  slaLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  slaValue: {
    color: colors.success,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  slaValueBreached: {
    color: colors.danger,
  },
  slaTarget: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  runbookMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  readOnlyLabel: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  progressText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  runbookRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 24,
  },
  checkboxComplete: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  runbookText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 13,
  },
  runbookTextComplete: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  noteInput: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 90,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 66,
  },
  timelineRail: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    height: 12,
    marginTop: 4,
    width: 12,
  },
  timelineLine: {
    backgroundColor: colors.border,
    flex: 1,
    marginVertical: spacing.xs,
    width: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  timelineMessage: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  timelineTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  resolveButton: {
    backgroundColor: colors.success,
  },
  primaryButtonLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
  resolvedSection: {
    gap: spacing.md,
  },
  resolvedBanner: {
    alignItems: 'center',
    backgroundColor: `${colors.success}20`,
    borderColor: colors.success,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.lg,
  },
  resolvedText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  reportStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
