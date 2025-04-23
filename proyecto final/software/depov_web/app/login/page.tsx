"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { saveSession } from "@/lib/auth-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./login.module.css"
import Footer from "@/components/ui/footer"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Evitar múltiples envíos
    if (isLoading) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      console.log("Respuesta del servidor:", data) 

      if (response.ok && data.user) {
        console.log("Guardando sesión en localStorage...") 
        // Guardar sesión en localStorage
        saveSession(data.user.id.toString(), data.user.role, data.user.name)
        console.log("Login exitoso, redirigiendo según rol:", data.role)

        // Redirigir según el rol
        setTimeout(() => {
          const role = data.user.role // <--- aseguramos el valor correcto

          if (role === "admin") {
            router.push("/admin/dashboard")
          } else if (role === "police") {
            router.push("/police/dashboard")
          } else {
            router.push("/dashboard")
          }
        }, 100)
      } else {
        setError(data.error || "Credenciales inválidas. Por favor intente de nuevo.")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("Error al iniciar sesión. Por favor intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className={styles.loginContainer}>
        <Card className={styles.loginCard}>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa a tu cuenta del sistema de alerta de emergencia</CardDescription>
          </CardHeader>

          {registered && (
            <div className={styles.alertContainer}>
              <Alert variant="success">
                <AlertDescription>Registro exitoso. Ahora puedes iniciar sesión con tus credenciales.</AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <div className={styles.alertContainer}>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <CardContent className={styles.formContent}>
              <div className={styles.formGroup}>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </CardContent>

            <CardFooter className={styles.formFooter}>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              <div className={styles.registerLink}>
                ¿No tienes una cuenta? <Link href="/register">Registrarse</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
    
    
  )
}

