import { Star, MapPin, Calendar, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, formatPrice } from '../utils/helpers'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop'

export default function EventCard({ event, onClick }) {
  const metadata = event.metadata || {}
  const title = event.title || event.name
  const startTime = event.start_time || event.date
  const rating = event.rating || 4.5
  const attendees = event.attendees || Math.floor(Math.random() * 5000) + 100
  const thumbnailUrl = metadata.thumbnail_url || event.image || FALLBACK_IMAGE

  return (
    <Link to={`/events/${event.id}`}>
      <div className="card-hover p-0 overflow-hidden h-full">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {event.featured && (
            <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            {metadata.category || event.category || 'Event'}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
            {title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {metadata.description || event.description || 'View event details and available seats.'}
          </p>

          <div className="space-y-2 mb-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>{formatDate(startTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span className="line-clamp-1">{metadata.venue_name || event.venue?.name || 'Venue details available on booking'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
              <span className="font-semibold text-gray-900">{rating}</span>
              <span className="text-sm text-gray-600">(128 reviews)</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">{attendees}+</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-gradient">
                {formatPrice(metadata.price || event.price || 0)}
              </p>
            </div>
            <span className="btn btn-primary py-2 px-4 text-sm">
              Book Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
