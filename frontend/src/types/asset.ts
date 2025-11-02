export type AssetStatus = 'Active' | 'Missing' | 'Recovered';

export interface Asset {
  id: string;
  asset_id: string;
  owner: string;
  location: string;
  last_seen: string;
  status: AssetStatus;
  value: number;
  category?: string;
  model?: string;
  serial_number?: string;
  value_estimate?: number;
  disposition_suggestion?: string;
  draftedEmail?: {
    to: string;
    subject: string;
    body: string;
  };
}

export interface AssetFilters {
  status?: AssetStatus;
  location?: string;
  owner?: string;
  minAge?: number;
}

export interface KPIData {
  recoveryRate: number;
  totalValueRecovered: number;
  outreachSuccessRate: number;
}

export interface ChartData {
  statusDistribution: { name: string; value: number }[];
  recoveryTrend: { date: string; recovered: number }[];
}
