from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

from app.core.config import get_settings

settings = get_settings()


def init_tracing(app: FastAPI):
    """Initialize OpenTelemetry tracing"""
    
    if not settings.otel_enabled:
        return
    
    # Jaeger exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name=settings.otel_jaeger_agent_host,
        agent_port=settings.otel_jaeger_agent_port,
    )
    
    # Tracer provider
    trace.set_tracer_provider(TracerProvider())
    trace.get_tracer_provider().add_span_processor(
        BatchSpanProcessor(jaeger_exporter)
    )
    
    # Instrumentors
    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument()
    RequestsInstrumentor().instrument()


def get_tracer(name: str) -> trace.Tracer:
    """Get tracer instance"""
    return trace.get_tracer(name)
