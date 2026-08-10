# MCP Servers, Tools, and Plugins

## Separation of concerns
- **Skill:** reasoning or domain capability.
- **MCP server:** governed external capability/resource boundary.
- **Tool:** atomic operation exposed by an MCP server or plugin.
- **Plugin/adapter:** deterministic local or infrastructure execution component.
- **Artifact:** versioned output with provenance.

## MCP registry
| ID | Server | Purpose |
|---|---|---|
| `atlassian-context` | Atlassian/Jira/Confluence MCP | Read approved work items, decisions, requirements, and documentation; writes require approval. |
| `bitbucket-repository` | Bitbucket Repository MCP | Read repository trees, diffs, commits, pull requests, and branch metadata; write operations approval-gated. |
| `workspace-git` | Scoped Workspace/Git MCP | Operate on an isolated checkout for code, notebooks, configs, and tests. |
| `data-catalog` | Data Catalog and Lineage MCP | Read approved datasets, schemas, ownership, classification, lineage, and quality metadata. |
| `warehouse-readonly` | Warehouse / Database Read-Only MCP | Execute approved parameterized, row-bounded, read-only analytical queries. |
| `object-storage` | Dataset and Artifact Storage MCP | Read/write project-scoped non-production datasets and artifacts through governed paths. |
| `experiment-tracking` | Experiment Tracking MCP | Read runs and log approved non-production experiments, metrics, parameters, and artifacts. |
| `model-registry` | Model Registry MCP | Read model lineage and create candidate registrations; promotion is approval-gated. |
| `feature-store` | Feature Store MCP | Read feature definitions and non-production feature metadata; production writes blocked. |
| `compute-platform` | ML Compute Platform MCP | Submit approved sandbox/training jobs with bounded compute, images, data mounts, and budgets. |
| `model-provider` | Approved Model Provider MCP | Invoke approved hosted foundation models through organization policy, budgets, and data controls. |
| `vector-search` | Vector / Retrieval Platform MCP | Operate project-scoped development indexes and inspect retrieval behavior. |
| `evaluation-platform` | AI Evaluation MCP | Run deterministic and model-assisted evaluation suites with versioned datasets and rubrics. |
| `observability` | AI/ML Observability MCP | Read bounded metrics, logs, traces, model-monitoring signals, and cost telemetry. |
| `security-scanners` | Security Scanner MCP | Run approved SAST, SCA, secret, container, IaC, and AI-security scanners in safe scope. |
| `documentation` | Documentation/Artifact MCP | Store model cards, dataset cards, diagrams, reports, and evidence bundles. |
| `vault-broker` | Vault / Capability Broker MCP | Issues scoped references or short-lived capabilities; never returns raw long-lived secrets to the model. |
| `policy-approval` | Policy and Approval MCP | Evaluate OPA-style policy and obtain payload-bound human approvals for protected actions. |

## Deterministic plugins and adapters
| ID | Plugin | Purpose |
|---|---|---|
| `python-runtime` | Python Runtime Adapter | Executes approved Python commands in isolated environments. |
| `notebook-runner` | Notebook Runner | Executes parameterized notebooks reproducibly and exports results. |
| `pytest` | pytest Adapter | Runs unit, integration, data, model, and regression tests. |
| `sklearn` | scikit-learn Adapter | Runs repository-pinned classical ML training and evaluation. |
| `pytorch` | PyTorch Adapter | Runs repository-pinned deep-learning training and inference. |
| `tensorflow` | TensorFlow Adapter | Runs repository-pinned TensorFlow/Keras workloads when the project uses them. |
| `transformers` | Transformers Adapter | Loads approved pretrained models and runs fine-tuning/inference with pinned versions. |
| `mlflow` | MLflow Adapter | Tracks experiments, evaluations, traces, and model candidate metadata where adopted. |
| `data-profiler` | Data Profiling Adapter | Profiles schemas, distributions, missingness, duplicates, and leakage indicators. |
| `evaluation-runner` | Evaluation Runner | Executes versioned golden sets, rubrics, regression suites, and deterministic validators. |
| `rag-evaluator` | RAG Evaluation Adapter | Measures retrieval, grounding, citation, and answer-quality metrics. |
| `model-benchmark` | Model Benchmark Adapter | Benchmarks latency, throughput, memory, tokens, and quality-cost tradeoffs. |
| `model-scanner` | Model Artifact Scanner | Checks artifact formats, provenance, hashes, unsafe serialization, and policy metadata. |
| `security-suite` | Security Suite | Runs approved code, dependency, container, IaC, secret, and AI-security scans. |
| `sbom-provenance` | SBOM and Provenance Adapter | Generates and verifies software/model supply-chain evidence. |
| `container-builder` | Container Build Adapter | Builds non-production model images from approved bases and lockfiles. |
| `k8s-readonly` | Kubernetes Read-Only Adapter | Reads approved ML workload metadata and telemetry; no direct mutations. |
| `cost-estimator` | AI Cost Estimator | Computes bounded training and inference cost scenarios. |
| `drift-analyzer` | Drift Analyzer | Computes approved distribution, performance, and task-success drift measures. |
| `redaction` | Sensitive Data Redaction Adapter | Redacts secrets and configured sensitive fields before model context or artifact publication. |
| `hash-signer` | Evidence Hash Adapter | Creates digests for datasets, models, prompts, reports, and approval payloads. |
| `diagram-renderer` | Diagram Renderer | Validates and renders Mermaid/Graphviz-style architecture and lifecycle diagrams. |

## Recommended tool families
Dataset search, schema/profile inspection, experiment logging, model training, evaluation, registry inspection, retrieval diagnostics, model-provider invocation, benchmark execution, drift analysis, artifact hashing, policy evaluation, approval requests, and read-only observability should be exposed as narrow tools rather than a universal shell.
