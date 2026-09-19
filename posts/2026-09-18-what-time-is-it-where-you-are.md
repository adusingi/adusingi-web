---
title: "What Time Is It Where You Are?"
date: 2026-09-18
description: "A clock app built in half an afternoon taught me the rule the serious version needed three months later, when eight people in four countries had to book time with me."
tags: ["ai", "build-in-public", "build-with-ai", "series"]
draft: false
---

I live in Japan, and almost nobody I work with does.

The people I teach are in Kigali, Lagos, Douala and Paris. The people who hire me are in France. I have family in Rwanda.

So every conversation starts with the same boring question: what time is it where you are?

Europe changes its clocks twice a year and East Africa never does, so Tokyo and Paris are seven hours apart in September and eight hours apart in November. Get the sum wrong and somebody sits alone in a video call, wondering whether you forgot them.

In June I stopped doing that sum.

## World Time

I built a small thing called World Time. Pick the cities you care about, see the same hour in all of them side by side, and choose the row where nobody has to wake up at four in the morning. No account, no server, no database — it runs in your browser and forgets you when you close it.

First commit at 16:57. Deploy config at 17:32. That was the whole first version, in half an afternoon.

👉 [World Time](https://meeting.mobayilo.com) — free, nothing to sign up for

That little app is also how I learned to work with AI — not through a tutorial that rebuilds somebody else's to-do list, but with a problem I already had and could finish in one sitting.

## Cohort 1

Three months later the same problem came back, bigger.

Cohort 1 of the academy started: eight people, eight weeks, the same four cities, and me in Tokyo. Some sessions are for everyone, because we need the same words for the same things before anybody starts building, and agentic development has a lot of words. The rest are one to one.

Email worked for the two group meetings. For eight separate hours, week after week, it would not — and no two weeks here look alike.

## The Booking Page

So the booking page now lives inside the academy. I type an hour in Tokyo, and before I save it the page shows me what that hour reads as in every one of those cities. I do not publish a slot I have not seen through their eyes. Each person sees the free hours and the one they hold, never anybody else's. The confirmation email is written in their hours, not Tokyo's, and the session puts itself into the calendar I work from.

It is not a public link — the page checks the cohort list first. Monday and Tuesday are public holidays in Japan, so those hours went up for one-to-ones.

Then the first test suite found three bugs I had never met by clicking around.

## So Why Tell You All This About a Clock App?

Because the small one was not a detour. It taught me the rule the serious one needed: never store what the clock on the wall says, only the exact moment in time.

You do not need an idea nobody has had. You need the thing you redo by hand every week. Build the smallest version that makes it stop, live with it, and let it tell you what to build next.

## What Do You Redo by Hand Every Week?

If you want to build it, bring it to a free 30-minute call.

👉 [Book a Discovery Call](https://tidycal.com/aimabled/1-on-1-ai-build-strategy-session-google-meet-10wrq0g) — 30 min, free, on Google Meet

---

*Originally published on LinkedIn, and adapted for this blog.*
