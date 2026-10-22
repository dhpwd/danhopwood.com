# External services

Three services sit outside the repo. How the site talks to each is recorded here. Their dashboard state is not – it changes without a commit, so a snapshot of it here would go stale with nothing to catch it. Where a gap is known, the ticket owns it.

## Vercel

Hosts the site from the `dhpwd/danhopwood.com` GitHub repo. `danhopwood.com` is the primary domain and currently the only one serving.

`vercel.json` at the project root holds the production-side routing:

- `trailingSlash: false` – see `docs/patterns/urls.md`
- `redirects` – permanent redirects for renamed post slugs

The site is static apart from one Vercel function, `api/subscribe.ts`, served at `POST /api/subscribe` (see Buttondown below). Vercel builds the root `api/` folder alongside the Astro build. The function runs on the Node runtime and exports the web-standard `{ fetch(request) }` handler. `pnpm dev` and `pnpm preview` don't serve it, so locally `/api/subscribe` 404s and the signup form takes its fallback.

Server code goes in root `api/`, never through the `@astrojs/vercel` adapter, which would drop the search index – see `docs/patterns/astro-build.md`.

`dhpwd.com` and `www.danhopwood.com` are both meant to redirect to the apex domain. Wiring that up is FID-547.

## Plausible

Cloud-hosted, privacy-friendly, no cookie banner. The script tag and the vendor init snippet are in `Layout.astro`'s `<head>`. The `async` attribute makes Astro treat the tag as inline – any attribute besides `src` does – so it renders as written. No Partytown: the script is about 1KB.

Custom events use Title Case with spaces, the Plausible convention. `plausible` is typed on `Window` in `src/env.d.ts`. Two events fire:

- **Newsletter Signup** – from the submit handler in `NewsletterSignup.astro`, once per submit on both the inline and fallback paths. It counts signups started, not confirmed – the reader may still abandon Buttondown's verification step
- **Share Link** – on click in `ShareLinks.astro`, with `{ props: { platform } }` for a per-platform breakdown

Each event needs a matching goal in the Plausible dashboard before it reports. The script loads from `plausible.io` directly, so ad blockers suppress it – proxying it through `danhopwood.com` with a `vercel.json` rewrite is the fix, and that is FID-548.

## Buttondown

Powers the Build Notes newsletter. `NewsletterSignup.astro` is embedded in `PostDetails.astro` and `AboutLayout.astro`, both as the same bordered card. It subscribes the reader in place through our own function, and falls back to Buttondown's embed form in the same tab.

**Inline path.** The submit handler fires the Plausible event, disables the button and POSTs the form data to `/api/subscribe` with an 8s timeout. On a 2xx it clears the form, re-enables the button, returns focus to whichever control had it and puts "Almost there – check your inbox to confirm your subscription." in the `role="status"` paragraph below the form. The paragraph is empty until then, so the card grows to fit the message (two lines on a phone). Each submit clears the message first, so a repeat success is announced again. `api/subscribe.ts` creates the subscriber with `POST https://api.buttondown.com/v1/subscribers` ([Creating a subscriber](https://docs.buttondown.com/api-subscribers-create)):

- Authenticates with the `BUTTONDOWN_API_KEY` environment variable, set in Vercel and never exposed to client code
- Sends `email_address`, `tags: ["website"]` (hard-coded, never read from the request), `ip_address` and `referrer_url`
- `ip_address` is the first `x-forwarded-for` value, which Vercel sets to the client IP. Buttondown's firewall scores the subscriber by it. Without it every signup arrives from Vercel's IPs, and the firewall may block them as repeat activity
- Sends no `type`, so double opt-in applies and a new subscriber comes back as `unactivated`. Never send `type: regular` or `X-Buttondown-Bypass-Firewall`
- Pins `X-API-Version`, because the response's `type` field depends on the API version (`subscriber_type` before `2024-08-01`) and an unpinned request uses the version pinned on the account ([Versioning](https://docs.buttondown.com/api-versioning))
- Times out after 5s, inside the client's 8s
- Logs nothing, since the request and Buttondown's response both hold the email

The function's responses: 405 for a non-POST, 403 when the browser marks the request `Sec-Fetch-Site: cross-site`, 400 for a body that isn't form data or a missing or blank email, 503 when the key is unset (without calling Buttondown) and 200 only when Buttondown returns 201 with `type: unactivated`. Anything else from Buttondown – another status, another `type` such as `blocked`, a timeout or a network error – is a 502 with `{ ok: false, upstream }`, where `upstream` is Buttondown's status code, its returned `type`, `"timeout"` or `"error"`. That is enough to diagnose a failure from the browser's network tab without exposing the email.

The 403 stops another site's page from making its visitors' browsers subscribe arbitrary addresses through our key. Each of those requests would carry a different real visitor's IP, so Buttondown's firewall would score them as unrelated signups. Browsers that don't send `Sec-Fetch-Site` pass, and same-origin and same-site requests always do.

**Honeypot.** The form carries a text input named `bd_hp` in an off-screen wrapper (`aria-hidden`, `tabindex="-1"`, `autocomplete="off"`). When it is non-empty the function returns 200 without calling Buttondown, so a bot sees a success. We don't run our own CAPTCHA: Buttondown's firewall scores API signups, and a reader it rejects lands on Buttondown's CAPTCHA page through the fallback.

**Fallback.** Any response but a 2xx, a network error or the 8s timeout re-enables the button and calls `form.submit()`, which skips the submit event and POSTs the form natively to `https://buttondown.com/api/emails/embed-subscribe/dhpwd` in the same tab. With JS off the form does the same. Buttondown's response page resolves what the API path can't: duplicate addresses (the API returns 400), firewall blocks, the API's rate limit (100 a day by default, 429), a missing key and the CAPTCHA, which in testing was Cloudflare Turnstile. Buttondown's docs rule out calling the embed endpoint with fetch for that reason ([Embedding an HTML form](https://docs.buttondown.com/building-your-subscriber-base#embedding-an-html-form)). The form's `action`, `method` and hidden inputs exist for the fallback:

- The hidden `embed=1` input is required by Buttondown's embed API
- Subscribers are tagged `website` through a hidden input. Further fields go in as `name="metadata__<key>"`
- The "Read the latest issue" link below the form points at `buttondown.com/dhpwd/archive`. It is muted relative to the Subscribe button on purpose, to keep the CTA hierarchy
- The strapline leads with the frequency and stays anti-sell. One short line, no hype
