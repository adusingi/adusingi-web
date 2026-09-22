---
title: "More Than I Needed"
date: 2026-09-22
description: "Basecamp's open-source monitoring tool was the first software I ran in production without building it myself — and it was more than my apps needed, so I built the small version in Go."
tags: ["build-in-public", "golang", "open-source", "series"]
draft: false
---

I was paying for more infrastructure than I needed, just to answer three simple questions.

Are my apps online?

Are their security certificates about to expire?

Are my servers running out of space?

## Upright

Basecamp had open-sourced Upright, their monitoring tool, so I cloned it and deployed it. I was excited. It was the first time I had put a project I did not build myself into production.

The only problem was that Upright was powerful. It was built for companies operating at a very different scale from mine.

Basecamp has customers all over the world, and Upright is built for that. It drives real browsers to check a site the way a visitor sees it, and it asks for a machine to match: 2 GB of memory at the very least, 4 GB recommended.

For the apps I run, that was a big engine to keep warm.

| Upright | Indebero |
|---|---|
| 2 vCPU | 1 vCPU |
| 2 GB RAM | 512 MB |
| 25 GB disk | 10 GB |
| Docker + Kamal | one static binary |

Same three questions. Much smaller machine. So I stopped and questioned the whole plan.

What I actually needed was much smaller.

Can people reach the service?

Is a certificate close to expiry?

Is a server running out of memory or disk?

## The Small Version

Around that time, I was learning Go through a few projects, all of them on the command line. So I decided to build the small version in Go.

I called it Indebero. It means "monitor" in Kinyarwanda.

Where Upright asks for 2 GB of memory, Indebero asks for 512 MB. It runs as three processes — a web server, the Go program, and a database — using about 180 MB, operating system included.

Nothing new stays running on the servers it watches. A small script reports their memory and disk usage every five minutes, then exits.

## The Heartbeat

The summary it sends on a schedule is also its heartbeat. If the monitor itself dies, the message does not arrive.

The silence is the alert.

## Not a Story About Beating Basecamp

This is not a story about beating Basecamp. Upright does more than Indebero, and it should. It was built for a scale I do not have.

It was simply more than I needed.

I was not playing around. I was learning.

Running their software taught me what a monitor has to do. Building my own taught me what I could leave out.

## What Is the Biggest Tool You Run for a Small Job?

If you want to build the small version, bring it to a free 30-minute call.

👉 [Book a Discovery Call](https://tidycal.com/aimabled/1-on-1-ai-build-strategy-session-google-meet-10wrq0g) — 30 min, free, on Google Meet

---

*Originally published on LinkedIn, and adapted for this blog.*
