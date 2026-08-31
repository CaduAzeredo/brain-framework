# Quickstart — Brain Framework

From zero to a governed project in five steps: install, scaffold, fill in the context, run the pipeline, validate.

## 1. Prerequisites

- **Bun** (recommended) or **Node.js 20+** — the scripts are `.mjs` and run on either.
- **git** — the Brain is versioned from the first commit.

## 2. Get the framework

```bash
git clone https://github.com/CaduAzeredo/brain-framework.git
cd brain-framework
```

Clone (or copy) the framework repository into the folder that will become your Brain:

```bash
git clone <framework-url> brain
cd brain
```

If you would rather start without history, copy the files and run `git init` in the folder.

## 3. Scaffold a project

```bash
bun scripts/new-project.mjs <slug>
```

Use a short kebab-case slug (for example `my-app`). The script creates `projects/<slug>/` with `CONTEXT.md` and `DOMAIN.md` (from the templates), plus `specs/`, `tickets/` and `handoffs/`.

## 4. Fill in the context with the pipeline

A project's `CONTEXT.md` is not written in one sitting — it is the output of the skill pipeline:

1. **`grill-with-docs`** — the agent interviews you (and reads whatever documentation exists) until it has extracted what the project is, what it is not, and which facts are verified. Always start here.
2. **`domain-modeling`** — models the entities, invariants and vocabulary of the domain.
3. **`to-spec`** — turns the model into specifications an agent can execute against.
4. **`implement`** — the executing agent implements against the spec, in the code repository, outside the Brain.
5. **`handoff`** — records state, decisions and next steps under `projects/<slug>/handoffs/`, so the next session starts without losing context.

The **`writing-for-agents`** meta-skill governs how every document is written: precise, verifiable, no filler. A complete worked example — context, domain, spec, tickets and a handoff pair — lives in `examples/course-platform-demo/`.

> Note: the skill files themselves are currently written in Brazilian Portuguese; English translation lands in the next minor release. Their `name` and `description` fields are in English, so agent discovery works either way.

## 5. Validate the structure

```bash
bun scripts/doctor.mjs
```

One command runs every check: structure (folder tree and the frontmatter of every `.md`, with the six required fields `id`, `tipo`, `projeto`, `status`, `data`, `autor`, plus a secret scan), broken relative links, prose references to files that do not exist, governance state, and the public export in dry-run. Run it before every commit; invalid structure is a bug, not a detail.

If you prefer running them one at a time, each remains available on its own: `validate-structure.mjs`, `validate-links.mjs`, `validate-prose-refs.mjs`, `validate-state.mjs` and `export-public.mjs`.

## Setup prompt

Paste this prompt into your agent (Claude Code, or equivalent) at the root of the Brain to start a new project:

```text
You are at the root of a Brain (Brain Framework). Before doing anything:

1. Read AGENTS.md in full — it is the operating contract that governs how you
   write and what you may touch in this repository.
2. Read skills/README.md to learn the available skill pipeline
   (grill-with-docs -> domain-modeling -> to-spec -> implement -> handoff).

Then walk me through the pipeline for project <slug>:
- Start with the grill-with-docs skill: interview me until you have enough
  facts, and fill in projects/<slug>/CONTEXT.md, marking as HYPOTHESIS
  anything I do not confirm with evidence.
- Advance one skill at a time, asking for my approval before moving on.
- Every .md file you create is born with the v2 frontmatter defined in
  AGENTS.md. When you finish, run bun scripts/doctor.mjs and fix every
  error before stopping.
```

## Next steps

- The framework `README.md` — the overview.
- `AGENTS.md` — the full agent contract.
- `templates/` — ADR, spec, handoff and status templates for the remaining artifacts.
