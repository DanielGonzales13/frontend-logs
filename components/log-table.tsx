"use client"

import { useState } from "react"
import { StatusIcon } from "@/components/status-icon"
import type { LogEntry } from "@/types/logs"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { LogDetailDialog } from "@/components/log-detail-dialog"

interface LogTableProps {
  logs: LogEntry[]
  loading: boolean
}

export function LogTable({ logs, loading }: LogTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRowClick = (log: LogEntry) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  const columns: ColumnDef<LogEntry>[] = [
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => <StatusIcon classification={row.original.classification} />,
      enableSorting: false,
    },
    {
      accessorKey: "ip",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP" />,
      cell: ({ row }) => <div className="font-mono">{row.getValue("ip")}</div>,
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha y Hora" />,
      cell: ({ row }) => <div>{new Date(row.getValue("timestamp")).toLocaleString()}</div>,
      sortingFn: "datetime",
    },
    {
      accessorKey: "message",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mensaje" />,
      cell: ({ row }) => <div className="max-w-md truncate">{row.getValue("message")}</div>,
    },
    {
      accessorKey: "classification",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Clasificación" />,
      cell: ({ row }) => {
        const classification = row.getValue("classification") as string

        return (
          <Badge
            variant={
              classification === "normal"
                ? "outline"
                : classification === "login_failed"
                  ? "secondary"
                  : classification === "system_error"
                    ? "default"
                    : classification === "user_creation"
                      ? "secondary"
                      : classification === "registry_modification"
                        ? "outline"
                        : classification === "privilege_escalation"
                          ? "destructive"
                          : "outline"
            }
            className="capitalize"
          >
            {classification}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "confidence",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Confianza" />,
      cell: ({ row }) => <div className="text-right">{((row.getValue("confidence") as number) * 100).toFixed(2)}%</div>,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      <DataTable columns={columns} data={logs} searchColumn="message" loading={loading} onRowClick={handleRowClick} />
      <LogDetailDialog log={selectedLog} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
