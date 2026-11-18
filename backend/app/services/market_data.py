import httpx
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback default prices if external API is unreachable or rate-limited
DEFAULT_PRICES: Dict[str, float] = {
    "ETH": 3120.45,
    "BTC": 62350.40,
    "USDC": 1.00,
    "WBTC": 62400.00,
    "SOL": 145.20,
}

COINGECKO_ID_MAP = {
    "ETH": "ethereum",
    "BTC": "bitcoin",
    "USDC": "usd-coin",
    "SOL": "solana",
}


async def get_live_asset_prices() -> Dict[str, Any]:
    """
    Fetch live crypto prices from CoinGecko API using the configured API key.
    Gracefully falls back to cached baseline prices upon network failure or rate limits.
    """
    prices = DEFAULT_PRICES.copy()
    source = "seeded_baseline"

    if settings.COINGECKO_API_KEY:
        try:
            ids = ",".join(COINGECKO_ID_MAP.values())
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd"
            headers = {"x-cg-demo-api-key": settings.COINGECKO_API_KEY}

            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    for symbol, cg_id in COINGECKO_ID_MAP.items():
                        if cg_id in data and "usd" in data[cg_id]:
                            prices[symbol] = float(data[cg_id]["usd"])
                    source = "coingecko_live"
                else:
                    logger.warning(f"CoinGecko API returned status {res.status_code}. Using fallback prices.")
        except Exception as e:
            logger.warning(f"CoinGecko price fetch failed: {e}. Falling back to default baseline.")

    return {
        "prices": prices,
        "source": source,
        "timestamp": datetime.utcnow().isoformat(),
    }
