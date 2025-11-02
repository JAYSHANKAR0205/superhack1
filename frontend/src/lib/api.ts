import { Asset, AssetStatus } from '@/types/asset';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function mapBackendAsset(a: any): Asset {
  return {
    id: String(a.id),
    asset_id: a.asset_id || '',
    owner: a.owner || a.owner_email || '',
    location: a.location || '',
    last_seen: a.last_seen || '',
    status: a.status || 'Active',
    value: typeof a.value === 'number' ? a.value : (a.value_estimate ?? 0),
    category: a.category,
    model: a.model,
    serial_number: a.serial_number,
    value_estimate: a.value_estimate,
    disposition_suggestion: a.disposition_suggestion,
    draftedEmail: undefined,
  };
}

export async function listAssets(params: {
  status?: string;
  owner?: string;
  asset_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.append(k, String(v));
  });
  const res = await fetch(`${API_BASE}/api/assets?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.map(mapBackendAsset);
}

export async function bulkUpload(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/assets/bulk_upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ created: number }>;
}

export async function flagMissing(id: number) {
  const res = await fetch(`${API_BASE}/api/assets/${id}/flag_missing`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ id: number; status: AssetStatus }>;
}

export async function draftEmail(id: number) {
  const res = await fetch(`${API_BASE}/api/assets/${id}/draft_email`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ email: { to: string; subject: string; body: string } }>;
}

export async function sendEmail(id: number, simulate_recovery?: boolean) {
  const qs = new URLSearchParams();
  if (simulate_recovery) qs.append('simulate_recovery', 'true');
  const res = await fetch(`${API_BASE}/api/assets/${id}/send_email?${qs.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    sent: boolean;
    log: any;
    asset_status: AssetStatus;
  }>;
}

export async function estimateValue(id: number) {
  const res = await fetch(`${API_BASE}/api/assets/${id}/estimate_value`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    rule_based: number;
    ml_stub: number;
    final: number;
    disposition: string;
  }>;
}

export async function chat(query: string, context_asset_ids?: number[]) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context_asset_ids }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ answer: string; context_count: number }>;
}

export async function getDashboard() {
  const res = await fetch(`${API_BASE}/api/dashboard`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    kpis: { total_assets: number; missing: number; recovered: number };
    charts: {
      status_breakdown: Record<string, number>;
      value_buckets: Record<string, number>;
    };
  }>;
}