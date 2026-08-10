# Deployment, Runtime, and Networking

## Runtime zones
- Isolated developer workspace.
- Bounded training/evaluation compute.
- Approved model-provider gateway.
- Artifact and model registry.
- Validation/staging serving.
- Production serving controlled by deterministic deployment systems.

## Network controls
Default-deny egress for training jobs where feasible; allowlisted model/package/dataset endpoints; private access to registries and data systems; workload identity; tenant/project isolation; audit logs; and separate production control-plane credentials.

The agent may prepare deployment manifests and immutable release bundles but cannot directly mutate production endpoints, traffic, Kubernetes, cloud resources, vector indexes, feature stores, or secrets.
