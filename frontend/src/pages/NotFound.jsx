import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="mb-8">
          <AlertCircle className="w-24 h-24 mx-auto text-accent-300 mb-4" />
          <h1 className="text-7xl font-bold mb-4">404</h1>
          <p className="text-3xl font-semibold mb-2">Page Not Found</p>
          <p className="text-lg opacity-90 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="inline-flex items-center space-x-2 btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-8 text-lg font-bold">
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <Link to="/events" className="inline-flex items-center space-x-2 btn border-2 border-white text-white hover:bg-white/10 py-3 px-8 text-lg font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span>Browse Events</span>
          </Link>
        </div>

        <p className="mt-12 text-sm opacity-75">
          Need help? <a href="#" className="underline hover:opacity-100">Contact support</a>
        </p>
      </div>
    </div>
  )
}