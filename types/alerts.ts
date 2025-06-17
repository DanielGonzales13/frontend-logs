export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: Date
  count: number
  timeWindow: number // in seconds
  logs: string[] // log IDs or messages that triggered the alert
  isRead: boolean
  source?: string
  ip?: string
}

export type AlertType =
  | "login_failed_burst"
  | "privilege_escalation_detected"
  | "user_creation_burst"
  | "registry_modification_burst"
  | "system_error_burst"
  | "suspicious_activity"

export type AlertSeverity = "low" | "medium" | "high" | "critical"

export interface AlertRule {
  type: AlertType
  classification: string
  threshold: number
  timeWindowSeconds: number
  severity: AlertSeverity
  title: string
  messageTemplate: string
}
