# Coding guidelines

- Keep strict TypeScript passing and avoid unvalidated `unknown` input at API/adaptor boundaries.
- Define side-effect risk in `qa-capabilities.ts`; do not bypass `CapabilityBroker` from a tool or route.
- Keep credentials and target URLs server-side. Return modes and sanitized references only.
- Preserve tenant and project authorization whenever adding a run-derived resource.
- Use bounded timeouts, response sizes, and allowlists for external calls.
- Add policy tests for every new capability, especially denial and approval transitions.
- Keep packs declarative; generalize proven platform primitives instead of embedding role-specific logic in core.
- Mark incomplete integrations as mocks or unknown rather than implying live behavior.

For UI work, provide loading, empty, failure, and conflict states; use native controls and visible focus. For docs, link to real source paths and update diagrams when the data flow changes.
