---
title: "Forgetting isn't the problem"
description: "Bigger context windows fix the wrong half of the AI codebase problem. The half they don't fix gets worse as your codebase grows."
pubDatetime: 2026-04-21T09:00:00Z
modDatetime: 2026-07-10T20:04:17Z
draft: false
tags: ["claude-code", "ai", "agentic-coding"]
---

At the end of [the memory bank post](/posts/the-memory-bank-framework), I said you keep one because it stops your codebase drifting. That's the reason that matters more, and it deserves more than a closing line.

Six months into a project you've been building with an agent, every file looks fine but the codebase as a whole doesn't.

You can't quite name what's wrong. Then you open a file and find a helper function that should have been extended – except the agent rewrote it from scratch, in a slightly different style, in a file you'd never have found on your own. Once you notice it, it's everywhere. Logic gets duplicated across files that don't know about each other. The same abstraction turns up three times, each with a slightly different signature.

None of it is 'wrong'. But none of it fits either.

## The contractors

Imagine renovating your house with a different contractor for each room. Each one is good at their job, but none of them have talked to the others. The kitchen's to spec, the bathroom plumbing is sound, the bedroom is freshly painted and properly wired.

Then you walk through it. The kitchen plumbing routes through the bedroom wall. The stairs don't quite meet the landing, the door handles come in three different styles, the floor heights vary between rooms. Every individual decision was fine but it doesn't work as a whole.

This is what AI codebases look like by default.

## Two dimensions of code quality

There are two dimensions of code quality, and they get conflated:

1. **Quality of the individual pieces.** AI is excellent at this. Give a good agent a clean task and it writes clean code
2. **Coherence across the whole app.** AI is nearly incapable of this by default. The agent isn't wired to think about where its work belongs in the wider system. It's wired to complete the task in front of it, and only that

It doesn't even register consistency as a concern. Every new task becomes a new file with a new abstraction and a new pattern. Logic gets duplicated, responsibilities drift between files, and helper functions get rewritten instead of extended. Six months later your codebase is a patchwork of quietly incompatible decisions – each one was made in a single session.

## The fix everyone reaches for

When people start noticing the issue, they often reach for the same fix: bigger context windows, auto-compaction, custom summarisation instructions. All variations on the same idea: cram more history into one session.

Why? One instinct drives all of it: FOLC – the fear of losing context.

**The continuity problem has a counter. The coherence problem doesn't.**

The continuity problem is that "your AI forgets what happened yesterday". This problem shrinks every month as context windows grow and compaction gets smarter. Give it a year or two and long-running sessions will feel fine for most work. "Session continuity" will become automatic.

The coherence problem doesn't shrink though. In fact it gets worse as your codebase grows. A longer context window lets the agent forget less of the current session, but it doesn't teach the agent to care about where its work fits. Bigger models don't fix incoherence, they produce more incoherent code faster.

You can't solve a blueprint problem by buying a sharper pencil.

## Give it the blueprints first

The fix isn't a better memory of the last session. It's a structured brief the agent reads before it touches any code.

The structure I use is called the memory bank. Five files at the root of every project:

- **project-brief.md** – what are we building?
- **product-context.md** – why does it exist, who's it for?
- **tech-context.md** – what are we building it with, what are the constraints?
- **system-patterns.md** – how do we build things here, what patterns do we reuse?
- **active-context.md** – what am I working on right now, what's blocked, what's undecided?

The first four are the blueprints. They tell the agent what the system is, why it exists, how the pieces fit together, and what conventions apply. The fifth is the spec – the current work. The agent loads all five at the start of every session.

Give it the blueprints first, so it can orient itself. Then give it the spec to execute against.

When the agent adds a feature, it doesn't invent an architecture. It reads system-patterns.md and follows the pattern already in use. When it needs a utility, it checks what's already there instead of creating a parallel version. When it faces a design decision, it consults product-context.md for the direction that serves the actual user.

None of these files are long. The stable ones are measured in hundreds of lines across a whole project, not thousands. But they're the difference between an agent that writes code and an agent that writes _your_ code. They're also one of the [early investments that scale agent work](/posts/the-order-you-build-a-software-factory-in).

The full practical guide (how to initialise one, the session loop, the discipline that keeps the files honest) is in [the memory bank framework post](/posts/the-memory-bank-framework).

## Install and keep

Install a memory bank because you're sick of re-explaining your project.

Keep it because it stops your codebase drifting.

Forgetting is the problem that shrinks. Drift is the problem that grows.
