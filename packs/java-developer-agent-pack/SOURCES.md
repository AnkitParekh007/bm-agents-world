# Sources and Standards Baseline

The pack is version-aware. During each run, adapters must load documentation matching the repository's JDK, framework, application server, ORM, build plugins and test libraries instead of automatically applying the newest APIs.

## Primary references

- OpenJDK projects and releases: https://openjdk.org/projects/jdk/
- Java SE documentation: https://docs.oracle.com/en/java/javase/
- Java developer resources: https://dev.java/
- Spring projects and documentation: https://spring.io/projects
- Spring Boot reference documentation: https://docs.spring.io/spring-boot/
- Jakarta EE specifications: https://jakarta.ee/specifications/
- Apache Maven documentation: https://maven.apache.org/guides/
- Gradle user manual: https://docs.gradle.org/current/userguide/
- JUnit user guide: https://docs.junit.org/
- Mockito documentation and project: https://site.mockito.org/ and https://github.com/mockito/mockito
- Testcontainers for Java: https://java.testcontainers.org/
- Hibernate ORM documentation: https://hibernate.org/orm/documentation/
- Spring Data documentation: https://spring.io/projects/spring-data
- Flyway documentation: https://documentation.red-gate.com/flyway
- Liquibase documentation: https://docs.liquibase.com/
- Apache Kafka documentation: https://kafka.apache.org/documentation/
- OpenAPI specification: https://spec.openapis.org/oas/latest.html
- Model Context Protocol specification: https://modelcontextprotocol.io/specification/
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OpenTelemetry specification: https://opentelemetry.io/docs/specs/
- Micrometer documentation: https://docs.micrometer.io/
- SLSA specification: https://slsa.dev/spec/
- SPDX specifications: https://spdx.dev/specifications/

## Current-version context

- OpenJDK uses a six-month feature-release cadence. JDK 26 reached general availability in March 2026.
- JDK 25 reached general availability in September 2025 and is an LTS release from major vendors.
- These facts are planning inputs only. Repository-pinned JDK and framework versions always control code generation.

## Governance notes

- Repository-pinned tools and conventions take precedence over generic recommendations unless an upgrade is explicitly approved.
- Framework and library documentation must be resolved to the version present in the build metadata or dependency lock/verification data.
- Security and production actions remain policy-controlled even when a connector technically supports them.
- Community MCP servers require code review, provenance verification, sandboxing and a least-privilege wrapper before organizational use.
