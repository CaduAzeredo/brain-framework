---
id: exemplo-course-platform-ticket-002
tipo: exemplo
projeto: global
status: proposto
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional**. This file demonstrates a ticket that exists **before** its work is done — opened from a follow-up, still waiting on a decision. Not every ticket in a healthy project is finished; a ticket in this state is a feature of the record, not a gap in it.

# ticket-002 — Certificate re-issuance after a name correction

## Origin

- Origin: [spec-002](../specs/spec-002-certificate-issuance.md), non-scope section and third listed risk
- Discovered by: [ticket-001](ticket-001-certificate-issuance.md), follow-ups

## Task

A student whose name is corrected after issuance holds a certificate showing the old name. Domain invariant 3 makes editing it impossible on purpose, and spec-002 explicitly left this out of scope. This ticket implements the path the invariant already prescribes: a **new** certificate that references the superseded one, leaving the original intact and retrievable.

No acceptance criteria are cited yet, because the governing spec does not exist. Writing it is the first step of this ticket.

## Execution diary

- **2026-08-27 16:10** — Opened from ticket-001 follow-ups. Not started.
- **2026-08-28 09:00** — Blocked pending an operator decision: when a certificate is superseded, should the original URL keep serving the old certificate, or redirect to the new one? The two answers imply different things about what a certificate *is*, so this is not an implementation detail to be picked by whoever writes the code.

## Deviations from the spec

None — no work has been done yet, so nothing has diverged.

## Result

Not started. No acceptance criteria passing, because none have been written.

## Follow-ups

<!-- ref-ausente-ok: spec-003-certificate-supersession.md — deliberate forward reference: this ticket is blocked precisely because its governing spec cannot be written before the operator answers PARADA 2. -->
- Write `spec-003-certificate-supersession.md` once the operator answers the URL question → new spec
- The public verification page from ticket-001 must account for superseded serials → fold into that spec when it is written
