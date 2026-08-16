import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, TrendingUp, Heart } from 'lucide-react'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { eventsAPI } from '../services/api'

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true)
        const response = await eventsAPI.getAll({ limit: 8, featured: true })
        setFeaturedEvents(response.data.data || response.data)
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-8 right-1/2 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600">
                  Welcome to BookNow
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                <span className="text-gradient">Discover Amazing</span>
                <br />
                Events Near You
              </h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Find and book tickets to the best concerts, movies, sports events, and more. Experience
                live entertainment like never before.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/events" className="btn btn-primary py-3 px-8 text-lg">
                  Explore Events
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
                <button className="btn btn-outline py-3 px-8 text-lg">
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary-600">10K+</p>
                  <p className="text-sm text-gray-600">Events Listed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary-600">50K+</p>
                  <p className="text-sm text-gray-600">Happy Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent-600">100K+</p>
                  <p className="text-sm text-gray-600">Tickets Sold</p>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative animate-slide-in-right">
              <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 aspect-square flex items-center justify-center text-white text-6xl font-bold">
                <img
                  src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop"
                  alt="Live Event"
                  className="w-full h-full object-cover rounded-lg shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-xl z-10">
                <p className="text-sm font-semibold text-gray-900">⭐ 4.9/5 Rating</p>
                <p className="text-xs text-gray-600">From 2,500+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose BookNow?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make it easy to discover, book, and enjoy the best events in your area
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast Booking',
                description: 'Book your tickets in seconds with our streamlined checkout process',
              },
              {
                icon: TrendingUp,
                title: 'Best Deals',
                description: 'Find exclusive discounts and early-bird offers on premium events',
              },
              {
                icon: Heart,
                title: 'Save Favorites',
                description: 'Create a wishlist and never miss events you want to attend',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="card p-8 text-center hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Featured Events</h2>
              <p className="text-gray-600">Check out the hottest events happening right now</p>
            </div>
            <Link to="/events" className="btn btn-ghost text-primary-600 hover:text-primary-700">
              View All <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-600 font-semibold">Failed to load events</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No featured events available right now</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Book Your Next Event?</h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of users who are already enjoying their favorite events
          </p>
          <Link to="/events" className="inline-block btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-8 text-lg font-semibold">
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  )
}
