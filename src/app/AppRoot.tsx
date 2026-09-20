import React from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import { Provider } from 'react-redux';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { colors } from '../design-system/theme/colors';
import { navigationTheme } from '../design-system/theme/navigationTheme';
import { useIncidentSimulation } from '../features/incidents/hooks/useIncidentSimulation';
import { AppBootstrapScreen } from '../shared/components/app/AppBootstrapScreen';
import { usePersistedIncidents } from './hooks/usePersistedIncidents';
import { usePersistedPreferences } from './hooks/usePersistedPreferences';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from './store/store';

function AppContent() {
  const preferences =
    usePersistedPreferences();
  const workspace =
    usePersistedIncidents();

  useIncidentSimulation();

  const loading =
    preferences.status === 'loading' ||
    workspace.status === 'loading';

  if (loading) {
    return <AppBootstrapScreen />;
  }

  if (preferences.status === 'error') {
    return (
      <AppBootstrapScreen
        error={preferences.error}
        onRetry={preferences.retry}
      />
    );
  }

  if (workspace.status === 'error') {
    return (
      <AppBootstrapScreen
        error={workspace.error}
        onRetry={workspace.retry}
      />
    );
  }

  return (
    <NavigationContainer
      theme={navigationTheme}
    >
      <StatusBar
        backgroundColor={colors.background}
        barStyle="light-content"
      />

      <RootNavigator />
    </NavigationContainer>
  );
}

export function AppRoot() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
