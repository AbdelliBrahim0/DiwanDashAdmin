'use client'

import { useState, useCallback } from 'react'

export function useCrudState<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState<T[]>(initialData)

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const searchItems = useCallback(
    (query: string, searchFields: (keyof T)[]) => {
      if (!query) return items
      const lowerQuery = query.toLowerCase()
      return items.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerQuery)
          }
          return false
        })
      )
    },
    [items]
  )

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
  }
}
