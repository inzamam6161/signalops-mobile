import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/navigation/types';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import { updateIncidentStatus } from '../incidentsSlice';
import type {
  IncidentStatus,
  IncidentTimelineEvent,
} from '../model/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'IncidentDetails'
>;

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

  const incident = useAppSelector(state =>
    state.incidents.items.find(
      item => item.id === route.params.incidentId,
    ),
  );

  const changeStatus = (
    status: IncidentStatus,
  ) => {
    if (!incident) {
      return;
    }

    dispatch(
      updateIncidentStatus({
        incidentId: incident.id,
        status,
        eventId: `${incident.id}-${Date.now()}`,
        changedAt: new Date().toISOString(),
        actor: 'Inzamam',
      }),
    );
  };

  if (!incident) {
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

  const canAcknowledge =
    incident.status === 'ongoing';

  const canResolve =
    incident.status === 'investigating' ||
    incident.status === 'monitoring';

  return (
    <Screen
      title={incident.title}
      subtitle={incident.id}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.severityBadge}>
              <Text style={styles.severityText}>
                {incident.severity}
              </Text>
            </View>

            <Text style={styles.status}>
              {incident.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.description}>
            {incident.summary}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Incident information
          </Text>

          <Text style={styles.sectionLabel}>
            Affected service
          </Text>

          <Text style={styles.sectionValue}>
            {incident.service}
          </Text>

          <Text style={styles.sectionLabel}>
            Detected
          </Text>

          <Text style={styles.sectionValue}>
            {incident.detectedAt}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Status timeline
          </Text>

          {incident.timeline.map(event => (
            <TimelineItem
              key={event.id}
              event={event}
            />
          ))}
        </View>

        {canAcknowledge ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Acknowledge incident"
            onPress={() =>
              changeStatus('investigating')
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>
              Acknowledge incident
            </Text>
          </Pressable>
        ) : null}

        {canResolve ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resolve incident"
            onPress={() => changeStatus('resolved')}
            style={({ pressed }) => [
              styles.resolveButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>
              Resolve incident
            </Text>
          </Pressable>
        ) : null}

        {incident.status === 'resolved' ? (
          <View style={styles.resolvedBanner}>
            <Text style={styles.resolvedText}>
              This incident has been resolved.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
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
    backgroundColor: colors.danger,
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
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.lg,
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
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  sectionValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: spacing.xs,
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
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
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
});