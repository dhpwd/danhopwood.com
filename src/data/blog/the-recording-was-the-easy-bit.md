---
title: "The recording was the easy bit"
description: "The fix for graveyard call transcripts isn't a better recorder. It's a pipeline that turns each transcript into agent-ready context the moment it lands."
pubDatetime: 2026-05-06T09:00:00Z
draft: true
tags: ["ai", "tools", "workflows"]
---

A transcript file lands in your inbox. You glance at it, think "I'll read that later", and never do. Most call transcripts die in someone's downloads folder, six minutes after the call ends.

The recorder I wrote about [last week](/posts/i-replaced-granola-in-2-hours) drops a markdown file into `~/call-transcripts/inbox/` after each call. On its own, that's not progress. A transcript sitting in a folder is data, not information.

## Most transcripts die in Notion

When I tell people I auto-record my calls, the next question is usually "where do they go?" For most people, the honest answer is: nowhere useful. The transcript gets dropped into a Notion page, an Apple Notes scratch file or the bottom of an email thread, on the assumption that they'll come back to it. They almost never do.

It's information that was true once, parked in a place where nothing reads it.

The problem isn't the transcript. The problem is the absence of a pipeline.

## What I run

Every call transcript that lands in `~/call-transcripts/inbox/` goes through three layers before it stops being raw material.

**Layer 1 – the recorder.** It drops a markdown file with minimal frontmatter: date, platform, meeting title, participants, duration, the Recall upload ID. That's the artefact.

**Layer 2 – the account-aware agent.** When I prompt my account assistant to "check the call inbox" before a session with a customer, it reads the raw transcript with the full account strategy already loaded into context. It classifies the call (`call_type: "discovery"`, `"audit-readout"`, `"check-in"`, and so on), tags it with the account name and domain, and resolves the generic Zoom-default title into the readable `{Account} – {Call type}` format. The output is a distilled interaction note in the account folder.

**Layer 3 – the archive.** The raw transcript moves from `inbox/` to `archive/`. The interaction note – a structured summary keyed to the account – becomes the historical record. Action items extracted from the call go into the account's working notes, where they surface the next time I sit down to plan.

<!-- ![A call transcript file with enriched frontmatter showing account, account_domain, call_type and resolved meeting_title fields](../../assets/images/recall-recorder-frontmatter.png) -->

The recorder produces an artefact. The pipeline produces context.

## Frontmatter is the leverage

The trick is the frontmatter.

A transcript with the account name, domain and call type populated, plus a properly resolved title, isn't just a transcript any more. It's a row in a queryable table that didn't exist before the call.

I never built a search system. I just classified at source, so when I want every discovery call with a particular customer this quarter, or the most recent audit-readout, or every commercial call across all accounts since January, my agent can find them in seconds.

This is the move data engineers have been making for a decade: when you want a system to be useful at scale, you classify at source. If the metadata isn't there when the artefact is created, retrofitting it later is always more expensive than capturing it at the moment the call ends.

The same discipline applies to call transcripts.

## Three layers of the same idea

Step back and what's happening is a familiar pattern, just at a different scale.

- **Raw transcript = data.** A faithful record. Useful in theory, almost never reread in practice
- **Distilled interaction note = information.** A condensed, account-contextualised summary. The agent has interpreted the call against everything it knows about the customer's strategy, decisions and history
- **Account context update = intelligence.** What changed because of this call: shifts in priority, new objections, decisions made. This is the layer that drives what I do next

The same agent does all three steps, but the artefacts are distinct. Each layer has a different shelf life and a different purpose. Confuse them and the pipeline collapses back into the Notion-page graveyard.

If this sounds like a warehouse pattern – source data, conformed model, semantic layer – it's because it is. The same discipline, applied at a different scale.

## Same problem, different scale

The thing I keep noticing is that most of the unsolved problems in working with AI agents are old problems in fresh clothes.

Speaker attribution in AI tooling is the same identity-stitching problem data engineers have wrestled with for a decade. Context bloat is schema design under another name. Agents losing track between sessions is the textbook stateless-system problem. Every one of these has been solved before in data infrastructure, and every one is being solved-again by AI tooling vendors who haven't read the previous decade's lessons.

The pipeline I run on call transcripts isn't novel. It's the cheapest version of a discipline that has run in every well-built data team I've ever worked with: capture cleanly, classify at source, archive deliberately, surface what changed.

The recorder was easy because Recall's SDK does most of the work. The pipeline is harder, but only because most people skip it.

Build the pipeline. The tool is replaceable.
