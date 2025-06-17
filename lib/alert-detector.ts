import type { LogEntry } from "@/types/logs"
import type { Alert, AlertRule, AlertType } from "@/types/alerts"

// Configuración de reglas de alertas
const ALERT_RULES: AlertRule[] = [
  {
    type: "login_failed_burst",
    classification: "login_failed",
    threshold: 5,
    timeWindowSeconds: 60,
    severity: "high",
    title: "Multiple Login Failures Detected",
    messageTemplate: "{count} failed login attempts detected in {timeWindow} seconds from {ip}",
  },
  {
    type: "privilege_escalation_detected",
    classification: "privilege_escalation",
    threshold: 1,
    timeWindowSeconds: 300,
    severity: "critical",
    title: "Privilege Escalation Detected",
    messageTemplate: "Privilege escalation attempt detected from {ip}",
  },
  {
    type: "user_creation_burst",
    classification: "user_creation",
    threshold: 3,
    timeWindowSeconds: 300,
    severity: "medium",
    title: "Multiple User Creations",
    messageTemplate: "{count} user creation events detected in {timeWindow} seconds from {ip}",
  },
  {
    type: "registry_modification_burst",
    classification: "registry_modification",
    threshold: 10,
    timeWindowSeconds: 120,
    severity: "medium",
    title: "High Registry Activity",
    messageTemplate: "{count} registry modifications detected in {timeWindow} seconds from {ip}",
  },
  {
    type: "system_error_burst",
    classification: "system_error",
    threshold: 15,
    timeWindowSeconds: 300,
    severity: "low",
    title: "System Error Spike",
    messageTemplate: "{count} system errors detected in {timeWindow} seconds",
  },
]

export class AlertDetector {
  private existingAlerts: Set<string> = new Set()

  detectAlerts(logs: LogEntry[]): Alert[] {
    const alerts: Alert[] = []
    const now = new Date()

    // Group logs by classification and IP
    const logGroups = this.groupLogsByClassificationAndIP(logs)

    for (const rule of ALERT_RULES) {
      const relevantGroups = logGroups.get(rule.classification) || new Map()

      for (const [ip, groupLogs] of relevantGroups) {
        // Filter logs within the time window
        const recentLogs = this.filterLogsByTimeWindow(groupLogs, rule.timeWindowSeconds)

        if (recentLogs.length >= rule.threshold) {
          const alertId = this.generateAlertId(rule.type, ip, recentLogs.length)

          // Avoid duplicate alerts
          if (!this.existingAlerts.has(alertId)) {
            const alert = this.createAlert(rule, recentLogs, ip, now)
            alerts.push(alert)
            this.existingAlerts.add(alertId)
          }
        }
      }
    }

    return alerts
  }

  private groupLogsByClassificationAndIP(logs: LogEntry[]): Map<string, Map<string, LogEntry[]>> {
    const groups = new Map<string, Map<string, LogEntry[]>>()

    for (const log of logs) {
      if (!log.classification || log.classification === "error") continue

      if (!groups.has(log.classification)) {
        groups.set(log.classification, new Map())
      }

      const ipGroups = groups.get(log.classification)!
      if (!ipGroups.has(log.ip)) {
        ipGroups.set(log.ip, [])
      }

      ipGroups.get(log.ip)!.push(log)
    }

    return groups
  }

  private filterLogsByTimeWindow(logs: LogEntry[], timeWindowSeconds: number): LogEntry[] {
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - timeWindowSeconds * 1000)

    return logs.filter((log) => {
      const logTime = new Date(log.timestamp)
      return logTime >= cutoffTime
    })
  }

  private generateAlertId(type: AlertType, ip: string, count: number): string {
    const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute buckets
    return `${type}-${ip}-${count}-${timestamp}`
  }

  private createAlert(rule: AlertRule, logs: LogEntry[], ip: string, timestamp: Date): Alert {
    const message = rule.messageTemplate
      .replace("{count}", logs.length.toString())
      .replace("{timeWindow}", rule.timeWindowSeconds.toString())
      .replace("{ip}", ip)

    return {
      id: this.generateAlertId(rule.type, ip, logs.length),
      type: rule.type,
      severity: rule.severity,
      title: rule.title,
      message,
      timestamp,
      count: logs.length,
      timeWindow: rule.timeWindowSeconds,
      logs: logs.map((log) => log.message),
      isRead: false,
      ip,
      source: logs[0]?.ip,
    }
  }

  clearExistingAlerts(): void {
    this.existingAlerts.clear()
  }
}
