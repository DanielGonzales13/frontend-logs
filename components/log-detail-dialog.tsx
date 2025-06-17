"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusIcon } from "@/components/status-icon"
import type { LogEntry } from "@/types/logs"
import { Badge } from "@/components/ui/badge"
import ProbabilityChart from "@/components/probability-chart"
import ProbabilityBarChart from "@/components/probability-bar-chart"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LogDetailDialogProps {
  log: LogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogDetailDialog({ log, open, onOpenChange }: LogDetailDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon classification={log.classification} />
            <span>Detalle de Log</span>
            <Badge
              variant={
                log.classification === "normal"
                  ? "outline"
                  : log.classification === "login_failed"
                    ? "secondary"
                    : log.classification === "system_error"
                      ? "default"
                      : log.classification === "user_creation"
                        ? "secondary"
                        : log.classification === "registry_modification"
                          ? "outline"
                          : log.classification === "privilege_escalation"
                            ? "destructive"
                            : "outline"
              }
              className="ml-2 capitalize"
            >
              {log.classification}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {new Date(log.timestamp).toLocaleString()} • {log.ip}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div>
            <h4 className="text-sm font-medium mb-2">Mensaje</h4>
            <div className="bg-muted p-3 rounded-md text-sm max-h-[200px] overflow-y-auto break-words whitespace-pre-wrap">
              {log.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Clasficación</h4>
              <p className="capitalize">{log.classification}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Confianza</h4>
              <p>{(log.confidence * 100).toFixed(2)}%</p>
            </div>
          </div>

          {log.probabilities && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Clasificación de Probabilidades</h4>

                <Tabs defaultValue="donut" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="donut">Gráfica de Dona</TabsTrigger>
                    <TabsTrigger value="bars">Gráfica de Barras</TabsTrigger>
                  </TabsList>

                  <TabsContent value="donut" className="mt-4">
                    <ProbabilityChart probabilities={log.probabilities} />
                  </TabsContent>

                  <TabsContent value="bars" className="mt-4">
                    <ProbabilityBarChart probabilities={log.probabilities} />
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Detalle de probabilidades</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(log.probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted rounded">
                        <span className="capitalize">{key.split("_").join(" ")}:</span>
                        <span className="font-mono">{(value * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
