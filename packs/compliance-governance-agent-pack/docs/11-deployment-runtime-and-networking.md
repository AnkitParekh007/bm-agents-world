# Deployment, Runtime and Networking

Run the supervisor in an orchestrated service with specialist tasks executed in isolated workers. Production connectors are read-only by default and network-egress allowlists restrict workers to approved endpoints.

Recommended zones: orchestration plane, policy/capability plane, evidence plane, restricted connector plane and artifact plane. Sensitive evidence should remain at source whenever possible; bring summaries, bounded extracts and immutable references into the agent context.

All write-capable adapters are separately deployed, disabled by default and require policy plus approval tokens.
