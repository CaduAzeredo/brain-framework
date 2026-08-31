---
id: exemplo-course-platform-ticket-001
tipo: exemplo
projeto: global
status: vigente
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional**. This file demonstrates a filled-in execution ticket following `templates/ticket.md`, including a real-looking deviation and its justification. In real use, `tipo` is `relatorio` and `projeto` carries your project slug.

# ticket-001 — Implement certificate issuance

## Origin

- Origin: [spec-002](../specs/spec-002-certificate-issuance.md)

## Task

Implement the completion check and certificate creation described in spec-002, plus the transactional email and the retrieval endpoint. This ticket covers **AC1 through AC6** — the whole spec. The expected result is that a student who finishes every lesson and passes every quiz receives one email with a permanent link, and that no code path can ever edit a certificate after it exists.

## Execution diary

- **2026-08-27 09:10** — Read spec-002 and DOMAIN.md. Confirmed that invariant 2 needs both conditions, not either; an earlier reading of the context had implied lessons alone were enough.
- **2026-08-27 09:40** — Added the `certificates` table with a unique constraint on `serial` and a second unique constraint on `enrollment_id`. The second one is what makes the concurrency error case structural rather than defensive.
- **2026-08-27 10:25** — Wrote the completion check as a single counting query. Asserted query count in the test to keep the hot-path risk from the spec honest: 1 query, not N.
- **2026-08-27 11:15** — AC1 and AC2 green. Three integration tests.
- **2026-08-27 13:05** — Implemented issuance and the email send as two separate steps with the send outside the transaction, so a provider outage cannot roll back a certificate.
- **2026-08-27 14:20** — AC5 initially failed: marking the final lesson watched twice sent two emails. Root cause was the send living in the completion handler rather than being keyed to certificate creation. Moved the send to fire on certificate creation only. AC5 green.
- **2026-08-27 15:30** — Retrieval endpoint done. AC6 green, including the archived-course case.
- **2026-08-27 16:10** — Full suite: 48 passing. Wrote up the name-correction problem as a follow-up rather than solving it here.

## Deviations from the spec

| Deviation | Justification | Approved by |
| --- | --- | --- |
| Added a unique constraint on `enrollment_id`, which the spec did not name | The spec's concurrency error case demanded "exactly one certificate" but left the mechanism open. A database constraint makes the guarantee structural; application locking would have made it conditional on correct code. | Operator, 2026-08-27 |
| Email send moved outside the issuance transaction | Required to satisfy the first error case: issuance must not depend on the provider being reachable. The spec implied this without stating it. | Operator, 2026-08-27 |

## Result

- **AC1** — 1 integration test, happy path, asserts exactly one certificate row. Passing.
- **AC2** — 2 integration tests (missing lesson; failing quiz), both assert zero certificate rows. Passing.
- **AC3** — Unique constraint on `serial`; duplicate-insert test expects failure. Passing.
- **AC4** — Certificate repository exposes no update method; asserted by test and confirmed by inspection. Passing.
- **AC5** — Double-marking test asserts a single send. Passing after the 14:20 fix.
- **AC6** — Archived-course retrieval returns HTTP 200. Passing.
- Suite total: 48 passing (measured 2026-08-27 16:10). The 42 in [CONTEXT.md](../CONTEXT.md) predate this ticket.

## Follow-ups

- Student name corrected after issuance leaves the certificate showing the old name, and invariant 3 forbids editing it → `tickets/ticket-002-certificate-reissuance.md`
- Public verification page so a third party can check a serial → new spec, not yet written
- Instructor completion metrics now have data to report on → task 4 in [CONTEXT.md](../CONTEXT.md)
