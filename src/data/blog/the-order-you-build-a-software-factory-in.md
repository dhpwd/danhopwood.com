---
title: "The order you build a software factory in"
description: "Six investments turn agents into a software factory. The order you make them in decides whether you get 10x the output or 10x the waste."
pubDatetime: 2026-06-23T21:17:14Z
draft: false
tags: ["claude-code", "agentic-coding", "ai"]
---

A software factory is the setup where agents do the building and you do the deciding: you own the spec, they execute, verify and open the pull request, you review what's worth reviewing. I ended the [last post](/posts/writing-loops-is-a-ladder-not-a-command) promising to lay out how you actually get there, and in what order. This is that.

People talk about getting there like it's a switch you flip. It isn't. It's six separate investments, and they only pay off in a particular order.

Get the order wrong and you waste most of the money. You sink time into elaborate specs against a codebase the agent can't navigate. You spin up five parallel agents with no way to check their own work, so every pull request still lands on your desk for a full review. The glamorous investments sit in the middle. The one that makes them worth anything sits underneath, and almost nobody starts there.

Here's the order, from prerequisite to polish.

![A vertical stack of six layers, numbered from the foundation up: 1 verification capacity highlighted at the base, then 2 codebase legibility, 3 environment context, 4 spec quality, 5 skill library, 6 layered review at the top. A "foundation to optimisation" arrow runs up the left, and each layer is annotated on the right with the bottleneck it answers.](../../assets/images/cc-software-factory-stack.jpeg)

## 1. Verification capacity (build this first)

Before anything else, the work has to be able to tell you whether it's right. A test framework, CI, browser automation, something watching what the running system actually does. You build it once and every task reuses it.

Skip it and nothing above it holds. The agent writes code, but it can't tell when the code is good, so it can't fix its own mistakes and you're back to reading every line yourself. It's a [data quality check](/posts/i-run-my-ai-customer-notes-like-a-database) with a different name: nothing downstream gets to trust the output until something at the edge has checked it. Unglamorous, but the whole foundation. You don't build the factory before you can test what comes off the line.

The bottleneck you feel here: "how do I even know it worked?"

## 2. A codebase the agent can read

The next thing that breaks: the agent keeps doing the right thing the wrong way. It adds a pattern you don't use, or rebuilds something you already have.

Two fixes, both permanent multipliers. Tidy the code so an agent can find its way around without a long briefing. And write the conventions down explicitly, in a doc that says "this is how we do things here". Tidy code plus named conventions means shorter specs, faster builds and less to fix on review. It pays back on every task, forever.

## 3. Context for where the work lands

Next bottleneck: the agent builds the wrong thing, because the spec was a guess. It didn't know enough about where the work was landing.

So give whoever writes the spec what they need. For the parts you keep building on (like your component library or an internal API) keep a stable reference doc describing the 'contract'. For one-offs, like integrating some third-party API once, send a research sub-agent to go and find out just in time. Either way the spec is written from facts, not guesses.

## 4. The spec itself

Now the spec can actually be good, because everything underneath is holding it up.

For software, "what good looks like" and "how we know it's good" are the same document. The verification criteria live in the spec. The form scales with the job: a bug fix might be one line and a way to reproduce it, a feature needs a proper doc. The test I use is whether there's enough here for the agent to build it in one pass and check its own work.

## 5. Skills for the builds you keep doing

Once you've written the same kind of spec three times, stop writing it by hand. Encode the pattern as a skill: it pulls the right reference doc, scaffolds the spec, wires in the verification gates. A build that took half a day drops to minutes. You only reach this point once spec-writing has gone repetitive, which is why it's fifth and not first.

## 6. Layered review (the safety net)

The last bottleneck only shows up when everything above is working: you've got eight pull requests open and no time to read them.

Put a cheap gate first. An automated review runs on every PR, a GitHub Action or a managed reviewer, and you only look at what passes it. This is worthless until PRs are landing faster than you can read them. Build it any earlier and you're guarding a door nobody's walking through.

## Reference doc, spec, skill: keep them apart

Those three get muddled constantly, and the muddle costs you. They're not the same thing. The reference doc is the ground you're building on, stable and reused. The spec is what you're building this time, written fresh. The skill is how you build it once you've done it enough times to stop thinking about it. Conflate them and you'll find yourself writing a "spec" that's really a reference doc, or a "skill" that only works for one task.

## The order isn't mine, it's the bottleneck's

Notice what happened across those six steps. You never picked where to invest, the bottleneck told you. "How do I know it works" forces verification. "Wrong pattern again" forces the conventions doc. "Wrong thing entirely" forces the spec. "Too many PRs" forces review. Each layer you fix reveals the next one, which is why you can't jump ahead: the problem that justifies step five is invisible until step four is solved.

So the move isn't to build all six. It's to find the one place the work is blocked right now and fix that, because pouring effort into a layer that isn't the bottleneck buys you nothing you can measure. You build it up one layer at a time ([over months](/posts/maturity-not-complexity)) not in a weekend.

And there's one last bottleneck that catches everyone who gets this far, and it isn't technical. When you're releasing 10x the work, the thing that breaks first isn't the spec or the agent or the reviewer. It's keeping each task pointed at something that matters. 10x the output on the wrong thing is just 10x the waste. The planning habit that was fine at one PR a day doesn't survive ten, and that (not the tooling) is the bottleneck nobody budgets for.
