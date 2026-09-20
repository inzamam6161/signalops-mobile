export type MainTabParamList = {
  Overview: undefined;
  Incidents: undefined;
  Activity: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;

  IncidentDetails: {
    incidentId: string;
  };

  CreateIncident: undefined;
};
