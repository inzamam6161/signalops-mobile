import React, {
  useCallback,
  useMemo,
} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';

import { useAppSelector } from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import type {
  IncidentEventType,
  IncidentSeverity,
} from '../../incidents/model/types';

type ActivityItem = {
  id: string;
  incidentId: string;
  incidentTitle: string;
  severity: IncidentSeverity;
  type: IncidentEventType;
  message: string;
  createdAt: string;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function ActivityRow({
  item,
}: {
  item: ActivityItem;
}) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.headerRow}>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>
            {item.severity}
          </Text>
        </View>

        <Text style={styles.timestamp}>
          {formatTimestamp(item.createdAt)}
        </Text>
      </View>

      <Text style={styles.incidentTitle}>
        {item.incidentTitle}
      </Text>

      <Text style={styles.message}>
        {item.message}
      </Text>

      <Text style={styles.incidentId}>
        {item.incidentId}
      </Text>
    </View>
  );
}

export function ActivityScreen() {
  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const activityItems = useMemo<ActivityItem[]>(
    () =>
      incidents
        .flatMap(incident =>
          incident.timeline.map(event => ({
            ...event,
            incidentId: incident.id,
            incidentTitle: incident.title,
            severity: incident.severity,
          })),
        )
        .sort(
          (first, second) =>
            Date.parse(second.createdAt) -
            Date.parse(first.createdAt),
        ),
    [incidents],
  );

  const renderItem: ListRenderItem<ActivityItem> =
    useCallback(
      ({ item }) => <ActivityRow item={item} />,
      [],
    );

  const keyExtractor = useCallback(
    (item: ActivityItem) => item.id,
    [],
  );

  return (
    <Screen
      title="Activity"
      subtitle="Incident actions and monitoring updates."
    >
      <FlatList
        data={activityItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 7,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  severityText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
  },
  incidentTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  incidentId: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.md,
  },
});