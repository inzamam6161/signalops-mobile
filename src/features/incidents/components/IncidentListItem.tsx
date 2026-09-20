import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import {
  severityColors,
  statusColors,
} from '../lib/presentation';
import type {
  Incident,
  IncidentStatus,
} from '../model/types';

type IncidentListItemProps = {
  incident: Incident;
  onPress: (incidentId: string) => void;
};

function formatStatus(status: IncidentStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const IncidentListItem = React.memo(
  function IncidentListItem({
    incident,
    onPress,
  }: IncidentListItemProps) {
    const handlePress = useCallback(() => {
      onPress(incident.id);
    }, [incident.id, onPress]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${incident.title}`}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
      >
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

        <View style={styles.content}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {incident.title}
          </Text>

          <Text style={styles.metadata}>
            {incident.service} · {incident.detectedAt}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.status,
              {
                color: statusColors[incident.status],
              },
            ]}
          >
            {formatStatus(incident.status)}
          </Text>

          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    minHeight: 76,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  severityBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  severityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  metadata: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 24,
    lineHeight: 26,
  },
});