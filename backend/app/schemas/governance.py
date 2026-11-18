from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProposalCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    proposer_wallet: str = Field(..., description="Proposer's wallet address")
    duration_days: int = Field(default=3, ge=1, le=14)

class VoteCast(BaseModel):
    proposal_id: str
    voter_wallet: str
    choice: str = Field(..., pattern="^(for|against|abstain)$")
    voting_power: float = Field(default=1000.0, gt=0.0)

class ProposalResponse(BaseModel):
    id: str
    title: str
    description: str
    proposer_wallet: str
    status: str  # pending, active, passed, defeated, executed
    start_at: str
    end_at: str
    votes_for: float
    votes_against: float
    votes_abstain: float
    total_votes: float
    quorum_reached: bool
    quorum_threshold: float = 10000.0
    time_remaining: str

class VoteResponse(BaseModel):
    id: str
    proposal_id: str
    voter_wallet: str
    voting_power: float
    choice: str
    created_at: str
