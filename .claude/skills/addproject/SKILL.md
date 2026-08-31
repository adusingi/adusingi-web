---
name: addproject
description: Add a project to the Selected Work list on adusingi.com, using the facts already recorded in the mobayilo-business portfolio register. Use when asked to put a project on the site, add something to Selected Work, or list a new build on the portfolio.
---

# Add a project to Selected Work

Input: a project — a repo name, a live URL, or just its name.
Output: one entry in "01 — Selected Work" on `www.adusingi.com`, after the owner
approves the deploy.

## 0. Work in the site repo

This skill is reachable from any directory, but every command below runs in the
`adusingi-web` repo:

```bash
cd ~/Documents/Code/p/adusingi-web
```

The facts come from a second repo, `mobayilo-business`. Read them there; write only
here.

## 1. Read the register, not the product repo

The portfolio register is the source of truth for what a project is, what it is
called, and whether it may be shown:

```bash
BIZ=~/Documents/Code/p/mobayilo-business
cat $BIZ/portfolio/projects/<name>.md
```

No entry means the project has not been recorded yet. **Stop and ask the owner to run
`/biz update <name>` first** — do not invent the facts here. The register is where
they belong, and this list is downstream of it.

## 2. Refuse to list a broken or unfit URL

Two checks, both blocking. A dead link on the portfolio is worse than an absent
project.

**The URL must work, and it must be the host the site itself claims.** Follow
redirects, then read the site's own `og:url` — list that host, not the one you were
handed:

```bash
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L https://<host>
curl -s -L https://<host> | grep -oE 'og:url[^>]*content="[^"]*"' | head -1
```

Apex and `www` often both answer 200 while only one is canonical, and the register may
record either — Doko Maps is listed as `www.dokomaps.com` because its own `og:url` says
so. Trust the site over the register on the host, and fix the register if they differ.

**A 200 is not enough — look at what it serves.** A sign-in wall answers 200, and so
does a single-page shell for a page that does not exist. `files.mobayilo.com` is
deliberately absent from Selected Work for exactly this reason: the root serves a
locked door. Read the page text before believing the status code.

**The register's `status` must be `live` or `active`.** Never list `paused`,
`dormant`, or `discontinued` — the owner does not want to be asked about a project he
stopped. If the owner asks for one anyway, say which status it carries and let him
decide.

## 3. Write the block

Copy the shape from the entry above the insertion point. Every entry is the same
eleven lines: link, name, category tag, one sentence.

- **The description is one sentence, in the product's own voice.** Prefer adapting the
  live site's hero copy over writing marketing prose — it is how the product describes
  itself, and it is already approved.
- **The category tag is lowercase, one or two words, joined with ` · `.** Reuse what
  the list already uses before coining a new one:

```bash
grep -oE 'shrink-0">[^<]*<' index.html | sed 's/shrink-0">//; s/<//' | sort -u
```

## 4. Mobayilo is pinned — insert directly below it

**Mobayilo stays first. A new project goes immediately below its block**, not above
it and not appended at the end. Owner rule, 2026-08-31. The markup carries the same
note at the insertion point:

```html
<!-- ^ pinned first · new projects go here, immediately below ^ -->
```

Do not reorder Mobayilo, and do not move that comment.

## 5. Report the drift

The register and this list drift apart silently — nothing keeps them in step. Run
this every time and report what it finds, even when the owner only asked for one
project:

```bash
python3 - <<'EOF'
import pathlib, re
biz = pathlib.Path.home()/"Documents/Code/p/mobayilo-business/portfolio/projects"
reg = {}
for f in sorted(biz.glob("*.md")):
    fm = f.read_text().split("---")[1]
    g = lambda k: (re.search(rf'^{k}:\s*(.+)$', fm, re.M) or [None, ""])[1].strip().strip('"')
    reg[f.stem] = (g("status"), g("url"))
site = re.findall(r'<a href="([^"]+)"[^>]*>.*?<h3[^>]*>([^<]+)</h3>',
                  open("index.html").read().split("01 — Selected Work")[1].split("</section>")[0], re.S)
norm = lambda u: u.rstrip("/").replace("https://www.", "https://")
urls = {norm(u) for u, _ in site}
print("on the site but not live/active in the register:")
for u, n in site:
    hit = [s for s, (st, ru) in reg.items() if ru and norm(ru) == norm(u)]
    st = reg[hit[0]][0] if hit else "NOT IN REGISTER"
    if st not in ("live", "active"):
        print(f"  {n} — {st}")
print("live/active in the register but not on the site:")
for s, (st, ru) in reg.items():
    if st in ("live", "active") and ru and norm(ru) not in urls:
        print(f"  {s} — {ru}")
EOF
```

Report both lists as findings, not as work to do. Adding or removing an entry is the
owner's call — some absences are deliberate (a sign-in wall, the site itself).

## 6. Build and check

```bash
pnpm build
pnpm test:run
pnpm preview --port 4321
```

Confirm the order on the built page, not in the source file:

```bash
curl -s http://localhost:4321/ | grep -oE '<h3[^>]*>[^<]*</h3>' | sed 's/<[^>]*>//g' | head -4
```

## 7. Deploy

Commit on a `content/<slug>` branch cut from `development`. Hand over the preview URL
and ask for approval — `CLAUDE.md` requires explicit consent before any deploy.

On approval: merge into `development`, merge `development` into `main`, push both.
Vercel builds from `main` in under a minute.

**Verify against the rendered list, never a status code.** `/` answers 200 throughout
the build, so a status check passes while the old page is still being served:

```bash
for i in $(seq 1 15); do
  curl -s "https://www.adusingi.com/?cb=$i" | grep -oE '<h3[^>]*>[^<]*</h3>' |
    sed 's/<[^>]*>//g' | head -2 | tr '\n' ' '; echo
  sleep 10
done
```

Stop when the new name appears second. Then ask whether to delete the branch.
