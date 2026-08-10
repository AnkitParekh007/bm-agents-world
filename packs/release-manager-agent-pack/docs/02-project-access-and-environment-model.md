# Project Access and Environment Model

## Access hierarchy

Every run is bound to: requester → role → project → release → services → repositories → environments → candidate hash → purpose → time window.

No agent receives global access merely because it has a Release Manager role.

## Project profiles

- **PCC:** Angular 12 and Java. Use conservative compatibility checks, pinned build tooling, extended regression, and operator-led production releases.
- **SOP:** Angular 15 and Java. Use version-aware builds, shared release calendars, database and API sequencing, and controlled production gates.
- **DataBridge:** AngularJS and Java. Use legacy-runtime safeguards, integration sequencing, longer observation windows, and rehearsed rollback.
- **BM Agent Foundry:** Web, agent services, MCP servers, policy, artifacts, data, and infrastructure. Add model, prompt, connector, policy, and evaluation compatibility.

## Environment classes

| Environment | Default agent access | Mutations |
|---|---|---|
| Local sandbox | Isolated workspace | Allowed inside sandbox |
| Playground | Read plus approved deterministic deployment rehearsal | Approval controlled |
| QA | Read plus approved validation and release rehearsal | Approval controlled |
| Production | Redacted read-only state and telemetry | Prohibited for free-form agent |

## Production execution

The agent creates an immutable bundle containing candidate hashes, exact targets, runbook, approvals, success criteria, stop conditions, rollback, and expiration. An authorized operator or deterministic deployment service executes that bundle.

## Data boundaries

Release evidence uses minimum-necessary, bounded, redacted data. Customer, employee, payment, credential, and unrestricted production records remain outside model context.
