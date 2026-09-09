---
title: "AI Will Stop You From Learning"
date: 2026-09-09
description: "A missed email multiplied our AWS bill by four. Fixing it became the deepest learning week of my year — and the AI never touched the server."
tags: ["ai", "aws", "learn-in-public", "build-with-ai"]
draft: false
---

I have learned more about software since AI than in all the years before it.

Here is this week.

I build and maintain the application for the company I work for. I am also in charge of our AWS.

I had no AWS experience. None. I learned it step by step with the old ChatGPT, and I took it over. I do not call myself a DevOps engineer. But I run the infrastructure of a medium-size company.

## The Bill

We opened the monthly bill. It had multiplied by four.

AWS had written to us. MySQL 8.0 was reaching the end of its support, and we should move to 8.4. We missed the email.

Four times the bill. That was the price of a missed email.

## The Upgrade

This week I did it. MySQL 8.4.11, in pair with GPT-5.6 sol.

I did not give the AI access to my server. That risk is not acceptable, and it is not necessary.

So:

1. I created a separate account, with an IAM policy that allows a short list of actions. Nothing else.
2. I asked for a plan before I asked for a command. A detailed one. No surprises.
3. I cut the plan into steps. Run one step. Observe. Validate. Then the next one.

Step three is where the learning is. Every step gave me something I could check with my own eyes. If I cannot verify it, I have not learned it. I have only copied it.

## What I Actually Learned

Anyone can tell you to take a backup.

A backup you have never restored is not a backup. It is a hope.

That is the distance between knowing the word and doing the work. I crossed a lot of that distance this week.

## So, Does AI Stop You From Learning?

The AI had no access to my server. It could not do the work for me.

What it did was answer my second question. Then my third. Then my tenth. At the moment I had it, on a real system, with a real bill attached.

No course does that. Mine included.

I asked the model one last thing: take everything we did and turn it into a lesson. It is on the academy now, free — least-privilege IAM, the golden backup, restore testing that proves something, and the upgrade itself written up step by step.

👉 [Agentic Backup and Recovery on Mobayilo Academy](https://academy.mobayilo.com/learn/infrastructure/devops-reliability) — free, no sign-up

A course cannot answer your tenth question. But it can save you the email you are about to miss.

AI did not replace my learning. It removed what used to stand between me and it.

## Do You Want to Learn This Way, on Your Own Project?

Book a free 30-minute call. Bring the thing you are afraid to touch.

👉 [Book a Discovery Call](https://tidycal.com/aimabled/1-on-1-ai-build-strategy-session-google-meet-10wrq0g) — 30 min, free, on Google Meet

---

*Originally published on LinkedIn, and adapted for this blog.*
