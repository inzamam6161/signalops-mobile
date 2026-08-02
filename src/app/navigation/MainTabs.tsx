import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { useAppSelector } from '../store/hooks';
import { ActivityScreen } from '../../features/activity/screens/ActivityScreen';
import { IncidentsScreen } from '../../features/incidents/screens/IncidentsScreen';
import { OverviewScreen } from '../../features/overview/screens/OverviewScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { colors } from '../../design-system/theme/colors';
import {
  TabIcon,
  type TabIconName,
} from '../../shared/components/icons/TabIcon';

import type { MainTabParamList } from './types';

const Tab =
  createBottomTabNavigator<MainTabParamList>();

const iconNames: Record<
  keyof MainTabParamList,
  TabIconName
> = {
  Overview: 'overview',
  Incidents: 'incidents',
  Activity: 'activity',
  Settings: 'settings',
};

export function MainTabs() {
  const incidents = useAppSelector(
    state => state.incidents.items,
  );

  const activeIncidentCount = useMemo(
    () =>
      incidents.filter(
        incident =>
          incident.status !== 'resolved',
      ).length,
    [incidents],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor:
          colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ color, size }) => (
          <TabIcon
            name={iconNames[route.name]}
            color={color}
            size={size}
          />
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      })}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
      />

      <Tab.Screen
        name="Incidents"
        component={IncidentsScreen}
        options={{
          tabBarBadge:
            activeIncidentCount > 0
              ? activeIncidentCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            color: colors.white,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />

      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}