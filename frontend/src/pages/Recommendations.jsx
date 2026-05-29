import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fetchRecommendations } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import EventCard from '../components/EventCard'
import { Link } from 'react-router-dom'

const GENRES = ['Rock', 'Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'R&B', 'Metal', 'Classical']

export default function Recommendations() {
  const { session, user } = useAuth()
  const token = session?.access_token

  const [selectedGenres, setSelectedGenres] = useState([])
  const [city, setCity] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleGenre = (g) =>
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedGenres.length) return setError('Pick at least one genre.')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await fetchRecommendations({ genres: selectedGenres, city }, token)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to get recommendations.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 pt-16">
        <Sparkles size={40} className="text-gray-600" />
        <p className="text-gray-400">Sign in to get AI-powered recommendations.</p>
        <Link to="/auth" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full text-sm transition-colors">Sign in</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles size={24} className="text-purple-400" /> AI Picks
        </h1>
        <p className="text-gray-400 text-sm mb-8">Tell us your taste and let Gemini find what's on.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-10">
          <div>
            <p className="text-sm text-gray-300 mb-2">Your genres</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                    ${selectedGenres.includes(g)
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Your city (optional)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 max-w-xs"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium w-fit transition-colors"
          >
            <Sparkles size={15} /> {loading ? 'Generating…' : 'Get my picks'}
          </button>
        </form>

        {result && (
          <div>
            {result.blurb && (
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4 mb-8 text-sm text-gray-300 leading-relaxed">
                {result.blurb}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(result.events || []).map((event) => (
                <EventCard key={event.id} event={event} isFav={false} onToggleFav={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
