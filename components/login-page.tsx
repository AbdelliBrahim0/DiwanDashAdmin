'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let success = false

    try {
      success = await login(email, password)
    } catch {
      success = false
    }

    if (!success) {
      setError(
        lang === 'fr'
          ? 'Email ou mot de passe incorrect, ou backend indisponible'
          : 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الخادم غير متاح'
      )
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header with language toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded flex items-center justify-center text-foreground font-bold">
              د
            </div>
            <div className="text-2xl font-bold text-accent">Diwan</div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 rounded bg-secondary text-foreground text-sm hover:bg-muted transition"
          >
            {lang === 'fr' ? 'AR' : 'FR'}
          </button>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === 'fr' ? 'Connexion Admin' : 'تسجيل دخول الإدارة'}
            </h1>
            <p className="text-muted-foreground">
              {lang === 'fr' 
                ? 'Dashboard d\'administration Diwan' 
                : 'لوحة تحكم إدارة ديوان'}
            </p>
          </div>

          {/* Demo credentials info */}
          <div className="bg-secondary/50 border border-accent/30 rounded p-3 mb-6 text-sm">
            <p className="text-foreground font-semibold mb-1">
              {lang === 'fr' ? 'Connexion réelle:' : 'تسجيل دخول حقيقي:'}
            </p>
            <p className="text-muted-foreground">
              {lang === 'fr'
                ? 'Utilisez le compte créé avec la commande backend'
                : 'استعمل الحساب الذي تم إنشاؤه بأمر backend'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'fr' ? 'Email' : 'البريد الإلكتروني'}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'fr' ? 'admin@diwan.com' : 'admin@diwan.com'}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'fr' ? 'Mot de passe' : 'كلمة المرور'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'fr' ? '••••••••' : '••••••••'}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10"
            >
              {loading 
                ? (lang === 'fr' ? 'Connexion...' : 'جاري الدخول...')
                : (lang === 'fr' ? 'Se connecter' : 'تسجيل الدخول')
              }
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {lang === 'fr'
              ? 'Authentification JWT connectée au backend FastAPI'
              : 'المصادقة JWT متصلة بخادم FastAPI'}
          </p>
        </Card>
      </div>
    </div>
  )
}
