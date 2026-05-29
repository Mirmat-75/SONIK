/**
 * SONIK – API client
 * All calls proxied through /api → FastAPI backend.
 * Implements timeout + retry (L2 pattern from course).
 */

const BASE = import.meta.env.VITE_API_URL || '/api'
const TIMEOUT_MS = 10_000

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      return res.json()
    } catch (err) {
      clearTimeout(timer)
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Events ──────────────────────────────────────────────────────────────────
export async function fetchEvents({ keyword, genre, city, date } = {}) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  if (genre)   params.set('genre', genre)
  if (city)    params.set('city', city)
  if (date)    params.set('date', date)
  return fetchWithRetry(`${BASE}/events?${params}`)
}

export async function fetchEvent(id) {
  return fetchWithRetry(`${BASE}/events/${id}`)
}

// ── Favorites ────────────────────────────────────────────────────────────────
export async function fetchFavorites(token) {
  return fetchWithRetry(`${BASE}/favorites`, { headers: authHeaders(token) })
}

export async function addFavorite(eventId, token) {
  return fetchWithRetry(`${BASE}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ event_id: eventId }),
  })
}

export async function removeFavorite(eventId, token) {
  return fetchWithRetry(`${BASE}/favorites/${eventId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

// ── Recommendations ──────────────────────────────────────────────────────────
export async function fetchRecommendations({ genres, city }, token) {
  return fetchWithRetry(`${BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ genres, city }),
  })
}
