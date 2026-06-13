'use client'

// ─────────────────────────────────────────────────────────────────────────────
//  DiwanDashAdmin — Atelier 3D Admin Page
//  Intègre tailleurAdminFront via iframe (build statique servi par nginx)
//  Fallback: URL directe dev si le build n'est pas disponible
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Layers3, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'

const ATELIER_ADMIN_URL =
  process.env.NEXT_PUBLIC_ATELIER_ADMIN_URL || 'http://localhost:5175'

export default function AtelierAdminPage() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Auth guard — vérifier token admin
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
    }
  }, [router])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setHasError(false)
    if (iframeRef.current) {
      // Force reload
      const src = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src }, 50)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Layers3 className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">
              Atelier 3D
            </h1>
            <p className="text-xs text-white/40">
              Gestion des scènes et mesures utilisateurs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
            title="Actualiser"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <a
            href={ATELIER_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-yellow-400/80 hover:text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg transition-all duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir dans onglet
          </a>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading skeleton */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/60 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center animate-pulse">
              <Layers3 className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-sm text-white/50">Chargement de l&apos;atelier...</p>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 bg-black/70">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-2">
                Impossible de charger l&apos;atelier
              </p>
              <p className="text-xs text-white/40 max-w-xs">
                Vérifiez que <code className="text-yellow-400/80 bg-yellow-400/5 px-1 rounded">{ATELIER_ADMIN_URL}</code> est accessible.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={ATELIER_ADMIN_URL}
          className="w-full h-full border-0"
          title="Atelier 3D Admin"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; camera; gyroscope; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  )
}
