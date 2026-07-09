# Blog post ideas

Backlog of potential topics. Not all will become posts – the bar is: would this be worth 5-10 minutes of a stranger's time?

## Ideas

- Fighting bloat in AI-generated content – optimise context docs for AI first, not humans
- Knowledge work with Claude Code – Emma (EA) output style
- How to remain focused – deep work and AI/phone addiction
- Managing AI agent memory across projects – naming decisions, DRY config, diff verification for memory updates
- Memory bank failure modes – stale context misleads harder than empty (silent decay creates false orientation), and bloat is the parallel failure mode (over-distribution across files). Both cut from the memory bank framework draft for space – worth a standalone follow-up. Source: [[Agentic Coding Best Practices]]

### Rebuilding fidero.com with an AI agent (series)

Working notes in [`_fidero-rebuild.md`](./_fidero-rebuild.md). Piece 1 (four-attempts narrative + reference-doc method) is published: `rebuilding-fidero-com-with-an-ai-agent`. Remaining to draft from the working notes: (2) agent-steering beats + dark corollary (recurrence essay); (3) "a build pass is not a render pass" (verification loops); (4) editing AI-authored reference docs

### Agent scaffolding encodes assumptions about model capability, and those assumptions go stale

Three captures, one thesis: a hard constraint, a line in a reference doc and a memory-bank file are all scaffolding, and each encodes an assumption about what the model can't do unaided. Model capability moves; the assumptions don't update themselves. The decay is hard to spot because a stale constraint still executes – it functions, it just no longer earns its cost.

Three instances, each with its own evidence:

- **Tools that compensate vs tools that amplify** (26.06.04). Compensating tools (hard blocks, forced ordering) decay as the model improves – they become cages around judgement it now has. Amplifying tools (overridable nudges, richer views of state) improve, because they hand a stronger model better inputs. Test: does this assume the model is dumb, or give a smart model more to work with? On a model change, re-audit the compensating tools first. Sub-beat: hooks are the only zero-overhead primitive, free when they don't fire
- **Reference docs written for an LLM audience** (26.06.08). Cost is paid every session, so the editorial bar is higher than for a human doc. 800 lines of source produced six additions. Subtraction, not addition, is the hard part
- **Retiring progress.md** (26.06.26). Measured: 3 of 23 commits in 60 days touched it. It duplicated `git log` by hand and carried a per-ticket re-narration tax. Scaffolding a stronger model plus good commit discipline had made redundant

Second half – the counter-argument. Without it the piece collapses into generic "delete your scaffolding" advice:

- Subtraction has a limit. Cut narration, not reasoning that changes a borderline judgement. Two kinds of why: motivation that generalises to a novel case stays, narration of a step's purpose goes
- Subtraction is usually relocation, not deletion. progress.md's durable decisions moved to system-patterns; the skills' motivation moved up to the framework doc. Nine narration lines left, no reasoning left the system
- Git cannot record a rejected alternative. Evaluating and rejecting an option produces no commit, so without a written note the agent re-proposes it every session. This is the least replaceable content in agent memory, and the reason the answer is relocate rather than delete
- Knowing the principle did not prevent violating it. The two doc bullets that should have caught the narration already existed, 400 lines apart, never connected. Instance of the existing "capture isn't prevention" principle

The three share one test: does this line, tool or file change what the agent does, or how it judges a borderline case? If not, cut.

Angle notes: the costly signal is retiring a file from a framework Dan named and published (`the-memory-bank-framework`) – self-correction on a public artefact. Nuance to preserve: it splits by repo type. Modular repos gain from parallel worktrees, cohesive ones don't.

**Absorbs the former standalone "Build tools that scale with intelligence" entry.** Also overlaps "Fighting bloat in AI-generated content" (above) and the rebuild series' piece 4, "editing AI-authored reference docs" – the fidero.com-specific instance of the same idea. Decide at draft time whether either survives separately.

Full captures:

- `{Fidero vault}/Strategy/Content/Captures/26.06.04 - Tools That Scale With Intelligence.md`
- `{Fidero vault}/Strategy/Content/Captures/26.06.08 - Editing AI Reference Docs Is Subtraction.md`
- `{Fidero vault}/Strategy/Content/Captures/26.06.26 - Git Is The Changelog, Retiring The Progress File.md`
