# Permissions, Approvals and Guardrails

## Safe autonomous operations

Read authorized metadata, analyze code/manifests, compile pipelines, render charts, validate schemas, run sandbox tests, evaluate models/agents, calculate hashes, draft changes and create evidence packs.

## Human-approved operations

Official Jira/Confluence/Bitbucket writes, shared registry changes, non-production platform applies, production promotions, traffic shifts, provider-route changes, vector index swaps, GPU/platform changes and rollback commands.

## Prohibited free-form operations

Production `kubectl apply/delete/exec`, Terraform/OpenTofu apply, cluster-admin use, direct cloud-admin changes, destructive object-store operations, production reindex/reembedding replacement, unapproved retraining/backfill, production model traffic mutation, raw secret access, artifact signing, bypassing security/evaluation gates, or accepting legal/privacy/responsible-AI risk.

## Approval binding

Protected approvals bind project, environment, target, source revision, candidate digest, configuration digest, payload hash, expected result, stop conditions, rollback, approver and expiry. Material payload changes invalidate prior approval.
