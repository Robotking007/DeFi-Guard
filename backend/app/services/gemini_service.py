import requests
import json
import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger("gemini_service")

FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-pro-latest",
]

class GeminiService:
    """Google Gemini AI Service configured for DeFiGuard risk and audit intelligence."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.preferred_model = settings.GEMINI_MODEL or "gemini-flash-lite-latest"
        self.model = self.preferred_model
        self.project_name = settings.GCP_PROJECT_NAME
        self.project_number = settings.GCP_PROJECT_NUMBER
        self.app_name = settings.GEMINI_APP_NAME

    def generate_explanation(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Call Google Gemini to generate real AI explanation with automatic model fallback."""
        if not self.api_key:
            return "Gemini API key is not configured."

        models_to_try = [self.preferred_model] + [m for m in FALLBACK_MODELS if m != self.preferred_model]

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800,
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        last_error = ""
        for model in models_to_try:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                res = requests.post(
                    endpoint,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=12.0,
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    last_error = f"{model} returned {res.status_code}"
                    logger.warning(f"Gemini {model} failed with status {res.status_code}. Trying next model...")
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Gemini {model} exception: {e}")

        return f"Gemini service unavailable ({last_error}). Please try again."

    def explain_smart_contract_finding(self, detector: str, code_snippet: str) -> str:
        """Generate plain-English developer remediation advice for Slither/AST findings."""
        prompt = (
            f"You are a senior smart contract auditor at DeFiGuard. "
            f"Vulnerability detector: {detector}.\n"
            f"Code snippet:\n```solidity\n{code_snippet}\n```\n"
            f"Explain the exploit vector concisely and provide the exact Solidity 0.8.24 remediation code."
        )
        return self.generate_explanation(prompt)

    def draft_fincen_sar_narrative(self, case_id: str, address: str, amount_usd: float, rule_code: str) -> str:
        """Draft a formal FinCEN Suspicious Activity Report (SAR) narrative."""
        prompt = (
            f"Draft a formal FinCEN SAR regulatory narrative pursuant to 31 CFR § 1020.320 for: "
            f"Case: {case_id}, Target: {address}, Amount: ${amount_usd:,.2f}, Violation: {rule_code}."
        )
        return self.generate_explanation(prompt)


# Global Gemini service instance
gemini_ai = GeminiService()
