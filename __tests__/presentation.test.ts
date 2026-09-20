import { colors } from '../src/design-system/theme/colors';
import {
  severityColors,
  statusColors,
} from '../src/features/incidents/lib/presentation';

describe('incident presentation semantics', () => {
  test('uses consistent severity colors', () => {
    expect(severityColors.P1).toBe(colors.danger);
    expect(severityColors.P2).toBe(colors.warning);
    expect(severityColors.P3).toBe('#4D8DFF');
  });

  test('uses consistent lifecycle colors', () => {
    expect(statusColors.ongoing).toBe(colors.danger);
    expect(statusColors.investigating).toBe(
      colors.warning,
    );
    expect(statusColors.monitoring).toBe('#4D8DFF');
    expect(statusColors.resolved).toBe(
      colors.success,
    );
  });
});
