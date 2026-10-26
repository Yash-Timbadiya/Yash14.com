import type { RoastResult } from "@/features/roast/types";

export type ExportFormat = "pdf" | "markdown" | "html" | "json";

const BRAND = "#ff4d00";

function fileBase(result: RoastResult) {
  const date = result.scannedAt.slice(0, 10);
  return `roast-${result.domain.replace(/[^a-z0-9.-]/gi, "-")}-${date}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lighthouseRows(result: RoastResult): [string, number][] {
  if (!result.lighthouse) return [];
  return [
    ["Performance", result.lighthouse.performance],
    ["Accessibility", result.lighthouse.accessibility],
    ["Best practices", result.lighthouse.bestPractices],
    ["SEO", result.lighthouse.seo],
  ];
}

export function toMarkdown(result: RoastResult) {
  const lines: string[] = [
    `# Roast: ${result.domain}`,
    "",
    `**Score:** ${result.score}/100 (${result.grade}) - ${result.gradeNote}`,
    "",
    `URL: ${result.url}  `,
    `Scanned: ${new Date(result.scannedAt).toUTCString()}`,
    "",
  ];

  const lighthouse = lighthouseRows(result);
  if (lighthouse.length > 0) {
    lines.push("## Lighthouse", "", "| Metric | Score |", "| --- | --- |");
    for (const [label, score] of lighthouse)
      lines.push(`| ${label} | ${score} |`);
    lines.push("");
  }

  if (result.dead) {
    lines.push("## Site unreachable", "", result.dead.detail, "");
    for (const fix of result.dead.fixes) lines.push(`- ${fix}`);
    lines.push("");
  }

  for (const category of result.categories) {
    lines.push(
      `## ${category.label}: ${category.score}/100`,
      "",
      `_${category.line}_`,
      "",
    );
    for (const issue of category.issues) {
      lines.push(
        `### ${issue.label} (${issue.status.toUpperCase()} - ${issue.value})`,
        "",
      );
      for (const fix of issue.fixes) lines.push(`- ${fix}`);
      lines.push("");
    }
    if (category.passedCount > 0) {
      lines.push(
        `${category.passedCount} other check${category.passedCount === 1 ? "" : "s"} passed.`,
        "",
      );
    }
  }

  lines.push("## Final verdict", "", `> ${result.verdict}`, "");
  return lines.join("\n");
}

export function toHtml(result: RoastResult) {
  const lighthouse = lighthouseRows(result);

  const categories = result.categories
    .map(
      (category) => `
    <section class="category">
      <div class="row">
        <div>
          <p class="label">${escapeHtml(category.label)}</p>
          <p class="line">${escapeHtml(category.line)}</p>
        </div>
        <div class="score-wrap">
          <div class="bar"><span style="width:${category.score}%;background-size:${10000 / Math.max(category.score, 1)}% 100%"></span></div>
          <span class="score">${category.score}</span>
        </div>
      </div>
      ${category.issues
        .map(
          (issue) => `
      <div class="issue">
        <div class="row"><strong>${escapeHtml(issue.label)}</strong><span class="status ${issue.status}">${issue.status.toUpperCase()} &middot; ${escapeHtml(issue.value)}</span></div>
        <ul>${issue.fixes.map((fix) => `<li>${escapeHtml(fix)}</li>`).join("")}</ul>
      </div>`,
        )
        .join("")}
      ${category.passedCount > 0 ? `<p class="passed">${category.passedCount} other check${category.passedCount === 1 ? "" : "s"} passed.</p>` : ""}
    </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Roast: ${escapeHtml(result.domain)}</title>
<style>
  :root { color-scheme: light; --fg: #0a0a0a; --muted: #6b6b6b; --line: #e5e5e5; --track: #efefef; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: var(--fg); font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 40px 16px; }
  h1 { margin: 0; font-size: 32px; }
  h1 span { color: ${BRAND}; }
  .meta, .passed, .label, .status { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .meta, .passed { color: var(--muted); }
  .summary { display: flex; gap: 24px; align-items: baseline; margin: 24px 0; padding: 16px 0; border-block: 1px solid var(--line); }
  .total { font-size: 48px; font-weight: 700; color: ${BRAND}; line-height: 1; }
  .lighthouse { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 8px; }
  .category { padding: 16px 0; border-bottom: 1px solid var(--line); break-inside: avoid; }
  .row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
  .label { margin: 0; text-transform: uppercase; letter-spacing: .04em; }
  .line, .verdict { margin: 4px 0 0; font-family: Georgia, serif; font-style: italic; color: var(--muted); font-size: 16px; }
  .score-wrap { display: flex; align-items: center; gap: 12px; }
  .bar { width: 80px; height: 6px; border-radius: 99px; background: var(--track); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: 99px; background-image: linear-gradient(to right, #b32d00, ${BRAND}, #ff9a5c); }
  .score { width: 36px; text-align: right; font: 600 18px ui-monospace, monospace; color: ${BRAND}; }
  .issue { margin-top: 12px; }
  .issue ul { margin: 4px 0 0; padding-left: 20px; }
  .status { color: var(--muted); }
  .status.fail { color: ${BRAND}; }
  .verdict { color: var(--fg); font-size: 22px; }
  h2 { margin: 32px 0 0; font: 12px ui-monospace, monospace; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 16mm; }
  @media print { main { padding: 0; } }
</style>
</head>
<body>
<main>
  <h1><span>&#9679;</span> ${escapeHtml(result.domain)}</h1>
  <p class="meta">${escapeHtml(result.url)} &middot; Scanned ${escapeHtml(new Date(result.scannedAt).toUTCString())}</p>
  <div class="summary">
    <span class="total">${result.score}</span>
    <div>
      <strong>${escapeHtml(result.grade)}</strong>
      <div class="meta">${escapeHtml(result.gradeNote)}</div>
      ${lighthouse.length > 0 ? `<div class="lighthouse meta">${lighthouse.map(([label, score]) => `<span>${label}: ${score}</span>`).join("")}</div>` : ""}
    </div>
  </div>
  ${result.dead ? `<section class="category"><p class="label">Site unreachable</p><p class="line">${escapeHtml(result.dead.detail)}</p><ul>${result.dead.fixes.map((fix) => `<li>${escapeHtml(fix)}</li>`).join("")}</ul></section>` : ""}
  ${categories}
  <h2>Final verdict</h2>
  <p class="verdict">${escapeHtml(result.verdict)}</p>
</main>
</body>
</html>`;
}

export function toJson(result: RoastResult) {
  return JSON.stringify(result, null, 2);
}

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Printing a standalone copy in a hidden iframe keeps the site chrome out of
// the PDF and avoids shipping a PDF library for a rarely used action.
function printAsPdf(result: RoastResult) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0";
  frame.srcdoc = toHtml(result);
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return frame.remove();
    win.document.title = fileBase(result);
    win.addEventListener("afterprint", () => frame.remove(), { once: true });
    win.focus();
    win.print();
  };
  document.body.appendChild(frame);
}

export function exportReport(result: RoastResult, format: ExportFormat) {
  const base = fileBase(result);
  switch (format) {
    case "pdf":
      return printAsPdf(result);
    case "markdown":
      return download(toMarkdown(result), `${base}.md`, "text/markdown");
    case "html":
      return download(toHtml(result), `${base}.html`, "text/html");
    case "json":
      return download(toJson(result), `${base}.json`, "application/json");
  }
}
