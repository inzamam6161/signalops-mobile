import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../../../app/navigation/types';
import { useAppSelector } from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import type {
  IncidentEventType,
  IncidentSeverity,
} from '../../incidents/model/types';

type Navigation =
  NativeStackNavigationProp<RootStackParamList>;

type ActivityItem = {
  id: string;
  incidentId: string;
  incidentTitle: string;
  severity: IncidentSeverity;
  type: IncidentEventType;
  message: string;
  createdAt: string;
};

type SeverityFilter =
  | 'all'
  | IncidentSeverity;

const filters: SeverityFilter[] = [
  'all',
  'P1',
  'P2',
  'P3',
];

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
  onPress,
}: {
  item: ActivityItem;
  onPress: (incidentId: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item.incidentId)}
      style={({ pressed }) => [
        styles.activityCard,
        pressed && styles.pressed,
      ]}
    >
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

      <View style={styles.footerRow}>
        <Text style={styles.incidentId}>
          {item.incidentId}
        </Text>

        <Text style={styles.openLabel}>
          Open →
        </Text>
      </View>
    </Pressable>
  );
}

export function ActivityScreen() {
  const navigation = useNavigation<Navigation>();
  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const [filter, setFilter] =
    useState<SeverityFilter>('all');

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
        .filter(
          item =>
            filter === 'all' ||
            item.severity === filter,
        )
        .sort(
          (first, second) =>
            Date.parse(second.createdAt) -
            Date.parse(first.createdAt),
        ),
    [filter, incidents],
  );

  const openIncident = useCallback(
    (incidentId: string) => {
      navigation.navigate('IncidentDetails', {
        incidentId,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<ActivityItem> =
    useCallback(
      ({ item }) => (
        <ActivityRow
          item={item}
          onPress={openIncident}
        />
      ),
      [openIncident],
    );

  const keyExtractor = useCallback(
    (item: ActivityItem) => item.id,
    [],
  );

  const header = useMemo(
    () => (
      <View style={styles.filters}>
        {filters.map(item => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterButton,
              filter === item &&
                styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === item &&
                  styles.filterLabelActive,
              ]}
            >
              {item === 'all' ? 'All' : item}
            </Text>
          </Pressable>
        ))}
      </View>
    ),
    [filter],
  );

  return (
    <Screen
      title="Activity"
      subtitle="Operational audit trail. Tap an event to open its incident."
    >
      <FlatList
        data={activityItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: `${colors.accent}20`,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: colors.accent,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
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
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  incidentId: {
    color: colors.textMuted,
    fontSize: 11,
  },
  openLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
});
