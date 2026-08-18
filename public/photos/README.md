---
type: Operating Guide
title: Adding photos to the photography page
description: Explains the preserved local manifest workflow and the automatic Files publication workflow.
tags: [photography, photos, portfolio]
timestamp: 2026-08-18T20:46:08+09:00
---

# Adding photos to /photography

The gallery keeps this folder's `photos.json` as the source for the existing
collection. New photos can be published automatically from Files, while this
manual workflow remains supported and unchanged.

## Automatic publication from Files

Upload photos through the private PWA at <https://files.mobayilo.com>, add the
`#portfolio` tag, and supply each photo's caption and place. Complete tagged
entries appear before the local manifest without a repository edit or site
deployment. If the Files feed is unavailable, this local manifest still
renders normally.

## Manual publication

### 1. Drop the image file in this folder

Put your image in `public/photos/`, e.g.:

```
public/photos/rice-terrace.jpg
```

Tips:
- Square-ish crops look best (the grid shows them as squares; the lightbox shows the full image).
- Keep files reasonably sized (long edge ~1600px, < ~500 KB) so the page stays fast.

### 2. Add an entry to `photos.json`

`photos.json` is a list, **newest first** (top of the list shows first in the grid):

```json
[
  {
    "src": "/photos/rice-terrace.jpg",
    "caption": "Morning over the rice terraces",
    "place": "Okayama, JP",
    "alt": "Rice terraces at dawn"
  }
]
```

| Field     | Required | Notes |
|-----------|----------|-------|
| `src`     | yes      | Path under the site root. A local file here is `/photos/<filename>`. An external URL also works. |
| `caption` | yes      | Shown in the lightbox. |
| `place`   | yes      | Place/date label, e.g. `Okayama, JP`. |
| `alt`     | no       | Accessibility/SEO text. Falls back to `caption` if omitted. |

Save, refresh `/photography`, and the photo appears.

## Notes

Drop full-size originals anywhere outside `public/` (the repo keeps yours in the
gitignored `photos-originals/`). The files committed here are already resized to ~1600px
and compressed for the web.

Do not migrate or remove existing entries merely because automatic
publication is available; the two sources are deliberately merged at runtime.
