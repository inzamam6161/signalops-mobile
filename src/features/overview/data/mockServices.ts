export type ServiceStatus =
  | 'healthy'
  | 'degraded'
  | 'down';

export type ServiceHealth = {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
};

export const mockServices: ServiceHealth[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway',
    status: 'healthy',
    uptime: 99.98,
  },
  {
    id: 'authentication',
    name: 'Authentication',
    status: 'healthy',
    uptime: 99.95,
  },
  {
    id: 'checkout',
    name: 'Checkout API',
    status: 'degraded',
    uptime: 96.12,
  },
  {
    id: 'payments',
    name: 'Payments',
    status: 'degraded',
    uptime: 97.33,
  },
  {
    id: 'search',
    name: 'Search Service',
    status: 'healthy',
    uptime: 99.9,
  },
];