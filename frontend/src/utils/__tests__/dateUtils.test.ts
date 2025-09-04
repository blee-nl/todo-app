import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatFullDate, formatRelativeTime, isToday, isYesterday } from '../dateUtils'

// Mock Date.now() to have consistent test results
const mockDate = new Date('2024-01-15T12:00:00.000Z')

beforeEach(() => {
  vi.setSystemTime(mockDate)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should return "Just now" for dates within the last hour', () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      expect(formatDate(recentDate)).toBe('Just now')
    })

    it('should return hours ago for dates within the last 24 hours', () => {
      const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      expect(formatDate(hoursAgo)).toBe('2 hours ago')
    })

    it('should return "Yesterday" for dates from yesterday', () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      expect(formatDate(yesterday)).toBe('Yesterday')
    })

    it('should return formatted date for older dates', () => {
      const oldDate = new Date('2023-12-01T00:00:00.000Z').toISOString()
      expect(formatDate(oldDate)).toBe('Dec 1, 2023')
    })

    it('should include year for dates from different years', () => {
      const oldDate = new Date('2023-01-01T00:00:00.000Z').toISOString()
      expect(formatDate(oldDate)).toBe('Jan 1, 2023')
    })
  })

  describe('formatFullDate', () => {
    it('should format date with full date and time', () => {
      const date = new Date('2024-01-15T14:30:00.000Z').toISOString()
      const result = formatFullDate(date)
      expect(result).toMatch(/Jan 15, 2024/)
      // Check for time format (could be 2:30 PM or different timezone)
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const recentDate = new Date(Date.now() - 30 * 1000).toISOString() // 30 seconds ago
      expect(formatRelativeTime(recentDate)).toBe('Just now')
    })

    it('should return minutes ago for recent dates', () => {
      const minutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      expect(formatRelativeTime(minutesAgo)).toBe('5 minutes ago')
    })

    it('should return hours ago for dates within 24 hours', () => {
      const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      expect(formatRelativeTime(hoursAgo)).toBe('3 hours ago')
    })

    it('should return days ago for older dates', () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      expect(formatRelativeTime(daysAgo)).toBe('3 days ago')
    })
  })

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date().toISOString()
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday\'s date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('should return true for yesterday\'s date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      expect(isYesterday(yesterday)).toBe(true)
    })

    it('should return false for today\'s date', () => {
      const today = new Date().toISOString()
      expect(isYesterday(today)).toBe(false)
    })
  })
})
