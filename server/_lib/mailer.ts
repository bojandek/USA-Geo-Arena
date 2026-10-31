/**
 * Sending the email.
 *
 * Mailchimp is the provider: the list is its audience, and a campaign is the
 * email with the audience attached. Sending one is three steps - make the
 * campaign, give it its content, tell it to go.
 *
 * The API key is a server secret. It is read here and never leaves the
 * server; the browser only ever sees the finished email.
 */

export interface MailerConfig {
  apiKey: string;
  listId: string;
  fromName: string;
  replyTo: string;
}

/** What happened when the email was sent. */
export interface SendResult {
  ok: boolean;
  /** Why it did not work, in a sentence. */
  error: string | null;
  /** The campaign the provider made, when there was one. */
  campaignId: string | null;
}

/** The finished email, as the builder hands it over. */
export interface EmailToSend {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

/**
 * The provider's settings, or null when the deployment is not set up.
 *
 * Nothing is sent without all four of them, so a half-finished setup never
 * sends half an email.
 */
export function mailerConfig(): MailerConfig | null {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey || !listId) return null;

  return {
    apiKey,
    listId,
    fromName: process.env.MAILCHIMP_FROM_NAME?.trim() || 'USA GeoArena',
    replyTo: process.env.MAILCHIMP_REPLY_TO?.trim() || 'contact@geoarena.com',
  };
}

/**
 * The datacenter the account lives in.
 *
 * A Mailchimp key looks like `abc123-us21`, and `us21` is the datacenter.
 * Asking the wrong one is refused, so it has to come out of the key.
 */
export function mailchimpDataCenter(apiKey: string): string {
  const dash = apiKey.lastIndexOf('-');
  return dash > 0 ? apiKey.slice(dash + 1) : 'us1';
}

/** The header the provider wants: basic auth, any name, the key as the password. */
function authorization(apiKey: string): string {
  return `Basic ${btoa(`geoarena:${apiKey}`)}`;
}

/** Turns a failure into a sentence that says what went wrong. */
async function describe(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    const detail = payload?.detail ?? payload?.title ?? payload?.message;
    if (typeof detail === 'string' && detail) return detail;
  } catch {
    // The provider answered with something that is not JSON.
  }
  return `The provider answered with ${response.status}.`;
}

/**
 * Sends the email to the list.
 *
 * The provider adds its own unsubscribe footer, which is the one that legally
 * has to be there, so the email does not have to carry one of its own.
 */
export async function sendDailyEmail(
  config: MailerConfig,
  email: EmailToSend,
): Promise<SendResult> {
  const base = `https://${mailchimpDataCenter(config.apiKey)}.api.mailchimp.com/3.0`;
  const headers = {
    'content-type': 'application/json',
    authorization: authorization(config.apiKey),
  };

  // The campaign: the email, and the audience it goes to.
  const created = await fetch(`${base}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'regular',
      recipients: { list_id: config.listId },
      settings: {
        subject_line: email.subject,
        preview_text: email.preheader.slice(0, 150),
        title: `Daily challenge - ${email.subject}`.slice(0, 200),
        from_name: config.fromName,
        reply_to: config.replyTo,
      },
    }),
  });

  if (!created.ok) {
    return { ok: false, error: await describe(created), campaignId: null };
  }

  const campaign = (await created.json()) as { id?: string };
  const id = String(campaign?.id ?? '');
  if (!id) {
    return { ok: false, error: 'The provider did not return a campaign.', campaignId: null };
  }

  // The content: the HTML and the plain text version.
  const content = await fetch(`${base}/campaigns/${id}/content`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ html: email.html, text: email.text }),
  });
  if (!content.ok) {
    return { ok: false, error: await describe(content), campaignId: id };
  }

  // And off it goes.
  const sent = await fetch(`${base}/campaigns/${id}/actions/send`, {
    method: 'POST',
    headers: { authorization: authorization(config.apiKey) },
  });
  if (!sent.ok) {
    return { ok: false, error: await describe(sent), campaignId: id };
  }

  return { ok: true, error: null, campaignId: id };
}

/** The one address a test email may go to, or null when none is set. */
export function testAddress(): string | null {
  const address = process.env.NEWSLETTER_TEST_EMAIL?.trim();
  return address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? address : null;
}

/**
 * Sends the email to one address, never to the list.
 *
 * Mailchimp only tests a campaign, so one is made, tested and deleted
 * again. It is never told to send, so the audience cannot receive it.
 */
export async function sendTestEmail(
  config: MailerConfig,
  email: EmailToSend,
  to: string,
): Promise<SendResult> {
  const base = `https://${mailchimpDataCenter(config.apiKey)}.api.mailchimp.com/3.0`;
  const headers = {
    'content-type': 'application/json',
    authorization: authorization(config.apiKey),
  };

  const created = await fetch(`${base}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'regular',
      recipients: { list_id: config.listId },
      settings: {
        subject_line: `[TEST] ${email.subject}`.slice(0, 150),
        preview_text: email.preheader.slice(0, 150),
        title: `Test - ${email.subject}`.slice(0, 200),
        from_name: config.fromName,
        reply_to: config.replyTo,
      },
    }),
  });
  if (!created.ok) {
    return { ok: false, error: await describe(created), campaignId: null };
  }
  const id = String(((await created.json()) as { id?: string })?.id ?? '');
  if (!id) {
    return { ok: false, error: 'The provider did not return a campaign.', campaignId: null };
  }

  let result: SendResult = { ok: true, error: null, campaignId: id };
  const content = await fetch(`${base}/campaigns/${id}/content`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ html: email.html, text: email.text }),
  });
  if (!content.ok) {
    result = { ok: false, error: await describe(content), campaignId: id };
  } else {
    const tested = await fetch(`${base}/campaigns/${id}/actions/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ test_emails: [to], send_type: 'html' }),
    });
    if (!tested.ok) result = { ok: false, error: await describe(tested), campaignId: id };
  }

  // The draft is only a vehicle for the test; leaving it would fill the
  // campaign list with copies.
  await fetch(`${base}/campaigns/${id}`, { method: 'DELETE', headers }).catch(() => undefined);
  return result;
}
