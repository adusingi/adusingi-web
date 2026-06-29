# Adding photos to /photography

The gallery reads this folder's `photos.json` at page load. Until the admin upload
(Minio + Postgres) ships, this is how you add a photo — by hand, in two steps.

## 1. Drop the image file in this folder

Put your image in `public/photos/`, e.g.:

```
public/photos/rice-terrace.jpg
```

Tips:
- Square-ish crops look best (the grid shows them as squares; the lightbox shows the full image).
- Keep files reasonably sized (long edge ~1600px, < ~500 KB) so the page stays fast.

## 2. Add an entry to `photos.json`

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

## Note

The four entries currently in `photos.json` use `picsum.photos` placeholder URLs so the
page renders out of the box. **Delete them and add your own** — they require internet to
load and are not real photos.
