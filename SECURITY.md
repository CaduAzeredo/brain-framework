# Security Policy

This policy covers the **Shizune** as published in this repository: the validation and export scripts, the templates, the skills, the worked example and the workflow definitions that ship with them.

It does not cover the instance you build with the framework. That distinction is the whole of the [Scope](#scope) section below, and it is worth reading before you report.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.2.x | Yes — security fixes land here |
| Earlier tags | No |

The project is pre-1.0. Only the latest published minor line receives fixes; there is no long-term support branch, and back-porting to an older tag is not offered.

## Reporting a vulnerability

Report privately, through **GitHub Private Vulnerability Reporting**: open the repository's **Security** tab and choose **Report a vulnerability**. That form is the only channel for security reports.

**Do not open a public issue, discussion or pull request** describing the problem. A public report tells every user of the framework about the weakness before a fix exists. If you have already opened one, say so in the private report — do not add details to the public thread; the rest of the conversation happens privately.

A useful report includes:

- the file and, where it applies, the line — for example a script under `scripts/`, a template, or a skill;
- the version or commit you tested;
- steps to reproduce, ideally as a command someone can run on a clean clone;
- the impact you believe it has, stated as impact and not as severity theatre;
- the runtime you used (Bun or Node.js, with the version) and the operating system;
- a proposed patch, if you have one — welcome, never required.

If you are unsure whether something qualifies, report it privately anyway. Deciding is the maintainer's job, not yours.

## Scope

**In scope — the files this repository ships.** Concretely:

- the scripts under `scripts/`: the validators (`validate-structure.mjs`, `validate-links.mjs`, `validate-prose-refs.mjs`, `validate-state.mjs`), the scaffolder (`new-project.mjs`), the index builder and the public export (`export-public.mjs`);
- the export allowlist in `scripts/export-manifest.json`, and the separate patterns file it points to;
- the artifact templates under `templates/` and the skills under `skills/`;
- the continuous integration workflow and issue templates shipped in the repository;
- the synthetic worked example under `examples/`.

Reports that land squarely in scope look like these:

- a validator that reports success while a pattern it claims to detect is present in the scanned content;
- the export copying a file that the allowlist does not list, or failing to apply a redaction pattern to content it did copy;
- a script that resolves a path outside the repository root, or that a crafted file or folder name can steer somewhere it should not go;
- a template or skill whose default instructions lead an agent to disclose credentials, weaken a stop, or write outside the boundaries the contract sets.

**Out of scope — the instance and its content.** The framework is machinery for producing an instance: your context files, your governance decisions, your logs, your project material, and your own entries in the export allowlist. That instance and everything in it is the responsibility of whoever operates it — who can read the repository, what gets committed, which authorisations an agent is granted, and whether the content is fit to publish. Those decisions are made in your repository, and by design they are never visible from here.

**Surface note.** The framework has **zero dependencies**: no `package.json`, no lockfile, no install step. The scripts run on Bun or Node.js 20+ using runtime builtins only. They read and write files under the repository root; they do not fetch anything over the network, do not execute third-party code and do not spawn a shell. That keeps the attack surface small — there is no dependency chain to compromise and no post-install hook to hijack. It does not make the surface zero: a script that mishandles a path or a pattern is still a defect, and still worth reporting.

## Response expectations

- **First response within 7 days** of the report reaching the private channel — an acknowledgement, and where possible an initial assessment.
- **Coordinated disclosure of up to 90 days** from that first response before details become public. If a fix lands sooner, disclosure happens sooner. If a fix will take longer, that is said plainly and a date is agreed with you rather than assumed.
- Accepted reports are fixed in a release on the supported line and published as a GitHub Security Advisory, with credit to the reporter unless the reporter prefers otherwise.
- **No bug bounty.** There is no reward programme, no payment and none planned. What is offered is a fix and, if you want it, public credit in the advisory.
- This is a small project with a single maintainer. The commitments above are honoured on a best-effort basis, and if a deadline is going to slip you will be told before it slips rather than after.

## What is not a vulnerability

- **Instance configuration.** Permissions granted to an agent, a repository left public, an absent branch protection, an operator authorising a write outside the root — these are operator decisions, not defects in the framework.
- **A secret the operator committed to their own repository.** The exposure is remediated where it happened: rotate the credential, then clean the history in that repository. (If the secret has a well-known shape that the scanner should have recognised and did not, the *missed pattern* is a valid report — see the next section.)
- **Validator output about your own content.** A run that reports a broken link, missing frontmatter, an invalid slug or a detected secret is the tool working: the finding describes your content, not a weakness in the tool. The reportable case is the inverse — a validator that reports nothing when the condition it checks is plainly present.
- **Missing hardening with no demonstrated impact.** A report that names a general best practice without showing how the files in this repository enable a concrete failure will be closed with thanks and no fix.

## About the scanners: a safety net, not a guarantee

The framework ships two sweeps, and it is worth being exact about what they promise.

- `scripts/validate-structure.mjs` scans every text file in the tree against known secret shapes — API keys, access tokens, private key headers — and fails the run on a match.
- `scripts/export-public.mjs` scans everything the allowlist would copy, line by line, against the redaction patterns in the file named by `redaction_patterns_file` in the manifest — a path the export never publishes, because a list of what you are hiding is itself a disclosure; the shipped template is `scripts/redaction-patterns.example.json`. The export fails on any match; in write mode it deletes the output directory so a failed export leaves nothing behind.

Both are pattern matchers. They catch the shapes they know. They cannot catch a credential that does not look like one, a secret split across two lines, a value encoded before it was committed, or an identifier that is unremarkable in general and highly identifying in your context. **A clean run means no known pattern matched — it does not mean the file is safe to publish.** The real control is the allowlist: private by default, and only what is explicitly listed ever leaves the repository. The scanners exist to catch mistakes inside that boundary, not to replace it.

One limit deserves stating on its own. **Both sweeps skip binary files.** A file whose first 8 KB contain a null byte is copied by the export but never read as text, so no pattern is ever applied to it. If your instance embeds images, PDFs, fonts or diagrams exported from a design tool, review them yourself before publishing: a screenshot of a terminal, metadata left in an image, or a diagram carrying a client name will pass every check in this repository without a word of complaint.

A gap in either sweep — a common secret shape that goes undetected, or exported content that a declared pattern should have caught — is a defect in a control the framework claims to provide, and is exactly the kind of report this policy is for.
