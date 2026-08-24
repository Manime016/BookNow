import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  return format(parseISO(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return format(parseISO(date), 'MMM dd, yyyy HH:mm')
}

export const formatTime = (date) => {
  if (!date) return '—'
  return format(parseISO(date), 'HH:mm')
}

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(parseISO(date), { addSuffix: true })
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(price) || 0)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num)
}

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const getColorFromString = (str) => {
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
  ]
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
