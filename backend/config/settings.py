from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str
    openai_vision_model: str = "gpt-5.2"  # Melhor modelo para análise de imagens (Jan 2026)
    openai_text_model: str = "gpt-5"  # Modelo inteligente para raciocínio e código
    openai_temperature: float = 0.3
    openai_max_tokens: int = 16000  # GPT-5 usa tokens para raciocínio + resposta
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 5000
    debug: bool = True
    
    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "threatlens"
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:5173/", "http://localhost:8081", "http://localhost:8081/"]
    
    # Request Limits
    max_image_size_mb: int = 10
    request_timeout_seconds: int = 1800  # 30 minutos - GPT-5.2 pode precisar de tempo para análises complexas
    
    # Paths
    reports_dir: str = "reports"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
