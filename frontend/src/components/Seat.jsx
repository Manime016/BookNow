import { Check } from 'lucide-react'
import { formatPrice } from '../utils/helpers'

export default function SeatComponent({ seat, isSelected, isLocked, onSelect }) {
  const getStatusClass = () => {
    if (isSelected) return 'bg-gradient-to-r from-primary-500 to-secondary-500 border-primary-600 text-white'
    if (isLocked) return 'bg-red-100 border-red-300 cursor-not-allowed'
    if (seat.is_available)
      return 'bg-white border-gray-300 hover:border-primary-500 hover:shadow-lg cursor-pointer transition-all'
    return 'bg-gray-200 border-gray-300 cursor-not-allowed'
  }

  return (
    <button
      onClick={() => (isSelected || (seat.is_available && !isLocked)) && onSelect(seat)}
      disabled={!isSelected && (!seat.is_available || isLocked)}
      className={`
        w-10 h-10 rounded-lg border-2 font-semibold text-sm
        flex items-center justify-center relative
        transition-all duration-200 hover:scale-110
        ${getStatusClass()}
      `}
      title={`Seat ${seat.row}${seat.number} - ${formatPrice(seat.price || 50)}`}
    >
      {isSelected && <Check className="w-5 h-5" />}
      {!isSelected && !isLocked && seat.is_available && (
        <span className="text-xs">{seat.row}{seat.number}</span>
      )}
    </button>
  )
}
