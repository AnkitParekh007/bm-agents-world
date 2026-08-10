# Deployment, Runtime, and Networking

The architect does not own deployment execution but must design how interfaces traverse ingress, gateways, service meshes, brokers, networks, identity boundaries, and egress controls.

Runtime discovery captures endpoint protocol/version, TLS profile, DNS/service discovery, load balancing, gateway products, broker clusters, service-mesh behavior, proxy timeouts, rate limits, WAF controls, certificate rotation, and observability propagation.

Production configuration changes are converted into deterministic, payload-hashed requests consumed by DevOps/SRE or approved platform automation.
