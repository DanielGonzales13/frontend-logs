"use client"

interface ProbabilityBarChartProps {
  probabilities: Record<string, number>
}

function ProbabilityBarChart({ probabilities }: ProbabilityBarChartProps) {
  // Color mapping for each classification
  const colors: Record<string, string> = {
    normal: "#10b981", // green
    login_failed: "#f59e0b", // yellow
    system_error: "#f97316", // orange
    user_creation: "#d97706", // amber
    registry_modification: "#8b5cf6", // purple
    privilege_escalation: "#ef4444", // red
  }

  // Sort probabilities by value (highest first)
  const sortedProbabilities = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      key,
      value,
      percentage: value * 100,
      color: colors[key] || "#6b7280",
      label: key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }))

  return (
    <div className="w-full space-y-3">
      {sortedProbabilities.map((item) => (
        <div key={item.key} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="font-mono text-xs">{item.percentage.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProbabilityBarChart
