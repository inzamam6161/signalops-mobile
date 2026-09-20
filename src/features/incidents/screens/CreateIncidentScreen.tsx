import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../../../app/navigation/types';
import {
  useAppDispatch,
} from '../../../app/store/hooks';
import { colors } from '../../../design-system/theme/colors';
import { spacing } from '../../../design-system/theme/spacing';
import { Screen } from '../../../shared/components/Screen';
import {
  createIncident,
} from '../incidentsSlice';
import type {
  IncidentSeverity,
} from '../model/types';

type Navigation =
  NativeStackNavigationProp<RootStackParamList>;

const severities: IncidentSeverity[] = [
  'P1',
  'P2',
  'P3',
];

export function CreateIncidentScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Navigation>();

  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [summary, setSummary] = useState('');
  const [impact, setImpact] = useState('');
  const [owner, setOwner] =
    useState('On-call engineer');
  const [team, setTeam] =
    useState('Platform');
  const [affectedUsers, setAffectedUsers] =
    useState('0');
  const [severity, setSeverity] =
    useState<IncidentSeverity>('P2');

  const canSubmit = useMemo(
    () =>
      title.trim().length >= 4 &&
      service.trim().length >= 2 &&
      summary.trim().length >= 8 &&
      impact.trim().length >= 8,
    [impact, service, summary, title],
  );

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    const now = new Date().toISOString();
    const suffix = String(Date.now()).slice(-6);
    const incidentId = `INC-2026-${suffix}`;

    dispatch(
      createIncident({
        id: incidentId,
        title: title.trim(),
        service: service.trim(),
        summary: summary.trim(),
        impact: impact.trim(),
        owner: owner.trim() || 'Unassigned',
        team: team.trim() || 'Platform',
        severity,
        affectedUsers:
          Number.parseInt(affectedUsers, 10) || 0,
        createdAt: now,
      }),
    );

    navigation.replace('IncidentDetails', {
      incidentId,
    });
  };

  return (
    <Screen
      title="Create incident"
      subtitle="Start an operational response with ownership and impact."
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>
          Severity
        </Text>

        <View style={styles.severityRow}>
          {severities.map(item => (
            <Pressable
              accessibilityRole="button"
              key={item}
              onPress={() => setSeverity(item)}
              style={[
                styles.severityButton,
                severity === item &&
                  styles.severityButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.severityText,
                  severity === item &&
                    styles.severityTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field
          label="Incident title"
          value={title}
          onChangeText={setTitle}
          placeholder="Checkout error rate spike"
        />

        <Field
          label="Affected service"
          value={service}
          onChangeText={setService}
          placeholder="Checkout API"
        />

        <Field
          label="Summary"
          value={summary}
          onChangeText={setSummary}
          placeholder="Describe what monitoring or users are reporting."
          multiline
        />

        <Field
          label="Customer impact"
          value={impact}
          onChangeText={setImpact}
          placeholder="Describe the user-facing impact."
          multiline
        />

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <Field
              label="Owner"
              value={owner}
              onChangeText={setOwner}
              placeholder="On-call engineer"
            />
          </View>

          <View style={styles.column}>
            <Field
              label="Team"
              value={team}
              onChangeText={setTeam}
              placeholder="Platform"
            />
          </View>
        </View>

        <Field
          label="Affected users"
          value={affectedUsers}
          onChangeText={setAffectedUsers}
          placeholder="0"
          keyboardType="number-pad"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Operational workflow
          </Text>
          <Text style={styles.infoBody}>
            A runbook, SLA targets and incident timeline
            will be created automatically.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSubmit}
          onPress={submit}
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.disabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          <Text style={styles.submitLabel}>
            Create incident
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  field: {
    marginTop: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multilineInput: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  severityButtonActive: {
    backgroundColor: `${colors.accent}20`,
    borderColor: colors.accent,
  },
  severityText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  severityTextActive: {
    color: colors.accent,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 54,
  },
  submitLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});
