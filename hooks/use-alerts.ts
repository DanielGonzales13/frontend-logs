"use client"

import { useState, useCallback, useEffect } from "react"
import type { Alert } from "@/types/alerts"
import { AlertDetector } from "@/lib/alert-detector"
import type { LogEntry } from "@/types/logs"

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [detector] = useState(() => new AlertDetector())

  const processLogs = useCallback(
    (logs: LogEntry[]) => {
      const newAlerts = detector.detectAlerts(logs)

      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          // Add new alerts and keep existing ones
          const existingIds = new Set(prev.map((alert) => alert.id))
          const uniqueNewAlerts = newAlerts.filter((alert) => !existingIds.has(alert.id))

          if (uniqueNewAlerts.length > 0) {
            // Show browser notification for critical alerts
            uniqueNewAlerts.forEach((alert) => {
              if (alert.severity === "critical" || alert.severity === "high") {
                showBrowserNotification(alert)
              }
            })
          }

          return [...prev, ...uniqueNewAlerts].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
        })
      }
    },
    [detector],
  )

  const markAsRead = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })))
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
    detector.clearExistingAlerts()
  }, [detector])

  // Update unread count
  useEffect(() => {
    setUnreadCount(alerts.filter((alert) => !alert.isRead).length)
  }, [alerts])

  return {
    alerts,
    unreadCount,
    processLogs,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    clearAllAlerts,
  }
}

// Browser notification helper
function showBrowserNotification(alert: Alert) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(alert.title, {
      body: alert.message,
      icon: "/favicon.ico",
      tag: alert.id,
    })
  }
}

// Request notification permission
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}
