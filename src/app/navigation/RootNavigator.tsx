import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../design-system/theme/colors';
import { IncidentDetailsScreen } from '../../features/incidents/screens/IncidentDetailsScreen';

import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="IncidentDetails"
        component={IncidentDetailsScreen}
        options={{
          title: 'Incident details',
        }}
      />
    </Stack.Navigator>
  );
}