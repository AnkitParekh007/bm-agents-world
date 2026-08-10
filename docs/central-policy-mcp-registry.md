# Central Policy Engine and Approved Connector Registry

This slice separates **what an agent wants to do** from **whether the organization permits it**.

## Decision path

```text
CopilotKit agent
      |
      v
Capability definition
      |
      v
ApprovedConnectorRegistry
  - connector approved/pilot/disabled
  - pack allowlist
  - tool -> capability mapping
  - action-class match
  - environment allowlist
  - maximum risk ceiling
      |
      v
OPA policy decision (shared pilot)
  - allow
  - deny
  - approval
  - effective risk
  - approval mode
  - reason / decision id
      |
      v
Capability Broker
      |
      +-- persisted action + policy decision
      +-- payload-bound approval if required
      +-- re-evaluate policy before execution
      |
      v
Trusted adapter / MCP server
```

Unregistered capabilities fail closed before an adapter can execute.

## Modes

### Local development

The central registry can be evaluated in-process:

```bash
BM_POLICY_MODE=local
```

The standalone SQLite broker retains its existing deterministic policy path. The shared async broker uses the central registry whenever `BM_POLICY_MODE` is set.

### Shared pilot

Kubernetes sets:

```bash
BM_POLICY_MODE=opa
BM_OPA_URL=http://127.0.0.1:8181
```

Each application pod runs a pinned OPA sidecar on loopback. The policy is centrally authored under `policies/bm-agents-world/authorization.rego`. OPA's local enforcement keeps policy latency and availability independent of an external policy-service hop. The OPA management model can later move policy distribution from the checked-in ConfigMap to signed bundles without changing the application decision API.

OPA failure is fail-closed: the action is denied at L4/privileged-process rather than falling back to a permissive local answer.

## Connector registry

`config/approved-connectors.yaml` is the organization admission list. It covers MCP and native adapters because BM Agents World already has native Jira/Bitbucket/Playwright integrations that may later be replaced by MCP servers without changing capability IDs.

A tool entry controls:

- capability IDs it may satisfy;
- action class (`read`, `test`, `mutation`, `external-write`);
- maximum allowed risk;
- allowed environments;
- approval expectation;
- allowed agent packs.

`disabled` connectors are denied. `pilot` connectors are admitted only under their explicit pack/tool/environment contract and still pass through policy/approval.

Secrets, OAuth access tokens, workload identity tokens, browser auth state, and database credentials are not registry data and must never enter model context.

## MCP security expectations

For Streamable HTTP MCP servers, BM Agents World expects the current MCP authorization model: protected servers use OAuth-based authorization, bearer tokens remain in headers rather than URLs, and servers validate tokens/audience. Stdio servers obtain credentials from their execution environment instead of the MCP HTTP authorization flow.

MCP tool descriptions and annotations are not sufficient for admission. BM Agents World treats discovered tools as untrusted until their server/tool mapping is present in the approved connector registry.

## Policy lifecycle

A policy decision is saved with each capability action. Before adapter execution, the shared broker evaluates policy again. If the action is newly denied, or effective risk/approval mode changed, execution stops and a new governed action must be requested.

This prevents an old approval from bypassing a newer policy restriction.

## Current centralized rules

The first Rego policy intentionally mirrors the proven QA governance contract:

- non-production L0/L1 work may run under standing policy;
- L2/L3 require governed human approval;
- L4 requires privileged-process approval;
- production reads become L4;
- free-form production mutation remains denied;
- unregistered connector/tool/capability combinations are denied before OPA evaluation.

Future slices can add organization role claims, project-specific allowlists, maintenance windows, separation-of-duties groups, data classifications, and centrally distributed signed OPA bundles without changing agent prompts or adapter implementations.

## Validation

CI validates:

- connector admission and risk ceilings;
- pack/environment restrictions;
- governed L3 and production L4 decisions;
- unregistered capability denial;
- OPA fail-closed behavior;
- Kubernetes OPA sidecar/policy mount contract;
- Rego syntax using the same pinned `openpolicyagent/opa:1.17.0` image used by the pilot;
- all existing QA/security/persistence/observability tests;
- the production application build and Playwright image build.
