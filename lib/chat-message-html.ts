const URL_PATTERN =
  /https?:\/\/[^\s<>"')\]]+/gi;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeUrl(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\//i.test(t) || /^www\./i.test(t);
}

function shouldOpenInNewTab(href: string, currentHost?: string): boolean {
  if (!href || href.startsWith("#")) return false;
  try {
    const url = new URL(href, currentHost ? `https://${currentHost}` : undefined);
    if (!currentHost) return true;
    return url.hostname !== currentHost;
  } catch {
    return true;
  }
}

function anchorAttrs(href: string, currentHost?: string): string {
  const openNew = shouldOpenInNewTab(href, currentHost);
  const rel = openNew ? ' rel="noopener noreferrer"' : "";
  const target = openNew ? ' target="_blank"' : "";
  return `${target}${rel}`;
}

function linkClass(label: string, href: string): string {
  const classes = ["chat-message-link", "underline"];
  const labelLooksLikeLink = looksLikeUrl(label) || label.trim() === href.trim();
  if (!labelLooksLikeLink) classes.push("font-bold");
  return classes.join(" ");
}

function renderAnchor(label: string, href: string, currentHost?: string): string {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  const cls = linkClass(label, href);
  return `<a href="${safeHref}" class="${cls}"${anchorAttrs(href, currentHost)}>${safeLabel}</a>`;
}

function linkifyPlainUrls(text: string, currentHost?: string): string {
  return text.replace(URL_PATTERN, (url) => {
    const trailing = url.match(/[.,;:!?)]+$/)?.[0] ?? "";
    const core = trailing ? url.slice(0, -trailing.length) : url;
    return `${renderAnchor(core, core, currentHost)}${escapeHtml(trailing)}`;
  });
}

/**
 * Converts agent/user message text to safe HTML with styled hyperlinks.
 * Markdown [label](url) links use bold+underline when label is not itself a URL.
 */
export function formatChatMessageHtml(
  raw: string,
  currentHost?: string,
): string {
  if (!raw) return "";

  const placeholders: string[] = [];
  let working = raw;

  working = working.replace(MARKDOWN_LINK_PATTERN, (_match, label: string, href: string) => {
    const token = `@@LINK${placeholders.length}@@`;
    placeholders.push(renderAnchor(label, href, currentHost));
    return token;
  });

  working = escapeHtml(working);
  working = working.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  working = linkifyPlainUrls(working, currentHost);

  for (let i = 0; i < placeholders.length; i++) {
    working = working.replace(`@@LINK${i}@@`, placeholders[i]);
  }

  return working.replace(/\n/g, "<br />");
}