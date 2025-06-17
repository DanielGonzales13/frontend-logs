"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutoRefreshStatusProps {
  timeLeft: number
  isActive: boolean
  isRefreshing: boolean
  formatTimeLeft: () => string
  onToggle: () => void
  onReset: () => void
}

export function AutoRefreshStatus({
  timeLeft,
  isActive,
  isRefreshing,
  formatTimeLeft,
  onToggle,
  onReset,
}: AutoRefreshStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Siguiente recarga:</span>
        <Badge
          variant={isActive ? (isRefreshing ? "default" : "secondary") : "outline"}
          className={cn("font-mono", isRefreshing && "animate-pulse", !isActive && "text-muted-foreground")}
        >
          {formatTimeLeft()}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="h-8 px-2"
          title={isActive ? "Pause auto-refresh" : "Start auto-refresh"}
        >
          {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isRefreshing}
          className="h-8 px-2"
          title="Reset timer and refresh now"
        >
          <RotateCcw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  )
}
