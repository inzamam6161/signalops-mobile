import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import type { Incident } from '../../incidents/model/types';
import {
  deriveServiceHealth,
  type ServiceHealthStatus,
} from '../../incidents/lib/operations';

const statusColors: Record<
  ServiceHealthStatus,
  string
> = {
  healthy: colors.success,
  degraded: colors.warning,
  down: colors.danger,
};

const statusLabels: Record<
  ServiceHealthStatus,
  string
> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Critical',
};

type Props = {
  incidents: Incident[];
};

export const ServiceHealthCard = React.memo(
  function ServiceHealthCard({
    incidents,
  }: Props) {
    const services = useMemo(
      () => deriveServiceHealth(incidents),
      [incidents],
    );

    return (
      <View style={styles.card}>
        {services.map(service => {
          const statusColor =
            statusColors[service.status];

          return (
            <View
              key={service.service}
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

                  <View>
                    <Text style={styles.serviceName}>
                      {service.service}
                    </Text>

                    <Text style={styles.serviceMeta}>
                      {service.activeIncidentCount === 0
                        ? 'No active incidents'
                        : `${service.activeIncidentCount} active · ${service.highestSeverity}`}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.status,
                    { color: statusColor },
                  ]}
                >
                  {statusLabels[service.status]}
                </Text>
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
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingRight: spacing.md,
  },
  statusDot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.md,
    width: 10,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  serviceMeta: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  status: {
    fontSize: 12,
    fontWeight: '800',
  },
});
