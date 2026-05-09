'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_V1_URL } from '@/lib/backend'

interface AuthContextType {
  isLoggedIn: boolean
  adminEmail: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const email = localStorage.getItem('admin_email')
    if (!token || !email) {
      return
    }

    setIsLoggedIn(true)
    setAdminEmail(email)

    void fetch(`${API_V1_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (!response.ok) {
        logout()
      }
    }).catch(() => {
      logout()
    })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await fetch(`${API_V1_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return false
    }

    const data: { access_token?: string } = await response.json()
    if (!data.access_token) {
      return false
    }

    localStorage.setItem('admin_token', data.access_token)
    localStorage.setItem('admin_email', email)
    setIsLoggedIn(true)
    setAdminEmail(email)
    return true
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    setIsLoggedIn(false)
    setAdminEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, adminEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
