import React, {
  useCallback,
  useDeferredValue,
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/navigation/types';
import { useAppSelector } from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import {
  IncidentFilters,
  type SeverityFilter,
} from '../components/IncidentFilters';
import { IncidentListItem } from '../components/IncidentListItem';
import type { Incident } from '../model/types';

type Navigation = NativeStackNavigationProp<
  RootStackParamList
>;

export function IncidentsScreen() {
  const navigation = useNavigation<Navigation>();

  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const [query, setQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] =
    useState<SeverityFilter>('all');

  const deferredQuery = useDeferredValue(query);

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = deferredQuery
      .trim()
      .toLowerCase();

    return incidents.filter(incident => {
      const matchesSeverity =
        selectedSeverity === 'all' ||
        incident.severity === selectedSeverity;

      const matchesQuery =
        normalizedQuery.length === 0 ||
        incident.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        incident.id
          .toLowerCase()
          .includes(normalizedQuery) ||
        incident.service
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesSeverity && matchesQuery;
    });
  }, [
    deferredQuery,
    incidents,
    selectedSeverity,
  ]);

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

  const listHeader = useMemo(
    () => (
      <View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('CreateIncident')
          }
          style={styles.createButton}
        >
          <Text style={styles.createButtonLabel}>
            + Create incident
          </Text>
        </Pressable>

        <IncidentFilters
          query={query}
          selectedSeverity={selectedSeverity}
          onQueryChange={setQuery}
          onSeverityChange={setSelectedSeverity}
        />
      </View>
    ),
    [navigation, query, selectedSeverity],
  );

  const emptyState = useMemo(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>
          No incidents found
        </Text>

        <Text style={styles.emptyDescription}>
          Try changing your search or severity filter.
        </Text>
      </View>
    ),
    [],
  );

  return (
    <Screen
      title="Incidents"
      subtitle={`${filteredIncidents.length} matching incidents`}
    >
      <FlatList
        data={filteredIncidents}
        renderItem={renderIncident}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 11,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  createButtonLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 64,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});