import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { eventsAPI } from '../services/api'
import { useEventStore } from '../store/store'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await eventsAPI.getAll({
          search: searchTerm,
          category: category !== 'all' ? category : undefined,
          sort_by: sortBy,
        })
        setEvents(response.data.data || response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchEvents, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, category, sortBy])

  const categories = ['all', 'Concert', 'Movie', 'Sports', 'Theater', 'Comedy', 'Conference']
  const sortOptions = [
    { value: 'date', label: 'Upcoming' },
    { value: 'popularity', label: 'Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
          <p className="text-gray-600 text-lg">
            Browse thousands of events and find your next favorite experience
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by name, artist, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-12 text-lg"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      category === cat
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-base"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No events found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}