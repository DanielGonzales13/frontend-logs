"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Search } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter?.length > 0

  // Get unique values for classification filter
  const classificationOptions = Array.from(
    new Set(
      table
        .getCoreRowModel()
        .rows.map((row) => row.getValue("classification") as string)
        .filter(Boolean),
    ),
  ).map((value) => ({
    label: value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    value,
  }))

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en todas las columnas..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(String(event.target.value))}
            className="pl-8 max-w-sm"
          />
        </div>

        {/* IP Filter */}
        {table.getColumn("ip") && (
          <Input
            placeholder="Filter IPs..."
            value={(table.getColumn("ip")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("ip")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        )}

        {/* Classification Filter */}
        {table.getColumn("classification") && classificationOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("classification")}
            title="Clasificación"
            options={classificationOptions}
          />
        )}

        {/* Message Filter */}
        {table.getColumn("message") && (
          <Input
            placeholder="Filtrar mensajes..."
            value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("message")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        )}

        {/* Clear Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
