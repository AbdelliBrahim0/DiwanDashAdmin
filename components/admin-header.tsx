'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  description?: string
  lang: 'fr' | 'ar'
  onLanguageChange: (lang: 'fr' | 'ar') => void
}

export function AdminHeader({
  title,
  description,
  lang,
  onLanguageChange,
}: AdminHeaderProps) {
  const { adminEmail, logout } = useAuth()

  return (
    <div className="bg-card border-b border-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange(lang === 'fr' ? 'ar' : 'fr')}
            className="border-border hover:bg-secondary"
          >
            <Globe size={16} className="mr-2" />
            {lang === 'fr' ? 'AR' : 'FR'}
          </Button>

          {/* User Info */}
          <div className="text-right text-sm">
            <p className="text-foreground font-medium">{adminEmail}</p>
            <p className="text-muted-foreground text-xs">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
