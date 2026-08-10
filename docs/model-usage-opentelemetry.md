# Model Usage Telemetry and OpenTelemetry

This slice adds measured agent/model telemetry and OpenTelemetry traces without treating missing provider metadata as zero usage.

## Telemetry contract

BM Agents World records an AG-UI agent run for every CopilotKit agent execution. A durable QA workflow is linked to the current AG-UI run when the agent starts or touches that QA run through the governed QA tools.

Per agent run the runtime persists:

- agent/run/thread identity
- tenant and authenticated user identity
- configured provider/model
- duration
- AG-UI event count
- tool-call count
- model-call count when usage records are measurable
- input/output/total tokens when numeric provider usage metadata is present
- configured cost estimate when both token rates are explicitly supplied
- OpenTelemetry trace/span ids when tracing is active
- execution error when the agent run fails

Provider usage is never inferred from text length. If current provider/AG-UI events do not expose numeric token usage, the run remains `unavailable`. If a QA workflow links multiple agent turns and only some expose usage, the QA scorecard reports `partial` coverage.

## Cost estimates

No model prices are hard-coded in the repository. Configure the rates that your organization has validated for the selected model:

```bash
BM_MODEL_INPUT_USD_PER_1M_TOKENS=...
BM_MODEL_OUTPUT_USD_PER_1M_TOKENS=...
```

A cost is calculated only when both rates are valid non-negative numbers and measured input/output token counts exist. The scorecard labels this `configured_estimate`; it is not a provider invoice.

## OpenTelemetry

Tracing is opt-in. Enable it explicitly or configure a standard OTLP endpoint:

```bash
BM_OTEL_ENABLED=true
OTEL_SERVICE_NAME=bm-agents-world-agent-window
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector.observability.svc:4318/v1/traces
```

`OTEL_EXPORTER_OTLP_ENDPOINT` is also supported through the OpenTelemetry exporter environment contract. `OTEL_SDK_DISABLED=true` disables export.

Current manual spans include:

```text
bm.agent.run
  └─ bm.capability.execute

bm.approval.decision
```

Attributes include bounded identifiers for agent/run/thread/tenant/project/capability, provider/model, capability mode, side-effect status, measured token counts, and execution durations. Prompts, tool payloads, Jira credentials, storage-state contents, and other secret material are not added as span attributes.

## QA scorecard

The existing QA pilot observability API now enriches run facts with:

- model usage status: `measured`, `partial`, or `unavailable`
- model-usage coverage
- model-call count
- input/output/total tokens
- configured cost estimates
- linked model/provider names
- trace ids
- measured capability execution latency
- per-capability latency breakdown

The original authoritative run/action/approval data remains unchanged. Telemetry is an enrichment view; it does not determine authorization or whether an external action occurred.

## Deployment notes

OpenTelemetry is not required for `/readyz` because the QA pilot must remain usable if the collector is temporarily unavailable. Treat collector/exporter availability as an observability SLO rather than an application authorization dependency.

For production, route OTLP only to an approved internal collector and apply your standard TLS/authentication/network policy. Use the collector to fan out to the organization's chosen trace backend.
