import math
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

from app.schemas.swap import (
    SwapQuoteRequest,
    SwapQuoteResponse,
    SwapExecuteRequest,
    SwapExecuteResponse,
    LiquidityPoolInfo,
    ImpermanentLossRequest,
    ImpermanentLossResponse,
    DyDxPerpRiskRequest,
    DyDxPerpRiskResponse,
    DukeProtocolStudy,
)

class AMMService:
    """Automated Market Maker (Uniswap v2 model) and Duke Protocol Analysis Engine."""

    # In-memory reserve state simulating live liquidity pools
    _pools: Dict[str, Dict[str, Any]] = {
        "ETH/USDC": {
            "reserve_a": 2500.0,       # 2,500 ETH (~$7.75M)
            "reserve_b": 7750000.0,   # 7,750,000 USDC
            "token_a": "ETH",
            "token_b": "USDC",
            "fee_percent": 0.3,
            "volume_24h": 14200000.0,
            "apy": 14.8,
        },
        "WBTC/USDC": {
            "reserve_a": 120.0,        # 120 WBTC (~$10.8M)
            "reserve_b": 10800000.0,  # 10,800,000 USDC
            "token_a": "WBTC",
            "token_b": "USDC",
            "fee_percent": 0.3,
            "volume_24h": 22400000.0,
            "apy": 11.2,
        },
        "DAI/USDC": {
            "reserve_a": 15000000.0,   # 15M DAI
            "reserve_b": 15000000.0,   # 15M USDC
            "token_a": "DAI",
            "token_b": "USDC",
            "fee_percent": 0.05,
            "volume_24h": 8500000.0,
            "apy": 4.1,
        },
    }

    def get_pools(self) -> List[LiquidityPoolInfo]:
        """Return list of active liquidity pools with reserves and APY."""
        result = []
        for name, pool in self._pools.items():
            tot_usd = pool["reserve_b"] * 2  # 50/50 balanced AMM
            result.append(
                LiquidityPoolInfo(
                    pool_name=name,
                    token_a=pool["token_a"],
                    token_b=pool["token_b"],
                    reserve_a=pool["reserve_a"],
                    reserve_b=pool["reserve_b"],
                    total_liquidity_usd=tot_usd,
                    fee_tier_percent=pool["fee_percent"],
                    volume_24h_usd=pool["volume_24h"],
                    apy_percent=pool["apy"],
                )
            )
        return result

    def get_swap_quote(self, req: SwapQuoteRequest) -> SwapQuoteResponse:
        """Calculate swap output using constant-product formula x * y = k with 0.3% LP fee."""
        pair_key = f"{req.token_in}/{req.token_out}"
        inverse_key = f"{req.token_out}/{req.token_in}"

        is_direct = pair_key in self._pools
        is_inverse = inverse_key in self._pools

        if not is_direct and not is_inverse:
            # Fallback to ETH/USDC or triangular routing
            pool_data = self._pools["ETH/USDC"]
            reserve_in = pool_data["reserve_a"] if req.token_in == "ETH" else pool_data["reserve_b"]
            reserve_out = pool_data["reserve_b"] if req.token_in == "ETH" else pool_data["reserve_a"]
        elif is_direct:
            pool_data = self._pools[pair_key]
            reserve_in = pool_data["reserve_a"]
            reserve_out = pool_data["reserve_b"]
        else:
            pool_data = self._pools[inverse_key]
            reserve_in = pool_data["reserve_b"]
            reserve_out = pool_data["reserve_a"]

        fee_rate = 0.003  # 0.3% fee
        amount_in_with_fee = req.amount_in * (1.0 - fee_rate)

        # Constant product output: dy = (y * dx_fee) / (x + dx_fee)
        amount_out = (reserve_out * amount_in_with_fee) / (reserve_in + amount_in_with_fee)

        # Execution price & spot price
        spot_price = reserve_out / reserve_in
        execution_price = amount_out / req.amount_in
        price_impact = max(0.0, (1.0 - (execution_price / spot_price)) * 100.0)

        # Minimum received after slippage
        min_out = amount_out * (1.0 - (req.slippage_tolerance_percent / 100.0))
        lp_fee_amount = req.amount_in * fee_rate

        return SwapQuoteResponse(
            token_in=req.token_in,
            token_out=req.token_out,
            amount_in=req.amount_in,
            expected_amount_out=round(amount_out, 6),
            minimum_amount_out=round(min_out, 6),
            execution_price=round(execution_price, 6),
            price_impact_percent=round(price_impact, 3),
            lp_fee_amount=round(lp_fee_amount, 6),
            lp_fee_percent=0.3,
            pool_reserves_in=reserve_in,
            pool_reserves_out=reserve_out,
            constant_product_k=reserve_in * reserve_out,
        )

    def execute_swap(self, req: SwapExecuteRequest) -> SwapExecuteResponse:
        """Execute simulated swap and update pool reserves."""
        # Run quote to get exact output
        quote = self.get_swap_quote(
            SwapQuoteRequest(
                token_in=req.token_in,
                token_out=req.token_out,
                amount_in=req.amount_in,
                slippage_tolerance_percent=0.5,
            )
        )

        if quote.expected_amount_out < req.minimum_amount_out:
            raise ValueError(
                f"Slippage limit violated. Expected {quote.expected_amount_out} but min required is {req.minimum_amount_out}"
            )

        # Update in-memory pool state if direct pair exists
        pair_key = f"{req.token_in}/{req.token_out}"
        inverse_key = f"{req.token_out}/{req.token_in}"
        if pair_key in self._pools:
            self._pools[pair_key]["reserve_a"] += req.amount_in
            self._pools[pair_key]["reserve_b"] -= quote.expected_amount_out
        elif inverse_key in self._pools:
            self._pools[inverse_key]["reserve_b"] += req.amount_in
            self._pools[inverse_key]["reserve_a"] -= quote.expected_amount_out

        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:8]}"

        return SwapExecuteResponse(
            tx_hash=tx_hash,
            token_in=req.token_in,
            token_out=req.token_out,
            amount_in=req.amount_in,
            amount_out_received=quote.expected_amount_out,
            effective_rate=quote.execution_price,
            timestamp=datetime.utcnow().isoformat(),
            status="CONFIRMED",
        )

    def calculate_impermanent_loss(self, req: ImpermanentLossRequest) -> ImpermanentLossResponse:
        """Calculate impermanent loss given relative price change of pool assets.
        Formula: IL = (2 * sqrt(k)) / (1 + k) - 1, where k = (1 + delta_a) / (1 + delta_b)
        """
        multiplier_a = 1.0 + (req.price_change_token_a_percent / 100.0)
        multiplier_b = 1.0 + (req.price_change_token_b_percent / 100.0)

        price_ratio_k = multiplier_a / multiplier_b
        if price_ratio_k <= 0:
            price_ratio_k = 0.0001

        il_fraction = (2.0 * math.sqrt(price_ratio_k)) / (1.0 + price_ratio_k) - 1.0
        il_percent = abs(il_fraction * 100.0)

        # Baseline assumption: $10,000 initial LP deposit ($5,000 token A + $5,000 token B)
        initial_val = 10000.0
        hoddle_value = 5000.0 * multiplier_a + 5000.0 * multiplier_b
        pool_hold_value = hoddle_value * (1.0 - abs(il_fraction))
        net_diff = pool_hold_value - hoddle_value

        explanation = (
            f"If Token A changes by {req.price_change_token_a_percent:+.1f}% and Token B changes by {req.price_change_token_b_percent:+.1f}%, "
            f"the constant-product arbitrageur rebalancing extracts {il_percent:.2f}% impermanent loss versus holding outside the pool."
        )

        return ImpermanentLossResponse(
            price_ratio_k=round(price_ratio_k, 4),
            impermanent_loss_percent=round(il_percent, 2),
            pool_hold_value_usd=round(pool_hold_value, 2),
            hoddle_value_usd=round(hoddle_value, 2),
            net_difference_usd=round(net_diff, 2),
            explanation=explanation,
        )

    def calculate_dydx_margin_risk(self, req: DyDxPerpRiskRequest) -> DyDxPerpRiskResponse:
        """Calculate dYdX-style perpetual derivatives margin requirements and liquidation risk.
        Long Liquidation: P_liq = Entry * (1 - 1/Lev + MMR)
        Short Liquidation: P_liq = Entry * (1 + 1/Lev - MMR)
        """
        position_size_usd = req.collateral_usd * req.leverage
        initial_margin = req.collateral_usd
        maint_margin = position_size_usd * req.maintenance_margin_rate

        is_long = req.position_type.upper() == "LONG"
        lev = req.leverage
        mmr = req.maintenance_margin_rate
        p_entry = req.entry_price_usd

        if is_long:
            p_liq = p_entry * (1.0 - (1.0 / lev) + mmr)
            dist_percent = max(0.0, ((p_entry - p_liq) / p_entry) * 100.0)
        else:
            p_liq = p_entry * (1.0 + (1.0 / lev) - mmr)
            dist_percent = max(0.0, ((p_liq - p_entry) / p_entry) * 100.0)

        # Funding rate (8 hour rate applied 3 times per day)
        funding_fee_daily = position_size_usd * (req.current_funding_rate_8h * 3.0)

        if dist_percent < 5.0:
            risk = "CRITICAL (Liquidation Imminent)"
            advice = "Immediately deposit additional USDC margin or reduce leverage to prevent forced on-chain liquidation."
        elif dist_percent < 15.0:
            risk = "HIGH (Elevated Volatility Risk)"
            advice = "Set tight stop-loss orders and monitor oracle price feed deviation closely."
        elif dist_percent < 30.0:
            risk = "MODERATE"
            advice = "Maintain healthy collateral buffer; safe against routine 5-10% market swings."
        else:
            risk = "LOW (Conservative Position)"
            advice = "Substantial margin safety cushion against extreme flash crashes."

        return DyDxPerpRiskResponse(
            position_type=req.position_type.upper(),
            position_size_usd=round(position_size_usd, 2),
            leverage=req.leverage,
            initial_margin_usd=round(initial_margin, 2),
            maintenance_margin_usd=round(maint_margin, 2),
            liquidation_price_usd=round(p_liq, 2),
            distance_to_liquidation_percent=round(dist_percent, 2),
            est_funding_fee_daily_usd=round(funding_fee_daily, 4),
            risk_level=risk,
            remediation_advice=advice,
        )

    def get_duke_protocols_study(self) -> List[DukeProtocolStudy]:
        """Return academic study parameters for the 5 protocols specifically mentioned in the Duke Specialization."""
        return [
            DukeProtocolStudy(
                protocol="MakerDAO (Sky)",
                duke_module="Course 2: DeFi Primitives & Collateralized Stablecoins",
                core_mechanism="Overcollateralized CDP Vaults minting decentralized DAI stablecoin",
                math_formula="CR = (Collateral_Value / Debt_DAI) >= Min_Ratio (150%)",
                key_parameters={
                    "collateral_assets": ["ETH", "WBTC", "stETH"],
                    "minimum_collateral_ratio": "150%",
                    "liquidation_penalty": "13.0%",
                    "stability_fee_apr": "4.5%",
                    "governance_token": "MKR / SKY",
                },
                live_risk_implications="In extreme market downturns, rapid ETH depreciation can trigger cascade collateral auctions (Dutch auctions) if CR drops below 150%.",
            ),
            DukeProtocolStudy(
                protocol="Compound",
                duke_module="Course 2: Decentralized Lending & Interest Rate Models",
                core_mechanism="Algorithmic money markets where interest rates float based on capital utilization",
                math_formula="Utilization U = Borrows / (Cash + Borrows); Borrow_Rate = R0 + U * Rslope",
                key_parameters={
                    "kink_utilization": "80.0%",
                    "base_rate_r0": "2.0%",
                    "slope_1": "10.0%",
                    "slope_2_jump": "50.0%",
                    "collateral_factor": "75.0%",
                },
                live_risk_implications="When liquidity dries up and utilization breaches the 80% kink point, interest rates spike exponentially to incentivize debt repayment.",
            ),
            DukeProtocolStudy(
                protocol="Aave v3",
                duke_module="Course 2: Liquidity Pools, eMode & Flash Loans",
                core_mechanism="Multi-asset liquidity pools with dynamic health factor monitoring and uncollateralized atomic Flash Loans",
                math_formula="Health_Factor = Sum(Collateral_i * Liquidation_Threshold_i) / Total_Debt",
                key_parameters={
                    "health_factor_warning": "< 1.10",
                    "liquidation_threshold": "< 1.00",
                    "flash_loan_fee": "0.09%",
                    "liquidation_bonus": "5.0% - 10.0%",
                    "e_mode_ltv": "Up to 97.0%",
                },
                live_risk_implications="Flash loans enable zero-capital arbitrage and self-liquidations, but also provide instantaneous liquidity for oracle-manipulation exploits.",
            ),
            DukeProtocolStudy(
                protocol="Uniswap (v2 / v3)",
                duke_module="Course 3: Automated Market Makers & Decentralized Exchanges",
                core_mechanism="Constant-product invariant market maker (x * y = k) eliminating centralized order books",
                math_formula="(x + dx * 0.997) * (y - dy) = x * y = k",
                key_parameters={
                    "fee_tier_v2": "0.30%",
                    "fee_tiers_v3": ["0.01%", "0.05%", "0.30%", "1.00%"],
                    "price_impact_formula": "Impact = 1 - (Effective_Price / Spot_Price)",
                    "impermanent_loss": "IL = 2*sqrt(k)/(1+k) - 1",
                },
                live_risk_implications="Impermanent loss erodes liquidity provider capital during high-volatility price discovery unless compensated by swap fee APY.",
            ),
            DukeProtocolStudy(
                protocol="dYdX",
                duke_module="Course 4: Decentralized Derivatives & Trading Risks",
                core_mechanism="Cross-margin perpetual futures contracts with dynamic funding rate balancing",
                math_formula="P_liq_Long = P_entry * (1 - 1/Lev + MMR); Funding = Position * (Index - Oracle) / 24h",
                key_parameters={
                    "max_leverage": "20x - 25x",
                    "initial_margin_rate": "5.0% (at 20x)",
                    "maintenance_margin_rate": "3.0%",
                    "funding_interval": "8 Hours",
                    "architecture": "Cosmos AppChain (dYdX v4) with in-memory orderbook",
                },
                live_risk_implications="High leverage (20x) means a mere 4.5% adverse price move triggers immediate position liquidation and insurance fund drawdowns.",
            ),
        ]
