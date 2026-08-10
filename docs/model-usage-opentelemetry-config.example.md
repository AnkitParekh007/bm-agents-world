# Example telemetry configuration

```bash
BM_MODEL_INPUT_USD_PER_1M_TOKENS=<validated-input-rate>
BM_MODEL_OUTPUT_USD_PER_1M_TOKENS=<validated-output-rate>
BM_OTEL_ENABLED=true
OTEL_SERVICE_NAME=bm-agents-world-agent-window
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector.observability.svc:4318/v1/traces
```

Do not copy model prices from this repository: validate rates for the model/provider contract used by the pilot.
