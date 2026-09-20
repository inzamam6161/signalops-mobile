import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../app/store/hooks';
import {
  setLiveUpdatesEnabled,
} from '../../../app/store/appSlice';
import {
  resetIncidents,
} from '../../incidents/incidentsSlice';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';

export function SettingsScreen() {
  const dispatch = useAppDispatch();

  const liveUpdatesEnabled = useAppSelector(
    state => state.app.liveUpdatesEnabled,
  );

  const handleLiveUpdatesChange = (
    value: boolean,
  ) => {
    dispatch(setLiveUpdatesEnabled(value));
  };

  const resetWorkspace = () => {
    Alert.alert(
      'Reset demo workspace?',
      'This restores bundled incidents and removes local incident changes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(resetIncidents());
          },
        },
      ],
    );
  };

  return (
    <Screen
      title="Settings"
      subtitle="Manage SignalOps preferences."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Monitoring
        </Text>

        <View style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Live incident updates
            </Text>

            <Text style={styles.description}>
              Simulate incoming monitoring signals
              every 12 seconds.
            </Text>

            <Text style={styles.savedLabel}>
              Saved automatically on this device
            </Text>
          </View>

          <Switch
            accessibilityLabel="Live incident updates"
            value={liveUpdatesEnabled}
            onValueChange={
              handleLiveUpdatesChange
            }
            trackColor={{
              false: colors.surfaceElevated,
              true: colors.accent,
            }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Workspace
        </Text>

        <View style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Incident workspace
            </Text>

            <Text style={styles.description}>
              Incident lifecycle changes, notes,
              assignments and runbook progress are
              persisted on this device.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={resetWorkspace}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonLabel}>
            Reset demo workspace
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Application
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Product
            </Text>

            <Text style={styles.infoValue}>
              SignalOps
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Version
            </Text>

            <Text style={styles.infoValue}>
              1.0.0
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Environment
            </Text>

            <Text style={styles.infoValue}>
              Portfolio demo
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  savedLabel: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 46,
  },
  resetButtonLabel: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
});