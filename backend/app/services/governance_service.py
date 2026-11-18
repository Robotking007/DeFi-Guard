import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import Proposal, Vote
from app.schemas.governance import (
    ProposalCreate,
    VoteCast,
    ProposalResponse,
    VoteResponse,
)

class GovernanceService:
    def __init__(self, db: Session):
        self.db = db

    def seed_initial_proposals_if_empty(self) -> None:
        """Seed realistic DAO governance proposals aligned with Duke & HKUST curricula."""
        if self.db.query(Proposal).count() > 0:
            return

        now = datetime.utcnow()
        seeds = [
            {
                "title": "DIP-14: Adjust MakerDAO Stability Fee from 4.5% to 5.25% to stabilize DAI peg",
                "description": "Proposal to increment the Dai Savings Rate (DSR) and stability fee across ETH-A and WBTC-A vaults by 75 bps to counter secondary market DAI peg discount below $0.998.",
                "proposer": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                "status": "active",
                "days_offset": 4,
                "votes": [
                    {"voter": "0x742d35cc6634c0532925a3b844bc454e4438f44e", "choice": "for", "power": 8500.0},
                    {"voter": "0x5a52e96bacdabb82fd05763e25335261b921378e", "choice": "for", "power": 4200.0},
                    {"voter": "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be", "choice": "against", "power": 1200.0},
                ]
            },
            {
                "title": "DIP-15: Integrate Slither CI AST Security Gate for all v2 Vault Upgrades",
                "description": "Mandate continuous automated static analysis via Slither 0.11.6 and solc 0.8.24 in the CI/CD pipeline before any timelock execution can be scheduled.",
                "proposer": "0x28c6c06298d514db089934071355e5743bf21d60",
                "status": "passed",
                "days_offset": -2,
                "votes": [
                    {"voter": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "choice": "for", "power": 15000.0},
                    {"voter": "0x742d35cc6634c0532925a3b844bc454e4438f44e", "choice": "for", "power": 6500.0},
                ]
            },
            {
                "title": "DIP-16: Whitelist OpenSanctions OFAC Automated Sanctions Oracle",
                "description": "Deploy an on-chain oracle relay updating OFAC Specially Designated Nationals (SDN) records to automatically restrict sanctioned counterparties from routing through protocol liquidity pools.",
                "proposer": "0x89205a3e3b2db968d0bb5ef504172f21de07441b",
                "status": "active",
                "days_offset": 5,
                "votes": [
                    {"voter": "0x5a52e96bacdabb82fd05763e25335261b921378e", "choice": "for", "power": 9200.0},
                    {"voter": "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be", "choice": "abstain", "power": 2500.0},
                ]
            }
        ]

        for s in seeds:
            prop = Proposal(
                proposer_wallet=s["proposer"],
                title=s["title"],
                description=s["description"],
                start_at=now - timedelta(days=1),
                end_at=now + timedelta(days=s["days_offset"]),
                status=s["status"],
            )
            self.db.add(prop)
            self.db.flush()

            for v in s["votes"]:
                vote = Vote(
                    proposal_id=prop.id,
                    voter_wallet=v["voter"],
                    voting_power=v["power"],
                    choice=v["choice"],
                )
                self.db.add(vote)

        self.db.commit()

    def list_proposals(self) -> List[ProposalResponse]:
        self.seed_initial_proposals_if_empty()
        proposals = self.db.query(Proposal).order_by(Proposal.start_at.desc()).all()

        results = []
        now = datetime.utcnow()

        for p in proposals:
            votes = self.db.query(Vote).filter(Vote.proposal_id == p.id).all()
            for_power = sum(float(v.voting_power) for v in votes if v.choice == "for")
            against_power = sum(float(v.voting_power) for v in votes if v.choice == "against")
            abstain_power = sum(float(v.voting_power) for v in votes if v.choice == "abstain")
            total = for_power + against_power + abstain_power

            rem = p.end_at - now
            if rem.total_seconds() > 0:
                time_str = f"{rem.days}d {int(rem.seconds / 3600)}h remaining"
            else:
                time_str = "Voting Ended"

            results.append(
                ProposalResponse(
                    id=p.id,
                    title=p.title,
                    description=p.description,
                    proposer_wallet=p.proposer_wallet,
                    status=p.status.upper(),
                    start_at=p.start_at.isoformat(),
                    end_at=p.end_at.isoformat(),
                    votes_for=for_power,
                    votes_against=against_power,
                    votes_abstain=abstain_power,
                    total_votes=total,
                    quorum_reached=total >= 10000.0,
                    quorum_threshold=10000.0,
                    time_remaining=time_str,
                )
            )
        return results

    def create_proposal(self, req: ProposalCreate) -> ProposalResponse:
        now = datetime.utcnow()
        end = now + timedelta(days=req.duration_days)

        prop = Proposal(
            proposer_wallet=req.proposer_wallet,
            title=req.title,
            description=req.description,
            start_at=now,
            end_at=end,
            status="active",
        )
        self.db.add(prop)
        self.db.commit()
        self.db.refresh(prop)

        return ProposalResponse(
            id=prop.id,
            title=prop.title,
            description=prop.description,
            proposer_wallet=prop.proposer_wallet,
            status="ACTIVE",
            start_at=prop.start_at.isoformat(),
            end_at=prop.end_at.isoformat(),
            votes_for=0.0,
            votes_against=0.0,
            votes_abstain=0.0,
            total_votes=0.0,
            quorum_reached=False,
            quorum_threshold=10000.0,
            time_remaining=f"{req.duration_days}d remaining",
        )

    def cast_vote(self, req: VoteCast) -> VoteResponse:
        prop = self.db.query(Proposal).filter(Proposal.id == req.proposal_id).first()
        if not prop:
            raise ValueError("Proposal not found")

        # Record vote
        vote = Vote(
            proposal_id=req.proposal_id,
            voter_wallet=req.voter_wallet,
            voting_power=req.voting_power,
            choice=req.choice.lower(),
        )
        self.db.add(vote)
        self.db.commit()
        self.db.refresh(vote)

        return VoteResponse(
            id=vote.id,
            proposal_id=vote.proposal_id,
            voter_wallet=vote.voter_wallet,
            voting_power=float(vote.voting_power),
            choice=vote.choice,
            created_at=vote.created_at.isoformat() if hasattr(vote, "created_at") and vote.created_at else datetime.utcnow().isoformat(),
        )

    def execute_proposal(self, proposal_id: str) -> Dict[str, Any]:
        prop = self.db.query(Proposal).filter(Proposal.id == proposal_id).first()
        if not prop:
            raise ValueError("Proposal not found")

        prop.status = "executed"
        self.db.commit()
        return {
            "proposal_id": prop.id,
            "status": "EXECUTED",
            "executed_at": datetime.utcnow().isoformat(),
            "tx_hash": f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:8]}",
        }
