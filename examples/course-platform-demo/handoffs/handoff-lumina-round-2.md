---
id: exemplo-course-platform-handoff-round-2
tipo: exemplo
projeto: global
status: vigente
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional**. This file demonstrates a filled-in handoff following `templates/handoff.md`, paired with [handoff-lumina-round-2.json](handoff-lumina-round-2.json) under the same `handoff_id`. In real use, `tipo` is `handoff` and `projeto` carries your project slug.

# Handoff — Lumina, round 2: certificate issuance

## Context and why

Round 1 produced the domain model in [DOMAIN.md](../DOMAIN.md). Round 2 turned its two hardest invariants into working behaviour: completion requires both lessons and quizzes, and a certificate can never be edited once it exists. That work is done and verified — [spec-002](../specs/spec-002-certificate-issuance.md) is fully implemented by [ticket-001](../tickets/ticket-001-certificate-issuance.md).

Round 3 exists because certificates now generate data worth reporting, which is what the instructor dashboard was always waiting for. Whoever picks this up should be able to start without asking anything — and should know exactly where to stop and wait for a human.

## Scope

### Delivered

- Completion detection on both trigger points — evidence: 3 integration tests covering AC1 and AC2, passing 2026-08-27.
- Certificate creation with unique serial and no update path — evidence: unique constraint plus duplicate-insert test (AC3); repository exposes no update method (AC4).
- Transactional email, exactly once per certificate — evidence: double-marking test asserts one send (AC5).
- Permanent retrieval URL surviving course archival — evidence: archived-course fetch returns HTTP 200 (AC6).
- Suite: 48 passing, measured 2026-08-27 16:10.

### Pending

- Task 4 from [CONTEXT.md](../CONTEXT.md): instructor dashboard showing completion metrics per course.
<!-- cita-proposto-ok: ticket-002-certificate-reissuance.md — the citation is informational, not normative: this ticket is listed precisely BECAUSE it is blocked. A worked example that only ever cited finished artifacts would teach the wrong lesson. -->
- [ticket-002](../tickets/ticket-002-certificate-reissuance.md) — re-issuance after a name correction, blocked on an operator decision.
- Public verification page for third parties checking a serial — no spec written yet.

### Deviations

| Deviation | Justification | Approved by |
| --- | --- | --- |
| Unique constraint on `enrollment_id` added beyond what spec-002 named | Makes "exactly one certificate" structural rather than dependent on correct application code | Operator, 2026-08-27 |
| Email send moved outside the issuance transaction | Issuance must not fail when the email provider is unreachable — required by the spec's first error case, which the spec stated as behaviour without naming the mechanism | Operator, 2026-08-27 |

## Environment state

- Snapshot date: 2026-08-27
- Test suite: 48 passing
- Database: `certificates` table live, with unique constraints on `serial` and on `enrollment_id`
- Email provider: configured; environment variable names only — `EMAIL_PROVIDER_KEY`, `EMAIL_FROM_ADDRESS`
- Not configured: nothing related to the instructor dashboard; no metrics tables, no aggregation queries
- Course archival: implemented and exercised by the AC6 test

## Execution order

### Block 1 — Model the metrics read

- **Preconditions:** spec-002 implemented and the suite green at 48 passing.
- **Steps:**
<!-- ref-ausente-ok: spec-004-instructor-completion-metrics.md — deliberate forward reference: a handoff names the artifact the NEXT round must produce; if it already existed, the handoff would have nothing to hand off. -->
  1. Write `spec-004-instructor-completion-metrics.md`, using the `to-spec` skill, with acceptance criteria stated as verifiable queries.
  2. Decide in that spec whether metrics are computed on read or maintained incrementally, and record the reasoning — not just the choice.
- **Expected result:** a spec whose every acceptance criterion names how it is verified.

### Block 2 — Implement the dashboard

- **Preconditions:** Block 1 complete and PARADA 1 approved.
- **Steps:**
  1. Implement against the spec, opening a ticket that records the diary as the work happens, not afterwards.
  2. Keep the completion hot path untouched — the query-count assertion from ticket-001 must still hold.
- **Expected result:** dashboard renders per-course completion counts; suite green with the new tests added.

## Human PARADAs

### PARADA 1 — Metrics computation strategy

- **When it occurs:** after Block 1, before any implementation.
- **What to approve:** computed-on-read versus incrementally maintained. This decides whether the platform gains a second source of truth about completion, which is a governance question, not a performance one.
- **Evidence required:** the drafted spec, plus a measured read-time figure for the computed-on-read option against the demo dataset.

### PARADA 2 — Certificate supersession semantics

- **When it occurs:** before any work starts on ticket-002.
- **What to approve:** whether a superseded certificate's original URL keeps serving the old document or redirects to the new one.
- **Evidence required:** none beyond the question itself — it is a product decision, and presenting it as a technical one would be misleading.

## Validation criteria

1. **V1 [GATE] —** The completion hot path still issues exactly one counting query. Verification: the existing query-count assertion from ticket-001 still passes.
2. **V2 [GATE] —** No certificate update path is introduced by the dashboard work. Verification: inspection of the certificate repository plus the AC4 test.
3. **V3 —** Dashboard figures match a direct count against the database for the demo dataset. Verification: a test comparing dashboard output to a raw count query.
4. **V4 —** Every new document carries valid v2 frontmatter. Verification: the framework's structure validator.

## Estimates

- **[HYPOTHESIS] Instructor dashboard, spec through implementation:** 2 sessions
- **Real anchor:** round 2 delivered spec-002 plus full implementation in 1 session (2026-08-27, 09:10 to 16:10), including one failed acceptance criterion that had to be re-cut.
- **Factors that could blow this up, in order of risk:** PARADA 1 going the incremental-maintenance route, which adds a write path and its consistency tests; a demo dataset too small to make the read-time measurement meaningful; scope creep from the public verification page, which is adjacent and tempting.
- **Not measured:** read-time of the computed-on-read option at any realistic data volume. Until that exists, the estimate assumes the cheaper branch of PARADA 1.

## Blocked / out of scope

- ticket-002 — blocked on PARADA 2; do not start implementation on it.
- Public verification page — out of scope for round 3; it needs its own spec.
- Certificate visual design — out of scope, and unrelated to metrics.

## Attachments

- [spec-002 — Certificate issuance](../specs/spec-002-certificate-issuance.md)
- [ticket-001 — Implement certificate issuance](../tickets/ticket-001-certificate-issuance.md)
<!-- cita-proposto-ok: ticket-002-certificate-reissuance.md — the citation is informational, not normative: this ticket is listed precisely BECAUSE it is blocked. A worked example that only ever cited finished artifacts would teach the wrong lesson. -->
- [ticket-002 — Certificate re-issuance](../tickets/ticket-002-certificate-reissuance.md)
- [CONTEXT.md](../CONTEXT.md)
- [DOMAIN.md](../DOMAIN.md)
