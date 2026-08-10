# Research and Standards Notes

## Java release model

OpenJDK ships feature releases on a six-month cadence. The pack therefore distinguishes repository runtime compatibility from the newest available JDK. JDK 25 is a long-term-support release from major vendors, while JDK 26 is the current feature release as of this pack's creation. Neither should be imposed on legacy repositories without an approved upgrade.

## Build-system principle

Maven and Gradle are both first-class. The repository wrapper, effective build configuration, parent/BOM hierarchy and CI commands are authoritative. The agent must not translate a project from one build system to another as part of unrelated work.

## Framework principle

Spring Boot, Spring Framework, Jakarta EE, Hibernate and application servers evolve independently. Version-matched documentation and compatibility matrices are required, especially for Java baseline changes and `javax.*` to `jakarta.*` migrations.

## Test principle

JUnit provides the test platform and Jupiter programming model in modern projects. Mockito should isolate stable boundaries, not recreate the implementation. Testcontainers supports integration testing against disposable real services. Existing project conventions take precedence.

## Database principle

ORM convenience does not remove the need to reason about SQL, transactions, constraints, fetch plans and migrations. Production data access remains read-only and policy-controlled.

## Supply-chain principle

Dependency sources are allowlisted, versions are governed, build plugins are treated as executable code, and outputs should include SBOM and provenance where supported. Artifact signing and publication belong to a dedicated release process.

## MCP principle

MCP servers expose distinct resources, prompts and tools. Sensitive executable tools require explicit schemas, user-visible intent, least privilege, sandboxing, policy checks and audit records. Community servers are not trusted merely because they are discoverable.
