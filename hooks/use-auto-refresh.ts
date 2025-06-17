"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseAutoRefreshProps {
  onRefresh: () => Promise<void>
  intervalMinutes?: number
  enabled?: boolean
}

export function useAutoRefresh({ onRefresh, intervalMinutes = 10, enabled = true }: UseAutoRefreshProps) {
  const [timeLeft, setTimeLeft] = useState(intervalMinutes * 60) // in seconds
  const [isActive, setIsActive] = useState(enabled)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const startCountdown = useCallback(() => {
    setTimeLeft(intervalMinutes * 60)

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return intervalMinutes * 60 // Reset for next cycle
        }
        return prev - 1
      })
    }, 1000)
  }, [intervalMinutes])

  const executeRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error("Auto-refresh failed:", error)
    } finally {
      setIsRefreshing(false)
      if (isActive) {
        startCountdown()
      }
    }
  }, [onRefresh, isRefreshing, isActive, startCountdown])

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    startCountdown()

    intervalRef.current = setInterval(
      () => {
        executeRefresh()
      },
      intervalMinutes * 60 * 1000,
    )
  }, [executeRefresh, intervalMinutes, startCountdown])

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const resetTimer = useCallback(async () => {
    stopAutoRefresh()
    await executeRefresh()
    if (isActive) {
      startAutoRefresh()
    }
  }, [stopAutoRefresh, executeRefresh, isActive, startAutoRefresh])

  const toggleAutoRefresh = useCallback(() => {
    setIsActive((prev) => {
      const newState = !prev
      if (newState) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
        setTimeLeft(0)
      }
      return newState
    })
  }, [startAutoRefresh, stopAutoRefresh])

  // Start auto-refresh when enabled
  useEffect(() => {
    if (enabled && isActive) {
      startAutoRefresh()
    }

    return () => {
      stopAutoRefresh()
    }
  }, [enabled, isActive, startAutoRefresh, stopAutoRefresh])

  // Format time left for display
  const formatTimeLeft = useCallback(() => {
    if (!isActive) return "Auto-refresh disabled"
    if (isRefreshing) return "Refreshing..."

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [timeLeft, isActive, isRefreshing])

  return {
    timeLeft,
    isActive,
    isRefreshing,
    formatTimeLeft,
    resetTimer,
    toggleAutoRefresh,
  }
}
