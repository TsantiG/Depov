"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./register.module.css"

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    contact1_name: "",
    contact1_phone: "",
    contact2_name: "",
    contact2_phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push("/login?registered=true")
      } else {
        setError(data.error || "Error al registrar usuario. Por favor intente de nuevo.")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setError("Error al registrar usuario. Por favor intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className={styles.registerContainer}>
        <Card className={styles.registerCard}>
          <CardHeader>
            <CardTitle>Registro de Usuario</CardTitle>
            <CardDescription>Crea una cuenta para usar el sistema de alerta de emergencia</CardDescription>
          </CardHeader>

          {error && (
            <div className={styles.alertContainer}>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <CardContent className={styles.formContent}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Información Personal</h3>

                <div className={styles.formGroup}>
                  <Label htmlFor="name" required>
                    Nombre Completo
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="document" required>
                    Documento de Identidad
                  </Label>
                  <Input id="document" name="document" value={formData.document} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="email" required>
                    Correo Electrónico
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="phone" required>
                    Teléfono
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="address" required>
                    Dirección
                  </Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="password" required>
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Contactos de Emergencia</h3>

                <div className={styles.formGroup}>
                  <Label htmlFor="contact1_name" required>
                    Nombre del Contacto 1
                  </Label>
                  <Input
                    id="contact1_name"
                    name="contact1_name"
                    value={formData.contact1_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="contact1_phone" required>
                    Teléfono del Contacto 1
                  </Label>
                  <Input
                    id="contact1_phone"
                    name="contact1_phone"
                    type="tel"
                    value={formData.contact1_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="contact2_name" required>
                    Nombre del Contacto 2
                  </Label>
                  <Input
                    id="contact2_name"
                    name="contact2_name"
                    value={formData.contact2_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="contact2_phone" required>
                    Teléfono del Contacto 2
                  </Label>
                  <Input
                    id="contact2_phone"
                    name="contact2_phone"
                    type="tel"
                    value={formData.contact2_phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className={styles.formFooter}>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>

              <div className={styles.loginLink}>
                ¿Ya tienes una cuenta? <Link href="/login">Iniciar Sesión</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

