---
id: exemplo-course-platform-context
tipo: exemplo
projeto: global
status: vigente
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional**, built to demonstrate a filled-in `CONTEXT.md` following `templates/projeto/CONTEXT.md`. In real use, the frontmatter `projeto` field carries your project slug (here it is `global` because this file is framework material).

# Lumina — Context

Lumina is a fictional online course platform: instructors publish courses with video lessons and quizzes, and students complete tracks and receive certificates. This file demonstrates the canonical project context format of Shizune.

## Overview

Small independent instructors need a simple place to publish a course: upload lessons, build one quiz per module, and issue a certificate at the end. Lumina does exactly that — no marketplace, no social network. A catalogue, a player and a certificate. HYPOTHESIS (not measured): automatic certificate issuance is the main driver of course completion — validate against usage data before treating it as fact.

## Scope

- **In**: course catalogue, video lessons, per-module quizzes, completion certificates, instructor dashboard with basic metrics.
- **Out**: third-party course marketplace, community/forum, native mobile app, any payment processing (out of scope for this demo).

## Repository and environment

- Repository: `<your-projects-folder>/lumina` (illustrative path)
- How to run: `npm install && npm run dev`
- Required environment variables (names only): `DATABASE_URL`, `VIDEO_STORAGE_BUCKET`, `SESSION_SECRET`, `EMAIL_PROVIDER_KEY`, `EMAIL_FROM_ADDRESS`

## Stack

- Web application (framework of your choice) — student interface and instructor dashboard
- Managed PostgreSQL — catalogue, enrollments, quiz results and certificates
- Object storage — lesson video files

## Task graph

| # | Task | Depends on | State |
| --- | --- | --- | --- |
| 1 | Model the domain (courses, enrollments, certificates) | — | done |
| 2 | Spec the certificate issuance | 1 | done |
| 3 | Implement certificate issuance | 2 | done |
| 4 | Instructor dashboard with completion metrics | 3 | pending |
| 5 | Certificate re-issuance after a name correction | 3 | blocked — awaiting PARADA 2 |

## State of variables (2026-08-27)

| Variable | Value | Measured on |
| --- | --- | --- |
| Tests | 48 passing (fictional demonstration suite) | 2026-08-27 |
| Published courses (demo environment) | 3 | 2026-08-27 |
| Certificates issued | 2 — feature live since ticket-001 | 2026-08-27 |
| Completion hot path | 1 counting query, asserted by test | 2026-08-27 |

## Relevant decisions

| ADR | Decision (summary) | Link |
| --- | --- | --- |
| 001 | Certificates are generated server-side and immutable after issuance | `governance/adr/adr-001-...` (illustrative) |

## Integrations and gateways

| Service | Role | Notes |
| --- | --- | --- |
| Transactional email provider | Delivers the certificate to the student | Completion email only; never marketing. Send lives outside the issuance transaction, so an outage cannot roll back a certificate. |

## Blockers

- Certificate supersession semantics — does the original URL serve the old document or redirect to the new one? Unblocked by: operator; risk: T1
- Certificate layout definition — unblocked by: operator; risk: T1

## Open items

<!-- ref-ausente-ok: spec-004-instructor-completion-metrics.md — deliberate forward reference: this demo shows a live project, and task 4 is open by design. The spec is written in round 3, after PARADA 1. -->
- [ ] Write `spec-004-instructor-completion-metrics.md` (task 4)
<!-- cita-proposto-ok: ticket-002-certificate-reissuance.md — the citation is informational, not normative: this ticket is listed precisely BECAUSE it is blocked. A worked example that only ever cited finished artifacts would teach the wrong lesson. -->
- [ ] Answer PARADA 2 so [ticket-002](tickets/ticket-002-certificate-reissuance.md) can start
- [ ] Public verification page for third parties checking a serial — no spec yet
- [ ] [AUTHORIZATION] Publish the demonstration environment

## Next action vector

Write the instructor completion metrics spec with the `to-spec` skill, then take PARADA 1 to the operator: metrics computed on read, or incrementally maintained. Do not implement before that answer — it decides whether the platform gains a second source of truth about completion.

## Round history

| Round | Date | Scope | Result | Handoff |
| --- | --- | --- | --- | --- |
| 1 | 2026-08-27 | Domain modelling | DOMAIN.md published | (illustrative) |
| 2 | 2026-08-27 | Certificate issuance | spec-002 implemented, 48 tests passing | [handoff-lumina-round-2.md](handoffs/handoff-lumina-round-2.md) |
