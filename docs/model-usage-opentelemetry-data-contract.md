# Telemetry data contract

Measured model usage can be `measured`, `partial`, or `unavailable`. Cost can be `configured_estimate`, `partial`, or `unavailable`. Consumers must preserve those states and must not coerce missing telemetry to zero.
