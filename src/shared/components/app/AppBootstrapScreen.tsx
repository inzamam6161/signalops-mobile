import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';

type AppBootstrapScreenProps = {
  error?: string | null;
  onRetry?: () => void;
};

export function AppBootstrapScreen({
  error,
  onRetry,
}: AppBootstrapScreenProps) {
  const hasError = Boolean(error);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <View style={styles.signalSmall} />
          <View style={styles.signalMedium} />
          <View style={styles.signalLarge} />
          <View style={styles.signalMedium} />
          <View style={styles.signalSmall} />
        </View>

        <Text style={styles.appName}>
          SignalOps
        </Text>

        {hasError ? (
          <>
            <Text style={styles.errorTitle}>
              Unable to start SignalOps
            </Text>

            <Text style={styles.description}>
              {error}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryLabel}>
                Try again
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator
              color={colors.accent}
              size="small"
              style={styles.loader}
            />

            <Text style={styles.description}>
              Preparing your operations dashboard
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 42,
  },
  signalSmall: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 12,
    width: 4,
  },
  signalMedium: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 24,
    width: 4,
  },
  signalLarge: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 38,
    width: 4,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xl,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    marginTop: spacing.xl,
    minWidth: 140,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retryLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});