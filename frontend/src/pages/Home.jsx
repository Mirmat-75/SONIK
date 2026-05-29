import { Link } from 'react-router-dom'
import { Music2, Search, Heart, Sparkles } from 'lucide-react'

const features = [
  { icon: Search, label: 'Discover Events', desc: 'Browse concerts, festivals & showcases near you in real time.' },
  { icon: Heart, label: 'Save Favorites', desc: 'Bookmark events and access them anytime from your profile.' },
  { icon: Sparkles, label: 'AI Picks', desc: 'Get personalized recommendations powered by Gemini AI.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-40 pb-24 gap-6">
        <div className="flex items-center gap-2 text-purple-300 text-sm font-medium tracking-widest uppercase">
          <Music2 size={16} /> Your music world, unified
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Find your next <span className="text-purple-400">live experience</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          SONIK aggregates music events from across the web so you never miss a show that matters.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            to="/events"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Browse Events
          </Link>
          <Link
            to="/auth"
            className="border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-full transition-colors"
          >
            Create account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-32 grid md:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-purple-300" />
            </div>
            <h3 className="font-semibold text-white">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
