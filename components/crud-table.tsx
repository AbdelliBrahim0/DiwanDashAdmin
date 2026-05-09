'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'

interface TableColumn {
  key: string
  label: string
  width?: string
  render?: (value: any) => React.ReactNode
}

interface CrudTableProps {
  columns: TableColumn[]
  data: any[]
  onEdit: (item: any) => void
  onDelete: (id: string) => void
  emptyMessage?: string
}

export function CrudTable({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = 'Aucune donnée',
}: CrudTableProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left p-4 font-semibold text-foreground"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            <th className="text-left p-4 font-semibold text-foreground w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item.id || idx}
              className="border-b border-border/50 hover:bg-secondary/30 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="p-4 text-foreground text-sm">
                  {col.render
                    ? col.render(item[col.key])
                    : item[col.key]}
                </td>
              ))}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
