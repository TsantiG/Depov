"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, hasRole } from "@/lib/auth-utils"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificamos la sesión
    const checkAuth = () => {
      const session = getSession()

      if (!session) {
        console.log("No hay sesión, redirigiendo a login")
        router.push("/login")
        return
      }

      // Si se requiere un rol específico y el usuario no lo tiene
      if (requiredRole && !hasRole(requiredRole)) {
        console.log(`Rol requerido: ${requiredRole}, rol actual: ${session.userRole}`)
        // Redirigir según el rol actual
        if (session.userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (session.userRole === "police") {
          router.push("/police/dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }

      console.log("Usuario autorizado")
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}

