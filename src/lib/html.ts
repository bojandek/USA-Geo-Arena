/**
 * Escaping for text that goes into HTML.
 *
 * The server writes HTML by hand - a share page, a newsletter - and anything
 * that came from a person has to be escaped before it is put on the page.
 * The share page had its own copy of this; both now use the same one, so
 * there is one rule about what a `<` in a nickname means.
 */

/** Escapes text for use in HTML content. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes text for use inside a URL in an HTML attribute. */
export function escapeUrl(value: unknown): string {
  return encodeURIComponent(String(value ?? ''));
}
