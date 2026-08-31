# Changelog

Version history of the Brain Framework. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning: [SemVer](https://semver.org/).

## [Unreleased]

Nothing yet.

## [0.2.1] - 2026-08-31

Follow-up to the adversarial pre-publication audit. Seven findings survived refutation and are closed here; none of them affect how the framework runs.

### Fixed

- **The worked example carried two illustrations that traced back to a real client engagement.** They described refuted hypotheses — findings that turned out not to be defects — but the wording was still a translation of someone else's audit. They are now genuinely Lumina's, inside the scope that example declares.
- **CONTRIBUTING claimed structural names are English on both sides.** The frontmatter field names (`tipo`, `projeto`, `data`, `autor`) and the `templates/projeto/` folder are not, and they ship. The rule was written as though it had already been met; it now says what is true and what is still pending.
- **The quickstart understated what the scaffolder creates**, omitting `DOMAIN.md` and `specs/` — the two artifacts the next step tells you to fill in.
- **Three validators hardcoded ten legacy folder names** from the private instance this framework was extracted from, so a fresh clone inherited someone else's migration archaeology and tolerated folders that do not exist in it. The list now comes from an optional instance file, `governance/legacy-tree.json`; absent means no legacy, which is the right state for a new repository — so the framework does not ship one.
<!-- ref-ausente-ok: legacy-tree.json — deliberate: this file describes an instance's own migration history, so a fresh package must not carry one. Its absence is the documented default. -->

## [0.2.0] - 2026-08-31

**First public release.** Version 0.1.0 above was a pre-publication milestone, cut before this repository existed in the open; this is the first version anyone outside the project can download.

### Added

- **Community package.** `SECURITY.md` with a coordinated-disclosure policy routed through GitHub's private vulnerability reporting (no email address anywhere in the package — the export's redaction scan uses a generic email pattern and any address would fail the build), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), issue forms for bug reports, skill proposals and translation work, a pull-request checklist, `.gitignore`, `.gitattributes`, and a checks workflow running the validators on Node 20, Node 22 and Bun.
- **A pipeline diagram** in `docs/assets/pipeline.svg`, shown at the top of the README. SVG rather than a raster image on purpose: the export's redaction scan skips any file with a null byte, so every binary is an unscanned channel. SVG is text — it is scanned, and it is reviewable in a diff.
- **Declared exceptions in the secret scan.** The structure validator now reads a registry of verified placeholder occurrences, each pinned to an exact path and line. The registry lives *outside* the file it exempts, unlike the two escapes the framework already had, because the case that motivated it sits inside an immutable dated record: writing the declaration into the file would have meant editing a log. A declaration that no longer matches anything is reported as stale, so the registry cannot rot into a silent hole.
- **Trademark and naming policy** in the README: Apache 2.0 section 6 grants no trademark rights, so the terms of use for the name are stated explicitly rather than assumed.

### Changed

- **README rebuilt for a first-time reader.** What it is, a working command, and the pipeline diagram now sit above the fold; the prose that used to open the file comes after. Functional badges replace none.
- **Frontmatter is stripped from the showcase files on export** (README, QUICKSTART, AGENTS, CONTRIBUTING, CHANGELOG). GitHub renders YAML frontmatter in a `.md` file as a table, which put a metadata table above the README's title. `skills/`, `templates/` and the worked example keep theirs — there, the frontmatter is the product.
- **Raw external material no longer fails the build.** A suspected secret inside the unversioned inbox folder is reported as a warning: it is gitignored by construction and cannot reach version control, and triage needs the signal without untriaged input breaking the checks.
- The public surface is now written in English: this changelog, the README, the quickstart, the agent contract, the contributing guide and the worked example. `skills/` and `templates/` remain in Brazilian Portuguese for this release, along with the frontmatter field names, and are the headline item of the next one — a phasing decided deliberately and declared in the README rather than hidden.
- The document type for agent memory was renamed to `memoria-agente`. Its previous name carried a third-party product name, and it had reached the validator's type enum — which meant anyone cloning the framework inherited a data model named after a tool they may not use. Roles are now described by function throughout, and the old name is a redaction pattern that fails the export.
- The T1–T4 risk matrix in the multi-agent contract now declares itself **self-sufficient**: the external source it used to cite is not present in this repository and is not auditable from it, so the contract's own table is the normative definition of the levels.
- The ecosystem context map reconciled with the dated records: task graph reorganised into independent parallel tracks, state of variables re-measured with the date of each measurement, and blockers updated.

### Fixed

- **`doctor` no longer fails in an exported package.** Its export step reads a manifest that references files existing only in the private instance, so a fresh clone failed on step five — and the quickstart tells every new user to run exactly that command as their first contact with the framework. The step now reports `n/a` when it detects it is running inside an exported package, and the summary distinguishes `n/a` from `OK` instead of masking one as the other.
- **Audit aggregates derived from NDA engagements were removed from the README.** They carried no client name, no stack and no slug — only numbers — which is precisely why no redaction pattern could catch them. Aggregate findings from a private engagement are still client data, and publishing them would have broken the quarantine rule this framework exists to enforce.
- The launch-track project file claimed the public export had never been generated. A residual snapshot existed in the output directory, produced by an earlier version of the manifest and containing material outside the current allowlist — including a project template with its placeholders unfilled. The state was corrected in the project file and triaging the residue became an explicit task, ahead of the first valid dry-run.

### Added — earlier in this cycle

- A complete worked example under `examples/course-platform-demo/`: the pipeline now runs end to end on a fictional product — a specification with six verifiable acceptance criteria, an execution ticket carrying its diary and two recorded deviations, a second ticket deliberately left blocked on a human decision, and a handoff pair (`.md` + `.json`) with its stops and estimates. The blocked ticket is intentional: a healthy project record shows work that is waiting, not only work that is finished.

- The targeted-search convention, stated in the agent contract: answer a question about repository state by reading the smallest set of files that answers it, rather than sweeping whole folders. It names the three shortcuts the framework already offered without stating them — the generated index, the date as the filename prefix of dated records, and the state-of-variables section of a project file.
- A "search before sweeping" rule in the multi-agent contract, establishing that a broad sweep is a last resort and must be announced before it starts.
- ADR-025 — the framework approved for assisted use on real projects, under the non-negotiable condition of explicit, case-by-case human approval for every production action: never blanket, never by precedent. Includes seven operating rules and five automatic revocation conditions.
- ADR-026 — independent parallel tracks: a stop on one track does not dam the others, with a declared writing boundary between them.
- A variable AI-cost process — five rules, among them a per-call ceiling and the principle that no pricing decision is made without measured data.
- An external-material triage process — an unversioned inbox folder for material born outside the repository, distillation into a document or a memory, and deletion of the original only under explicit approval.
- A self-documentation guide — a decision table for where each artifact produced during work should be saved.

## [0.1.0] - 2026-08-27

### Added

- ADRs 016-021: structural reorganisation, git plus Apache 2.0 licensing with a public/private split, the v2 frontmatter contract, the canonical pipeline skills, the agent-architecture integrations (layered L0–L4 memory, the T1–T4 risk matrix, orchestrator–subagent topology) and the client-content quarantine policy.
- `templates/handoff.json` — the machine-readable counterpart of the handoff template (same `handoff_id` as the `.md`).
- Git repository initialised with tag `v0-pre-reorganizacao` preserving the state before the reorganisation.
- The v2 tree skeleton: the skill pipeline (`grill-with-docs` → `domain-modeling` → `to-spec` → `implement` → `handoff`, plus the `writing-for-agents` meta-skill), artifact `templates/` and scaffolding and validation `scripts/`.
- Project files merged into `projects/<slug>/CONTEXT.md` (legacy sources unified into a single canonical document per project).
- `AGENTS.md` and agent profiles under `agents/`.
- `examples/` with a synthetic project context example (`course-platform-demo/`).
- Go-to-market documentation under `docs/` and a metrics base under `metrics/`.
- `LICENSE` and `NOTICE` (Apache 2.0 — Brain Framework © 2026 Cadu Azeredo).
