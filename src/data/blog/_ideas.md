# Blog post ideas

Backlog of potential topics. Not all will become posts – the bar is: would this be worth 5-10 minutes of a stranger's time?

## Ideas

- Fighting bloat in AI-generated content – optimise context docs for AI first, not humans
- Knowledge work with Claude Code – Emma (EA) output style
- I built Granola in 2 hours (`~/dev/recall-recorder`) – open source repo first, then blog post walks through the build with repo as proof. Angle: "replaced a SaaS tool in 2 hours with AI agents". Notes (Feb):
  - **5 improvements over Granola:** (1) all meeting triggers worked reliably, (2) async recording (records locally, no streaming, uploads at end) → model gets whole recording → noticeably better transcription, (3) separates attendees by name vs Granola's "Me vs Them" – critical for 3+ person calls, (4) full control over transcript deployment (webhook or local folder), (5) agent workflow processes each transcript through existing account context, auto-edits frontmatter for filtering (e.g. training tag), archives
  - **Buy vs build reasoning:** used Recall desktop SDK rather than building call detection/recording from scratch. Speaker separation worked out the box. "Super cheap". Trade-off: requires Recall API key (not fully self-contained)
  - **Key detail from 8 Feb:** "context7 doc is key" – shared a doc covering gotchas and how it works. Also: "key thing is it handles multiple participants (and separating them out) vs Granola's Me vs Them, which is confusing"
  - Platforms: web (blog post) + tw + li + wa seed ("wrote up the granola replacement: [link]")
- How to move from Claude desktop app to CLI (Claude Code) for non-technical folks
- How to remain focused – deep work and AI/phone addiction
- The memory bank framework – signature concept, canonical reference post. 6-file structured memory system for persistent AI context across sessions. Source: `~/cli-agents/shared/memory-bank.md`. Angle: "my AI forgets everything between sessions – here's the 6-file system that fixes it". Notes (Feb) – key questions and answers to structure the post around:
  - **"How do I initialise?"** → Prompt "initialise memory bank" with lean canvas or architecture docs attached for richer project-brief/product-context. Agent creates `memory-bank/` folder and all 6 files. For multi-repo: import a single shared file (`@~/my-instructions/memory-bank.md`) instead of copy-pasting
  - **"Meaningful difference vs compress?"** → Compress = lossy summary of a single session. Memory bank = structured, persistent, full-fidelity context across sessions. 5 separate files with update guidelines. Each new session loads all 5 → much richer and more predictable context for continuation than a compressed summary could ever produce
  - **"What about updating?"** → Instructions include an "update memory bank" trigger with steps. Run after each task. On trigger: review ALL files, even if some don't need updates
  - **Session workflow that connects it:** Never compact, never clear. Task done → commit → /exit → new session. /prime loads all memory bank files at start of each session. Compaction becomes unnecessary because sessions stay short and focused, and cross-session context lives in the memory bank not in compacted summaries
  - **The coherence argument:**
    - The obvious pitch is session continuity – "your AI forgets, here's how to fix it." But the stronger argument is architectural coherence
    - Without a bird's eye view, AI builds isolated solutions in-situ: duplicated logic, inconsistent patterns, responsibilities landing in the wrong place. It doesn't even register consistency as a concern – it's wired to complete the task in front of it, not to think about where the solution belongs in the wider system
    - Gets worse as the codebase grows. Each new task adds another isolated solution that doesn't know about the others
    - Two dimensions of code quality: (1) quality in individual pieces of code – AI is good at this, (2) coherence and consistency across the full app – AI is nearly incapable of this *by default*. Memory bank attacks dimension 2
    - The fix: memory bank gives the AI both the bird's eye view (product context, project brief) and the lower-level design conventions and patterns (system-patterns.md, tech-context.md) *before* it touches anything. "Give it the blueprints first to orient, then give it the spec to execute against"
    - This reframes memory banks from "nice to have for context" to "architectural necessity" – especially for anyone past hobby-stage codebases
    - The continuity argument has a reasonable counter: "just use /compact." Nobody has a counter for the coherence argument
    - Find an analogy for "each piece is good, the whole doesn't hold together." The experience is universal for anyone whose AI codebase has grown – needs something that makes the mechanism click, not just a brand comparison
  - Include: file hierarchy diagram, content boundaries between files, audit triggers, why this + session-per-task = compaction is never needed
  - Platforms: web (canonical reference) + tw + li + wa seed
- Managing AI agent memory across projects – naming decisions, DRY config, diff verification for memory updates
- Structuring agent sessions for complex implementations – plan mode lifecycle (auto-persistence through context clear + compaction), spec vs plan distinction, compaction hooks (what to cover vs what's already handled), memory bank as session bridge. Full workflow with config examples. Source: [[Agentic Coding Best Practices]] + any spec-to-implementation example
