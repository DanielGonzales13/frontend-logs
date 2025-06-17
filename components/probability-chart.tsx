"use client"

import { useMemo } from "react"
import type { ClassificationProbabilities } from "@/types/logs"

interface ProbabilityChartProps {
  probabilities: ClassificationProbabilities | Record<string, number>
}

function ProbabilityChart({ probabilities }: ProbabilityChartProps) {
  const chartData = useMemo(() => {
    // Color mapping for each classification
    const colors: Record<string, string> = {
      normal: "#10b981", // green
      login_failed: "#f59e0b", // yellow
      system_error: "#f97316", // orange
      user_creation: "#d97706", // amber
      registry_modification: "#8b5cf6", // purple
      privilege_escalation: "#ef4444", // red
    }

    const total = Object.values(probabilities).reduce((sum, value) => sum + value, 0)
    let currentAngle = 0

    return Object.entries(probabilities).map(([key, value]) => {
      const percentage = (value / total) * 100
      const angle = (value / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      // Calculate path for SVG arc
      const centerX = 120
      const centerY = 120
      const radius = 80
      const innerRadius = 40

      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180

      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)

      const x3 = centerX + innerRadius * Math.cos(endAngleRad)
      const y3 = centerY + innerRadius * Math.sin(endAngleRad)
      const x4 = centerX + innerRadius * Math.cos(startAngleRad)
      const y4 = centerY + innerRadius * Math.sin(startAngleRad)

      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        "Z",
      ].join(" ")

      currentAngle += angle

      return {
        key,
        value,
        percentage,
        color: colors[key] || "#6b7280",
        pathData,
        label: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }
    })
  }, [probabilities])

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        {/* SVG Donut Chart */}
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
            {chartData.map((segment, index) => (
              <path
                key={segment.key}
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                }}
              >
                <title>{`${segment.label}: ${segment.percentage.toFixed(2)}%`}</title>
              </path>
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Total</div>
              <div className="text-lg font-bold">100%</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-md">
          {chartData.map((segment) => (
            <div key={segment.key} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
              <span className="truncate">{segment.label}</span>
              <span className="font-mono text-xs ml-auto">{segment.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProbabilityChart
