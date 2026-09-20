module.exports = {
  preset: '@react-native/jest-preset',

  // React Native dependencies increasingly ship modern ESM builds.
  // These packages must be transformed by Babel during Jest runs.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-svg|@reduxjs/toolkit|react-redux|redux|immer|reselect)/)',
  ],
};
