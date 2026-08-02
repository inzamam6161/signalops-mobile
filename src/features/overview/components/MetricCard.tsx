import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';

type MetricCardProps = {
  label: string;
  value: number | string;
  tone?: 'danger' | 'success' | 'default';
};

const toneColors = {
  danger: colors.danger,
  success: colors.success,
  default: colors.textPrimary,
};

export const MetricCard = React.memo(
  function MetricCard({
    label,
    value,
    tone = 'default',
  }: MetricCardProps) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.value,
            {
              color: toneColors[tone],
            },
          ]}
        >
          {value}
        </Text>

        <Text style={styles.label}>{label}</Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 104,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
});