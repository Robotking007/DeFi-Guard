from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TransactionResponse(BaseModel):
    id: str
    tx_hash: str
    chain_id: int
    from_address: str
    to_address: str
    asset_symbol: Optional[str] = "ETH"
    amount: float
    timestamp: datetime
    status: str
    block_number: Optional[int] = None
    is_anomaly: Optional[bool] = False
    risk_score: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)


class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class DemoImportResponse(BaseModel):
    message: str
    inserted_count: int
    normal_count: int
    anomalous_count: int


class LiveSyncRequest(BaseModel):
    address: str = Field(..., description="Ethereum wallet or smart contract address (0x...)")
    chain_id: int = Field(default=1, description="1 for Ethereum Mainnet, 11155111 for Sepolia")
    limit: int = Field(default=25, ge=1, le=100)


class LiveSyncResponse(BaseModel):
    status: str
    synced_count: int
    anomalous_count: int
    address: str
    chain_id: int
    source: str

