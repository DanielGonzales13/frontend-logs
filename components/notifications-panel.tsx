"use client"

import type React from "react"

import { useState } from "react"
import { Bell, X, AlertTriangle, AlertCircle, Info, Zap, Eye, EyeOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Alert, AlertSeverity } from "@/types/alerts"
import { cn } from "@/lib/utils"
import { AlertLogDetailDialog } from "@/components/alert-log-detail-dialog"
import type { LogEntry } from "@/types/logs"

interface NotificationsPanelProps {
  alerts: Alert[]
  unreadCount: number
  logs: LogEntry[] // Add this prop
  onMarkAsRead: (alertId: string) => void
  onMarkAllAsRead: () => void
  onDismissAlert: (alertId: string) => void
  onClearAll: () => void
  onViewFullLog?: (log: LogEntry) => void // Add this prop
}

export function NotificationsPanel({
  alerts,
  unreadCount,
  logs, // Add this
  onMarkAsRead,
  onMarkAllAsRead,
  onDismissAlert,
  onClearAll,
  onViewFullLog, // Add this
}: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [logDetailState, setLogDetailState] = useState<{
    alert: Alert | null
    logMessage: string | null
    open: boolean
  }>({
    alert: null,
    logMessage: null,
    open: false,
  })

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <Zap className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "border-l-red-600 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const findRelatedLog = (alert: Alert, logMessage: string): LogEntry | null => {
    return (
      logs.find(
        (log) =>
          (log.message === logMessage && log.ip === alert.ip && log.classification === alert.type.split("_")[0]) ||
          log.classification.includes(alert.type.split("_")[0]),
      ) || null
    )
  }

  const handleLogClick = (alert: Alert, logMessage: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log("Opening log detail for:", alert.title)
    setLogDetailState({
      alert,
      logMessage,
      open: true,
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Alertas de Seguridad</SheetTitle>
              <SheetDescription>
                {alerts.length === 0
                  ? "No alerts detected"
                  : `${alerts.length} alert${alerts.length !== 1 ? "s" : ""} • ${unreadCount} unread`}
              </SheetDescription>
            </div>

            {alerts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="sr-only">Alerta de acciones</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMarkAllAsRead} disabled={unreadCount === 0}>
                    <Eye className="mr-2 h-4 w-4" />
                    Marcar todo como leido
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onClearAll} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpiar alertas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sin alertas de seguridad</p>
              <p className="text-sm">Seras notificado cuando se detecte actividad sospechosa</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={cn(
                      "border-l-4 transition-all duration-200",
                      getSeverityColor(alert.severity),
                      !alert.isRead && "shadow-md",
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
                          {!alert.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              new
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(alert.id)}
                            className="h-6 w-6 p-0"
                            title={alert.isRead ? "Mark as unread" : "Mark as read"}
                          >
                            {alert.isRead ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismissAlert(alert.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Dismiss alert"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        <div className="flex items-center gap-2">
                          {alert.ip && (
                            <Badge variant="outline" className="text-xs">
                              {alert.ip}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>

                      {alert.logs.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View related logs ({alert.logs.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {alert.logs.slice(0, 3).map((log, index) => (
                              <div
                                key={index}
                                className="p-2 bg-muted rounded text-xs cursor-pointer hover:bg-muted/80 transition-colors border"
                                onClick={(event) => handleLogClick(alert, log, event)}
                              >
                                <div className="truncate mb-1 font-mono">{log}</div>
                                <div className="text-muted-foreground text-xs">Click para ver detalle de logs</div>
                              </div>
                            ))}
                            {alert.logs.length > 3 && (
                              <div className="text-muted-foreground text-xs p-2">
                                ... y {alert.logs.length - 3} mas (detalle de logs)
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>

      {/* Add the AlertLogDetailDialog */}
      <AlertLogDetailDialog
        alert={logDetailState.alert}
        logMessage={logDetailState.logMessage}
        relatedLog={
          logDetailState.alert && logDetailState.logMessage
            ? findRelatedLog(logDetailState.alert, logDetailState.logMessage)
            : null
        }
        open={logDetailState.open}
        onOpenChange={(open) => setLogDetailState((prev) => ({ ...prev, open }))}
        onViewFullLog={onViewFullLog}
      />
    </Sheet>
  )
}
