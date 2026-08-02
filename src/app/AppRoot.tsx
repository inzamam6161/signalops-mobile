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
import { usePersistedPreferences } from './hooks/usePersistedPreferences';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from './store/store';

function AppContent() {
  const {
    status,
    error,
    retry,
  } = usePersistedPreferences();

  useIncidentSimulation();

  if (status === 'loading') {
    return <AppBootstrapScreen />;
  }

  if (status === 'error') {
    return (
      <AppBootstrapScreen
        error={error}
        onRetry={retry}
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