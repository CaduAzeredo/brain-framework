// ---------------------------------------------------------------------------
// build-checklist.mjs — Renders a two-lane launch checklist (Markdown) as a
// standalone HTML page.
//
// The Markdown file is the single source of truth. This script never writes
// back to it: the page it produces is a read-and-mark surface, and any mark a
// reader makes lives in that reader's own browser until it is copied back into
// the Markdown by hand.
//
// Two views come out of one source:
//   --view=internal  every lane, with origin, where the answer is found, risk
//                    tier and the authorization control the operator marks;
//   --view=client    only the owner's lane, rendered from each item's
//                    client-facing text, with no technical vocabulary.
//
// Usage (works from any directory):
//   bun scripts/build-checklist.mjs <source.md> [--view=internal|client]
//                                   [--lang=en|pt] [--out=<file.html>] [--title=<page title>]
//   (node >= 20 also works: node scripts/build-checklist.mjs ...)
//
// Only the interface chrome is translated by --lang; every word about the
// product comes from the source document, in whatever language it is written.
//
// Expected item format in the source Markdown. Field names and lane names are
// accepted in English or Portuguese and normalized to one canonical key, so a
// document reads naturally in its own language:
//
//   ### N4 — Short title
//
//   - **lane:** builder | owner | cutover      (fila: nossa | dele | final)
//   - **origin:** A6                           (origem:)
//   - **source:** where the answer is found    (fonte:)          optional
//   - **risk:** T2 / T4 note                   (risco:)          optional
//   - **mark:** urgent | signs                 (marca:)          optional
//   - **depends on:** N1 done                  (depende de:)     optional
//   - **state:** pending | decided — ...       (estado:)
//   - **authorization:** waiting | cleared | stop   (autorização: aguardando | liberado | parada)
//
//   **Interno.** One or more paragraphs, for the internal view. A paragraph
//   that opens with a bold lead ending in a colon renders as a callout.
//
//   **Cliente.** One or more paragraphs, in the owner's own language. Only
//   these are rendered in the client view.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// --- lanes ------------------------------------------------------------------
//
// Three lanes, in the order they are rendered. A source document may name a
// lane in English or in Portuguese; both resolve to the same canonical key.

const LANE_ORDER = ["builder", "owner", "cutover"];

const LANE_ALIASES = {
  builder: "builder",
  ours: "builder",
  nossa: "builder",
  owner: "owner",
  theirs: "owner",
  dele: "owner",
  cutover: "cutover",
  final: "cutover",
};

const AUTHORIZATION_STATES = ["waiting", "cleared", "stop"];

const AUTHORIZATION_ALIASES = {
  waiting: "waiting",
  aguardando: "waiting",
  cleared: "cleared",
  liberado: "cleared",
  stop: "stop",
  parada: "stop",
};

// --- interface strings ------------------------------------------------------
//
// The framework ships in English; an instance can render in its own language
// with --lang. Only the interface chrome lives here — every word about the
// product itself comes from the source document.

const STRINGS = {
  en: {
    eyebrowInternal: ["Internal checklist", "generated from Markdown"],
    eyebrowClient: ["Open items"],
    ledeInternal:
      "The builder lane is what we can settle with the access we already have. The owner lane is what only the business owner can answer. The third is the cutover that closes the cycle.",
    ledeClient:
      "Everything here depends on you — these are calls I cannot make on your behalf. The rest of the work keeps moving in parallel, without waiting.",
    howtoTitle: "How to use this",
    howtoInternal: [
      "The box on the left marks <b>done</b>. The control at the end of each item marks <b>authorization</b>: <b>cleared</b> can be executed directly, <b>stop</b> requires a formal human gate.",
      "Use <b>Copy state</b> at the top to produce one line with every mark, to paste back into the conversation — that is how a mark becomes a record in the Markdown.",
      "If this page and the source Markdown disagree, <b>the Markdown wins</b>.",
    ],
    howtoClient: [
      "Answer in the order shown — the first items unblock the most.",
      "Where a recommendation is offered, replying \"agreed\" is enough.",
      "Checked boxes are saved in your browser only; the record is our conversation.",
    ],
    copyButton: "Copy state",
    copyHint: "produces one line with every mark, to paste back into the conversation",
    copyOk: "copied — paste it into the conversation to make it a record",
    copyFail: "could not copy; the state was written to the console",
    footerSource: "Page generated from",
    footerAuthority: "If they disagree, the Markdown wins.",
    footerLocal:
      "Marks are saved in this browser only — they are not a record, and nobody else sees them.",
    item: "item",
    items: "items",
    of: "of",
    done: "done",
    pending: "pending",
    authLabel: "Authorization for item",
    authStates: { waiting: "waiting", cleared: "cleared", stop: "stop" },
    flags: { urgent: "urgent", signs: "owner signs at the end", decided: "decided" },
    meta: { origin: "Origin", source: "Source", dependson: "Depends on", risk: "Risk", state: "State" },
    lanes: {
      builder: {
        kicker: "Builder lane",
        heading: "What we settle without asking anyone",
        blurb:
          "Every item here has somewhere to find its answer, and none of them needs a conversation with the owner. The authorization mark is yours: it says what may be executed directly.",
      },
      owner: {
        kicker: "Owner lane",
        heading: "What only the business owner can answer",
        blurb:
          "Price, brand, business model, history that lives nowhere in the system, and legal acceptance. Nothing here is technical, which is exactly why nothing here can be researched on their behalf.",
      },
      cutover: {
        kicker: "Cutover",
        heading: "Moving to the official environment",
        blurb:
          "Only after both lanes above are closed. It does not start now and it does not wait on the owner.",
      },
    },
  },
  pt: {
    eyebrowInternal: ["Checklist interno", "gerado do Markdown"],
    eyebrowClient: ["Lista de pendências"],
    ledeInternal:
      "A fila nossa é o que resolvemos com o acesso que já temos. A fila dele é o que só o dono do negócio pode responder. A terceira é a virada, que fecha o ciclo.",
    ledeClient:
      "Tudo que está aqui depende de você — são decisões que eu não posso tomar no seu lugar. O resto do trabalho segue andando em paralelo, sem esperar.",
    howtoTitle: "Como usar",
    howtoInternal: [
      "A caixa à esquerda marca <b>concluído</b>. O controle no fim de cada item marca <b>autorização</b>: o que está <b>liberado</b> pode ser executado direto, <b>parada</b> exige gate humano formal.",
      "Use <b>Copiar estado</b> no topo para gerar uma linha com todas as marcações e colar de volta na conversa — é assim que a marcação vira registro no Markdown.",
      "Em divergência entre esta tela e o Markdown de origem, <b>o Markdown vale</b>.",
    ],
    howtoClient: [
      "Responda na ordem em que os itens aparecem — os primeiros são os que travam mais coisa.",
      "Onde houver recomendação, responder \"combinado\" já resolve.",
      "As caixas marcadas ficam salvas só no seu navegador; o registro oficial é a conversa.",
    ],
    copyButton: "Copiar estado",
    copyHint: "gera uma linha com todas as marcações, para colar de volta na conversa",
    copyOk: "copiado — cole na conversa para virar registro",
    copyFail: "não deu para copiar; o estado está no console",
    footerSource: "Página gerada de",
    footerAuthority: "Em divergência, o Markdown vale.",
    footerLocal:
      "As marcações ficam salvas apenas neste navegador — não são registro, e ninguém mais as vê.",
    item: "item",
    items: "itens",
    of: "de",
    done: "feito",
    pending: "pendente",
    authLabel: "Autorização do item",
    authStates: { waiting: "aguardando", cleared: "liberado", stop: "parada" },
    flags: { urgent: "urgente", signs: "ele assina no fim", decided: "decidido" },
    meta: { origin: "Origem", source: "Fonte", dependson: "Depende de", risk: "Risco", state: "Estado" },
    lanes: {
      builder: {
        kicker: "Fila nossa",
        heading: "O que resolvemos sem perguntar nada a ele",
        blurb:
          "Cada item tem onde buscar a resposta e nenhum depende de conversa com o cliente. A marcação de autorização é sua: ela diz o que pode ser executado direto.",
      },
      owner: {
        kicker: "Fila dele",
        heading: "O que só o dono do negócio pode responder",
        blurb:
          "Preço, marca, modelo de negócio, histórico que só ele viveu e assinatura legal. Nada aqui é técnico, e por isso nada aqui pode ser sondado no lugar dele.",
      },
      cutover: {
        kicker: "Fase final",
        heading: "A virada para o ambiente oficial",
        blurb:
          "Só depois que as duas filas acima fecharem. Não começa agora e não depende de resposta do cliente.",
      },
    },
  },
};

// --- helpers ----------------------------------------------------------------

function shizuneRoot() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Minimal inline Markdown: links, bold, code. Everything else stays literal.
function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

// A paragraph opening with a bold lead that ends in a colon becomes a callout.
function asCallout(paragraph) {
  const m = paragraph.match(/^\*\*([^*]+?):\*\*\s*([\s\S]*)$/);
  if (!m) return null;
  const tag = m[1].trim();
  const alert = /ressalva|risco|parada|atenção|atenção/i.test(tag);
  return { tag, body: m[2].trim(), alert };
}

// Field names are accepted in English or Portuguese and normalized to one
// canonical key, so a source document reads naturally in its own language.
const FIELD_ALIASES = {
  lane: "lane",
  fila: "lane",
  origin: "origin",
  origem: "origin",
  source: "source",
  fonte: "source",
  risk: "risk",
  risco: "risk",
  mark: "mark",
  marca: "mark",
  dependson: "dependson",
  dependede: "dependson",
  state: "state",
  estado: "state",
  authorization: "authorization",
  autorizacao: "authorization",
};

function slugFieldName(raw) {
  const slug = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "");
  return FIELD_ALIASES[slug] || slug;
}

// --- parser -----------------------------------------------------------------

function parseChecklist(markdown) {
  const withoutFrontmatter = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = withoutFrontmatter.split(/\r?\n/);

  const items = [];
  let current = null;
  let buffer = [];

  const flush = () => {
    if (!current) return;
    current.raw = buffer.join("\n");
    items.push(current);
    current = null;
    buffer = [];
  };

  // A fenced code block may contain the format contract itself; its example
  // item must never be parsed as a real one.
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      if (current) buffer.push(line);
      continue;
    }
    if (inFence) {
      if (current) buffer.push(line);
      continue;
    }

    const heading = line.match(/^###\s+([A-Za-z]+\d+)\s+[—–-]\s+(.+?)\s*$/);
    if (heading) {
      flush();
      current = { code: heading[1], title: heading[2], fields: {} };
      buffer = [];
      continue;
    }
    if (!current) continue;
    if (/^##\s/.test(line)) {
      flush();
      continue;
    }
    buffer.push(line);
  }
  flush();

  for (const item of items) {
    // The metadata bullets come first, possibly separated from the heading and
    // from the prose by blank lines. Everything from the first non-field,
    // non-blank line onwards is prose and is kept verbatim.
    const body = [];
    let readingFields = true;
    for (const line of item.raw.split("\n")) {
      if (readingFields) {
        if (!line.trim()) continue;
        const field = line.match(/^-\s+\*\*([^*]+?):\*\*\s*(.*)$/);
        if (field) {
          item.fields[slugFieldName(field[1])] = field[2].trim();
          continue;
        }
        readingFields = false;
      }
      body.push(line);
    }

    const blocks = body.join("\n").split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    item.internal = [];
    item.client = [];
    let target = null;
    for (const block of blocks) {
      if (/^\*\*(Internal|Interno)\.\*\*/.test(block)) {
        target = item.internal;
        target.push(block.replace(/^\*\*(Internal|Interno)\.\*\*\s*/, ""));
        continue;
      }
      if (/^\*\*(Client|Cliente)\.\*\*/.test(block)) {
        target = item.client;
        target.push(block.replace(/^\*\*(Client|Cliente)\.\*\*\s*/, ""));
        continue;
      }
      if (target) target.push(block);
    }
    item.internal = item.internal.filter(Boolean);
    item.client = item.client.filter(Boolean);

    item.lane = LANE_ALIASES[(item.fields.lane || "").toLowerCase()] || "builder";
    item.authorization =
      AUTHORIZATION_ALIASES[(item.fields.authorization || "").toLowerCase()] || "waiting";
    item.urgent = /urgente|urgent/i.test(item.fields.mark || "");
    item.signs = /assina|signs?\b/i.test(item.fields.mark || "");
    item.decided = /^(decidido|decided)/i.test(item.fields.state || "");
  }

  const title = (withoutFrontmatter.match(/^#\s+(.+?)\s*$/m) || [])[1] || "Checklist";
  return { title, items };
}

// --- rendering --------------------------------------------------------------

function renderMeta(item, view, strings) {
  if (view === "client") return "";
  const bits = ["origin", "source", "dependson", "risk", "state"]
    .filter(key => item.fields[key])
    .map(key => `${strings.meta[key]}: <span>${inline(item.fields[key])}</span>`);
  if (!bits.length) return "";
  return `\n        <p class="src">${bits.join(" &nbsp;&middot;&nbsp; ")}</p>`;
}

function renderProse(paragraphs) {
  return paragraphs
    .map(p => {
      const callout = asCallout(p);
      if (callout) {
        return `\n        <p class="callout${callout.alert ? " alert" : ""}"><b class="tag">${inline(
          callout.tag
        )}</b>${inline(callout.body)}</p>`;
      }
      return `\n        <p class="why">${inline(p)}</p>`;
    })
    .join("");
}

function renderAuthorization(item, view, strings) {
  if (view === "client") return "";
  const buttons = AUTHORIZATION_STATES.map(
    state =>
      `<button type="button" class="auth-opt" data-auth-set="${state}" aria-pressed="${
        item.authorization === state
      }">${escapeHtml(strings.authStates[state])}</button>`
  ).join("");
  return `\n        <div class="auth" data-auth-for="${item.code}" role="group" aria-label="${escapeHtml(
    strings.authLabel
  )} ${item.code}">${buttons}</div>`;
}

function renderItem(item, view, strings) {
  const flags = [];
  if (item.urgent) flags.push(`<span class="flag">${escapeHtml(strings.flags.urgent)}</span>`);
  if (view === "internal" && item.signs)
    flags.push(`<span class="flag sign">${escapeHtml(strings.flags.signs)}</span>`);
  if (view === "internal" && item.decided)
    flags.push(`<span class="flag done">${escapeHtml(strings.flags.decided)}</span>`);

  const prose = view === "client" ? renderProse(item.client) : renderProse(item.internal);

  return `
    <label class="item" data-lane="${item.lane}" data-code="${item.code}">
      <input type="checkbox" data-id="${item.code.toLowerCase()}">
      <span class="code">${item.code}</span>
      <span class="body">${flags.length ? `\n        ${flags.join("\n        ")}` : ""}
        <span class="ask">${inline(item.title)}</span>${prose}${renderMeta(
    item,
    view,
    strings
  )}${renderAuthorization(item, view, strings)}
      </span>
    </label>`;
}

function renderLane(laneKey, items, view, strings) {
  if (!items.length) return "";
  const lane = strings.lanes[laneKey];
  const noun = items.length === 1 ? strings.item : strings.items;
  return `
  <section class="lane lane-${laneKey}">
    <div class="lane-head">
      <p class="lane-kicker"><span>${lane.kicker} &middot; ${items.length} ${noun}</span><span class="cnt" data-lane-count="${laneKey}">0 ${strings.of} ${items.length}</span></p>
      <h2>${lane.heading}</h2>
      <p>${lane.blurb}</p>
    </div>${items.map(i => renderItem(i, view, strings)).join("")}
  </section>`;
}

function renderScore(laneKey, items, strings) {
  return `
    <div class="score lane-${laneKey}">
      <p class="who">${strings.lanes[laneKey].kicker}</p>
      <span class="n" data-score-done="${laneKey}">0</span><span class="of">${strings.of} <span data-score-total="${laneKey}">${items.length}</span></span>
      <div class="track"><div class="fill" data-score-fill="${laneKey}"></div></div>
    </div>`;
}

function page({ title, items, view, sourceRelative, titleOverride, strings }) {
  if (titleOverride) title = titleOverride;
  const grouped = { builder: [], owner: [], cutover: [] };
  for (const item of items) grouped[item.lane].push(item);

  const laneOrder = view === "client" ? ["owner"] : LANE_ORDER;
  const lede = view === "client" ? strings.ledeClient : strings.ledeInternal;
  const howtoLines = view === "client" ? strings.howtoClient : strings.howtoInternal;
  const howto = `<ol>\n      ${howtoLines.map(l => `<li>${l}</li>`).join("\n      ")}\n    </ol>`;
  const eyebrowParts = view === "client" ? strings.eyebrowClient : strings.eyebrowInternal;
  const eyebrow = eyebrowParts
    .map(p => `<span>${escapeHtml(p)}</span>`)
    .join("<span>&middot;</span>");

  return `<!-- GERADO por scripts/build-checklist.mjs a partir de ${sourceRelative} — não editar à mão -->
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
:root{
  --paper:#F3F4F1; --surface:#FBFBF9; --ink:#14181A; --ink-2:#3E484B; --ink-3:#6E7A7C;
  --rule:#D9DED8; --rule-strong:#BCC4BC;
  --accent:#0E5C4A; --accent-soft:#E2EDE7;
  --signal:#8A6000; --signal-soft:#F4EAD2;
  --alert:#8E211D; --alert-soft:#F2DDD9;
  --muted:#5C6A70; --muted-soft:#E7EAEA;
  --sans:"Archivo",-apple-system,"Segoe UI",sans-serif;
  --serif:"Source Serif 4",Georgia,"Times New Roman",serif;
  --mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#101413; --surface:#171C1B; --ink:#E9EDE9; --ink-2:#AFB9B5; --ink-3:#7C8985;
    --rule:#29312F; --rule-strong:#3D4744;
    --accent:#63C2A5; --accent-soft:#14302A;
    --signal:#D9AC50; --signal-soft:#2E2614;
    --alert:#E39086; --alert-soft:#37201D;
    --muted:#93A0A4; --muted-soft:#1E2423;
  }
}
:root[data-theme="dark"]{
  --paper:#101413; --surface:#171C1B; --ink:#E9EDE9; --ink-2:#AFB9B5; --ink-3:#7C8985;
  --rule:#29312F; --rule-strong:#3D4744;
  --accent:#63C2A5; --accent-soft:#14302A;
  --signal:#D9AC50; --signal-soft:#2E2614;
  --alert:#E39086; --alert-soft:#37201D;
  --muted:#93A0A4; --muted-soft:#1E2423;
}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font-family:var(--serif);font-size:16.5px;line-height:1.6;margin:0}
.wrap{max-width:900px;margin:0 auto;padding:56px 28px 96px}
.eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0 0 18px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
h1{font-family:var(--sans);font-weight:700;font-size:clamp(30px,5.2vw,44px);line-height:1.08;letter-spacing:-.022em;margin:0 0 18px;text-wrap:balance}
.lede{font-size:18px;color:var(--ink-2);margin:0;max-width:64ch}
.scores{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);margin:32px 0 0}
.score{background:var(--surface);padding:18px 20px 20px}
.score .who{font-family:var(--mono);font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--lane,var(--ink-3));font-weight:600;margin:0 0 10px}
.score .n{font-family:var(--sans);font-size:38px;font-weight:700;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.score .of{font-family:var(--sans);font-size:15px;color:var(--ink-3);font-weight:500;margin-left:6px}
.score .track{height:7px;background:var(--rule);margin-top:12px;overflow:hidden}
.score .fill{height:100%;width:0;background:var(--lane,var(--accent));transition:width .32s ease}
.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:18px 0 0}
.btn{font-family:var(--sans);font-size:13.5px;font-weight:600;padding:9px 14px;border:1px solid var(--rule-strong);background:var(--surface);color:var(--ink);cursor:pointer;border-radius:2px}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.toolbar .hint{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);letter-spacing:.04em}
.howto{margin:26px 0 4px;padding:18px 20px;background:var(--surface);border:1px solid var(--rule)}
.howto h2{font-family:var(--sans);font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-3);margin:0 0 10px;font-weight:600}
.howto ol{margin:0;padding-left:19px;font-size:15.5px;color:var(--ink-2)}
.howto li{margin:5px 0}
.lane{margin:64px 0 0}
.lane-builder{--lane:var(--accent);--lane-soft:var(--accent-soft)}
.lane-owner{--lane:var(--signal);--lane-soft:var(--signal-soft)}
.lane-cutover{--lane:var(--muted);--lane-soft:var(--muted-soft)}
.lane-head{border-top:3px solid var(--lane);background:var(--lane-soft);padding:20px 22px 22px}
.lane-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--lane);font-weight:600;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 10px}
.lane-kicker .cnt{font-variant-numeric:tabular-nums;color:var(--ink-3)}
.lane-head h2{font-family:var(--sans);font-weight:700;font-size:26px;letter-spacing:-.018em;margin:0 0 9px;text-wrap:balance}
.lane-head p{margin:0;color:var(--ink-2);font-size:15.5px;max-width:62ch}
.item{display:grid;grid-template-columns:26px 52px 1fr;gap:0 14px;align-items:start;padding:20px 4px 20px 0;border-bottom:1px solid var(--rule)}
.item > input{appearance:none;-webkit-appearance:none;margin:3px 0 0;width:19px;height:19px;border:1.5px solid var(--rule-strong);background:var(--surface);cursor:pointer;display:grid;place-content:center;border-radius:2px}
.item > input:hover{border-color:var(--lane)}
.item > input:focus-visible{outline:2px solid var(--lane);outline-offset:2px}
.item > input:checked{background:var(--lane);border-color:var(--lane)}
.item > input:checked::after{content:"";width:10px;height:6px;border-left:2px solid var(--paper);border-bottom:2px solid var(--paper);transform:rotate(-45deg) translate(1px,-1px)}
.code{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--lane);padding-top:4px;letter-spacing:.03em}
.body{min-width:0}
.ask{display:block;font-family:var(--sans);font-weight:600;font-size:17px;line-height:1.34;margin:0 0 6px;letter-spacing:-.008em}
.why{margin:0 0 6px;color:var(--ink-2);font-size:15.5px;max-width:60ch}
.why b{color:var(--ink);font-weight:600}
.callout{margin:9px 0 0;font-size:14.5px;color:var(--ink-2);border-left:2px solid var(--lane);padding:1px 0 1px 12px;max-width:58ch}
.callout.alert{border-left-color:var(--alert)}
.callout b.tag{font-family:var(--sans);font-weight:600;font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--lane);display:block;margin-bottom:1px}
.callout.alert b.tag{color:var(--alert)}
.src{margin:9px 0 0;font-family:var(--mono);font-size:11.5px;letter-spacing:.03em;color:var(--ink-3);line-height:1.7}
.src span{color:var(--ink-2)}
.flag{display:inline-flex;align-items:center;font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;margin:0 6px 8px 0;background:var(--alert-soft);color:var(--alert);border-radius:2px}
.flag.sign{background:var(--signal-soft);color:var(--signal)}
.flag.done{background:var(--accent-soft);color:var(--accent)}
.auth{display:inline-flex;margin:12px 0 0;border:1px solid var(--rule-strong);border-radius:2px;overflow:hidden}
.auth-opt{font-family:var(--mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:600;padding:5px 10px;border:0;border-right:1px solid var(--rule-strong);background:var(--surface);color:var(--ink-3);cursor:pointer}
.auth-opt:last-child{border-right:0}
.auth-opt:hover{color:var(--ink)}
.auth-opt:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.auth-opt[aria-pressed="true"]{background:var(--muted-soft);color:var(--ink)}
.auth-opt[data-auth-set="liberado"][aria-pressed="true"]{background:var(--accent);color:var(--paper)}
.auth-opt[data-auth-set="parada"][aria-pressed="true"]{background:var(--alert);color:var(--paper)}
.item.on .ask{color:var(--ink-3);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--rule-strong)}
.item.on .why,.item.on .callout,.item.on .flag,.item.on .src{opacity:.5}
footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--rule);font-size:13.5px;color:var(--ink-3);max-width:62ch}
footer p{margin:0 0 7px}
@media (max-width:640px){
  .wrap{padding:38px 20px 72px}
  .item{grid-template-columns:26px 1fr;gap:0 12px}
  .code{grid-column:2;padding-top:0;margin-bottom:4px}
  .body{grid-column:2}
}
@media (prefers-reduced-motion: reduce){*{transition:none !important}}
@media print{
  body{background:#fff;color:#000;font-size:11pt}
  .wrap{padding:0;max-width:none}
  .lane-head,.howto,.score{background:transparent}
  .toolbar,.auth{display:none}
  .item{break-inside:avoid}
}
</style>

<div class="wrap">
  <p class="eyebrow">${eyebrow}</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="lede">${lede}</p>

  <div class="scores">${laneOrder.map(l => renderScore(l, grouped[l], strings)).join("")}
  </div>
${
  view === "internal"
    ? `
  <div class="toolbar">
    <button type="button" class="btn" id="copy-state">${escapeHtml(strings.copyButton)}</button>
    <span class="hint" id="copy-hint">${escapeHtml(strings.copyHint)}</span>
  </div>
`
    : ""
}
  <div class="howto">
    <h2>${escapeHtml(strings.howtoTitle)}</h2>
    ${howto}
  </div>
${laneOrder.map(l => renderLane(l, grouped[l], view, strings)).join("")}

  <footer>
    <p>${escapeHtml(strings.footerSource)} <code>${escapeHtml(sourceRelative)}</code>. ${escapeHtml(
    strings.footerAuthority
  )}</p>
    <p>${escapeHtml(strings.footerLocal)}</p>
  </footer>
</div>

<script>
(function(){
  var KEY = ${JSON.stringify("checklist:" + sourceRelative + ":" + view)};
  var UI = ${JSON.stringify({
    done: strings.done,
    pending: strings.pending,
    copyOk: strings.copyOk,
    copyFail: strings.copyFail,
  })};
  var items = Array.prototype.slice.call(document.querySelectorAll(".item"));
  var state = { done: {}, auth: {} };
  try {
    var raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (raw && typeof raw === "object") {
      state.done = raw.done || {};
      state.auth = raw.auth || {};
    }
  } catch (e) {}

  function persist(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function render(){
    var per = {};
    items.forEach(function(it){
      var box = it.querySelector("input"), lane = it.dataset.lane;
      per[lane] = per[lane] || { d: 0, t: 0 };
      per[lane].t++;
      it.classList.toggle("on", box.checked);
      if (box.checked) per[lane].d++;
    });
    Object.keys(per).forEach(function(lane){
      var p = per[lane];
      var done = document.querySelector('[data-score-done="' + lane + '"]');
      var total = document.querySelector('[data-score-total="' + lane + '"]');
      var fill = document.querySelector('[data-score-fill="' + lane + '"]');
      var cnt = document.querySelector('[data-lane-count="' + lane + '"]');
      if (done) done.textContent = p.d;
      if (total) total.textContent = p.t;
      if (fill) fill.style.width = (p.t ? (p.d / p.t) * 100 : 0) + "%";
      if (cnt) cnt.textContent = p.d + " de " + p.t;
    });
  }

  items.forEach(function(it){
    var box = it.querySelector("input");
    var code = it.dataset.code;
    if (state.done[code]) box.checked = true;
    box.addEventListener("change", function(){
      state.done[code] = box.checked ? 1 : 0;
      persist();
      render();
    });

    var group = it.querySelector("[data-auth-for]");
    if (!group) return;
    var stored = state.auth[code];
    if (stored) {
      Array.prototype.forEach.call(group.querySelectorAll(".auth-opt"), function(b){
        b.setAttribute("aria-pressed", String(b.dataset.authSet === stored));
      });
    }
    group.addEventListener("click", function(ev){
      var btn = ev.target.closest(".auth-opt");
      if (!btn) return;
      ev.preventDefault();
      state.auth[code] = btn.dataset.authSet;
      Array.prototype.forEach.call(group.querySelectorAll(".auth-opt"), function(b){
        b.setAttribute("aria-pressed", String(b === btn));
      });
      persist();
    });
  });

  var copyBtn = document.getElementById("copy-state");
  if (copyBtn) {
    copyBtn.addEventListener("click", function(){
      var parts = items.map(function(it){
        var code = it.dataset.code;
        var box = it.querySelector("input");
        var group = it.querySelector("[data-auth-for]");
        var auth = "waiting";
        if (group) {
          var on = group.querySelector('[aria-pressed="true"]');
          if (on) auth = on.dataset.authSet;
        }
        return code + ":" + (box.checked ? UI.done : UI.pending) + "/" + auth;
      });
      var text = parts.join(" ");
      var hint = document.getElementById("copy-hint");
      function ok(){ if (hint) hint.textContent = UI.copyOk; }
      function fail(){ if (hint) hint.textContent = UI.copyFail; console.log(text); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fail);
      } else {
        fail();
      }
    });
  }

  render();
})();
</script>
`;
}

// --- entry point ------------------------------------------------------------

function main() {
  const argv = process.argv.slice(2);
  const source = argv.find(a => !a.startsWith("--"));
  if (!source) {
    console.error("uso: build-checklist.mjs <source.md> [--view=internal|client] [--out=<file.html>]");
    process.exit(2);
  }

  const viewArg = (argv.find(a => a.startsWith("--view=")) || "--view=internal").split("=")[1];
  if (!["internal", "client"].includes(viewArg)) {
    console.error(`view inválida: ${viewArg} (use internal ou client)`);
    process.exit(2);
  }

  const sourcePath = path.resolve(process.cwd(), source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`fonte não encontrada: ${sourcePath}`);
    process.exit(2);
  }

  const root = shizuneRoot();
  const sourceRelative = path.relative(root, sourcePath).split(path.sep).join("/");
  const parsed = parseChecklist(fs.readFileSync(sourcePath, "utf8"));

  if (!parsed.items.length) {
    console.error(`nenhum item reconhecido em ${sourceRelative} — confira o formato "### CODE — Título"`);
    process.exit(1);
  }

  const outArg = argv.find(a => a.startsWith("--out="));
  const outPath = outArg
    ? path.resolve(process.cwd(), outArg.split("=")[1])
    : path.join(path.dirname(sourcePath), `${path.basename(sourcePath, ".md")}-${viewArg}.html`);

  const langArg = (argv.find(a => a.startsWith("--lang=")) || "--lang=en").split("=")[1];
  if (!STRINGS[langArg]) {
    console.error(`unknown --lang: ${langArg} (available: ${Object.keys(STRINGS).join(", ")})`);
    process.exit(2);
  }

  const titleArg = argv.find(a => a.startsWith("--title="));
  const rendered = page({
    ...parsed,
    view: viewArg,
    sourceRelative,
    strings: STRINGS[langArg],
    titleOverride: titleArg ? titleArg.slice("--title=".length) : null,
  });
  fs.writeFileSync(outPath, rendered, "utf8");

  const counts = parsed.items.reduce((acc, i) => {
    acc[i.lane] = (acc[i.lane] || 0) + 1;
    return acc;
  }, {});
  const shown = viewArg === "client" ? counts.owner || 0 : parsed.items.length;
  console.log(
    `Generated: ${path.relative(root, outPath).split(path.sep).join("/")} (${shown} item(s), view=${viewArg}, lang=${langArg})`
  );
  console.log(
    `  lanes: builder=${counts.builder || 0} owner=${counts.owner || 0} cutover=${counts.cutover || 0}`
  );
}

main();
