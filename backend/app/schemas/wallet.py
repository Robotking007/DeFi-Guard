from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class WalletCreate(BaseModel):
    address: str = Field(..., min_length=42, max_length=66)
    chain_id: int = Field(default=11155111)  # Sepolia
    label: Optional[str] = Field(default="Primary Wallet")


class WalletResponse(BaseModel):
    id: str
    user_id: str
    address: str
    chain_id: int
    label: Optional[str] = None
    connected_at: datetime

    model_config = ConfigDict(from_attributes=True)
