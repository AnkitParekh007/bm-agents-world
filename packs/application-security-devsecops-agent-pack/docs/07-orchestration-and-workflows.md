# Orchestration and Workflows

## Stateful workflow model

`Intake → Authorization → Context → Risk tier → Parallel analysis → Evidence convergence → Independent review → Human decision → Protected publication or execution request → Verification → Learning`

## Workflow set

1. **Secure feature intake and threat model** — turns a product or architecture change into requirements, threats, controls, and a security test plan.
2. **Code change security validation** — analyzes a source revision using focused code review, SAST, SCA, secrets, API, and targeted tests.
3. **Supply-chain and release security** — verifies candidate artifacts, SBOM, provenance, signatures, infrastructure, exceptions, and release readiness.
4. **Vulnerability triage and remediation** — converts scanner or advisory evidence into prioritized, owned, verified remediation.
5. **Product-security incident and exception management** — coordinates sensitive incidents and time-bound exception decisions.

## Concurrency

Independent scanners and specialist agents may execute in parallel after scope authorization. They converge only through stable finding and artifact identities. The supervisor does not average conflicting results; it records disagreement and requests further evidence.

## Failure behavior

Missing authorization stops execution. Stale, mismatched, or unavailable evidence produces `unknown`, not `pass`. Scanner outages and incomplete coverage must be visible in gate decisions. The agent never fabricates security evidence to complete a workflow.
