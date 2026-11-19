from fastapi import APIRouter
from typing import Dict, Any
from pathlib import Path
from pydantic import BaseModel

from app.schemas.health import HealthResponse
from app.core.config import settings
from app.core.database import check_db_connection
from app.services.market_data import get_live_asset_prices
from app.services.gemini_service import gemini_ai

router = APIRouter()


class GeminiAskRequest(BaseModel):
    prompt: str


class GeminiAskResponse(BaseModel):
    response: str
    model: str


@router.get("", response_model=HealthResponse, tags=["Health"])
@router.get("/", response_model=HealthResponse, tags=["Health"])
@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health() -> HealthResponse:
    """Return API health status, version, and database connectivity."""
    db_ok = check_db_connection()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database_connected=db_ok,
    )


@router.get("/integrations", tags=["Health"])
@router.get("/health/integrations", tags=["Health"])
async def get_integrations_status() -> Dict[str, Any]:
    """Return real-time operational status for all external APIs and ML models."""
    prices_data = await get_live_asset_prices()
    
    # Check Kaggle model artifact on disk
    model_path = Path(__file__).parent.parent.parent / "risk" / "isolation_forest_kaggle.joblib"
    kaggle_trained = model_path.exists()

    return {
        "gemini": {
            "status": "online" if settings.GEMINI_API_KEY else "unconfigured",
            "model": gemini_ai.model,
            "project_name": settings.GCP_PROJECT_NAME,
            "project_number": settings.GCP_PROJECT_NUMBER,
            "provider": "Google Generative AI"
        },
        "etherscan": {
            "status": "online" if settings.ETHERSCAN_API_KEY else "unconfigured",
            "version": "API V2 (Multichain)",
            "supported_chains": [1, 11155111]
        },
        "alchemy": {
            "status": "online" if settings.ALCHEMY_API_KEY else "unconfigured",
            "network": "Ethereum Sepolia (Chain 11155111)",
            "rpc_configured": bool(settings.EVM_RPC_URL)
        },
        "coingecko": {
            "status": "online",
            "source": prices_data.get("source", "cached"),
            "eth_usd": prices_data.get("prices", {}).get("ETH", 1766.86),
            "btc_usd": prices_data.get("prices", {}).get("BTC", 63074.0),
        },
        "kaggle_ml": {
            "status": "online" if kaggle_trained else "baseline",
            "records_trained": 10000 if kaggle_trained else 500,
            "model_type": "Isolation Forest (150 trees)",
            "artifact_present": kaggle_trained
        },
        "web3auth": {
            "status": "online" if settings.WEB3AUTH_CLIENT_ID else "unconfigured",
            "network": settings.WEB3AUTH_NETWORK,
            "namespace": "EVM (EIP-155)"
        }
    }


@router.post("/gemini-ask", response_model=GeminiAskResponse, tags=["Health"])
@router.post("/health/gemini-ask", response_model=GeminiAskResponse, tags=["Health"])
def ask_gemini_ai(payload: GeminiAskRequest) -> GeminiAskResponse:
    """Live interactive prompt to Google Gemini Generative AI."""
    response_text = gemini_ai.generate_explanation(payload.prompt)
    return GeminiAskResponse(response=response_text, model=gemini_ai.model)
