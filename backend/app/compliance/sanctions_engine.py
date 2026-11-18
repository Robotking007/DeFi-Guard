import csv
import os
import re
from typing import Dict, List, Any, Optional

class SanctionsIndex:
    """In-memory index for the OpenSanctions dataset provided in 'opensactions file'."""

    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.records: List[Dict[str, str]] = []
        self.crypto_records: List[Dict[str, str]] = []
        self._loaded = False

    def load(self, max_records: int = 50000) -> None:
        if self._loaded or not os.path.exists(self.csv_path):
            return

        try:
            with open(self.csv_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    self.records.append(row)
                    row_text = f"{row.get('name', '')} {row.get('aliases', '')} {row.get('identifiers', '')} {row.get('sanctions', '')}".lower()
                    if "0x" in row_text or "crypto" in row_text or "wallet" in row_text:
                        self.crypto_records.append(row)
                    count += 1
                    if count >= max_records:
                        break
            self._loaded = True
        except Exception as e:
            print(f"Error loading OpenSanctions CSV: {e}")

    def screen_address_or_name(self, query: str) -> List[Dict[str, Any]]:
        """Screen a query (wallet address, counterparty name) against indexed sanctions records."""
        if not self._loaded:
            self.load()

        query_clean = query.strip().lower()
        matches = []

        # Check against crypto records first
        for rec in self.crypto_records:
            target_str = f"{rec.get('name', '')} {rec.get('aliases', '')} {rec.get('identifiers', '')}".lower()
            if query_clean in target_str:
                matches.append({
                    "id": rec.get("id"),
                    "name": rec.get("name"),
                    "aliases": rec.get("aliases"),
                    "sanctions": rec.get("sanctions"),
                    "dataset": rec.get("dataset"),
                    "countries": rec.get("countries"),
                    "program_ids": rec.get("program_ids"),
                    "match_type": "crypto_identifier_match",
                    "severity": "critical",
                })
                if len(matches) >= 10:
                    break

        # If no crypto matches, check general records
        if not matches:
            for rec in self.records:
                target_str = f"{rec.get('name', '')} {rec.get('aliases', '')}".lower()
                if query_clean in target_str:
                    matches.append({
                        "id": rec.get("id"),
                        "name": rec.get("name"),
                        "aliases": rec.get("aliases"),
                        "sanctions": rec.get("sanctions"),
                        "dataset": rec.get("dataset"),
                        "countries": rec.get("countries"),
                        "program_ids": rec.get("program_ids"),
                        "match_type": "name_match",
                        "severity": "high",
                    })
                    if len(matches) >= 10:
                        break

        return matches


# Global instance pointing to the user's uploaded OpenSanctions file
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
_default_csv = os.path.join(_project_root, "opensactions file", "targets.simple.csv")
sanctions_indexer = SanctionsIndex(_default_csv)
