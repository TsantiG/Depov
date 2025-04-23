"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { getUsers, getAlerts, deleteUser } from "@/lib/api-client"
import AuthGuard from "@/components/auth-guard"
import styles from "./dashboard.module.css"

export default function AdminDashboard() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("users")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        console.log("Cargando datos de administrador...")
        setLoading(true)

        // Usar las funciones de API en lugar de las funciones de servidor
        const [usersData, alertsData] = await Promise.all([getUsers(), getAlerts()])

        console.log("Datos cargados:", { users: usersData.length, alerts: alertsData.length })

        setUsers(usersData)
        setFilteredUsers(usersData)
        setAlerts(alertsData)
      } catch (error) {
        console.error("Error loading data:", error)
        addToast({
          title: "Error",
          description: "No se pudo cargar los datos. Por favor intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.document.includes(searchTerm),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  async function handleDeleteUser(userId: number) {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      try {
        await deleteUser(userId)

        setUsers(users.filter((user) => user.id !== userId))
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userId))

        addToast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente.",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        addToast({
          title: "Error",
          description: "No se pudo eliminar el usuario. Por favor intenta de nuevo.",
          variant: "destructive",
        })
      }
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

  return (
    <AuthGuard requiredRole="admin">
      <div className="container">
        <h1 className={styles.pageTitle}>Panel de Administración</h1>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "users" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Usuarios
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "alerts" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            Alertas
          </button>
        </div>

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.searchIcon}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <Input
                    placeholder="Buscar por nombre, email o documento..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e:any) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Documento</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th className={styles.actionsColumn}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className={styles.nameCell}>{user.name}</td>
                          <td>{user.document}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td className={styles.actionsCell}>
                            <div className={styles.actionButtons}>
                              <Link href={`/admin/users/edit/${user.id}`} className={styles.editButton}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </Link>
                              <button className={styles.deleteButton} onClick={() => handleDeleteUser(user.id)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={styles.emptyState}>
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "alerts" && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Alertas</CardTitle>
              <CardDescription>Todas las alertas de emergencia enviadas por los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Fecha y Hora</th>
                      <th>Ubicación</th>
                      <th>Estado</th>
                      <th className={styles.actionsColumn}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <tr key={alert.id}>
                          <td className={styles.nameCell}>{alert.user.name}</td>
                          <td>{new Date(alert.timestamp).toLocaleString()}</td>
                          <td className={styles.locationCell}>
                            {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${alert.status === "atendida" ? styles.statusSuccess : styles.statusPending}`}
                            >
                              {alert.status === "atendida" ? "Atendida" : "Pendiente"}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            <Link href={`/admin/alerts/${alert.id}`} className={styles.viewButton}>
                              Ver detalles
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={styles.emptyState}>
                          No hay alertas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

