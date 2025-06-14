import type { LogEntry } from "@/types/logs"

interface LogResponse {
  hits: {
    hits: Array<{
      _source: {
        message: string
        timestamp: string
        gl2_remote_ip?: string
        source?: string
      }
    }>
  }
}

interface ClassificationResponse {
  clase: string
  confianza: number
  log: string
}

export async function fetchLogs(size = 150): Promise<LogEntry[]> {
  try {
    // Ensure size is within valid range
    const validSize = Math.min(Math.max(size, 1), 1000)

    const body = {
      query: {
        match_all: {},
      },
      sort: [
        {
          timestamp: {
            order: "desc",
          },
        },
      ],
      size: validSize,
    }

    const response = await fetch("http://172.55.1.7:9200/graylog_*/_search?pretty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`)
    }

    const data: LogResponse = await response.json()

    return data.hits.hits.map((hit) => {
      const source = hit._source
      return {
        message: source.message,
        timestamp: source.timestamp,
        ip: source.gl2_remote_ip || source.source || "Unknown",
        classification: "",
        confidence: 0,
      }
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    throw error
  }
}

export async function classifyLog(message: string): Promise<ClassificationResponse> {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/prediccion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error(`Failed to classify log: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error classifying log:", error)
    throw error
  }
}
