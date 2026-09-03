# CONTRIBUTING — How to contribute to Shizune

This guide defines the conventions any contribution must follow — from humans or agents — in a Shizune instance: commits, ADRs, frontmatter, archiving, security and licence.

---

## 1. Language and naming

- **The public framework is written in English**; an instance keeps its own content in whatever language its team works in. The boundary is the export allowlist, file by file: whatever `scripts/export-manifest.json` exports is product and is written in English.
- **In this release**, `skills/` and `templates/` are still in Brazilian Portuguese while their translation lands; new files added to the allowlist are written in English from the start.
- Structural names — folders, files, frontmatter fields, slugs — are **English** on both sides. Two exceptions still ship and are part of the same translation pass: the frontmatter field names (`tipo`, `projeto`, `data`, `autor`) and the `templates/projeto/` folder. New structural names are English from the start, without exception.
- Links between documents are always **relative** — never absolute machine paths.
- Project slugs are canonical and live in `governance/registro-projetos.yaml`; never invent variations.

## 2. Commits — Conventional Commits

Format: `type(scope): description`.

- **Type and scope in English** (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`); the description follows the content language of the repository you are committing to — English in this public framework repository.
- One commit per logical change; messages in the imperative.
- **A commit that changes product behaviour carries a decision trailer**, on its own line, naming a row of `governance/registro-decisoes.md`:

  ```
  Decision: DEC-001
  ```

  The build fails when a commit cites a decision that is not in the record, one with no signer, one whose commit SHA does not resolve in the tree, or one still marked `rascunho, assinatura pendente` — nothing may lean on a decision nobody has signed. A commit that changes no product behaviour needs no trailer, and an unsigned draft sitting in the record without being cited is a legitimate state that only warns. Check yours before pushing with `bun scripts/validate-decisions.mjs`; the record and the optional key-signature layer are explained in `QUICKSTART.md`, section 6.

Examples:

```
docs(governance): record ADR on the tree reorganisation
feat(skills): add the handoff skill to the core pipeline
fix(scripts): correct frontmatter validation for SKILL.md files
```

## 3. ADR flow (Architecture Decision Records)

- **Nygard** format: Context → Decision → Consequences, with Status and Date in the header.
- **Numbering**: highest existing number plus one. **Never renumber** an ADR, even a rejected one.
- **Supersede by status mark**: an ADR is never deleted, and never edited to "fix" the decision — a new ADR supersedes it and the old one receives the status mark (for example, `Superseded by ADR-021`).
- **Cross-project prefixes**: ADRs local to a project use a slug prefix (for example `ProjectA/ADR-001`) so they do not collide with Shizune's global numbering.
- Your instance's ADRs live under `governance/adr/`, numbered sequentially and never renumbered.
- **The framework ships no ADRs of its own.** Skills, templates and script comments cite ADR numbers (ADR-007, ADR-015, ADR-018 and others): those are decision records of the instance this framework was extracted from, and they are not published — they carry that instance's private context. What ships is the mechanism: `templates/adr.md` and the `shizune-adr` skill. Read a cited number as "there is a recorded reason for this rule", not as a document you are expected to open. Your instance starts its own numbering at 001.

## 4. Frontmatter v2 is mandatory

Every new `.md` is born with the v2 YAML block — exactly these six fields, in this order:

```yaml
---
id: <type>-<descriptive-slug>   # globally unique, kebab-case
tipo: <decisao|mapa|ficha|memoria-agente|handoff|status|relatorio|processo|skill|template|referencia|indice|exemplo|guia>
projeto: <canonical slug, or global>
status: vigente
data: <YYYY-MM-DD>
autor: <author>
---
```

The field names and enum values are part of the data contract and stay as written, in Portuguese, so that documents remain machine-readable across instances regardless of prose language.

Exception: `SKILL.md` opens with `name` and `description` (the Anthropic skills spec), followed by the six v2 fields **in the same block**.

**Validation**: before submitting, run

```
bun scripts/doctor.mjs
```

It runs every checker at once. The structure checker verifies frontmatter, field order, slugs and `id` uniqueness; the others check broken relative links, prose references, governance state and the public export in dry-run.

## 5. Nothing is deleted

- A superseded document is **not deleted**: it moves to `archive/` with a **supersession banner** at the top (what superseded it, when and why).
- Dated records (status files, reports, evidence under `logs/`) are **immutable**: a correction is a new record, never an edit of the old one.

## 6. Security — zero secrets

- **No secret** in any file: no `.env`, tokens, keys, credentials or URLs with embedded credentials.
- Publishable framework files must also carry no personal data — email addresses, machine names, user profile paths.
- The validator (`bun scripts/validate-structure.mjs`) **fails** on any detected secret pattern; that failure blocks the contribution.

## 7. How to propose a new skill

1. Start from the template in `templates/skill/`.
2. The skill is born as `skills/<category>/<name>/SKILL.md`, with `name` and `description` followed by the v2 frontmatter (section 4).
3. Describe: purpose in one or two sentences, usage trigger, output artifact and its relation to the existing pipeline.
4. Run the validation and open the proposal with a `feat(skills): ...` commit.

## 8. Licence

Shizune is distributed under the **Apache License 2.0** ("Shizune © 2026 Cadu Azeredo" — see `LICENSE` and `NOTICE` at the root). Every contribution is accepted under the same licence (**inbound = outbound**): by contributing, you agree to license your contribution under Apache 2.0, with no additional terms.
