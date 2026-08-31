---
id: exemplo-course-platform-audit-journey
tipo: exemplo
projeto: global
status: vigente
data: 2026-08-30
autor: brain-framework
---

> **This is an example only — adapt it to your own project.** The "Lumina" product is **entirely fictional** ([CONTEXT.md](CONTEXT.md) · [DOMAIN.md](DOMAIN.md)). This document shows end to end how the Brain takes a codebase from "unknown state" to a prioritised, auditable plan — the journey the framework makes repeatable.

# Lumina — From audit to governance: a journey with the Brain

## The problem the Brain solves

Every inherited codebase arrives with the same unanswered question: *what actually works, what is safe, and what is missing before launch?* The README says one thing, the tests say another, and the production database says a third. The Brain turns that uncertainty into a verifiable map: an immutable report, a project dossier and a prioritised backlog with estimates — all under governance rules that stop assumption from becoming fact.

This journey uses Lumina (a fictional course platform) as its subject. The method is the same for any project.

## The backbone: the skill pipeline

The work follows five chained stages, each with one canonical output artifact:

| Stage | Skill | Produces |
|---|---|---|
| Interrogate | `grill-with-docs` | `CONTEXT.md` — what the project is, where it lives, what state it is in |
| Model | `domain-modeling` | `DOMAIN.md` — entities, relations, verifiable invariants |
| Specify | `to-spec` | `specs/spec-NNN` — a behaviour contract with acceptance criteria |
| Implement | `implement` | code + `tickets/ticket-NNN` — an execution diary with explicit deviations |
| Hand off | `handoff` | a `.md`+`.json` pair — everything the next executor needs, with human PARADAs |

Nothing is skipped: a spec without a verifiable criterion goes back for rewriting, and a handoff with an empty section is a gap, not an option.

You can read the real artifacts of this demo, in order: [spec-002](specs/spec-002-certificate-issuance.md) → [ticket-001](tickets/ticket-001-certificate-issuance.md) → [handoff round 2](handoffs/handoff-lumina-round-2.md).

## The differentiator: adversarial verification

The Brain does not trust its first finding. Every candidate defect is re-verified by reading the real code, with a `file:line` reference, and receives an explicit verdict — **Confirmed**, **Partial** or **Refuted**. A finding that fails to reconfirm is downgraded in writing, never quietly dropped. In Lumina's journey two "obvious" hypotheses fell through that sieve: a component that looked live turned out to be orphan code with no importer, and a route flagged as unprotected proved to be correctly authenticated all along. Reporting what is **not** a problem is as valuable as reporting what is.

## What the method looks for

These are **classes of defect**, not a report. Deliberately: the findings of a real audit belong to the
client who commissioned it, and a defect chain is identifiable even with the names removed — the
mechanism *is* the signature. What generalises is the shape of the question, not the answer.

- **Authorisation that is checked on the wrong side.** Permission proven at one layer and assumed at
  the next. The question: for every write path, where exactly is the check, and can the caller reach
  the data by a route that skips it?
- **The side effect that never happens.** A call whose failure is invisible, so the compensating
  logic behind it is dead code and nobody notices for months. The question: which failures in this
  system are silent, and what was supposed to happen after them?
- **The silent-failure signature.** An ignored error return, a log gated on "not production", an
  empty result that does not distinguish "nothing found" from "the query failed". Individually
  small; together, a product that looks healthy because nothing screams.
- **Tests that cannot fail.** A suite whose assertions are tautological, or that talks to something
  real enough to pass with the logic broken. This is usually the answer to "how did a serious defect
  survive this long?"
- **The toolchain as measurement.** Does it install, typecheck, lint, build — on a clean machine,
  from the stated instructions? These are cheap, binary facts, and they separate what is measured
  from what is assumed.

Every unmeasured number in the report is born marked **[HYPOTHESIS]**, and a hypothesis that fails to
reconfirm is written down as refuted rather than quietly dropped.

## The layer most projects are missing: governance

What makes the journey auditable is not the findings — it is what surrounds them:

- **ADRs (decision records).** Every architecture or process decision becomes a numbered record: immutable, supersedable, never rewritten. Six months later you can still learn *why* something was decided.
- **Immutable, dated reports.** The audit report is born in `logs/<year>/<project>/` and is never edited; a late finding becomes a dated addendum. The trail is trustworthy precisely because it cannot be rewritten.
- **Quarantine for sensitive data.** When the project belongs to a client, the Brain isolates everything: private material lives outside any exportable area, automated validators redact sensitive names, and the public example — this very Lumina — is **100% synthetic**. The framework separates what may be shown from what may not, by construction.
- **Automated validators.** `validate-structure` checks frontmatter, naming and — fatally — the absence of secrets in any file; `validate-links` ensures no reference breaks. Every step ends green before the next begins.

## The deliverables

At the end of a round, the operator receives:

1. An **immutable audit report** with classified findings (P0/P1/P2), each carrying evidence and a verdict.
2. A **project dossier** — `CONTEXT.md`, `DOMAIN.md` (with invariants flagged where violated), specs and tickets — turning findings into executable work.
3. A **prioritised four-week plan** with `[HYPOTHESIS]` estimates and a split by executor: what is mechanical and can be delegated, what needs human review, what only runs with approval.
4. A **handoff** that makes the next step unambiguous, with human PARADAs at the risky points — touching production, writing outside scope, business decisions.

## Why this matters

Without the Brain: "we think it's ready." With the Brain: a map with `file:line` evidence, traceable decisions, sensitive data contained, and a plan any executor — human or agent — can follow without asking. Lumina's journey went from an opaque codebase to a governed backlog in a single audit round. That process — repeatable, auditable and safe by default — is what the Brain delivers.

---

> Want to see the format of the artifacts named above? Start with [CONTEXT.md](CONTEXT.md) and [DOMAIN.md](DOMAIN.md) from this same demo, walk through [spec-002](specs/spec-002-certificate-issuance.md), [ticket-001](tickets/ticket-001-certificate-issuance.md) and the [round 2 handoff](handoffs/handoff-lumina-round-2.md), then read the blanks in `templates/`.
