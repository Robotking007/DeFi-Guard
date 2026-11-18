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

export interface LiveSyncResult {
  status: string;
  synced_count: number;
  anomalous_count: number;
  address: string;
  chain_id: number;
  source: string;
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

export interface LendingPosition {
  supplied_collateral_eth: number;
  supplied_collateral_usd: number;
  borrowed_usdc: number;
  collateral_price_usd: number;
  ltv_percent: number;
  health_factor: number;
  liquidation_threshold_percent: number;
  borrow_power_used_percent: number;
  available_to_borrow_usdc: number;
  borrow_apr_percent: number;
  net_worth_usd: number;
  credit_score: number;
  credit_rating: string;
  collateral_multiplier: number;
  is_liquidation_risk: boolean;
}

export interface LendingActionResponse {
  success: boolean;
  message: string;
  position: LendingPosition;
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  amount: number;
  price_usd: number;
  value_usd: number;
  allocation_percent: number;
  color: string;
}

export interface PortfolioMetrics {
  total_portfolio_value_usd: number;
  change_24h_usd: number;
  change_24h_percent: number;
  var_95_usd: number;
  var_99_usd: number;
  max_drawdown_percent: number;
  allocations: AssetAllocation[];
  valuation_source: string;
}

export interface StressTestResult {
  scenario_label: string;
  price_shock_percent: number;
  original_portfolio_value: number;
  stressed_portfolio_value: number;
  value_loss_usd: number;
  original_health_factor: number;
  stressed_health_factor: number;
  liquidation_triggered: boolean;
  capital_at_risk_usd: number;
  remediation_advice: string;
}

// ----------------- REGTECH & COMPLIANCE (MODULE 6) -----------------

export interface SanctionsMatch {
  id?: string;
  name?: string;
  aliases?: string;
  sanctions?: string;
  dataset?: string;
  countries?: string;
  program_ids?: string;
  match_type: string;
  severity: string;
}

export interface ScreeningResponse {
  query: string;
  is_sanctioned: boolean;
  total_matches: number;
  matches: SanctionsMatch[];
  checked_at: string;
}

export interface ComplianceMetrics {
  overall_risk_score: number;
  risk_level: string;
  pending_alerts: number;
  active_cases: number;
  watchlist_matches: number;
  sar_filings_count: number;
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
}

export interface ComplianceCaseItem {
  id: string;
  case_number: string;
  target_address: string;
  entity_name?: string;
  violation_type: string;
  priority: string;
  status: string;
  risk_score: number;
  assigned_to?: string;
  notes?: string;
  decision?: string;
  sar_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelRuleResult {
  is_compliant: boolean;
  threshold_usd: number;
  threshold_exceeded: boolean;
  missing_fields: string[];
  originator_sanction_check: boolean;
  beneficiary_sanction_check: boolean;
  risk_verdict: string;
  recommendation: string;
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

export async function syncLiveTransactions(
  address: string,
  chainId: number = 1,
  limit: number = 25
): Promise<LiveSyncResult> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/transactions/sync-live`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address, chain_id: chainId, limit }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to sync live blockchain transactions.");
  }
  return res.json();
}

export async function draftSarWithGemini(
  caseId: string,
  address: string,
  amountUsd: number,
  ruleCode: string
): Promise<{ case_id: string; narrative: string }> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/draft-sar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      case_id: caseId,
      address,
      amount_usd: amountUsd,
      rule_code: ruleCode,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to draft SAR narrative with Gemini.");
  }
  return res.json();
}

export async function explainFindingWithGemini(
  detector: string,
  codeSnippet: string
): Promise<{ explanation: string; detector: string }> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/security/explain-finding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ detector, code_snippet: codeSnippet }),
  });
  if (!res.ok) {
    throw new Error("Failed to generate Gemini AI explanation.");
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

// ----------------- LENDING & BORROWING (MODULE 2) -----------------

export async function fetchLendingPosition(): Promise<LendingPosition> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/lending/position`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load lending position.");
  return res.json();
}

export async function depositCollateral(amount_eth: number): Promise<LendingActionResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/lending/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount_eth }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Deposit failed.");
  }
  return res.json();
}

export async function borrowAsset(amount_usdc: number): Promise<LendingActionResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/lending/borrow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount_usdc }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Borrow failed.");
  }
  return res.json();
}

export async function repayLoan(amount_usdc: number): Promise<LendingActionResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/lending/repay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount_usdc }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Repay failed.");
  }
  return res.json();
}

export async function withdrawCollateral(amount_eth: number): Promise<LendingActionResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/lending/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount_eth }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Withdrawal failed.");
  }
  return res.json();
}

// ----------------- FINANCIAL ANALYTICS & STRESS TESTING (MODULE 8) -----------------

export async function fetchPortfolioMetrics(): Promise<PortfolioMetrics> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/analytics/portfolio`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load portfolio metrics.");
  return res.json();
}

export async function runStressTest(
  shock_percent: number,
  scenario_label: string
): Promise<StressTestResult> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/analytics/stress-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shock_percent, scenario_label }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Stress test simulation failed.");
  }
  return res.json();
}

// ----------------- REGTECH & COMPLIANCE (MODULE 6) -----------------

export async function fetchComplianceMetrics(): Promise<ComplianceMetrics> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load compliance metrics.");
  return res.json();
}

export async function screenSanctionsTarget(query: string): Promise<ScreeningResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/screen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Sanctions screening failed.");
  return res.json();
}

export async function fetchComplianceCases(): Promise<ComplianceCaseItem[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/cases`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load compliance cases.");
  return res.json();
}

export async function updateComplianceCase(
  case_id: string,
  payload: { status?: string; priority?: string; assigned_to?: string; resolution_notes?: string }
): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/cases/${case_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update case.");
  return res.json();
}

export async function fileSARReport(payload: {
  case_id: string;
  narrative: string;
  suspicious_amount_usd: number;
  officer_name?: string;
}): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/sar-filing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "SAR filing failed.");
  }
  return res.json();
}

export async function verifyTravelRule(payload: {
  originator_name: string;
  originator_address: string;
  originator_vasp: string;
  beneficiary_name: string;
  beneficiary_address: string;
  beneficiary_vasp: string;
  amount_usd: number;
  asset_symbol?: string;
}): Promise<TravelRuleResult> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/compliance/travel-rule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Travel rule check failed.");
  }
  return res.json();
}

// ----------------- TOKEN SWAPS & AMM (MODULE 3 & 4) -----------------

export interface LiquidityPoolInfo {
  pool_name: string;
  token_a: string;
  token_b: string;
  reserve_a: number;
  reserve_b: number;
  total_liquidity_usd: number;
  fee_tier_percent: number;
  volume_24h_usd: number;
  apy_percent: number;
}

export interface SwapQuoteResponse {
  token_in: string;
  token_out: string;
  amount_in: number;
  expected_amount_out: number;
  minimum_amount_out: number;
  execution_price: number;
  price_impact_percent: number;
  lp_fee_amount: number;
  lp_fee_percent: number;
  pool_reserves_in: number;
  pool_reserves_out: number;
  constant_product_k: number;
}

export interface SwapExecuteResponse {
  tx_hash: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  amount_out_received: number;
  effective_rate: number;
  timestamp: string;
  status: string;
}

export interface ImpermanentLossResponse {
  price_ratio_k: number;
  impermanent_loss_percent: number;
  pool_hold_value_usd: number;
  hoddle_value_usd: number;
  net_difference_usd: number;
  explanation: string;
}

export interface DyDxPerpRiskResponse {
  position_type: string;
  position_size_usd: number;
  leverage: number;
  initial_margin_usd: number;
  maintenance_margin_usd: number;
  liquidation_price_usd: number;
  distance_to_liquidation_percent: number;
  est_funding_fee_daily_usd: number;
  risk_level: string;
  remediation_advice: string;
}

export interface DukeProtocolStudy {
  protocol: string;
  duke_module: string;
  core_mechanism: string;
  math_formula: string;
  key_parameters: Record<string, any>;
  live_risk_implications: string;
}

export async function fetchLiquidityPools(): Promise<LiquidityPoolInfo[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/pools`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load liquidity pools.");
  return res.json();
}

export async function fetchSwapQuote(
  token_in: string,
  token_out: string,
  amount_in: number,
  slippage_tolerance_percent: number = 0.5
): Promise<SwapQuoteResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token_in, token_out, amount_in, slippage_tolerance_percent }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch swap quote.");
  }
  return res.json();
}

export async function executeSwapTransaction(
  token_in: string,
  token_out: string,
  amount_in: number,
  minimum_amount_out: number
): Promise<SwapExecuteResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token_in, token_out, amount_in, minimum_amount_out }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Swap execution failed.");
  }
  return res.json();
}

export async function calculateImpermanentLoss(
  price_change_token_a_percent: number,
  price_change_token_b_percent: number = 0
): Promise<ImpermanentLossResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/impermanent-loss`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ price_change_token_a_percent, price_change_token_b_percent }),
  });
  if (!res.ok) throw new Error("Impermanent loss calculation failed.");
  return res.json();
}

export async function calculateDyDxPerpRisk(payload: {
  position_type: string;
  entry_price_usd: number;
  collateral_usd: number;
  leverage: number;
  maintenance_margin_rate?: number;
  current_funding_rate_8h?: number;
}): Promise<DyDxPerpRiskResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/dydx-margin-risk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("dYdX derivatives calculation failed.");
  return res.json();
}

export async function fetchDukeProtocolsStudy(): Promise<DukeProtocolStudy[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/swap/duke-protocols`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load Duke protocols study.");
  return res.json();
}

// ----------------- SMART CONTRACT SECURITY SCANNER (MODULE 7) -----------------

export interface PresetContract {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export interface SecurityFinding {
  id?: string;
  detector: string;
  severity: "high" | "medium" | "low" | "informational";
  line_number?: number;
  description: string;
  recommendation?: string;
}

export interface SecurityScanResponse {
  scan_id: string;
  contract_name: string;
  source_hash: string;
  security_score: number;
  score_grade: string;
  is_safe_to_deploy: boolean;
  summary: string;
  findings_count: {
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  findings: SecurityFinding[];
  scanned_at: string;
  slither_version: string;
  solc_version: string;
}

export async function fetchContractPresets(): Promise<PresetContract[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/security/presets`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load contract presets.");
  return res.json();
}

export async function runContractScan(payload: {
  contract_name: string;
  source_code: string;
  compiler_version?: string;
}): Promise<SecurityScanResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/security/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Contract security scan failed.");
  }
  return res.json();
}

// ----------------- DAO GOVERNANCE (MODULE 9) -----------------

export interface ProposalItem {
  id: string;
  title: string;
  description: string;
  proposer_wallet: string;
  status: string;
  start_at: string;
  end_at: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  quorum_reached: boolean;
  quorum_threshold: number;
  time_remaining: string;
}

export async function fetchProposals(): Promise<ProposalItem[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/governance/proposals`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load governance proposals.");
  return res.json();
}

export async function createDAOProposal(payload: {
  title: string;
  description: string;
  proposer_wallet: string;
  duration_days?: number;
}): Promise<ProposalItem> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/governance/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create proposal.");
  }
  return res.json();
}

export async function castVoteOnProposal(payload: {
  proposal_id: string;
  voter_wallet: string;
  choice: "for" | "against" | "abstain";
  voting_power?: number;
}): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/governance/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to cast vote.");
  }
  return res.json();
}

export async function executeDAOProposal(proposal_id: string): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/governance/proposals/${proposal_id}/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to execute proposal.");
  }
  return res.json();
}

// ----------------- APACHE AIRFLOW ML PIPELINE ORCHESTRATION -----------------

export interface AirflowTaskInfo {
  task_id: string;
  operator: string;
  downstream_tasks: string[];
  description: string;
}

export interface AirflowDAGInfo {
  dag_id: string;
  description: string;
  schedule_interval: string;
  is_paused: boolean;
  last_run_state: string;
  last_run_timestamp?: string;
  next_run_timestamp?: string;
  tasks: AirflowTaskInfo[];
  tags: string[];
}

export interface AirflowRunResponse {
  dag_id: string;
  dag_run_id: string;
  state: string;
  execution_date: string;
  message: string;
  task_logs: Array<{ task: string; status: string; log: string }>;
  live_airflow_url: string;
}

export async function fetchAirflowDAGs(): Promise<AirflowDAGInfo[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/risk/airflow/dags`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load Airflow DAGs.");
  return res.json();
}

export async function triggerAirflowDAG(dag_id: string): Promise<AirflowRunResponse> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/risk/airflow/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dag_id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to trigger Airflow DAG.");
  }
  return res.json();
}
