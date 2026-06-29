// Photography gallery — contact-sheet grid with a full-screen lightbox slider.
// Photos are read from /photos/photos.json (see public/photos/README.md for how
// to add one). This manual manifest is the interim source; the admin upload +
// Minio/Postgres phase will replace the manifest with a generated/served list.

import './style.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';

interface Photo {
  /** Path under /public, e.g. "/photos/rice-terrace.jpg". */
  src: string;
  /** Short caption shown in the lightbox. */
  caption: string;
  /** Place/date label, e.g. "Okayama, JP". */
  place: string;
  /** Optional alt text; falls back to caption. */
  alt?: string;
}

function isPhoto(value: unknown): value is Photo {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.src === 'string' && typeof p.caption === 'string' && typeof p.place === 'string';
}

async function loadPhotos(): Promise<Photo[]> {
  const res = await fetch('/photos/photos.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`photos.json ${res.status}`);
  const data: unknown = await res.json();
  return Array.isArray(data) ? data.filter(isPhoto) : [];
}

function renderGrid(grid: HTMLElement, photos: Photo[]): void {
  grid.innerHTML = photos
    .map(
      (p, i) => `
      <button data-index="${i}" class="group relative aspect-square overflow-hidden bg-ink/5" aria-label="Open photo ${i + 1}">
        <img src="${p.src}" alt="${p.alt ?? p.caption}" loading="lazy"
          class="w-full h-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-90" />
        <span class="absolute top-2 left-2 text-[11px] font-mono text-paper/0 group-hover:text-paper transition">${String(
          i + 1,
        ).padStart(2, '0')}</span>
      </button>`,
    )
    .join('');
}

function createLightbox(photos: Photo[]): { open: (i: number) => void } {
  const box = document.getElementById('lightbox');
  const imgEl = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const capEl = document.getElementById('lightbox-cap');
  const countEl = document.getElementById('lightbox-count');
  if (!box || !imgEl || !capEl || !countEl) return { open: () => {} };

  let index = 0;
  const isOpen = (): boolean => !box.classList.contains('hidden');

  const show = (i: number): void => {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    imgEl.src = p.src;
    imgEl.alt = p.alt ?? p.caption;
    capEl.textContent = `${p.caption} · ${p.place}`;
    countEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  };
  const open = (i: number): void => {
    show(i);
    box.classList.remove('hidden');
    box.classList.add('flex');
  };
  const close = (): void => {
    box.classList.add('hidden');
    box.classList.remove('flex');
  };

  document.getElementById('lightbox-close')?.addEventListener('click', close);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => show(index - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => {
    if (e.target === box) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Escape') close();
  });

  return { open };
}

async function init(): Promise<void> {
  const grid = document.getElementById('photo-grid');
  const empty = document.getElementById('photo-empty');
  if (!grid) return;

  let photos: Photo[] = [];
  try {
    photos = await loadPhotos();
  } catch {
    photos = [];
  }

  if (photos.length === 0) {
    empty?.classList.remove('hidden');
    return;
  }

  renderGrid(grid, photos);
  const lightbox = createLightbox(photos);
  grid.querySelectorAll<HTMLButtonElement>('[data-index]').forEach((btn) =>
    btn.addEventListener('click', () => lightbox.open(Number(btn.dataset.index))),
  );
}

void init();
