# SignalOps Mobile

SignalOps is a React Native CLI incident-operations application built to demonstrate production-oriented mobile architecture and operational user experience.

The repository uses local sample data and a deterministic update simulator. It does not claim to connect to a live incident-management backend.

## Features

- Operational overview and service-health dashboard
- Searchable and filterable incident list
- Incident acknowledgement and resolution workflows
- Simulated real-time incident updates
- Incident activity timeline
- Persisted application preferences
- Typed React Navigation routes
- Reusable design-system components
- Optimized `FlatList` rendering
- iOS and Android support

## Architecture

The source is organized by product feature, with shared application, navigation, design-system and storage layers.

```text
src/
â”œâ”€â”€ app/             # App root, navigation, store and bootstrap
â”œâ”€â”€ design-system/   # Theme tokens and navigation styling
â”œâ”€â”€ features/        # Incidents, overview, activity and settings
â””â”€â”€ shared/          # Shared UI and local storage
```

Redux Toolkit owns incident and application state. Async Storage persists user preferences. The incident simulator is isolated behind a feature hook so it can later be replaced by WebSocket or server-sent event infrastructure.

## Technology

- React Native CLI
- TypeScript
- React Navigation
- Redux Toolkit
- Async Storage
- React Native SVG
- Jest

## Run locally

Install dependencies:

```bash
npm install
```

Install iOS pods:

```bash
npx pod-install ios
```

Start Metro:

```bash
npm start
```

In a second terminal, run a platform target:

```bash
npm run ios
# or
npm run android
```

Run the checks:

```bash
npm run lint
npm test
```

## Status

Portfolio engineering build. The current incident feed and service data are simulated; production authentication, backend connectivity, observability and release validation are outside the present scope.
