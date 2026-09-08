---
title: "The runbook was right and nearly every detail was wrong"
description: "Six research agents designed my cloud agent box. The architecture survived the build untouched. The host, the phone app and eleven secrets didn't – and the worst failures never errored."
pubDatetime: 2026-09-17T08:00:00Z
draft: true
tags: ["claude-code", "agentic-coding", "ai"]
---

<!-- OUTLINE – not a draft. Why → how → what. Follows _cloud-box.md and links to it for the stack – no re-explaining the setup. 80/20: five or six failures told properly, the rest left out entirely, not summarised. -->

## Why (~150 words)

- Trigger: the morning after the research. Runbook in hand, price re-verified, first command is the Hetzner order – and every tier in every EU location reports no stock. Their status page has had an incident open for 65 days. Vendor gone before the first command ran
- The claim, stated once: a runbook written from research is a hypothesis. This one's architecture (Tailscale, mosh, tmux, git-backed config, cloud-primary) survived the build untouched. Almost none of its specifics did – host, OS, CPU architecture, phone app, half the counts
- Why that matters beyond my box: agents will write more of your runbooks, specs and plans from research. The interesting question isn't whether they're wrong – they will be – it's which way they fail

## How it failed (~450 words)

**Loudly, mostly – and that was fine.** One paragraph, a list of three or four: Playwright wanted a Chrome that wasn't installed, the phone app's disqualifier was false (Termius does support mosh – its docs say so), the runbook's own pricing was stale within the day. Every one obvious within seconds of running, fixed in minutes. That's the mode you want.

**Silently, a few times – and that's the mode to design against.** Each told as a short story, one mechanism, one number:

1. **Eleven secrets wrote themselves blank.** `op read` on a field that existed but was empty returns nothing with exit code 0. The setup script's fallback tested the exit code. So did the pre-flight check written to catch exactly this. Two layers of verification checked the wrong thing and reported eleven of eleven present. The servers failed later with an unrelated-looking OAuth error. Fix is one line: test the value, not the exit code
2. **The hardening that hardened nothing.** sshd locked down: no root, no passwords, one allowed user. Immediately afterwards `tailscale ssh root@box` returned root. Tailscale SSH is its own listener and never consults sshd's config – their docs say so. Default tailnet policy: any device authenticated in the last 12 hours is root. The control was the tailnet policy, not sshd. Perimeter strong, nothing behind it
3. **The hook that had never run.** `pre-commit install` sat after a `cd` at the end of the clone script, so one repo in five got a hook. The formatter it calls was never installed either, and the hook exits 1 when it's missing – it would have aborted every unattended commit rather than skipping. The skill that plants that config promised the opposite. Two faults, both invisible until the first commit
4. **The identity that was never anywhere.** The box had no git identity, in any file, and never had. An agent that can't commit doesn't stop – it improvises: `-c user.name` on the command line, a repo-local `[user]` under a different name. Found four days later as inconsistent authorship, not as an error
5. **The rebuild that comes "entirely from git" – except the parts that don't.** `~/.gitconfig` sits outside every repo, so a dozen settings didn't travel. Nine repos cloned, none with `node_modules` installed. Nothing failed for nine days because nothing had needed them. A rebuild would have reproduced the gap exactly
6. **The fix that reaches nothing already running.** Every shell-level change – theme, aliases, `DISPLAY` for image paste – only reached processes started after it. The test spawned a fresh process and passed. The panes I actually use had been running for days. tmux's persistence is the thing that makes this happen, and a fresh-process test can't detect it. Happened four times before it was handled

## What to take from it (~200 words)

- Sort by failure mode, not by severity. Loud failures are cheap however many there are. Silent ones are the ones a runbook, a spec or a pipeline should be designed around
- Concrete habits, each one line: test values not exit codes. When you record an unknown, don't record a guessed cause with it – the next session inherits the guess (the phone scrollback case: three suspects, all wrong, the session sent to fix it started from them). Test in the process you actually use, not a fresh one. "Rebuild from git" is a claim to verify by rebuilding
- Docs versus lived experience, one beat: three research claims (calendar tokens expire weekly, WhatsApp drops every 20 days, the phone app can't see background sessions) contradicted by months of use – the last one while I was looking at the session on my phone. Docs describe a system; use describes yours
- Territory bridge, once, plainly: this is the same failure mode I spend my working life on in customer data – dashboards green, events flowing, half of them empty. Same discipline applies. Then end on the last concrete point. No kicker

## Cut list

OSC 52 / `tiparm_s`, the theme mechanism's three wrong explanations, Kitesurf, Agent SDK, Hetzner vs Netcup pricing detail, the sweep alias, npm/pnpm version strictness, the Slack connector. All true, all weeds.
