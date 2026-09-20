# SignalOps Mobile

SignalOps is a React Native CLI incident-response command center built to
demonstrate production-oriented mobile architecture, operational workflows and
offline-persistent state.

The repository uses local demo incidents and a deterministic monitoring
simulator. It does **not** claim to connect to a production incident-management
backend.

## Real functionality

- Operational overview with active incidents, P1 count, SLA breaches and MTTR
- Dynamic service health derived from active incident severity
- Create Incident workflow with severity, impact, service, owner and affected users
- Full incident lifecycle: ongoing → investigating → monitoring → resolved
- Assignment / ownership tracking
- Acknowledge and resolution SLA calculations
- Persisted incident workspace with Async Storage
- Incident response runbook / checklist
- Operator notes written into the audit timeline
- Searchable and severity-filtered incident list
- Actionable activity audit trail with incident deep links
- Simulated incoming monitoring signals
- Deterministic postmortem / incident report generation
- Shareable resolved-incident reports
- Persisted monitoring preferences
- Resettable portfolio demo workspace
- Typed React Navigation
- Redux Toolkit state management
- Optimized FlatList rendering
- Jest tests and GitHub Actions CI
- iOS and Android support

## Incident workflow

```text
Create incident
     ↓
Ongoing
     ↓ acknowledge
Investigating
     ↓ mitigation / runbook / notes
Monitoring
     ↓ recovery confirmed
Resolved
     ↓
Postmortem report
```

Each state transition is written into the incident timeline.

## Operational intelligence

SignalOps derives operational metrics from the actual incident timestamps and
state in the device workspace.

### SLA

Targets are deterministic by severity:

| Severity | Acknowledge | Resolve |
| --- | ---: | ---: |
| P1 | 15 min | 2 hours |
| P2 | 30 min | 4 hours |
| P3 | 60 min | 8 hours |

The app calculates acknowledgement breaches, resolution breaches, MTTA and MTTR.

### Service health

Service health is not a static mock percentage.

It is derived from unresolved incidents:

- active P1 → Critical
- active P2/P3 → Degraded
- no active incidents → Healthy

### Postmortem

Resolved incidents can generate a deterministic report containing:

- incident identity and severity
- service and ownership
- customer impact and affected users
- time to acknowledge
- time to resolve
- runbook completion
- resolution summary
- complete incident timeline

The report can be shared through the native share sheet.

## Offline persistence

Incident creation, status transitions, assignments, notes and runbook state are
stored locally with Async Storage. Restarting the app restores the operational
workspace.

Settings includes **Reset demo workspace** for restoring the bundled sample
incidents.

## Architecture

```text
src/
├── app/
│   ├── hooks/           # preference + workspace persistence
│   ├── navigation/      # typed React Navigation
│   └── store/           # Redux Toolkit store
├── design-system/       # colors, spacing, navigation styling
├── features/
│   ├── activity/        # actionable audit trail
│   ├── incidents/
│   │   ├── data/        # bundled demo incidents
│   │   ├── hooks/       # live update simulator
│   │   ├── lib/         # SLA, metrics, service health, postmortem
│   │   ├── model/       # incident domain model
│   │   └── screens/     # list, create, command center
│   ├── overview/        # operational dashboard
│   └── settings/        # preferences + reset
└── shared/
    ├── components/
    └── storage/
```

## Technology

- React Native CLI
- React 19
- TypeScript
- React Navigation
- Redux Toolkit
- Async Storage
- React Native SVG
- Jest
- GitHub Actions

## Run locally

```bash
npm install
npx pod-install ios
npm start
```

In another terminal:

```bash
npm run ios
# or
npm run android
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

## Portfolio positioning

SignalOps demonstrates mobile engineering around a realistic operational domain:
state-machine workflows, local persistence, derived metrics, typed navigation,
audit trails, resilient UI state and deterministic reporting.

Production authentication, push notifications, WebSocket connectivity and a
real monitoring backend are intentionally outside the current portfolio build.
