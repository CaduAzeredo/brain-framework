---
id: exemplo-course-platform-spec-002
tipo: exemplo
projeto: global
status: vigente
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional**. This file demonstrates a filled-in specification following `templates/spec.md`. In real use, the frontmatter `projeto` field carries your project slug and `tipo` is `referencia`; here they are `global` and `exemplo` because this file is framework material.

# spec-002 — Certificate issuance on course completion

## Objective

Issue an immutable certificate the moment an enrollment reaches completion, and deliver it to the student without manual intervention. This is the feature the instructor dashboard later reports on, so it has to exist before completion metrics mean anything.

## Scope

- Detecting that an enrollment has reached completion.
- Creating a certificate record with a stable, verifiable serial number.
- Delivering the certificate to the student by transactional email.
- Serving the certificate at a permanent retrieval URL.

## Non-scope

- Visual design of the certificate (layout, typography, seal) — a separate spec.
- Public verification page for third parties checking a serial — future spec.
- Re-issuance after a corrected student name — see `tickets/ticket-002-certificate-reissuance.md`, discovered during implementation.
- Any payment or refund behaviour — out of scope for this demo entirely.

## Expected behaviour

Written in the language of [DOMAIN.md](../DOMAIN.md).

An **Enrollment** transitions from `active` to `completed` when both conditions of domain invariant 2 hold: every **Lesson** in the **Course** has been watched, and every **Quiz** in the course has a passing score for that student.

The transition is evaluated at exactly two moments — when a lesson is marked watched, and when a quiz attempt is scored. It is never evaluated on a schedule, so completion is immediate from the student's point of view and there is no background job to reason about.

On transition, the system creates a **Certificate** carrying: a serial number unique across the platform, the student's name as recorded at issuance time, the course title, and the issuance timestamp. Per domain invariant 3, the certificate is immutable from that moment: nothing in the record is ever updated in place.

The student then receives one transactional email containing the retrieval URL. The certificate remains retrievable at that URL indefinitely, including after the course is archived — archiving a course never affects certificates already issued.

## Acceptance criteria

1. **AC1 —** An enrollment whose lessons are all watched and whose quizzes all pass transitions to `completed` and produces exactly one certificate. Verification: integration test covering the full happy path, asserting one certificate row.
2. **AC2 —** An enrollment missing one watched lesson, or holding one failing quiz score, produces **no** certificate. Verification: two integration tests, one per condition, asserting zero certificate rows.
3. **AC3 —** Serial numbers are unique across the platform. Verification: a unique constraint at the database level plus a test that attempts a duplicate insert and expects failure.
4. **AC4 —** A certificate record is never updated after creation. Verification: no update path exists in the certificate repository, confirmed by inspection; and a test asserting the repository exposes no update method.
5. **AC5 —** Completing a course sends exactly one email, even if the completion evaluation runs more than once. Verification: test that marks the final lesson watched twice and asserts a single send.
6. **AC6 —** The retrieval URL resolves after the course is archived. Verification: test that archives the course and then fetches the certificate, expecting HTTP 200.

## Error cases

| Case | Expected behaviour |
| --- | --- |
| Email provider unavailable at issuance | The certificate is still created; the send is retried with backoff. Issuance never depends on email delivery succeeding. |
| Completion evaluated twice concurrently | Exactly one certificate exists. Enforced by a unique constraint on the enrollment reference, not by application-level locking. |
| Student record deleted before issuance completes | Issuance aborts and logs; no orphan certificate is created. |
| Quiz re-scored downward after issuance | The certificate stands. Invariant 3 is absolute; a correction is a new certificate referencing the previous one, never an edit. |
| Retrieval URL requested for an unknown serial | HTTP 404 with a neutral message. The response never reveals whether the serial once existed. |

## Dependencies

- [DOMAIN.md](../DOMAIN.md) — invariants 2 and 3, and the `active → completed` enrollment transition.
- ADR-001 (illustrative) — certificates are generated server-side and immutable after issuance.
- A transactional email provider — see the integrations table in [CONTEXT.md](../CONTEXT.md).

## Risks

- **Completion is evaluated on a hot path.** Two writes now trigger a completion check; if that check is expensive it slows every lesson and quiz interaction — mitigation: the check reads only counts, never full lesson rows, and is covered by an assertion on query count.
- **Email delivery is confused with issuance.** A failed send could be read as a failed issuance — mitigation: AC5 and the first error case make the two independent by construction, and the log records them as separate events.
- **The student's name is a moving target.** A name corrected after issuance makes the certificate look wrong while invariant 3 forbids editing it — mitigation: accepted deliberately and handled as re-issuance; this is what produced `ticket-002`.
