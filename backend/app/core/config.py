from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings and configuration."""

    APP_ENV: str = "development"
    PROJECT_NAME: str = "DeFiGuard API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    APP_SECRET_KEY: str = "defiguard_secret_jwt_key_siddhant_2026_secure"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Relational Database connection string
    DATABASE_URL: str = "sqlite:///./defiguard.db"

    # CORS configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    # External APIs
    ETHERSCAN_API_KEY: str = ""
    COINGECKO_API_KEY: str = ""
    ALCHEMY_API_KEY: str = ""

    # Web3Auth Credentials
    WEB3AUTH_CLIENT_ID: str = ""
    WEB3AUTH_CLIENT_SECRET: str = ""
    WEB3AUTH_JWKS_ENDPOINT: str = "https://api-auth.web3auth.io/.well-known/jwks.json"

    # Web3 / Blockchain config
    EVM_CHAIN_ID: int = 11155111  # Sepolia Testnet
    EVM_RPC_URL: str = "https://eth-sepolia.g.alchemy.com/v2/alch_FLpDl8cL5y5pYJlkHVsL1"

    # Static scanner configuration
    SLITHER_ENABLED: bool = True
    SOLC_VERSION: str = "0.8.24"

    # Compliance & Sanctions
    OPENSANCTIONS_PATH: str = "../opensactions file/targets.simple.csv"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
