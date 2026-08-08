# External services

Three services sit outside the repo. Their dashboard state can't be read from the code, so it is recorded here.

## Vercel

Hosts the site from the `dhpwd/danhopwood.com` GitHub repo. `danhopwood.com` is the primary domain and currently the only one serving.

`vercel.json` at the project root holds the production-side routing:

- `trailingSlash: false` – see `docs/patterns/urls.md`
- `redirects` – permanent redirects for renamed post slugs

`dhpwd.com` and `www.danhopwood.com` are both meant to redirect to the apex domain. Neither points at Vercel: `dhpwd.com` still resolves to its previous host and `www.danhopwood.com` has no DNS record.

## Plausible

Cloud-hosted, privacy-friendly, no cookie banner. The script tag and the vendor init snippet are in `Layout.astro`'s `<head>`. The `async` attribute makes Astro treat the tag as inline – any attribute besides `src` does – so it renders as written. No Partytown: the script is about 1KB.

Custom events use Title Case with spaces, the Plausible convention. `plausible` is typed on `Window` in `src/env.d.ts`. Two events fire:

- **Newsletter Signup** – from `trackSignup()` in `NewsletterSignup.astro`, on both Ajax success and the native form fallback
- **Share Link** – on click in `ShareLinks.astro`, with `{ props: { platform } }` for a per-platform breakdown

Each event needs a matching goal in the Plausible dashboard before it reports. The script loads from `plausible.io` directly, so ad blockers suppress it – routing it through `danhopwood.com` with a `vercel.json` rewrite is the fix, and no rewrite is configured.

## Buttondown

Powers the Build Notes newsletter. `NewsletterSignup.astro` POSTs to `https://buttondown.com/api/emails/embed-subscribe/dhpwd` and is embedded in `PostDetails.astro` and `AboutLayout.astro`, with a `compact` prop for the narrower placement.

- The hidden `embed=1` input is required by Buttondown's embed API
- Subscribers are tagged `website` through a hidden input. Further fields go in as `name="metadata__<key>"`
- The form submits by fetch, with inline success and error messages and no redirect. When fetch fails – Buttondown's human verification step returns a non-200 – it falls back to a native form POST in a new tab
- The "Read the latest issue" link below the form points at `buttondown.com/dhpwd/archive`. It is muted relative to the Subscribe button on purpose, to keep the CTA hierarchy
- The strapline leads with the frequency and stays anti-sell. One short line, no hype
