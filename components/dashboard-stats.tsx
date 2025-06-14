import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LogEntry } from "@/types/logs"

interface DashboardStatsProps {
  logs: LogEntry[]
}

export function DashboardStats({ logs }: DashboardStatsProps) {
  const totalLogs = logs.length

  const alertCount = logs.filter((log) =>
    ["login_failed", "user_creation", "registry_modification", "privilege_escalation"].includes(log.classification),
  ).length

  const warningCount = logs.filter((log) => ["system_error"].includes(log.classification)).length

  const normalCount = logs.filter((log) => ["normal"].includes(log.classification)).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLogs}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Normal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{normalCount}</div>
          <p className="text-xs text-muted-foreground">
            {totalLogs > 0 ? ((normalCount / totalLogs) * 100).toFixed(1) + "%" : "0%"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">{warningCount}</div>
          <p className="text-xs text-muted-foreground">
            {totalLogs > 0 ? ((warningCount / totalLogs) * 100).toFixed(1) + "%" : "0%"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{alertCount}</div>
          <p className="text-xs text-muted-foreground">
            {totalLogs > 0 ? ((alertCount / totalLogs) * 100).toFixed(1) + "%" : "0%"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
