# Telemetry operator note

OpenTelemetry export is intentionally not part of `/readyz`; application execution must not be blocked by a temporary collector outage. Monitor the collector/export pipeline separately and alert when trace export is unavailable or unexpectedly sparse.
