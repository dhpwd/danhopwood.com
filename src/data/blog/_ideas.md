# Blog post ideas

Backlog of potential topics. Not all will become posts – the bar is: would this be worth 5-10 minutes of a stranger's time?

## Ideas

- Fighting bloat in AI-generated content – optimise context docs for AI first, not humans
- Knowledge work with Claude Code – Emma (EA) output style
- How to remain focused – deep work and AI/phone addiction
- Managing AI agent memory across projects – naming decisions, DRY config, diff verification for memory updates
- Memory bank failure modes – stale context misleads harder than empty (silent decay creates false orientation), and bloat is the parallel failure mode (over-distribution across files). Both cut from the memory bank framework draft for space – worth a standalone follow-up. Source: [[Agentic Coding Best Practices]]

### Rebuilding fidero.com with an AI agent – the reference-doc-driven workflow

Working notes in [`_fidero-rebuild.md`](./_fidero-rebuild.md). Likely splits into 3–4 posts at draft time: (1) four-attempts narrative + reference-doc method; (2) agent-steering beats + dark corollary (recurrence essay); (3) "a build pass is not a render pass" (verification loops); (4) editing AI-authored reference docs. Write after homepage + remaining pages land + Lovable cutover

### The software factory – investment order for 10x build throughput with agents

**Committed as the next post** – teased as the follow-up at the end of [the writing-loops post](./writing-loops-is-a-ladder-not-a-command.md).

Six-step sequencing claim for actually 10x'ing software build throughput with agents. Mis-sequencing wastes investment (elaborate specs against a codebase agents can't navigate; parallel agents with no way to verify their work).

The order:

1. **Ambient verification capacity** (one-time) – test framework, CI, browser automation, observability stack. The prerequisite that makes per-task criteria executable rather than aspirational
2. **Codebase legibility + system patterns** – tidy code agents can navigate without long primers, plus a system-patterns doc that names conventions explicitly
3. **Environment context for the build surface** – stable reference doc for recurring surfaces (components, API), just-in-time research sub-agent for one-offs (third-party APIs)
4. **Spec quality per task** – form scales with task complexity. A bug ticket may be a one-liner with repro; a feature needs a full doc. "What good looks like" and "how we know it's good" are the same artefact for software – verification criteria live in the spec
5. **Skill library for recurring builds** – once spec-writing recurs, encode each pattern as a skill bundling reference-doc pull + spec scaffold + verification gates
6. **Layered review** (catch-net) – auto-review first (GitHub Action, /ultrareview, managed Code Review), human-review only for what passes the cheap gate

Threads to pull on in the post:

- **Three primitives to keep separate:** reference doc (environment contract, stable) / spec (per-task ask) / skill (encoded workflow). Common conflation that costs clarity
- **Bottleneck migration:** each layer reveals the next. "How do I know it works?" → "agent keeps adding the wrong pattern" → "agent built the wrong thing" → "I have 8 PRs and no time"
- **The ambient-vs-per-task distinction** sharpens the verification-first principle. Ambient capacity is the prerequisite; per-task criteria live in the spec
- **Background-vs-interactive dispatch heuristic** – three task modes (background from start, interactive-then-background, interactive throughout) plus a two-test gate: spec completeness (the Slack-message test) and iteration cadence. The iteration-cadence test is the sharp beat – a well-specified task can still be wrong to background, because peek-and-reply round-trip latency makes tight-loop work slower than inline. Worked example: polishing a built marketing page – passes on spec but fails on cadence. Sits awkwardly under investment-sequencing (it's a per-task dispatch call, not an investment tier); may peel off into the verification-loops post at draft time
- **A → B → Z orientation** – three reference points the operator and agents both need: A (existing memory + codebase state), B (this task's spec), Z (strategic north star). Memory bank = A, spec = B, strategy docs = Z. Frames why each factory artefact exists, and why drift on any one corrupts the others at scale
- **The operator's loop:** choose what to do → write the spec (collaborative) → approve the agent's plan → agent executes, verifies, opens PR → auto-review → human review of green PRs → merge

Source: [[Agentic Coding Best Practices#The software factory investment order]]. Anchors advisory positioning around how to actually scale agent throughput rather than the generic "agents are great" framing already saturating the space

### Build tools that scale with intelligence, not ones that compensate for its absence

A frame for customising agentic harnesses (two-kinds-of-tools heuristic → nudge-don't-block → zero-overhead abstraction), drawn out of a Daisy Holman (Anthropic, Claude Code team) talk. Full capture: `/Users/dhpwd/Vaults/Fidero/Strategy/Content/Captures/26.06.04 - Tools That Scale With Intelligence.md`

