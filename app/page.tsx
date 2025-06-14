"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogTable } from "@/components/log-table"
import { DashboardStats } from "@/components/dashboard-stats"
import { fetchLogs, classifyLog } from "@/lib/api"
import type { LogEntry } from "@/types/logs"
import { AlertCircle, Loader2 } from "lucide-react"

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [logCount, setLogCount] = useState("150")

  const loadLogs = async () => {
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
              confidence: classification.confianza,
            }
          } catch (err) {
            console.error("Error classifying log:", err)
            return {
              ...log,
              classification: "error",
              confidence: 0,
            }
          }
        }),
      )

      setLogs(processedLogs)
    } catch (err) {
      console.error("Error loading logs:", err)
      setError("Failed to load logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

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

  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tablero de Clasificación de Logs</h1>
        <div className="flex items-center gap-4">
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
          <Button onClick={loadLogs} disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Refrescar Logs
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        <p>
          <strong>Nota de rendimiento:</strong> El limite de logs es 1000 por razones de rendimiento. Actualmente se muestran {logs.length}{" "}
          logs.
        </p>
      </div>

      <div className="mb-6">
        <DashboardStats logs={logs} />
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos ({getFilteredLogs().length})</TabsTrigger>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LogTable logs={getFilteredLogs()} loading={loading} />
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
