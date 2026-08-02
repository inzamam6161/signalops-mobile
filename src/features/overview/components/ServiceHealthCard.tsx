import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import {
  mockServices,
  type ServiceStatus,
} from '../data/mockServices';

const statusColors: Record<ServiceStatus, string> = {
  healthy: colors.success,
  degraded: colors.warning,
  down: colors.danger,
};

export const ServiceHealthCard = React.memo(
  function ServiceHealthCard() {
    return (
      <View style={styles.card}>
        {mockServices.map(service => {
          const statusColor =
            statusColors[service.status];

          return (
            <View
              key={service.id}
              style={styles.serviceRow}
            >
              <View style={styles.rowHeader}>
                <View style={styles.nameContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: statusColor,
                      },
                    ]}
                  />

                  <Text style={styles.serviceName}>
                    {service.name}
                  </Text>
                </View>

                <Text style={styles.uptime}>
                  {service.uptime.toFixed(2)}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: statusColor,
                      width:
                        `${service.uptime}%` as `${number}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  serviceRow: {
    marginBottom: spacing.lg,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  uptime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    height: 6,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 4,
    height: 6,
  },
});