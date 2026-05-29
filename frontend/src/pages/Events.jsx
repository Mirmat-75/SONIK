import { useState, useEffect, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import EventCard from '../components/EventCard'
import { fetchEvents, addFavorite, removeFavorite, fetchFavorites } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const GENRES = ['Rock', 'Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'Classical', 'R&B', 'Metal']

export default function Events() {
  const { session } = useAuth()
  const token = session?.access_token

  const [events, setEvents] = useState([])
  const [favIds, setFavIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [keyword, setKeyword] = useState('')
  const [genre, setGenre] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEvents({ keyword, genre, city, date })
      setEvents(data.events || [])
    } catch (e) {
      setError(e.message || 'Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [keyword, genre, city, date])

  useEffect(() => { loadEvents() }, [])   // initial load (no filters)

  useEffect(() => {
    if (!token) return
    fetchFavorites(token).then((d) => setFavIds(new Set((d.favorites || []).map((f) => f.event_id))))
  }, [token])

  const handleSearch = (e) => {
    e.preventDefault()
    loadEvents()
  }

  const toggleFav = async (eventId) => {
    if (!token) return alert('Sign in to save favorites!')
    const isFav = favIds.has(eventId)
    if (isFav) {
      await removeFavorite(eventId, token)
      setFavIds((prev) => { const s = new Set(prev); s.delete(eventId); return s })
    } else {
      await addFavorite(eventId, token)
      setFavIds((prev) => new Set([...prev, eventId]))
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Discover Events</h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Artist, event name…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-36"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Filter size={15} /> Search
          </button>
        </form>

        {/* States */}
        {loading && <p className="text-gray-400 text-sm">Loading events…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Grid */}
        {!loading && events.length === 0 && !error && (
          <p className="text-gray-500 text-sm">No events found. Try different filters.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isFav={favIds.has(event.id)}
              onToggleFav={toggleFav}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
