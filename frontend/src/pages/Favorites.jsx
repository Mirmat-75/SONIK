import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { fetchFavorites, fetchEvent, removeFavorite } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import EventCard from '../components/EventCard'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const { session, user } = useAuth()
  const token = session?.access_token
  const [events, setEvents] = useState([])
  const [favIds, setFavIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const data = await fetchFavorites(token)
      const ids = (data.favorites || []).map((f) => f.event_id)
      setFavIds(new Set(ids))
      // Fetch event details in parallel
      const results = await Promise.allSettled(ids.map((id) => fetchEvent(id)))
      setEvents(results.filter((r) => r.status === 'fulfilled').map((r) => r.value))
      setLoading(false)
    }
    load()
  }, [token])

  const toggleFav = async (eventId) => {
    await removeFavorite(eventId, token)
    setFavIds((prev) => { const s = new Set(prev); s.delete(eventId); return s })
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 pt-16">
        <Heart size={40} className="text-gray-600" />
        <p className="text-gray-400">Sign in to see your saved events.</p>
        <Link to="/auth" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full text-sm transition-colors">
          Sign in
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Heart size={24} className="text-red-400" /> My Favorites
        </h1>
        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-3">No favorites yet.</p>
            <Link to="/events" className="text-purple-400 hover:underline text-sm">Browse events →</Link>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isFav={favIds.has(event.id)} onToggleFav={toggleFav} />
          ))}
        </div>
      </div>
    </main>
  )
}
