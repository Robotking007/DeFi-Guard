from app.services.gemini_service import gemini_ai
from app.core.config import settings

def test_gemini_configuration():
    assert gemini_ai.project_name == "projects/507081010383"
    assert gemini_ai.project_number == "507081010383"
    assert gemini_ai.app_name == "DeFi Guard"
    assert "flash" in gemini_ai.model.lower()
    # Key is loaded safely from backend/.env
    assert len(gemini_ai.api_key) > 10
