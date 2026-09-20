import { colors } from '../../../design-system/theme/colors';
import type {
  IncidentSeverity,
  IncidentStatus,
} from '../model/types';

export const severityColors: Record<
  IncidentSeverity,
  string
> = {
  P1: colors.danger,
  P2: colors.warning,
  P3: '#4D8DFF',
};

export const statusColors: Record<
  IncidentStatus,
  string
> = {
  ongoing: colors.danger,
  investigating: colors.warning,
  monitoring: '#4D8DFF',
  resolved: colors.success,
};
