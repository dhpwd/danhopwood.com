// Creates a Build Notes subscriber through Buttondown's API for the inline
// signup in NewsletterSignup.astro. Every non-200 response sends the reader to
// Buttondown's own embed form instead – see docs/external-services.md.

const BUTTONDOWN_SUBSCRIBERS_URL = "https://api.buttondown.com/v1/subscribers";

// Pinned because the response's `type` field depends on the API version, and
// without the header Buttondown uses the version pinned on the account.
const BUTTONDOWN_API_VERSION = "2026-04-01";

const HONEYPOT_FIELD = "bd_hp";

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return json(400, { ok: false });
    }

    if (form.get(HONEYPOT_FIELD)) return json(200, { ok: true });

    const email = form.get("email");
    if (typeof email !== "string" || !email.trim()) {
      return json(400, { ok: false });
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) return json(503, { ok: false });

    const ipAddress = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      .trim();
    const referrerUrl = request.headers.get("referer");

    // No `type` field, so Buttondown applies double opt-in. Neither the
    // request nor Buttondown's response is logged: both hold the email.
    let upstream: number | string;
    try {
      const response = await fetch(BUTTONDOWN_SUBSCRIBERS_URL, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
          "X-API-Version": BUTTONDOWN_API_VERSION,
        },
        body: JSON.stringify({
          email_address: email.trim(),
          tags: ["website"],
          ...(ipAddress && { ip_address: ipAddress }),
          ...(referrerUrl && { referrer_url: referrerUrl }),
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 201) {
        const { type } = await response.json();
        if (type === "unactivated") return json(200, { ok: true });
        upstream = String(type);
      } else {
        upstream = response.status;
      }
    } catch (error) {
      upstream =
        error instanceof DOMException && error.name === "TimeoutError"
          ? "timeout"
          : "error";
    }

    return json(502, { ok: false, upstream });
  },
};
