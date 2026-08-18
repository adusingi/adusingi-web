import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadPhotos, renderGrid, type Photo } from '../src/lib/photography'

const localPhoto = {
  src: '/photos/existing.jpg',
  caption: 'Existing photo',
  place: 'Okayama, JP',
  alt: 'Existing alt',
}

const remotePhoto = {
  id: 'a'.repeat(64),
  src: `https://files.mobayilo.com/${'a'.repeat(64)}-display.webp`,
  thumbnailSrc: `https://files.mobayilo.com/${'a'.repeat(64)}-portfolio-thumb.webp`,
  caption: 'New publication',
  place: 'Setouchi, JP',
  alt: 'A harbour at sunrise',
  category: 'ushimado',
  publishedAt: '2026-08-18T10:00:00.000Z',
}

function jsonResponse(body: unknown, ok = true): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 503,
    headers: { 'Content-Type': 'application/json' },
  })
}

function feed(photos: unknown[]): Response {
  return jsonResponse({ success: true, data: { photos } })
}

describe('photography feed integration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('places valid remote publications before the unchanged local manifest order', async () => {
    const secondLocal = { ...localPhoto, src: '/photos/second.jpg', caption: 'Second local' }
    const fetcher = vi.fn(async (url: string) => {
      if (url === '/photos/photos.json') return jsonResponse([localPhoto, secondLocal])
      return feed([remotePhoto])
    })

    const photos = await loadPhotos(fetcher)

    expect(photos.map((photo) => photo.caption)).toEqual([
      'New publication',
      'Existing photo',
      'Second local',
    ])
    expect(photos[1].thumbnailSrc).toBe('/photos/existing.jpg')
    expect(fetcher).toHaveBeenCalledWith(
      'https://files.mobayilo.com/api/portfolio',
      expect.objectContaining({ cache: 'no-cache', signal: expect.any(AbortSignal) }),
    )
  })

  it('renders every local photo when the remote feed is unavailable', async () => {
    const fetcher = vi.fn(async (url: string) => {
      if (url === '/photos/photos.json') return jsonResponse([localPhoto])
      throw new Error('feed unavailable')
    })

    await expect(loadPhotos(fetcher)).resolves.toEqual([
      { ...localPhoto, thumbnailSrc: localPhoto.src },
    ])
  })

  it('ignores malformed or untrusted remote records without affecting local photos', async () => {
    const fetcher = vi.fn(async (url: string) => {
      if (url === '/photos/photos.json') return jsonResponse([localPhoto])
      return feed([
          { ...remotePhoto, src: 'https://evil.example/photo.webp' },
          { ...remotePhoto, caption: 42 },
      ])
    })

    const photos = await loadPhotos(fetcher)
    expect(photos).toEqual([{ ...localPhoto, thumbnailSrc: localPhoto.src }])
  })

  it('uses thumbnails in the flat grid and inserts remote text safely', () => {
    const grid = document.createElement('div')
    const malicious: Photo = {
      ...remotePhoto,
      caption: '<img src=x onerror=alert(1)>',
      alt: '<script>alert(1)</script>',
    }

    renderGrid(grid, [malicious])

    const image = grid.querySelector('img')
    expect(grid.children).toHaveLength(1)
    expect(image?.src).toBe(remotePhoto.thumbnailSrc)
    expect(image?.alt).toBe('<script>alert(1)</script>')
    expect(grid.querySelector('script')).toBeNull()
    expect(grid.innerHTML).not.toContain('onerror=')
  })

  it('stops waiting for a stalled remote feed and returns the local gallery', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn((url: string) => {
      if (url === '/photos/photos.json') return Promise.resolve(jsonResponse([localPhoto]))
      return new Promise<Response>(() => undefined)
    })

    const photosPromise = loadPhotos(fetcher)
    await vi.advanceTimersByTimeAsync(3000)

    await expect(photosPromise).resolves.toEqual([{ ...localPhoto, thumbnailSrc: localPhoto.src }])
    vi.useRealTimers()
  })
})
