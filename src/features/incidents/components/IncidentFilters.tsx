import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import type { IncidentSeverity } from '../model/types';

export type SeverityFilter =
  | 'all'
  | IncidentSeverity;

type IncidentFiltersProps = {
  query: string;
  selectedSeverity: SeverityFilter;
  onQueryChange: (value: string) => void;
  onSeverityChange: (
    severity: SeverityFilter,
  ) => void;
};

const filters: Array<{
  label: string;
  value: SeverityFilter;
}> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'P1',
    value: 'P1',
  },
  {
    label: 'P2',
    value: 'P2',
  },
  {
    label: 'P3',
    value: 'P3',
  },
];

export const IncidentFilters = React.memo(
  function IncidentFilters({
    query,
    selectedSeverity,
    onQueryChange,
    onSeverityChange,
  }: IncidentFiltersProps) {
    return (
      <View style={styles.container}>
        <TextInput
          accessibilityLabel="Search incidents"
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search title, ID or service"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.input}
        />

        <View style={styles.filterRow}>
          {filters.map(filter => {
            const selected =
              filter.value === selectedSeverity;

            return (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  onSeverityChange(filter.value)
                }
                style={({ pressed }) => [
                  styles.filterButton,
                  selected &&
                    styles.selectedFilterButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    selected &&
                      styles.selectedFilterLabel,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 14,
    height: 50,
    paddingHorizontal: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedFilterButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedFilterLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.7,
  },
});