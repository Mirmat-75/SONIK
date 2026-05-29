import { Heart } from 'lucide-react'

export default function EventCard({ event, isFav, onToggleFav }) {
  const fallback = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80'

  return (
    <article className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image_url || fallback}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = fallback }}
        />
        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleFav(event.id) }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors
            ${isFav ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white/70 hover:text-red-400'}`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        {/* Genre badge */}
        {event.genre && (
          <span className="absolute bottom-3 left-3 text-xs bg-purple-600/90 text-white px-2 py-0.5 rounded-full">
            {event.genre}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-1">
          {event.title}
        </h3>
        {event.artist && (
          <p className="text-purple-300 text-xs mb-2">{event.artist}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{event.city || event.location || 'TBA'}</span>
          <span>{event.date ? new Date(event.date).toLocaleDateString('en-CA') : 'TBA'}</span>
        </div>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-full py-1.5 transition-colors"
          >
            Get tickets →
          </a>
        )}
      </div>
    </article>
  )
}
