# Research and Standards Notes

The pack uses current published standards as reference baselines while respecting project compatibility.

- OpenAPI Specification **3.2.0** is the latest published OpenAPI release as of this pack date.
- AsyncAPI Specification **3.1.0** is the current specification line for event-driven APIs.
- JSON Schema **Draft 2020-12** remains the referenced stable JSON Schema draft.
- CloudEvents core **1.0.2** is the latest published CloudEvents release while the wire `specversion` remains `1.0`.
- RFC 9457 defines Problem Details for HTTP APIs.
- RFC 9700 is the OAuth 2.0 Security Best Current Practice; OAuth 2.1 remains under development rather than assumed final.
- RFC 9449 defines DPoP sender-constrained OAuth tokens.
- OWASP API Security Top 10 is used for threat awareness and review checklists.
- OpenTelemetry semantic conventions are applied according to their current stability status; messaging conventions are still evolving.

Standards are inputs, not automatic migration mandates. Existing client compatibility, gateway/tool support, partner constraints, and organizational standards control actual adoption.
