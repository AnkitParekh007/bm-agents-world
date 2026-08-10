# Research and Standards Notes

## Python and packaging

The pack treats the repository's supported Python versions as authoritative. New syntax, typing features, packaging metadata, and standard-library APIs are allowed only when compatible with that matrix. `pyproject.toml` is the preferred modern configuration surface where the repository supports it, but legacy configuration is preserved until an approved migration.

## Testing and typing

pytest fixtures, parametrization, markers, and async support are modeled as deterministic capabilities. Static typing is incremental: strictness follows project policy, and the agent must not create broad `Any`, ignores, or exclusions merely to pass a gate.

## Formatting and linting

Ruff is included as a recommended modern option for projects that adopt it, but the agent first detects existing Black, Flake8, isort, pylint, or other conventions. Tool replacement is a separate upgrade task, not a side effect of feature development.

## APIs and persistence

Framework-specific practices are version matched. FastAPI dependency injection and async testing, Django deployment/security checks, Pydantic validation, and SQLAlchemy sessions/transactions are examples of framework knowledge loaded only when relevant.

## MCP

MCP servers expose resources, prompts, and tools. Tools are model-controlled actions and therefore require explicit schemas, user-understandable behavior, policy evaluation, least privilege, and confirmation for sensitive operations. Organization-owned adapters are preferred for systems containing proprietary code or production access.

## Supply chain

Package sources, lockfiles, hashes, SBOMs, vulnerability results, licenses, provenance, build isolation, and artifact signing should be part of release evidence according to organizational risk. Similar package names and dependency confusion are treated as security signals.

## Open questions for onboarding

- Which Python versions and frameworks exist today?
- Are Poetry, uv, pip-tools, Conda, or plain pip standardized?
- Which repositories produce services, libraries, workers, scripts, or PySpark jobs?
- What databases, queues, caches, and observability tools are used?
- Are there private PyPI indexes and package publication workflows?
- Which CI/CD and deployment platforms own migrations and releases?
