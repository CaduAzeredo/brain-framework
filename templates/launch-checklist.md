---
id: template-launch-checklist
tipo: template
projeto: global
status: vigente
data: 2026-08-29
autor: brain-framework
---

# Template — launch checklist in two lanes

A launch checklist that separates **what the builder can settle alone** from **what only the business owner can answer**. Copy this file into a project, cut it down, rewrite each item in the project's own words, and render it with `scripts/build-checklist.mjs`.

## Why two lanes

Most launch checklists are written as one list of things "pending the client", and that is the failure. Once the builder has access to the systems, the majority of a launch list is not a question at all — it is work. Items that look commercial are often technical: a competent developer with access can read the payment account's state, classify which records are real, compute a fair-use ceiling, or enumerate who holds administrator access far better than the owner can recall it.

Sorting the list this way has two effects. The builder's lane starts immediately instead of waiting. The owner's lane shrinks to what is genuinely theirs — price, brand, business model, history that lives nowhere in the system, and legal acceptance — which is short enough that they actually answer it.

**The test for the owner lane:** if a developer with system access could find or decide the answer, it belongs to the builder, *even when the consequence is commercial*. Reserve the owner lane for what is irreducibly theirs. When an item has both halves, split it: the builder produces the answer, the owner approves the exceptions.

## How to use this template

1. **Cut hard.** This file is a reference of everything that has ever bitten a launch, not a list to execute in full. A real project checklist is 25–40 items. Delete every item that does not apply, and say so out loud rather than leaving it unmarked.
2. **Rewrite in the project's words.** Generic titles are placeholders. Name the actual plans, the actual gateway, the actual limits.
3. **Fill the `Client.` block for every owner item.** It is the same pendency said without technical vocabulary, and it is what the client view renders. An owner item with no client text will render empty.
4. **Set `authorization` deliberately.** It is the operator's mark, not the builder's: `waiting` is the default and means do not execute. Authorization is independent of `risk` — an item can be `cleared` and still be T4, and the T4 stop still applies. Authorization releases the intent; it never dispenses with the gate.
5. **Add the business-model delta.** The appendix lists what changes for four common models. Fold the relevant one in; ignore the rest.
6. **Render both views:**

```
bun scripts/build-checklist.mjs <path>/launch-checklist.md --view=internal --out=<path>/checklist-internal.html
bun scripts/build-checklist.mjs <path>/launch-checklist.md --view=client --title="What is still open" --out=<path>/checklist-client.html
```

## Item format

Field names and lane names are accepted in English or Portuguese. Fields marked optional may be omitted entirely.

```
### B01 — Short title, imperative for builder items and a question for owner items

- **lane:** builder | owner | cutover
- **origin:** the dimension or the code this item came from
- **source:** where the answer is found                    (optional)
- **risk:** T1 | T2 | T3 | T4, with a clause when it is split   (optional)
- **mark:** urgent | signs                                 (optional)
- **depends on:** B01 done                                 (optional)
- **state:** pending | decided — <who and when>
- **authorization:** waiting | cleared | stop

**Internal.** One or two sentences: what this settles, and what breaks if it is
skipped. A paragraph opening with a bold lead that ends in a colon renders as a
callout — use it for a risk caveat that must survive onto the screen.

**Client.** Owner items only. The same pendency in the owner's language, with
the way out already offered so the answer can be a single word.
```

**Risk tiers.** T1 free · T2 safe mutation with a record · T3 requires prior authorization · T4 destructive or production, requires a formal human stop. When in doubt between two tiers, take the higher one.

---

## Builder lane — what we settle without asking anyone

### B01 — Inventory what actually exists, screen by screen

- **lane:** builder
- **origin:** scope
- **source:** the running app, the route table, the feature-flag configuration
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Classify every route, screen, background job and public endpoint as: works with real data; works only with seeded or admin data; visible but stubbed; or absent. Take the answers from the running system, never from tickets or the roadmap. Without this, a feature everyone believed was finished turns out to be a clickable mockup, discovered in launch week by a customer.

### B02 — Build the promise ledger and run it twice

- **lane:** builder
- **origin:** scope, legal
- **source:** landing and pricing pages, onboarding copy, transactional email, FAQ, sales deck, store listing
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Map every outward claim to a line in the inventory and sort into three buckets: true today; true only under conditions; not true. Run it once early to shape scope, and again before the domain goes live to catch drift.

**Handing back the third bucket is an owner decision:** retracting a public promise is not a wording fix. Route it to the owner rather than silently rewording it.

### B03 — Cost the unfinished work and draft the cut list, including its doors

- **lane:** builder
- **origin:** scope
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** For each unfinished item, estimate the hours to a genuinely shippable state and propose finish, cut, or hide. For every cut, also list its entrances — nav links, dashboard tiles, empty settings tabs, onboarding steps, scheduled emails, help text — because a cut feature is only cut when its doors are closed too.

### B04 — Walk the primary journey end to end in a clean account

- **lane:** builder
- **origin:** scope
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** From a stranger's first click to the moment they get what they came for, including payment in test mode. Brand-new account, no session, no seed data, on a phone and a desktop. Every screen can pass alone while the whole path breaks at step four.

### B05 — Derive the list of content the product needs before the first user

- **lane:** builder
- **origin:** scope
- **source:** the production environment, separating real records from seed and demo data
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Walk the product for every empty state, required taxonomy, default record and seeded example, and report the real counts currently live. Hand the owner a list to fill rather than asking them to imagine it.

### B06 — Reconcile every place a price or quota is written down

- **lane:** builder
- **origin:** pricing
- **source:** billing code, database, landing page, FAQ, in-app copy
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Divergent price catalogs are the norm, not the exception. Build the single source now, structured and empty; when the owner's number arrives it is filled in one place. Until then the page can advertise one value while the system charges another.

### B07 — Write down what each quota literally counts and when it resets

- **lane:** builder
- **origin:** pricing
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Active versus registered, per month versus rolling window, per account versus per seat. Marketing, support and the software must describe the same limit in the same words.

### B08 — Make roles, plans, entitlements and prices server-authoritative, and prove it at the data layer

- **lane:** builder
- **origin:** pricing, security
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** A limit hidden only in the interface is not a limit. Prove each one with a direct request that bypasses the UI, and prove tenant and row-level isolation with two real accounts querying each other's data.

### B09 — Define upgrade, downgrade, repeat purchase and mid-cycle cancellation

- **lane:** builder
- **origin:** pricing, payments
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Proration, entitlement transition, what a second purchase of the same product does, and the over-limit-after-downgrade case. Support needs to answer "what will I be charged" from a written rule.

### B10 — Trace what happens the day a trial or free plan ends

- **lane:** builder
- **origin:** pricing
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Make the lapse a designed conversion moment with a working upgrade path, instead of an undefined state discovered by customers.

### B11 — Produce the launch-day billing ledger

- **lane:** builder
- **origin:** pricing
- **source:** payment gateway plus the application database
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Who pays what today, on what period, with what next renewal date. Hand the owner the accounts that do not map cleanly onto the new plans; only those need a grandfathering decision.

### B12 — Implement the default over-limit behaviour

- **lane:** builder
- **origin:** pricing
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Soft block and prompt to upgrade is the safe default and is a builder decision. Blocking signups mid-campaign produces cancellations, not upgrades. Escalate to the owner only for the variant that charges automatically, which carries disclosure obligations.

### B13 — Ship per-customer cost metering before the first paid signup

- **lane:** builder
- **origin:** unit economics
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Until real usage is measured, every margin projection is a hypothesis. Metering added after launch cannot answer what last month cost.

### B14 — Compute the fully loaded cost to serve one customer on each tier

- **lane:** builder
- **origin:** unit economics
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Storage, delivery, metered third-party calls, support time. The tier that loses money at its own advertised limit must be found before it is sold, not after.

### B15 — Measure egress and media delivery, not just what is stored

- **lane:** builder
- **origin:** unit economics
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Storage is usually the small number. Delivery of heavy media is where the order-of-magnitude difference between architectures lives, and it scales with engagement rather than with signups.

### B16 — Price one unit of work for every metered external call

- **lane:** builder
- **origin:** unit economics
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** One generation, one lookup, one message: its cost in the vendor's units and in currency. Without this, quotas are set by feel.

### B17 — Put a hard ceiling on every metered call, and compute the fair-use limit

- **lane:** builder
- **origin:** unit economics
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Per-call ceiling, per-account ceiling, and a defined behaviour at the cap. The fair-use number itself falls out of per-tier cost and per-call unit cost — compute it and hand it over; only the decision to publish an unbounded word is the owner's.

### B18 — Reconcile the internal meter against one real vendor invoice

- **lane:** builder
- **origin:** unit economics
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** A meter that has never been checked against a bill is an estimate wearing the costume of a measurement. Do this before quoting any margin.

### B19 — Cost the accounts that pay nothing and the resources that serve nobody

- **lane:** builder
- **origin:** unit economics
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Abandoned trials still store files; idle environments still bill. This is the line item nobody budgets and everybody pays.

### B20 — Key every entitlement to a stable product identifier

- **lane:** builder
- **origin:** payments
- **source:** the payment gateway's product catalog
- **risk:** T2
- **mark:** urgent
- **state:** pending
- **authorization:** waiting

**Internal.** Inferring a plan from a product *name* is the defect that provisions an entry-tier buyer onto the most expensive plan. Bind each plan to an immutable identifier and fail loudly on an unknown one.

### B21 — Verify webhook authenticity and make every handler idempotent

- **lane:** builder
- **origin:** payments
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Signature verified on every event, replays and duplicates safe, out-of-order events handled. Payment providers retry; a non-idempotent handler grants twice or refunds twice.

### B22 — Bind each payment to an account the application owns

- **lane:** builder
- **origin:** payments
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Matching on email alone breaks the moment someone pays with a different address. Carry an account reference through checkout and reconcile the orphans deliberately.

### B23 — Implement revocation, not just granting

- **lane:** builder
- **origin:** payments
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Cancellation, expiry, failed renewal, refund and chargeback all have to remove access on a defined schedule. Systems that only grant leak paid features indefinitely.

### B24 — Reconcile money collected against access granted

- **lane:** builder
- **origin:** payments
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** A recurring report of paying accounts without entitlement and entitled accounts without payment. Both directions are bugs, and both are invisible without the report.

### B25 — Read the payment account's verification, entity and payout state

- **lane:** builder
- **origin:** payments
- **source:** the payment gateway dashboard
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Verification status, legal entity on file, payout destination and schedule, live versus test mode. Report exactly what is missing rather than asking the owner to recall it, because they will guess.

### B26 — Rebuild the schema from the repository and diff it against every live database

- **lane:** builder
- **origin:** data
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Drift between the repository and production is where migrations fail at the worst moment. The diff is the honest inventory of that gap, and it is read-only.

### B27 — Make one command that resets a non-production environment to a known good state

- **lane:** builder
- **origin:** data
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Reproducible resets are what make destructive testing safe and what turn "it works on my machine" into a checkable claim.

### B28 — Seed test accounts for every role and lifecycle state

- **lane:** builder
- **origin:** data
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Include the empty account, the expired one, the over-limit one and the half-migrated one. Bugs live in the states nobody seeds.

### B29 — Prove every non-production environment points only at non-production resources

- **lane:** builder
- **origin:** data
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Database, storage, payment keys, email sender, analytics. The default is that real customer data is never copied into a test environment; set that default rather than asking whether it is allowed.

### B30 — Restore a backup into a scratch environment before trusting it

- **lane:** builder
- **origin:** data
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** An untested backup is a belief. Restore one and check row counts and a real record before any destructive operation depends on it.

### B31 — Write the list of operations that require a formal human stop

- **lane:** builder
- **origin:** data
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Name each T4 operation and its approver, in writing, before anyone is under time pressure. The gate that is decided during an incident is the gate that gets skipped.

### B32 — Classify the existing records: which are real and must survive

- **lane:** builder
- **origin:** data
- **source:** last sign-in, payment history, email domain, activity volume, creation source
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** A developer with database access classifies this far better than the owner can remember it. Deliver a classified list and hand back only the ambiguous residue.

### B33 — Inventory every secret and prove none is client-reachable

- **lane:** builder
- **origin:** security
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Every key, its scope, where it is stored, who can read it. Anything ever exposed in a repository, a log or a client bundle is rotated, not reasoned about.

### B34 — Put rate limits on the endpoints that actually get abused

- **lane:** builder
- **origin:** security
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Signup, login, password reset, search, and anything that sends mail or costs money per call. Unlimited retries on a reset endpoint is a free enumeration tool.

### B35 — Serve private and paid media through short-lived signed URLs bound to entitlement

- **lane:** builder
- **origin:** security
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** A permanent public URL to paid content is a leak with a long tail: once shared, it cannot be recalled.

### B36 — Enforce a content security policy and sanitize anything a user can make the page render

- **lane:** builder
- **origin:** security
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Profile fields, uploaded documents, embedded media and rich text. Verify the policy does not silently break a legitimate feature — a policy nobody tested gets disabled the first time it does.

### B37 — Inventory every human with elevated access

- **lane:** builder
- **origin:** security
- **source:** hosting, database, gateway, domain registrar, email, repository
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Asking the owner who has administrator access produces a list wrong in both directions. Enumerate it from the systems, then hand it over for approval.

### B38 — Map where personal data actually goes

- **lane:** builder
- **origin:** legal
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** What is collected, where it is stored, which third parties receive it, and for how long it is kept. The privacy document cannot be written honestly without this, and it is the builder who knows.

### B39 — Capture and version the acceptance of the terms

- **lane:** builder
- **origin:** legal
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Which document version each person accepted, and when. "They agreed" is only defensible if the system recorded what they agreed to.

### B40 — Prove one data export and one deletion end to end

- **lane:** builder
- **origin:** legal
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Including what deletion means for records that must be retained for accounting. A promised right that has never been exercised is an untested code path.

### B41 — Check what fires before consent

- **lane:** builder
- **origin:** legal
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Analytics, pixels, session recorders and embedded media often load before anyone clicks accept, which makes the consent banner decorative.

### B42 — Put a source and a date on every public number

- **lane:** builder
- **origin:** legal
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Customer counts, uptime, volume processed, satisfaction scores. Anything measurable from the system gets measured; anything historical goes to the owner with the measurement asked for, not asserted.

### B43 — Audit every borrowed asset and every quoted person

- **lane:** builder
- **origin:** legal
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Enumerate every font, icon, stock image, mark, quote and logo the product actually ships, with the licence recorded in the package or file metadata. This is a technical audit; only the gaps it finds go to the owner.

### B44 — Make "cancel anytime" and the refund promise real

- **lane:** builder
- **origin:** legal
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** If the copy promises self-service cancellation, there must be a button. A promise the interface cannot keep is the most easily proven kind of misleading claim.

### B45 — Pin one canonical host and redirect every other spelling to it

- **lane:** builder
- **origin:** launch ops
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** One host answers; every other variant redirects. Split hosts split sessions, cookies, search indexing and analytics, and the split is invisible until it is expensive.

### B46 — Authenticate the sending domain and watch account-critical email actually arrive

- **lane:** builder
- **origin:** launch ops
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Sender authentication configured, and a real delivery test to the major mailbox providers for confirmation, password reset and receipt. Silent delivery failure looks exactly like a product nobody wanted.

### B47 — Wire error tracking and an uptime check on the paying path

- **lane:** builder
- **origin:** launch ops
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Alerting somewhere a human reads at night. Discovering an outage from a customer's message is a support failure before it is a technical one.

### B48 — Make the beta gate a runtime switch on production infrastructure

- **lane:** builder
- **origin:** launch ops
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Opening to the public should be a setting, not a deploy. A gate that requires a release turns the go-live decision into an engineering event.

### B49 — Prove a one-line change can go to production and back out again, timed

- **lane:** builder
- **origin:** release engineering
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Every "we will fix it fast" assumption in this checklist rests on a capability nobody has checked. Measure the round trip so the go/no-go call is made against a real rollback window.

### B50 — Walk every way an account is entered, recovered and changed

- **lane:** builder
- **origin:** authentication
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Signup, sign-in, password reset, email change, session expiry, second factor on privileged accounts, and what happens when the identity provider is down. "Nobody can log in" is the most common launch-day incident there is.

### B51 — Build the smallest back office that closes a real ticket without a developer

- **lane:** builder
- **origin:** support tooling
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Find an account, read its billing and entitlement state, grant, revoke, refund, resend a receipt, unblock a stuck signup. Without it every day-one ticket escalates to the developer, permanently.

### B52 — Set a latency budget on the paying path and test it above expected peak

- **lane:** builder
- **origin:** capacity
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Including cold start. A launch is precisely the moment traffic is abnormal, and it should not be the first time the system has been under load.

### B53 — Define what happens when each critical external service degrades

- **lane:** builder
- **origin:** capacity
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Slow, erroring, or down. A vendor's bad hour should degrade one feature visibly instead of taking down signup, checkout, or the whole page.

### B54 — Instrument the funnel end to end and verify each event fires once

- **lane:** builder
- **origin:** measurement
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Arrival, signup, activation, checkout start, payment, first real use — verified from a clean account. Without it, a disappointing launch cannot be told apart from a broken funnel.

### B55 — Set the device, browser and accessibility floor, and prove it holds

- **lane:** builder
- **origin:** baseline
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** Name the browsers and screen sizes supported and the assistive-technology baseline committed to, then test the primary journey against them. An unstated floor is a floor nobody meets.

---

## Owner lane — what only the business owner can answer

### O01 — What is the product called, and what is the one thing it does?

- **lane:** owner
- **origin:** scope
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Locks the single string and single sentence every screen, receipt, email, domain and support reply must agree on. Three spellings live across app, card descriptor and domain produce disputed charges.

**Client.** What is the product called, spelled exactly as it should appear everywhere — and in one sentence, what is the one thing it does for someone?

### O02 — Who is this for, and who are we happy to turn away?

- **lane:** owner
- **origin:** scope
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Written non-goals are what let the build say no without it being one person's taste. Without them every request looks in scope and the date slides with no decision anyone can point to.

**Client.** Who is the first person you expect to pay for this — and which kinds of customer are you content not to serve in the first version?

### O03 — On day one, is it open, invite-only, or a migration?

- **lane:** owner
- **origin:** scope
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** Three very different builds: public signup, invite mechanics, or moving existing accounts and their history across. Assuming the wrong one surfaces two days before go-live.

**Client.** On the first day, can anyone sign up, is it a private list you invite, or are you moving people who are already your customers onto the new thing?

### O04 — From the freeze date, who may still add to the first version?

- **lane:** owner
- **origin:** scope
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** A pre-agreed answer to the good idea that arrives three days before launch. Keep a dated parking list with costs so each answer is a visible trade rather than a refusal.

**Client.** From the freeze date onward, who is allowed to add something to the first version — and is everyone agreed that everything else waits for the next release?

### O05 — Supply the day-one content, against the list we hand you

- **lane:** owner
- **origin:** scope
- **depends on:** B05 done
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** The list is derivable and ours to produce; the content itself is theirs and is usually weeks of work by people who are not developers. Launching technically working and visibly empty loses the first visitors permanently.

**Client.** Here is everything that has to be filled in before the first visitor arrives. Who writes or loads each of these, and by when?

### O06 — The one pricing decision

- **lane:** owner
- **origin:** pricing, payments, unit economics
- **depends on:** B06, B11, B14 done
- **risk:** T3
- **mark:** urgent
- **state:** pending
- **authorization:** waiting

**Internal.** Deliberately one item, not four. Price per tier, currency, billing period, annual treatment and discount, the unit each tier scales on, and the over-limit clause. Asking this decision once per surface is what makes owners stall. Hand it over with the cost of serving each tier alongside and the market comparison already done.

**Client.** The complete table for every plan: monthly price, annual price if there is one, and what each plan includes. It comes to you already built, with what each plan costs us to deliver next to it — you fill one column. Almost everything else waits on this.

### O07 — May any plan say "unlimited"?

- **lane:** owner
- **origin:** unit economics
- **depends on:** B17 done
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** The fair-use ceiling is computed and handed over. Only publishing an unbounded word is the owner's call, because it is a commitment, not a number.

**Client.** Do you want any plan to advertise "unlimited"? If so, we set an internal fair-use ceiling — here is the number the costs support — and the word carries a footnote.

### O08 — Grandfathering: which existing accounts do we honour?

- **lane:** owner
- **origin:** pricing
- **depends on:** B11 done
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** The ledger of who pays what is ours to produce; only the accounts that do not map cleanly onto the new plans need a decision, and any promise that must be kept is recorded before the migration runs.

**Client.** These accounts do not fit the new plans. For each one: move them, keep their current terms, or contact them first?

### O09 — What are your refund, cancellation and renewal terms?

- **lane:** owner
- **origin:** payments
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** These are commitments with legal weight, and they must be identical in the terms document, the interface and the support script. Contradictions between the three are resolved against the business.

**Client.** How long can someone ask for a refund, what happens when they cancel mid-period, and does the subscription renew automatically? Your answer goes into the terms and into the product word for word.

### O10 — Supply the entity documents, the bank account and the payout destination

- **lane:** owner
- **origin:** payments
- **depends on:** B25 done
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** We read and report the gateway's state; only providing the documents and confirming the destination account belongs to the business is theirs.

**Client.** The payment account is missing the items listed. Sending them is what lets money actually reach you.

### O11 — Which legal entity stands behind the product, and do you accept the terms as written?

- **lane:** owner
- **origin:** legal
- **risk:** T3
- **mark:** signs
- **state:** pending
- **authorization:** waiting

**Internal.** We draft the terms and the privacy policy from what the system actually collects and does — the owner could not describe it. The acceptance is theirs because the liability is theirs, and it is named once here rather than asked again inside the payments items.

**Client.** I write both documents from what the platform actually collects and does. What I need from you is the company that stands behind them and your written approval — the legal responsibility sits with the owner of the platform.

### O12 — Who is the merchant of record, and where are you registered for tax?

- **lane:** owner
- **origin:** legal
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Whether the business sells directly or through a reseller of record changes who owes consumption tax in each market, what the invoice must show, and what the checkout has to collect. It is real liability and it is frequently discovered after the first cross-border sale.

**Client.** Are you selling directly to customers, or through a service that sells on your behalf? And in which countries or states are you registered to collect tax?

### O13 — Who gave permission for each quote, logo and borrowed asset?

- **lane:** owner
- **origin:** legal
- **depends on:** B43 done
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** The inventory is ours; the permission is theirs. Ask for the source, never assert a problem — and offer both exits in the same message so the answer can be a single word.

**Client.** Here is every quote, logo and borrowed image currently on the site. For each, can you confirm where it came from and that its owner agreed to it being used? If any came from an older campaign, I can swap it for a current one or switch the section off — both are quick.

### O14 — Approve the administrator access list, and name who revokes on departure

- **lane:** owner
- **origin:** security
- **depends on:** B37 done
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** The enumeration is ours. What is theirs is confirming who should still be on it and naming the person responsible for cutting access the day someone leaves.

**Client.** Here is everyone who currently has administrator access to the live system and the money accounts. Who should stay, and who is responsible for removing access when someone leaves?

### O15 — Will you sign the written authorization for intrusive security testing?

- **lane:** owner
- **origin:** security
- **risk:** T4
- **mark:** signs
- **state:** pending
- **authorization:** waiting

**Internal.** Scope, window, and consent from whoever owns each system in the path — including hosting and any third party. Without it, testing stops at code and configuration review, which still covers most real risk. This is never assumed and never inferred from general access.

**Client.** To actively test the system's defences rather than only review the code, I need your written authorization: what may be tested, in what window, and confirmation that you can authorize each system involved. Without it I keep to review only, and I will say plainly what that leaves uncovered.

### O16 — Who may look inside a customer's account, and is that disclosed?

- **lane:** owner
- **origin:** support tooling
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Impersonation and support access need a written rule and an audit trail before the first person uses them, not after a complaint. It also has to match what the privacy policy says.

**Client.** When a customer has a problem, may your team view their account as they see it? If so, who is allowed to, in what circumstances, and should the customer be told it happened?

### O17 — Who reads the support inbox, and how fast do we promise to answer?

- **lane:** owner
- **origin:** launch ops
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** The address must be one a person actually reads. An unattended support address is worse than none, because it is a published promise that is visibly broken.

**Client.** Which email and support channel appear to customers, who reads them, and what response time do you want to promise publicly?

### O18 — Who makes the go/no-go call, and what are we willing to launch broken?

- **lane:** owner
- **origin:** launch ops
- **risk:** T1
- **state:** pending
- **authorization:** waiting

**Internal.** One named person, a date and an hour, and an agreed list of known defects acceptable at launch. Decided while everyone is calm, it prevents the launch-eve argument.

**Client.** Who makes the final call to go live, on what day and at what time — and which known rough edges are you willing to launch with?

### O19 — What number tells us this launch worked, and what would make us roll back?

- **lane:** owner
- **origin:** measurement
- **risk:** T2
- **state:** pending
- **authorization:** waiting

**Internal.** A threshold agreed in advance turns the post-launch decision into a measurement instead of an argument. Pair it with the rollback trigger, which is the more important half.

**Client.** What number, by what date, would make you call this launch a success? And what would have to go wrong for you to want it pulled back?

### O20 — Do you want an exception to keep real customer data out of test environments?

- **lane:** owner
- **origin:** data
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** The default is no and we set it. This item exists only so a deliberate exception can be requested and recorded rather than assumed. Do not block environment work waiting on it.

**Client.** By default, no real customer data is ever copied into a test environment. Tell us only if you need an exception, and we will scope it narrowly.

---

## Cutover lane — moving to the official environment

### C01 — Publish the final shipped-versus-cut list at handover

- **lane:** cutover
- **origin:** scope
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** One page: what it does, what it deliberately does not do yet, what is queued next. Walk the public surfaces once more against the frozen scope and remove anything still promising a cut feature. Everyone answering a customer on day one should describe the same product.

### C02 — Move every account the product depends on into the business's name

- **lane:** cutover
- **origin:** launch ops, unit economics, data
- **risk:** T4
- **state:** pending
- **authorization:** waiting

**Internal.** Domain, hosting, database, payment gateway, email sender, and every metered vendor — with billing, spend caps, alerts and a running backup schedule proven live, not merely configured. A product whose domain sits in a departed contractor's personal account is not owned by the business.

### C03 — Flip every integration to live and prove one real end-to-end transaction

- **lane:** cutover
- **origin:** pricing, payments, launch ops
- **risk:** T4
- **state:** pending
- **authorization:** waiting

**Internal.** Deliberately one item rather than three. Live credentials and live plan catalog everywhere, then one real purchase carried through to the entitlement it grants and the receipt it sends. Test-mode success proves the code path, never the account configuration.

### C04 — Freeze the old environment

- **lane:** cutover
- **origin:** data, launch ops, security
- **risk:** T4
- **state:** pending
- **authorization:** waiting

**Internal.** One action at one moment, with three clauses: final export and reconciliation against the new system; read-only freeze rather than deletion, kept for a defined period; and closing the pre-launch conveniences — seeded admin accounts, debug endpoints, permissive settings that only ever existed to build with.

### C05 — Rotate every credential used during the build

- **lane:** cutover
- **origin:** security
- **risk:** T4
- **state:** pending
- **authorization:** waiting

**Internal.** Every key that passed through a development machine, a shared document or a chat is treated as exposed. Delete the accounts that existed only to build the product.

### C06 — Publish the final legal documents on the live domain and retire the drafts

- **lane:** cutover
- **origin:** legal
- **depends on:** O11 done
- **risk:** T4
- **state:** pending
- **authorization:** waiting

**Internal.** Accepted versions live, drafts removed from the index, acceptance capture pointing at the published version. A draft still reachable at a public URL is the version a dispute will cite.

### C07 — Hand over the deploy path itself

- **lane:** cutover
- **origin:** release engineering
- **risk:** T3
- **state:** pending
- **authorization:** waiting

**Internal.** Pipeline, build secrets, and a written rollback runbook. Without it the product is frozen at whatever version was live when the build team left, and the business cannot ship a correction.

---

## Appendix — what changes per business model

Fold in the section that matches; ignore the rest. Each begins with the single owner question that most changes what gets built.

### Multi-tenant subscription billed to the account owner

**Sharpest question:** when a second person joins a workspace, does the bill change — and who may sit inside a paid workspace without being billed (pending invites, deactivated members, external guests, your own support staff)?

- `[owner]` If the paying person's card fails, what is the grace behaviour for everyone else in the workspace? *(Card failure itself is a builder item — retry schedule, grace period, degradation. Only what happens when the paying person **leaves**, and who inherits the account, is irreducibly the owner's.)*
- `[builder]` Resolve every entitlement from the active workspace, never from the signed-in user.
- `[builder]` Sweep for cross-workspace leakage in derived and asynchronous surfaces — search indexes, exports, scheduled email, caches — not only in the tables.
- `[builder]` Walk the second-person journey and its broken states: invite, accept, role change, removal, last-admin-leaves.
- `[cutover]` Land every existing workspace in exactly one billing state at the switch.

### Two-sided marketplace on a take rate

**Sharpest question:** do you hold the buyer's money until the seller has delivered, or does it pass straight through — and when a refund or chargeback lands after the seller has been paid, whose money covers it?

- `[owner]` What is the take rate, which side pays it, and does the buyer see it before checkout?
- `[builder]` Split every charge into seller net, platform fee and tax at capture, and reconcile the three legs daily against the processor's balance.
- `[builder]` Gate listing and payout on the seller's verification state, driven by the provider's account-status events.
- `[builder]` Make the money run backwards: refunds, disputes and chargebacks landing after the payout has left.
- `[builder]` Build suspension and takedown that reach orders and payouts already in flight, plus reporting and moderation for user-submitted content.
- `[cutover]` Extend the live-transaction proof with the payout leg: one real payout landing in a real seller's bank account.

### Course or membership product

**Sharpest question:** when a member stops paying, or when you retire a course, what exactly do they keep — nothing, everything already released to them, or only what they finished? And does anything already published as "lifetime access" mean something different?

- `[owner]` What does a lapsed member keep, and what happens when a course is retired?
- `[owner]` What is inside the content that you do not own, and who is owed a share of each sale?
- `[builder]` Prove the release schedule is enforced per member on the server, not in the interface.
- `[builder]` Make progress, completion and any certificate server-recorded and idempotent.
- `[builder]` Set and enforce a sharing ceiling: concurrent streams, devices, download behaviour per seat.
- `[cutover]` Re-establish every existing member's access and billing on the new system in one pass.

### Productized service or retainer with a client portal

**Sharpest question:** what is inside the retainer, what is a quoted extra, and who at the client may authorize an extra? The answer decides whether the portal is an intake form or needs estimates, change orders and approval-to-bill.

- `[owner]` What is inside the retainer, what is billable beyond it, and who may authorize an extra?
- `[owner]` Who owns each deliverable, when does ownership pass, and may the finished work be shown publicly?
- `[builder]` Meter labour and cycle time per client account before any retainer price is set.
- `[builder]` Encode the turnaround clock: what starts it, what pauses it, what the queue refuses at its ceiling.
- `[builder]` Make client approval a frozen, attributable record that closes the revision round.
- `[cutover]` Move the in-flight work, not just the accounts, and close the old intake channel by name.

---

## Record of receipt

Marks made on the rendered page live in that browser only. This table is the record.

| Date | Items | Lane | How it arrived |
|---|---|---|---|
| — | — | — | — |
