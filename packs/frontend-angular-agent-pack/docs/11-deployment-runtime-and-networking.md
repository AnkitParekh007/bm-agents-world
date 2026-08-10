# Deployment, Runtime, and Networking

## 1. Runtime components

- API/UI entry point
- frontend supervisor service
- model gateway/router
- workflow and durable state store
- policy decision point
- approval service
- credential broker
- MCP gateway
- workspace worker pool
- browser/DevTools worker pool
- artifact store
- audit and telemetry pipeline
- queue and scheduler

## 2. Worker isolation

### Workspace worker

- ephemeral container or VM
- non-root execution
- read-only base image
- dedicated temporary filesystem
- repository root as the only writable project mount
- CPU, memory, process, file-size, and timeout limits
- no Docker socket
- no host home-directory mount
- no unrestricted shell tool

### Browser worker

- separate sandbox from source workspace
- isolated browser profile
- approved origin allowlist
- restricted downloads and uploads
- no personal browser session
- evidence redaction before storage
- network and console capture with size limits

## 3. Network segmentation

Default deny egress. Allow only:

- selected Atlassian endpoints
- approved Bitbucket host
- approved Figma and design endpoints
- private package registry and approved public registry proxy
- project application/API origins
- SonarQube, Storybook, artifact, telemetry, and vault endpoints
- official documentation through a controlled cache or fetch proxy

Block link-local addresses, cloud metadata endpoints, private networks outside registered targets, and arbitrary URLs from story text.

## 4. Toolchain images

Create versioned worker images or toolchain profiles for:

- Angular 12 compatible Node/CLI dependencies
- Angular 15 compatible Node/CLI dependencies
- AngularJS legacy toolchain
- modern Angular reference/sandbox profile

The repository's lockfile and registered compatibility matrix determine execution. Do not automatically use the host's newest Node.js or Angular CLI.

## 5. Package installation

- prefer lockfile-preserving installs such as the project's frozen/clean mode
- route installs through an approved registry proxy
- verify package integrity
- limit lifecycle scripts where feasible
- record package and lockfile changes
- deny global package installation in production workers
- deny package publication

## 6. MCP deployment

- remote SaaS MCP servers connect through the MCP gateway
- organization servers use authenticated streamable HTTP
- local stdio servers run inside the scoped worker
- expose only selected toolsets per agent
- set timeouts, request limits, and output-size limits
- validate tool schemas and sanitize outputs

## 7. Availability and recovery

- persist workflow state outside workers
- make external writes idempotent
- use dead-letter queues for repeated tool failures
- support operator cancellation and global kill switch
- retain partial patches and sanitized evidence when a worker fails
- invalidate all capability and secret leases on cancellation
