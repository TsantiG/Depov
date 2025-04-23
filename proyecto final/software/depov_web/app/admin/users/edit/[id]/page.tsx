"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { getUser, updateUser } from "@/lib/api-client"
import AuthGuard from "@/components/auth-guard"
import { getSession } from "@/lib/auth-utils"
import styles from "./edit-user.module.css"

export default function EditUser({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        // Verificar que el usuario es administrador
        const session = getSession()
        if (!session || session.userRole !== "admin") {
          addToast({
            title: "Error",
            description: "No tienes permisos para editar usuarios.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        // Cargar datos del usuario desde la API
        const userId = params.id
        if (!userId) {
          addToast({
            title: "Error",
            description: "No se pudo obtener el ID del usuario.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const userData = await getUser(Number.parseInt(userId))
        setUser(userData)
      } catch (error) {
        console.error("Error loading user:", error)
        addToast({
          title: "Error",
          description: "No se pudo cargar la información del usuario.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [params.id, addToast, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      await updateUser(user.id, user)

      addToast({
        title: "Usuario actualizado",
        description: "La información del usuario ha sido actualizada exitosamente.",
      })

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error updating user:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar la información del usuario.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <p>Usuario no encontrado</p>
          <Button onClick={() => router.push("/admin/dashboard")}>Volver al panel</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="container">
        <Card className={styles.editCard}>
          <CardHeader>
            <CardTitle>Editar Usuario</CardTitle>
            <CardDescription>Actualiza la información del usuario</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className={styles.formContent}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Información Personal</h3>

                <div className={styles.formGroup}>
                  <Label htmlFor="name" required>
                    Nombre Completo
                  </Label>
                  <Input id="name" name="name" value={user.name} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="document" required>
                    Documento de Identidad
                  </Label>
                  <Input id="document" name="document" value={user.document} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="email" required>
                    Correo Electrónico
                  </Label>
                  <Input id="email" name="email" type="email" value={user.email} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="phone" required>
                    Teléfono
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={user.phone} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="address" required>
                    Dirección
                  </Label>
                  <Input id="address" name="address" value={user.address} onChange={handleChange} required />
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
                    value={user.contact1_name}
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
                    value={user.contact1_phone}
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
                    value={user.contact2_name}
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
                    value={user.contact2_phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className={styles.formFooter}>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/dashboard")}
                className={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthGuard>
  )
}

