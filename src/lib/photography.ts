import { z } from 'zod'

const LOCAL_MANIFEST = '/photos/photos.json'
const REMOTE_FEED = 'https://files.mobayilo.com/api/portfolio'
const REMOTE_TIMEOUT_MS = 3000

export interface Photo {
  src: string
  thumbnailSrc: string
  caption: string
  place: string
  alt?: string
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>

const BasePhotoSchema = z.object({
  src: z.string(),
  caption: z.string(),
  place: z.string(),
  alt: z.string().optional(),
})
const TrustedFilesUrlSchema = z.string().url().refine((value) => {
  const url = new URL(value)
  return url.protocol === 'https:' && url.hostname === 'files.mobayilo.com' && url.port === ''
})
const RemotePhotoSchema = BasePhotoSchema.extend({
  src: TrustedFilesUrlSchema,
  thumbnailSrc: TrustedFilesUrlSchema,
})
const RemoteEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.object({ photos: z.array(z.unknown()) }),
})

function localPhoto(value: unknown): Photo | null {
  const parsed = BasePhotoSchema.safeParse(value)
  if (!parsed.success) return null
  return {
    ...parsed.data,
    thumbnailSrc: parsed.data.src,
  }
}

function remotePhoto(value: unknown): Photo | null {
  const parsed = RemotePhotoSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

async function loadLocalPhotos(fetcher: Fetcher): Promise<Photo[]> {
  try {
    const response = await fetcher(LOCAL_MANIFEST, { cache: 'no-cache' })
    if (!response.ok) return []
    const value: unknown = await response.json()
    return Array.isArray(value) ? value.map(localPhoto).filter((photo): photo is Photo => photo !== null) : []
  } catch {
    return []
  }
}

async function loadRemotePhotos(fetcher: Fetcher, signal: AbortSignal): Promise<Photo[]> {
  try {
    const response = await fetcher(REMOTE_FEED, { cache: 'no-cache', signal })
    if (!response.ok) return []
    const value: unknown = await response.json()
    const envelope = RemoteEnvelopeSchema.safeParse(value)
    if (!envelope.success) return []
    return envelope.data.data.photos.map(remotePhoto).filter((photo): photo is Photo => photo !== null)
  } catch {
    return []
  }
}

async function loadRemoteWithinTimeout(fetcher: Fetcher): Promise<Photo[]> {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<Photo[]>((resolve) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      resolve([])
    }, REMOTE_TIMEOUT_MS)
  })
  try {
    return await Promise.race([loadRemotePhotos(fetcher, controller.signal), timeout])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

export async function loadPhotos(fetcher: Fetcher = fetch): Promise<Photo[]> {
  const [remote, local] = await Promise.all([loadRemoteWithinTimeout(fetcher), loadLocalPhotos(fetcher)])
  return [...remote, ...local]
}

function photoButton(photo: Photo, index: number): HTMLButtonElement {
  const button = document.createElement('button')
  button.dataset.index = String(index)
  button.className = 'group relative aspect-square overflow-hidden bg-ink/5'
  button.setAttribute('aria-label', `Open photo ${index + 1}`)

  const image = document.createElement('img')
  image.src = photo.thumbnailSrc
  image.alt = photo.alt ?? photo.caption
  image.loading = 'lazy'
  image.className = 'w-full h-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-90'

  const number = document.createElement('span')
  number.className = 'absolute top-2 left-2 text-[11px] font-mono text-paper/0 group-hover:text-paper transition'
  number.textContent = String(index + 1).padStart(2, '0')
  button.append(image, number)
  return button
}

export function renderGrid(grid: HTMLElement, photos: Photo[]): void {
  grid.replaceChildren(...photos.map(photoButton))
}

function createLightbox(photos: Photo[]): { open: (index: number) => void } {
  const box = document.getElementById('lightbox')
  const imageElement = document.getElementById('lightbox-img')
  const image = imageElement instanceof HTMLImageElement ? imageElement : null
  const caption = document.getElementById('lightbox-cap')
  const count = document.getElementById('lightbox-count')
  if (!box || !image || !caption || !count) return { open: () => undefined }

  let index = 0
  const isOpen = (): boolean => !box.classList.contains('hidden')
  const show = (next: number): void => {
    index = (next + photos.length) % photos.length
    const photo = photos[index]
    image.src = photo.src
    image.alt = photo.alt ?? photo.caption
    caption.textContent = `${photo.caption} · ${photo.place}`
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`
  }
  const open = (next: number): void => {
    show(next)
    box.classList.remove('hidden')
    box.classList.add('flex')
  }
  const close = (): void => {
    box.classList.add('hidden')
    box.classList.remove('flex')
  }

  document.getElementById('lightbox-close')?.addEventListener('click', close)
  document.getElementById('lightbox-prev')?.addEventListener('click', () => show(index - 1))
  document.getElementById('lightbox-next')?.addEventListener('click', () => show(index + 1))
  box.addEventListener('click', (event) => { if (event.target === box) close() })
  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return
    if (event.key === 'ArrowLeft') show(index - 1)
    if (event.key === 'ArrowRight') show(index + 1)
    if (event.key === 'Escape') close()
  })
  return { open }
}

export async function initPhotography(fetcher: Fetcher = fetch): Promise<void> {
  const grid = document.getElementById('photo-grid')
  const empty = document.getElementById('photo-empty')
  if (!grid) return

  const photos = await loadPhotos(fetcher)
  if (photos.length === 0) {
    empty?.classList.remove('hidden')
    return
  }

  renderGrid(grid, photos)
  const lightbox = createLightbox(photos)
  grid.querySelectorAll<HTMLButtonElement>('[data-index]').forEach((button) => {
    button.addEventListener('click', () => lightbox.open(Number(button.dataset.index)))
  })
}
