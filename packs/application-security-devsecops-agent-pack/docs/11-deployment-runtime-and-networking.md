# Deployment, Runtime, and Networking

## Runtime zones

1. Agent gateway and orchestration control plane
2. Policy, approval, and capability-broker plane
3. Isolated source-analysis and scanner workers
4. Restricted active-testing workers
5. Read-only cloud, Kubernetes, registry, and observability adapters
6. Immutable security artifact and evidence store
7. Human and deterministic protected-action systems

## Network controls

- Default-deny egress from scanner workers
- Allowlisted advisory, package, image, and vulnerability sources
- Explicit target allowlists for DAST and fuzzing
- No network route from free-form model workers to production management planes
- Separate identities and networks for source analysis and active testing
- Request, response, and artifact size limits
- Malware and archive-bomb protections

## Isolation

Each run uses a clean, ephemeral workspace. Dependencies and scanner containers are pinned and verified. Source is deleted according to retention policy. Active-testing workers cannot reach targets outside the approved allowlist.

## Availability

Scanner outages fail open only for explicitly optional advisory checks. Required gates become `unknown` or `blocked`; they never silently pass.
