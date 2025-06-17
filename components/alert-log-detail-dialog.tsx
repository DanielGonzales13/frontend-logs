"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusIcon } from "@/components/status-icon"
import { Copy, ExternalLink, Clock, MapPin, Shield, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LogEntry } from "@/types/logs"
import type { Alert } from "@/types/alerts"

interface AlertLogDetailDialogProps {
  alert: Alert | null
  logMessage: string | null
  relatedLog: LogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewFullLog?: (log: LogEntry) => void
}

export function AlertLogDetailDialog({
  alert,
  logMessage,
  relatedLog,
  open,
  onOpenChange,
  onViewFullLog,
}: AlertLogDetailDialogProps) {
  console.log("AlertLogDetailDialog props:", {
    hasAlert: !!alert,
    hasLogMessage: !!logMessage,
    open,
    alertTitle: alert?.title,
  })

  if (!alert || !logMessage) {
    console.log("Dialog not rendering - missing alert or logMessage")
    return null
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(timestamp)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] max-h-[95vh] w-full">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <StatusIcon
              classification={
                alert.type.includes("login")
                  ? "login_failed"
                  : alert.type.includes("privilege")
                    ? "privilege_escalation"
                    : alert.type.includes("user")
                      ? "user_creation"
                      : alert.type.includes("registry")
                        ? "registry_modification"
                        : "system_error"
              }
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">Detalle de Alerta de Log</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1 text-sm">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{formatTimestamp(alert.timestamp)}</span>
                {alert.ip && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="font-mono">{alert.ip}</span>
                  </>
                )}
              </DialogDescription>
            </div>
            <Badge className={cn("capitalize flex-shrink-0", getSeverityColor(alert.severity))}>{alert.severity}</Badge>
          </div>
        </DialogHeader>

        {/* Main content with proper scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-[calc(95vh-200px)] w-full">
            <div className="space-y-6 pr-4">
              {/* Alert Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Resumen de Alerta</h3>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 break-words">{alert.message}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contador de eventos</p>
                      <p className="text-lg font-semibold">{alert.count}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tiempo de ventana</p>
                      <p className="text-lg font-semibold">{alert.timeWindow}s</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">IP origen</p>
                      <p className="text-lg font-semibold font-mono break-all">{alert.ip || "Multiple"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo de alerta</p>
                      <p className="text-sm font-semibold capitalize break-words">{alert.type.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Log Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Detalles de entrada de log</h3>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                          Log Entry
                        </Badge>
                        {relatedLog && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            Confidence: {(relatedLog.confidence * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(logMessage)}
                          className="h-8 px-2"
                          title="Copy log message"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {relatedLog && onViewFullLog && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewFullLog(relatedLog)}
                            className="h-8 px-2"
                            title="View full log details"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Log message with proper scrolling */}
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-900 text-gray-100 p-4">
                        <ScrollArea className="max-h-[400px] w-full">
                          <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {logMessage}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Log Information */}
              {relatedLog && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Detalle de Clasificación</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Clasificación</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIcon classification={relatedLog.classification} />
                          <Badge variant="outline" className="capitalize">
                            {relatedLog.classification.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Confianza</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${relatedLog.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono flex-shrink-0">
                            {(relatedLog.confidence * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha y hora</p>
                        <p className="text-sm font-mono mt-1 break-all">
                          {new Date(relatedLog.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">IP Origen</p>
                        <p className="text-sm font-mono mt-1 break-all">{relatedLog.ip}</p>
                      </div>
                    </div>
                  </div>

                  {/* Probability Distribution */}
                  {relatedLog.probabilities && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Probabilidades de clasificación</p>
                      <div className="space-y-2">
                        {Object.entries(relatedLog.probabilities)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <div className="w-32 text-sm capitalize flex-shrink-0">{key.replace(/_/g, " ")}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-0">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${value * 100}%` }}
                                />
                              </div>
                              <div className="w-16 text-sm font-mono text-right flex-shrink-0">
                                {(value * 100).toFixed(2)}%
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Context Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Contexto de Alerta</h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-900">Patron de detección</p>
                      <p className="text-blue-700 mt-1 break-words">
                        {alert.count} eventos de tipo "{alert.type.replace(/_/g, " ")}" detectados en {" "}
                        {alert.timeWindow} seconds
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Evaluación de riesgos</p>
                      <p className="text-blue-700 mt-1 break-words">
                        {alert.severity === "critical" && "Se requiere atención inmediata: posible violación de seguridad"}
                        {alert.severity === "high" && "Alta prioridad: se detectó actividad sospechosa"}
                        {alert.severity === "medium" && "Prioridad media: se detectó un patrón inusual"}
                        {alert.severity === "low" && "Prioridad baja: se recomienda monitoreo"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold">Acciones recomendadas</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {alert.type === "login_failed_burst" && (
                      <>
                        <li className="break-words">• Considere bloquear la dirección IP {alert.ip} temporalmente</li>
                        <li>• Revisar la seguridad de las cuentas de usuario afectadas</li>
                        <li>• Compruebe si hay relleno de credenciales o patrones de fuerza bruta</li>
                      </>
                    )}
                    {alert.type === "privilege_escalation_detected" && (
                      <>
                        <li>• Investigue inmediatamente el sistema afectado</li>
                        <li>• Revisar los permisos de usuario y los registros de acceso</li>
                        <li>• Considere aislar el sistema afectado</li>
                      </>
                    )}
                    {alert.type === "user_creation_burst" && (
                      <>
                        <li>• Verificar la legitimidad de las nuevas cuentas de usuario</li>
                        <li>• Revisar los permisos de creación de usuarios</li>
                        <li>• Comprobar acceso administrativo no autorizado</li>
                      </>
                    )}
                    {alert.type === "registry_modification_burst" && (
                      <>
                        <li>• Analizar el sistema en busca de malware o cambios no autorizados</li>
                        <li>• Revisar instalaciones de software recientes</li>
                        <li>• Considere restaurar el sistema si los cambios son maliciosos</li>
                      </>
                    )}
                    {alert.type === "system_error_burst" && (
                      <>
                        <li>• Comprobar el estado del sistema y el uso de recursos</li>
                        <li>• Revisar los registros de errores en busca de patrones</li>
                        <li>• Considere el mantenimiento o las actualizaciones del sistema</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer with buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            cerrar
          </Button>
          {relatedLog && onViewFullLog && (
            <Button onClick={() => onViewFullLog(relatedLog)}>View Full Log Details</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
