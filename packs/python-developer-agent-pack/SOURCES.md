# Sources and Standards Baseline

The pack is intentionally version-aware. During each run, adapters should load the documentation version matching the repository rather than automatically applying the newest syntax or framework behavior.

## Primary references

- Python documentation: https://docs.python.org/3/
- Python virtual environments: https://docs.python.org/3/library/venv.html
- Python asyncio: https://docs.python.org/3/library/asyncio.html
- Python Packaging User Guide: https://packaging.python.org/
- `pyproject.toml` guide: https://packaging.python.org/en/latest/guides/writing-pyproject-toml/
- PyPA interoperability specifications: https://packaging.python.org/en/latest/specifications/
- pytest documentation: https://docs.pytest.org/en/stable/
- mypy documentation: https://mypy.readthedocs.io/en/stable/
- Ruff documentation: https://docs.astral.sh/ruff/
- FastAPI documentation: https://fastapi.tiangolo.com/
- Django documentation: https://docs.djangoproject.com/
- Pydantic documentation: https://docs.pydantic.dev/
- SQLAlchemy documentation: https://docs.sqlalchemy.org/
- Model Context Protocol specification: https://modelcontextprotocol.io/specification/
- MCP Python SDK: https://py.sdk.modelcontextprotocol.io/
- OpenAPI specification: https://spec.openapis.org/oas/latest.html
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OpenTelemetry specification: https://opentelemetry.io/docs/specs/
- SLSA specification: https://slsa.dev/spec/
- SPDX specification: https://spdx.dev/specifications/

## Governance notes

- Repository-pinned tools and conventions take precedence over generic recommendations unless an upgrade is explicitly approved.
- Framework and library documentation must be loaded at the version present in the lockfile or build metadata.
- Security and production actions remain policy-controlled even if a tool technically supports them.
- Community MCP servers require code review, provenance verification, sandboxing, and a least-privilege wrapper before organizational use.
