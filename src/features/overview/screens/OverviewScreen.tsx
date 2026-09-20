import React, {
  useCallback,
  useMemo,
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
import { IncidentListItem } from '../../incidents/components/IncidentListItem';
import {
  formatDuration,
  getOperationalMetrics,
} from '../../incidents/lib/operations';
import type { Incident } from '../../incidents/model/types';
import { Screen } from '../../../shared/components/Screen';
import { MetricCard } from '../components/MetricCard';
import { ServiceHealthCard } from '../components/ServiceHealthCard';

type Navigation =
  NativeStackNavigationProp<RootStackParamList>;

export function OverviewScreen() {
  const navigation = useNavigation<Navigation>();

  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const metrics = useMemo(
    () => getOperationalMetrics(incidents),
    [incidents],
  );

  const recentIncidents = useMemo(
    () => incidents.slice(0, 4),
    [incidents],
  );

  const openIncident = useCallback(
    (incidentId: string) => {
      navigation.navigate('IncidentDetails', {
        incidentId,
      });
    },
    [navigation],
  );

  const renderIncident: ListRenderItem<Incident> =
    useCallback(
      ({ item }) => (
        <IncidentListItem
          incident={item}
          onPress={openIncident}
        />
      ),
      [openIncident],
    );

  const keyExtractor = useCallback(
    (item: Incident) => item.id,
    [],
  );

  const dashboardHeader = useMemo(
    () => (
      <View>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.sectionTitle}>
              Operations
            </Text>
            <Text style={styles.sectionSubtitle}>
              Live incident workspace
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('CreateIncident')
            }
            style={styles.createButton}
          >
            <Text style={styles.createButtonLabel}>
              + New incident
            </Text>
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            label="Active"
            value={metrics.active}
            tone="danger"
          />

          <MetricCard
            label="P1 critical"
            value={metrics.critical}
            tone="danger"
          />
        </View>

        <View style={styles.metricsRowSecondary}>
          <MetricCard
            label="SLA breached"
            value={metrics.breached}
            tone={
              metrics.breached > 0
                ? 'danger'
                : 'success'
            }
          />

          <MetricCard
            label="MTTR"
            value={formatDuration(metrics.mttr)}
            tone="success"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Service health
        </Text>

        <Text style={styles.sectionSubtitle}>
          Derived from active incident severity
        </Text>

        <ServiceHealthCard
          incidents={incidents}
        />

        <Text style={styles.sectionTitle}>
          Recent incidents
        </Text>
      </View>
    ),
    [incidents, metrics, navigation],
  );

  return (
    <Screen
      title="SignalOps"
      subtitle="Incident response command center."
    >
      <FlatList
        data={recentIncidents}
        renderItem={renderIncident}
        keyExtractor={keyExtractor}
        ListHeaderComponent={dashboardHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxl,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  createButton: {
    backgroundColor: colors.accent,
    borderRadius: 11,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  createButtonLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metricsRowSecondary: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
