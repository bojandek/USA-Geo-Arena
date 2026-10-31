/**
 * Where a finished round can be sent.
 *
 * The share sheet of the phone is the best way to send a round, but it is
 * not there on most desktops, and even on a phone a player often knows
 * exactly where the round is going. So each network gets its own button,
 * and each button is a plain link the network already understands - no SDK,
 * no script from anybody else on the page.
 */

/** The channels a round can be sent to. */
export type ShareChannel =
  | 'native'
  | 'whatsapp'
  | 'x'
  | 'facebook'
  | 'telegram'
  | 'copy'
  | 'image';

/** What is shared: the words and the link they point at. */
export interface SharePayload {
  text: string;
  url: string;
}

/** The address that opens a network with the round already written. */
export function shareTargetUrl(
  channel: 'whatsapp' | 'x' | 'facebook' | 'telegram',
  payload: SharePayload,
): string {
  const text = payload.text.trim();
  const url = payload.url;
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    case 'facebook':
      // Facebook only takes the link; the words come from the page it points at.
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }
}

/** The words and the link together, as they are copied. */
export function shareClipboardText(payload: SharePayload): string {
  return `${payload.text.trim()}\n${payload.url}`;
}
