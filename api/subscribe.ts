// Creates a Build Notes subscriber through Buttondown's API for the inline
// signup in NewsletterSignup.astro. Every non-200 response sends the reader to
// Buttondown's own embed form instead. The request fields, the version pin and
// the no-logging rule are explained in docs/external-services.md.

const BUTTONDOWN_SUBSCRIBERS_URL = "https://api.buttondown.com/v1/subscribers";
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

    const emailField = form.get("email");
    const email = typeof emailField === "string" ? emailField.trim() : "";
    if (!email) return json(400, { ok: false });

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) return json(503, { ok: false });

    const ipAddress = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      .trim();
    const referrerUrl = request.headers.get("referer");

    try {
      const response = await fetch(BUTTONDOWN_SUBSCRIBERS_URL, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
          "X-API-Version": BUTTONDOWN_API_VERSION,
        },
        body: JSON.stringify({
          email_address: email,
          tags: ["website"],
          ...(ipAddress && { ip_address: ipAddress }),
          ...(referrerUrl && { referrer_url: referrerUrl }),
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.status !== 201) {
        return json(502, { ok: false, upstream: response.status });
      }
      const { type } = await response.json();
      if (type === "unactivated") return json(200, { ok: true });
      return json(502, { ok: false, upstream: String(type) });
    } catch (error) {
      const upstream =
        error instanceof DOMException && error.name === "TimeoutError"
          ? "timeout"
          : "error";
      return json(502, { ok: false, upstream });
    }
  },
};
