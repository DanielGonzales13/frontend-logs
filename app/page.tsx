"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogTable } from "@/components/log-table"
import { DashboardStats } from "@/components/dashboard-stats"
import { AutoRefreshStatus } from "@/components/auto-refresh-status"
import { NotificationsPanel } from "@/components/notifications-panel"
import { fetchLogs, classifyLog } from "@/lib/api"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { useAlerts, requestNotificationPermission } from "@/hooks/use-alerts"
import type { LogEntry } from "@/types/logs"
import { AlertCircle, Loader2 } from "lucide-react"

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [logCount, setLogCount] = useState("150")

  // Alerts hook
  const { alerts, unreadCount, processLogs, markAsRead, markAllAsRead, dismissAlert, clearAllAlerts } = useAlerts()

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const count = Number.parseInt(logCount) || 150
      const fetchedLogs = await fetchLogs(count)

      // Process each log to get classification
      const processedLogs = await Promise.all(
        fetchedLogs.map(async (log) => {
          try {
            const classification = await classifyLog(log.message)
            return {
              ...log,
              classification: classification.clase,
              confidence:
                typeof classification.confianza === "string"
                  ? Number.parseFloat(classification.confianza)
                  : classification.confianza,
              probabilities: classification.probabilidad,
            }
          } catch (err) {
            console.error("Error classifying log:", err)
            return {
              ...log,
              classification: "error",
              confidence: 0,
              probabilities: undefined,
            }
          }
        }),
      )

      setLogs(processedLogs)

      // Process logs for alerts
      processLogs(processedLogs)
    } catch (err) {
      console.error("Error loading logs:", err)
      setError("Failed to load logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [logCount, processLogs])

  // Auto-refresh hook
  const {
    timeLeft,
    isActive: autoRefreshActive,
    isRefreshing: autoRefreshing,
    formatTimeLeft,
    resetTimer,
    toggleAutoRefresh,
  } = useAutoRefresh({
    onRefresh: loadLogs,
    intervalMinutes: 10,
    enabled: true,
  })

  // Initial load and request notification permission
  useEffect(() => {
    loadLogs()
    requestNotificationPermission()
  }, [])

  // Manual refresh handler
  const handleManualRefresh = async () => {
    await resetTimer()
  }

  // Filter logs based on active tab
  const getFilteredLogs = () => {
    switch (activeTab) {
      case "alerts":
        return logs.filter((log) =>
          ["login_failed", "user_creation", "registry_modification", "privilege_escalation"].includes(
            log.classification,
          ),
        )
      case "warnings":
        return logs.filter((log) => ["system_error"].includes(log.classification))
      case "normal":
        return logs.filter((log) => ["normal"].includes(log.classification))
      default:
        return logs
    }
  }

  const handleLogCountChange = (value: string) => {
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      const num = Number.parseInt(value)
      if (value === "" || (num >= 1 && num <= 1000)) {
        setLogCount(value)
      }
    }
  }

  const isCurrentlyLoading = loading || autoRefreshing

  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tablero de Clasificación de Logs</h1>
        <div className="flex items-center gap-4">
          {/* Notifications Panel */}
          <NotificationsPanel
            alerts={alerts}
            unreadCount={unreadCount}
            logs={logs} // Add this line
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismissAlert={dismissAlert}
            onClearAll={clearAllAlerts}
            onViewFullLog={(log) => {
              // You can implement additional logic here if needed
              // For now, this will open the existing log detail dialog
              console.log("View full log:", log)
            }} // Add this prop
          />

          <div className="flex items-center gap-2">
            <Label htmlFor="log-count" className="text-sm font-medium whitespace-nowrap">
              Número de logs:
            </Label>
            <Input
              id="log-count"
              type="text"
              value={logCount}
              onChange={(e) => handleLogCountChange(e.target.value)}
              className="w-20"
              placeholder="150"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">(Max: 1000)</span>
          </div>
          <Button onClick={handleManualRefresh} disabled={isCurrentlyLoading} className="flex items-center gap-2">
            {isCurrentlyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Recargar Logs
          </Button>
        </div>
      </div>

      {/* Auto-refresh status */}
      <div className="mb-4">
        <AutoRefreshStatus
          timeLeft={timeLeft}
          isActive={autoRefreshActive}
          isRefreshing={autoRefreshing}
          formatTimeLeft={formatTimeLeft}
          onToggle={toggleAutoRefresh}
          onReset={resetTimer}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        <p>
          <strong>Nota de Rendimiento:</strong> El limite de logs es de 1000 por razones de rendimiento. Actualmente mostrando {logs.length}{" "}
          logs.
          {autoRefreshActive && (
            <span className="ml-2">
              <strong>Auto-Recarga:</strong> Cada 10 minutos
            </span>
          )}
          {alerts.length > 0 && (
            <span className="ml-2">
              <strong>Alertas de Seguridad:</strong> {alerts.length} total, {unreadCount} sin leer
            </span>
          )}
        </p>
      </div>

      <div className="mb-6">
        <DashboardStats logs={logs} />
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos los Logs ({getFilteredLogs().length})</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas (
            {
              logs.filter((log) =>
                ["login_failed", "user_creation", "registry_modification", "privilege_escalation"].includes(
                  log.classification,
                ),
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Warnings ({logs.filter((log) => ["system_error"].includes(log.classification)).length})
          </TabsTrigger>
          <TabsTrigger value="normal">
            Normal ({logs.filter((log) => ["normal"].includes(log.classification)).length})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" && "All System Logs"}
              {activeTab === "alerts" && "Alert Logs"}
              {activeTab === "warnings" && "Warning Logs"}
              {activeTab === "normal" && "Normal Logs"}
              {isCurrentlyLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {autoRefreshing ? "(Auto-refreshing...)" : "(Loading...)"}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LogTable logs={getFilteredLogs()} loading={isCurrentlyLoading} />
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
