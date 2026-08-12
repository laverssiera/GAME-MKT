from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "GAME MKT"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/game_mkt"
    database_echo: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # NATS
    nats_url: str = "nats://localhost:4222"
    nats_runtime_stream: str = "gamemkt.runtime"
    
    # OpenTelemetry
    otel_enabled: bool = True
    otel_jaeger_agent_host: str = "localhost"
    otel_jaeger_agent_port: int = 6831
    
    # External integrations
    john_base_url: str = "http://john-brasileiro:8000"
    cefeida_base_url: str = "http://cefeida:8000"
    archimedes_base_url: str = "http://archimedes:8000"
    archimedes_url: str = "http://archimedes:8000"
    cea_url: str = "http://cea:8001"
    academia_url: str = "http://academia:8110"
    john_runtime_url: str = "http://john:8080"

    # Runtime feature flags
    interplanetary_runtime: bool = True
    federation_authority: bool = True
    knowledge_graph: bool = True
    ecosystem_memory: bool = True
    unified_observability: bool = True
    causal_runtime: bool = True
    holographic_commerce: bool = True
    planetary_marketing: bool = True
    interplanetary_sales: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
