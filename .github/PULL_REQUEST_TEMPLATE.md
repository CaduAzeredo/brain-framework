# Pull request

## What changes and why

<!-- One paragraph. What the reader gets after this merges, and the problem it solves.
     If the change is a rule and not a document, say so explicitly here. -->

## Which ADR governs this

<!-- Reference the ADR this change implements or complies with, e.g. "ADR-018 — mandatory
     frontmatter v2". If none applies, write "None — no rule changes." -->

> **A change of rule requires an ADR.** Documents, skills and scripts can move freely inside the
> rules that already exist. Anything that changes what the framework *requires* — a new mandatory
> field, a different pipeline order, a new validation that can fail a build, a change to what the
> export allows — is a decision, and a decision is born as an ADR in Nygard format
> (Context / Decision / Consequences) before the code that implements it. Numbering is
> always-increasing and an ADR is never renumbered; a superseded decision is marked, never edited.

## Checklist

- [ ] `bun scripts/doctor.mjs` passes (or `node scripts/doctor.mjs`) — it runs every check at once:
      structure, frontmatter, links, prose references, governance state and the export dry-run.
- [ ] Every new `.md` is born with frontmatter v2 — the six fields `id`, `tipo`, `projeto`,
      `status`, `data`, `autor`, in that order. `SKILL.md` opens with `name` and `description`
      first, then the same six fields in the same block.
- [ ] No secrets and no private paths in the diff — no tokens, keys, credentials, `.env` contents,
      email addresses, machine names or absolute paths from a local drive or user profile.
- [ ] Relative links resolve — every link between documents points at a file that exists in the
      repository; no absolute machine paths.
- [ ] Commits follow Conventional Commits (`type(scope): description`), one commit per logical
      change, description in the imperative.
- [ ] Nothing was deleted to make room — a superseded document moved to `archive/` with a
      supersession banner, and dated records under `logs/` were left untouched.
- [ ] I understand this contribution is licensed under **Apache License 2.0** on the same terms as
      the project (**inbound = outbound**). There is no CLA and no additional terms.

## Notes for the reviewer

<!-- Optional: what you deliberately left out of scope, what you are unsure about, and anything
     that needs a human decision rather than a review comment. Stating a gap counts as much as
     closing it — an unmeasured number stays marked as a hypothesis. -->
