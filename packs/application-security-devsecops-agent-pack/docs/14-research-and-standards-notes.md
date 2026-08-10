# Research and Standards Notes

## OWASP application standards

OWASP ASVS 5.0.0 is the primary application-security requirements and verification baseline. Requirement references should include the version. OWASP Top 10:2025 and API Security Top 10:2023 are awareness and prioritization aids, not complete verification standards.

## Secure development maturity

NIST SSDF 1.1 is the current final NIST baseline. NIST published an initial draft of SSDF 1.2 in December 2025; this pack labels it as draft until NIST publishes a final revision. OWASP SAMM 2.0.3 supports maturity assessment and improvement planning.

## Supply chain

SLSA 1.2 is the current approved specification in this pack. CycloneDX 1.7 and SPDX 3.0 are supported SBOM formats. Sigstore/Cosign is modeled for identity-bound artifact signing and verification, while private signing material remains outside the agent.

## Vulnerability risk

CVSS v4.0 communicates technical severity. It is not a complete organizational risk score. Triage also uses exposure, reachability, asset criticality, privileges, affected data, exploit intelligence, CISA KEV status, compensating controls, and business impact.

## AI and agent systems

BM Agent Foundry and other AI-enabled systems additionally use the applicable OWASP LLMSVS and AISVS requirements. These complement rather than replace ordinary application, API, cloud, supply-chain, identity, and privacy controls.

## Security-agent limitations

Automated tools and language models can miss vulnerabilities and create false positives. A clean scan does not prove security. High-risk conclusions require deterministic evidence, independent review, and accountable human decisions.
