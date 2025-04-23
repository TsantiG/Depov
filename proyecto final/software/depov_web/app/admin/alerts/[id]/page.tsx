"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { getAlert, updateAlertStatus } from "@/lib/api-client"
import AlertMap from "@/components/alert-map"
import AuthGuard from "@/components/auth-guard"
import styles from "./alert-details.module.css"

export default function AlertDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [alert, setAlert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadAlert() {
      try {
        setLoading(true)
        console.log("Cargando detalles de la alerta:", params.id)
        const alertData = await getAlert(Number.parseInt(params.id))
        console.log("Datos de alerta cargados:", alertData)
        setAlert(alertData)
      } catch (error) {
        console.error("Error loading alert:", error)
        addToast({
          title: "Error",
          description: "No se pudo cargar la información de la alerta.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAlert()
  }, [params.id])

  async function handleUpdateStatus(status: string) {
    try {
      setUpdating(true)
      await updateAlertStatus(Number.parseInt(params.id), status)

      // Actualizar el estado local
      setAlert({ ...alert, status })

      addToast({
        title: "Estado actualizado",
        description: `La alerta ha sido marcada como ${status === "atendida" ? "atendida" : "pendiente"}.`,
      })
    } catch (error) {
      console.error("Error updating alert status:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar el estado de la alerta.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando detalles de la alerta...</p>
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Alerta no encontrada</h2>
          <Button onClick={() => router.push("/admin/dashboard")}>Volver al panel</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="container">
        <div className={styles.header}>
          <Button variant="outline" className={styles.backButton} onClick={() => router.push("/admin/dashboard")}>
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
              className={styles.backIcon}
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver al panel
          </Button>
        </div>

        <h1 className={styles.pageTitle}>Detalles de la Alerta #{alert.id}</h1>

        <div className={styles.alertGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Alerta</CardTitle>
              <CardDescription>Detalles completos de la alerta de emergencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.statusSection}>
                <div className={styles.statusInfo}>
                  <span className={styles.statusLabel}>Estado:</span>
                  <span
                    className={`${styles.statusBadge} ${alert.status === "atendida" ? styles.statusSuccess : styles.statusPending}`}
                  >
                    {alert.status === "atendida" ? "Atendida" : "Pendiente"}
                  </span>
                </div>

                <div className={styles.statusActions}>
                  {alert.status !== "atendida" ? (
                    <Button
                      className={styles.attendButton}
                      onClick={() => handleUpdateStatus("atendida")}
                      disabled={updating}
                    >
                      {updating ? "Actualizando..." : "Marcar como atendida"}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleUpdateStatus("pendiente")} disabled={updating}>
                      {updating ? "Actualizando..." : "Marcar como pendiente"}
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha y hora:</span> {new Date(alert.timestamp).toLocaleString()}
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Coordenadas:</span> {alert.location.lat.toFixed(6)},{" "}
                  {alert.location.lng.toFixed(6)}
                </div>
              </div>

              <div className={styles.userSection}>
                <h3 className={styles.sectionTitle}>Información del Usuario</h3>
                <div className={styles.userInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nombre:</span> {alert.user.name}
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Documento:</span> {alert.user.document}
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Teléfono:</span> {alert.user.phone}
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Dirección:</span> {alert.user.address}
                  </div>
                </div>
              </div>

              <div className={styles.contactsSection}>
                <h3 className={styles.sectionTitle}>Contactos de Emergencia</h3>
                <div className={styles.contactsGrid}>
                  <div className={styles.contactCard}>
                    <div className={styles.contactName}>{alert.user.contact1_name}</div>
                    <div className={styles.contactPhone}>{alert.user.contact1_phone}</div>
                  </div>
                  <div className={styles.contactCard}>
                    <div className={styles.contactName}>{alert.user.contact2_name}</div>
                    <div className={styles.contactPhone}>{alert.user.contact2_phone}</div>
                  </div>
                </div>
              </div>

              {alert.nearbyStations && alert.nearbyStations.length > 0 && (
                <div className={styles.stationsSection}>
                  <h3 className={styles.sectionTitle}>CAIs Cercanos</h3>
                  <div className={styles.stationsList}>
                    {alert.nearbyStations.map((station: any, index: number) => (
                      <div key={index} className={styles.stationCard}>
                        <div className={styles.stationName}>{station.name}</div>
                        <div className={styles.stationDistance}>Distancia: {station.distance.toFixed(2)} km</div>
                        {station.phone && <div className={styles.stationPhone}>Teléfono: {station.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicación de la Alerta</CardTitle>
              <CardDescription>Mapa con la ubicación exacta de la emergencia</CardDescription>
            </CardHeader>
            <CardContent className={styles.mapContent}>
              <div className={styles.mapContainer}>
                <AlertMap
                  alert={alert}
                  policeStations={[
                    { name: "CAI Centro", lat: 6.2476, lng: -75.5658 },
                    { name: "CAI Poblado", lat: 6.2107, lng: -75.5696 },
                    { name: "CAI Laureles", lat: 6.245, lng: -75.5926 },
                    { name: "CAI Belén", lat: 6.2342, lng: -75.6068 },
                    { name: "CAI Robledo", lat: 6.2867, lng: -75.5908 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

