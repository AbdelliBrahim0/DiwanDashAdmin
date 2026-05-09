'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface FormField {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select'
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
}

interface CrudModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
  fields: FormField[]
  initialData?: Record<string, any>
  isLoading?: boolean
}

export function CrudModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  fields,
  initialData,
  isLoading,
}: CrudModalProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>(
    initialData || {}
  )

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      const newData: Record<string, any> = {}
      fields.forEach((field) => {
        newData[field.name] = field.type === 'number' ? 0 : ''
      })
      setFormData(newData)
    }
  }, [initialData, fields])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground"
                  rows={4}
                />
              ) : field.type === 'select' && field.options ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: e.target.value,
                    })
                  }
                  required={field.required}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Sélectionner...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]:
                        field.type === 'number'
                          ? parseFloat(e.target.value)
                          : e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
