import { Asset, KPIData, ChartData } from '@/types/asset';

export const mockAssets: Asset[] = [
  {
    id: '1',
    asset_id: 'LPT-001',
    owner: 'Sarah Johnson',
    location: 'Building A, Floor 3',
    last_seen: '2024-01-15',
    status: 'Active',
    value: 1200,
    category: 'Laptop',
    model: 'Dell XPS 15',
    serial_number: 'DL123456'
  },
  {
    id: '2',
    asset_id: 'LPT-002',
    owner: 'Mike Chen',
    location: 'Building B, Floor 1',
    last_seen: '2023-12-20',
    status: 'Missing',
    value: 1500,
    category: 'Laptop',
    model: 'MacBook Pro',
    serial_number: 'MP789012'
  },
  {
    id: '3',
    asset_id: 'MON-001',
    owner: 'Lisa Park',
    location: 'Building A, Floor 2',
    last_seen: '2024-01-10',
    status: 'Recovered',
    value: 400,
    category: 'Monitor',
    model: 'Dell UltraSharp',
    serial_number: 'US345678'
  }
];

export const mockKPIs: KPIData = {
  recoveryRate: 65.5,
  totalValueRecovered: 42500,
  outreachSuccessRate: 78.2
};

export const mockChartData: ChartData = {
  statusDistribution: [
    { name: 'Active', value: 45 },
    { name: 'Missing', value: 32 },
    { name: 'Recovered', value: 23 }
  ],
  recoveryTrend: [
    { date: '2024-01-01', recovered: 5 },
    { date: '2024-01-08', recovered: 8 },
    { date: '2024-01-15', recovered: 12 },
    { date: '2024-01-22', recovered: 18 },
    { date: '2024-01-29', recovered: 23 }
  ]
};
