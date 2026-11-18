export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  database_connected: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  role: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  tx_hash: string;
  chain_id: number;
  from_address: string;
  to_address: string;
  asset_symbol: string;
  amount: number;
  timestamp: string;
  status: string;
  block_number?: number;
  is_anomaly?: boolean;
  risk_score?: number;
}

export interface PaginatedTransactions {
  items: TransactionItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DemoImportResult {
  message: string;
  inserted_count: number;
  normal_count: number;
  anomalous_count: number;
}

export interface ContributingSignal {
  code: string;
  label: string;
  weight: number;
  description?: string;
}

export interface RiskAnalysisResponse {
  analysis_id: string;
  subject_type: string;
  subject_id: string;
  score: number;
  risk_band: "low" | "medium" | "high" | "critical";
  is_fraud_probability: boolean;
  model_name: string;
  model_version: string;
  signals: ContributingSignal[];
  disclaimer: string;
  created_at: string;
}

export interface RiskOverviewStats {
  total_transactions_analyzed: number;
  flagged_anomalies: number;
  high_risk_wallets: number;
  critical_alerts: number;
  average_risk_score: number;
  anomaly_rate_percent: number;
  model_status: string;
  model_version: string;
  last_updated: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("defiguard_token");
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("defiguard_token", token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("defiguard_token");
    localStorage.removeItem("defiguard_role");
    localStorage.removeItem("defiguard_email");
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API health check failed: ${res.statusText}`);
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Authentication failed.");
  }
  const data: AuthToken = await res.json();
  setStoredToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("defiguard_role", data.role);
    localStorage.setItem("defiguard_email", data.email);
  }
  return data;
}

export async function registerUser(
  email: string,
  password: string,
  role: string = "user"
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed.");
  }
  return res.json();
}

export async function getSiweNonce(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/nonce`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to generate challenge nonce.");
  const data = await res.json();
  return data.nonce;
}

export async function verifySiwe(
  address: string,
  message: string,
  signature: string
): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/auth/siwe/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "SIWE verification failed.");
  }
  const data: AuthToken = await res.json();
  setStoredToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("defiguard_role", data.role);
    localStorage.setItem("defiguard_email", data.email);
  }
  return data;
}

export async function loginWeb3Auth(
  public_address: string,
  email?: string,
  id_token?: string
): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/auth/web3auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_address, email, id_token }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Web3Auth login failed.");
  }
  const data: AuthToken = await res.json();
  setStoredToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("defiguard_role", data.role);
    localStorage.setItem("defiguard_email", data.email);
  }
  return data;
}

export async function fetchMe(): Promise<UserProfile> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Session expired or unauthorized.");
  return res.json();
}

export async function fetchTransactions(
  page: number = 1,
  limit: number = 15,
  search?: string,
  status?: string
): Promise<PaginatedTransactions> {
  const token = getStoredToken();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);

  const res = await fetch(`${API_BASE_URL}/transactions/?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load transactions.");
  }
  return res.json();
}

export async function seedDemoTransactions(): Promise<DemoImportResult> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/transactions/import-demo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to seed demo transactions.");
  }
  return res.json();
}

export async function fetchRiskOverview(): Promise<RiskOverviewStats> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/risk/overview`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load risk engine overview.");
  return res.json();
}

export async function analyzeRisk(
  transaction_id?: string,
  wallet_address?: string
): Promise<RiskAnalysisResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/risk/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transaction_id, wallet_address }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Risk analysis failed.");
  }
  return res.json();
}
