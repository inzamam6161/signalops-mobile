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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/navigation/types';
import { useAppSelector } from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { IncidentListItem } from '../../incidents/components/IncidentListItem';
import type { Incident } from '../../incidents/model/types';
import { Screen } from '../../../shared/components/Screen';
import { MetricCard } from '../components/MetricCard';
import { ServiceHealthCard } from '../components/ServiceHealthCard';

type Navigation = NativeStackNavigationProp<
  RootStackParamList
>;

export function OverviewScreen() {
  const navigation = useNavigation<Navigation>();

  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const activeCount = useMemo(
    () =>
      incidents.filter(
        incident => incident.status !== 'resolved',
      ).length,
    [incidents],
  );

  const resolvedCount = useMemo(
    () =>
      incidents.filter(
        incident => incident.status === 'resolved',
      ).length,
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
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.metricsRow}>
          <MetricCard
            label="Active incidents"
            value={activeCount}
            tone="danger"
          />

          <MetricCard
            label="Resolved incidents"
            value={resolvedCount}
            tone="success"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Service health
        </Text>

        <ServiceHealthCard />

        <Text style={styles.sectionTitle}>
          Recent incidents
        </Text>
      </View>
    ),
    [activeCount, resolvedCount],
  );

  return (
    <Screen
      title="Good morning, Inzamam"
      subtitle="Here's what's happening with your systems."
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});