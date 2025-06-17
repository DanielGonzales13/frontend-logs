export interface LogEntry {
  message: string
  timestamp: string
  ip: string
  classification: string
  confidence: number
  probabilities?: Record<string, number>
}

export interface ClassificationProbabilities extends Record<string, number> {
  login_failed: number
  normal: number
  privilege_escalation: number
  registry_modification: number
  system_error: number
  user_creation: number
}
