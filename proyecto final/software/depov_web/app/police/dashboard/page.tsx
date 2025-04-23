"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { getAlerts, updateAlertStatus } from "@/lib/api-client"
import AlertMap from "@/components/alert-map"
import AuthGuard from "@/components/auth-guard"
import styles from "./dashboard.module.css"

export default function PoliceDashboard() {
  const { addToast } = useToast()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  async function loadAlerts() {
    try {
      console.log("Cargando alertas para el panel de policía...")
      const alertsData = await getAlerts()
      console.log("Alertas cargadas:", alertsData.length)
      setAlerts(alertsData)

      // Si hay una nueva alerta y ya cargamos la página una vez
      if (!loading && alertsData.length > alerts.length) {
        playAlertSound()
        addToast({
          title: "¡Nueva alerta de emergencia!",
          description: "Se ha recibido una nueva alerta de emergencia.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading alerts:", error)
      addToast({
        title: "Error",
        description: "No se pudieron cargar las alertas. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    // Set up polling for new alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000)

    return () => clearInterval(interval)
  }, [])

  function playAlertSound() {
    try {
      const audio = new Audio("/alert-sound.mp3")
      audio.play().catch((e) => console.error("Error playing sound:", e))
    } catch (error) {
      console.error("Error creating audio:", error)
    }
  }

  async function handleMarkAsAttended(alertId: number) {
    try {
      await updateAlertStatus(alertId, "atendida")

      // Update local state
      setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "atendida" } : alert)))

      addToast({
        title: "Alerta actualizada",
        description: "La alerta ha sido marcada como atendida.",
      })

      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status: "atendida" })
      }
    } catch (error) {
      console.error("Error updating alert:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar el estado de la alerta.",
        variant: "destructive",
      })
    }
  }

  function handleViewAlert(alert: any) {
    console.log("Alerta seleccionada:", alert)

    // Verificar que la alerta tenga toda la información necesaria
    if (!alert || !alert.user) {
      console.error("Datos de alerta incompletos:", alert)
      addToast({
        title: "Error",
        description: "No se pudo cargar la información completa de esta alerta.",
        variant: "destructive",
      })
      return
    }

    // Establecer la alerta seleccionada
    setSelectedAlert(alert)

    // Mostrar notificación de éxito
    addToast({
      title: "Alerta seleccionada",
      description: `Mostrando información de la alerta de ${alert.user.name}`,
    })
  }

  // Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
  function calculateDistance(point1: any, point2: any): number {
    try {
      if (!point1 || !point2) return 0

      const R = 6371 // Radio de la Tierra en km
      const dLat = deg2rad(point2.lat - point1.lat)
      const dLng = deg2rad(point2.lng - point1.lng)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    } catch (error) {
      console.error("Error calculando distancia:", error)
      return 0
    }
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
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
    <AuthGuard requiredRole="police">
      <div className="container">
        <h1 className={styles.pageTitle}>Panel de Control - Policía de Medellín</h1>

        <div className={styles.dashboardGrid}>
          <Card className={alerts.length > 0 ? styles.alertsCard : ""}>
            <CardHeader className={alerts.length > 0 ? styles.alertsHeader : ""}>
              <div className={styles.alertsHeaderContent}>
                <CardTitle className={styles.alertsTitle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.bellIcon}
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  Alertas de Emergencia
                  {alerts.length > 0 && <span className={styles.alertBadge}>{alerts.length} activas</span>}
                </CardTitle>
                <CardDescription>Alertas de emergencia enviadas por ciudadanos</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th className={styles.actionsColumn}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert) => (
                        <tr key={alert.id}>
                          <td className={styles.nameCell}>{alert.user.name}</td>
                          <td>{new Date(alert.timestamp).toLocaleTimeString()}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${alert.status === "atendida" ? styles.statusSuccess : styles.statusPending}`}
                            >
                              {alert.status === "atendida" ? "Atendida" : "Pendiente"}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.actionButtons}>
                              <button className={styles.viewButton} onClick={() => handleViewAlert(alert)}>
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
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                              </button>
                              {alert.status !== "atendida" && (
                                <button className={styles.attendButton} onClick={() => handleMarkAsAttended(alert.id)}>
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
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No hay alertas activas en este momento</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mapa de Alertas</CardTitle>
              <CardDescription>
                {selectedAlert
                  ? `Ubicación de la alerta de ${selectedAlert.user.name}`
                  : "Selecciona una alerta para ver su ubicación"}
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.mapContent}>
              <div className={styles.mapContainer}>
                <AlertMap
                  alert={selectedAlert}
                  policeStations={[
                    { name: "CAI Centro", lat: 6.2476, lng: -75.5658 },
                    { name: "CAI Poblado", lat: 6.2107, lng: -75.5696 },
                    { name: "CAI Laureles", lat: 6.245, lng: -75.5926 },
                    { name: "CAI Belén", lat: 6.2342, lng: -75.6068 },
                    { name: "CAI Robledo", lat: 6.2867, lng: -75.5908 },
                    { name: "CAI Castilla", lat: 6.2765, lng: -75.5914 },
                    { name: "CAI San Javier", lat: 6.2754, lng: -75.5890 },
                    { name: "CAI Manrique", lat: 6.2819, lng: -75.5710 },
                    { name: "CAI Conquistadores", lat: 6.2621, lng: -75.5765 },
                    { name: "CAI San Antonio de Prado", lat: 6.1562, lng: -75.6257 },
                    { name: "CAI Guayabal", lat: 6.2091, lng: -75.5855 },
                    { name: "CAI Niquía", lat: 6.3415, lng: -75.5173 },
                    { name: "CAI San Cristóbal", lat: 6.3240, lng: -75.6165 },
                    { name: "CAI El Trapiche", lat: 6.2098, lng: -75.5942 },
                    { name: "CAI El Tesoro", lat: 6.1872, lng: -75.5680 },
                    { name: "CAI Aranjuez", lat: 6.2671, lng: -75.5768 },
                    { name: "CAI Altavista", lat: 6.2679, lng: -75.6012 },
                    { name: "CAI La América", lat: 6.2443, lng: -75.5945 },
                    { name: "CAI Santa Cruz", lat: 6.2349, lng: -75.5859 },
                    { name: "CAI Zamora", lat: 6.2436, lng: -75.5667 }
                  ]
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedAlert && selectedAlert.user && (
          <Card className={styles.detailsCard}>
            <CardHeader>
              <CardTitle>Detalles de la Alerta</CardTitle>
              <CardDescription>Información completa de la alerta seleccionada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.detailsGrid}>
                <div className={styles.detailsSection}>
                  <h3 className={styles.sectionTitle}>Información del Usuario</h3>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Nombre:</span> {selectedAlert.user.name}
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Documento:</span> {selectedAlert.user.document}
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Teléfono:</span>
                      <a href={`tel:${selectedAlert.user.phone}`} className={styles.phoneLink}>
                        {selectedAlert.user.phone}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={styles.phoneIcon}
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </a>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Dirección:</span> {selectedAlert.user.address}
                    </div>
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <h3 className={styles.sectionTitle}>Información de la Alerta</h3>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Fecha y hora:</span>{" "}
                      {new Date(selectedAlert.timestamp).toLocaleString()}
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Coordenadas:</span> {selectedAlert.location.lat.toFixed(6)},{" "}
                      {selectedAlert.location.lng.toFixed(6)}
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Estado:</span>
                      <span
                        className={`${styles.statusBadge} ${selectedAlert.status === "atendida" ? styles.statusSuccess : styles.statusPending}`}
                      >
                        {selectedAlert.status === "atendida" ? "Atendida" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.contactsSection}>
                <h3 className={styles.sectionTitle}>Contactos de Emergencia</h3>
                <div className={styles.contactsGrid}>
                  <div className={styles.contactCard}>
                    <div className={styles.contactName}>{selectedAlert.user.contact1_name}</div>
                    <a href={`tel:${selectedAlert.user.contact1_phone}`} className={styles.contactPhone}>
                      {selectedAlert.user.contact1_phone}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.phoneIcon}
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </a>
                  </div>
                  <div className={styles.contactCard}>
                    <div className={styles.contactName}>{selectedAlert.user.contact2_name}</div>
                    <a href={`tel:${selectedAlert.user.contact2_phone}`} className={styles.contactPhone}>
                      {selectedAlert.user.contact2_phone}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.phoneIcon}
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.stationsSection}>
                <h3 className={styles.sectionTitle}>CAIs más cercanos</h3>
                <div className={styles.stationsGrid}>
                {[
                  {
                    name: "CAI Centro",
                    phone: "6045112233",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2476, lng: -75.5658 }),
                  },
                  {
                    name: "CAI Poblado",
                    phone: "6045223344",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2107, lng: -75.5696 }),
                  },
                  {
                    name: "CAI Laureles",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.245, lng: -75.5926 }),
                  },
                  {
                    name: "CAI Belén",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2342, lng: -75.6068 }),
                  },
                  {
                    name: "CAI Robledo",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2867, lng: -75.5908 }),
                  },
                  {
                    name: "CAI Castilla",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2765, lng: -75.5914 }),
                  },
                  {
                    name: "CAI San Javier",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2754, lng: -75.5890 }),
                  },
                  {
                    name: "CAI Manrique",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2819, lng: -75.5710 }),
                  },
                  {
                    name: "CAI Conquistadores",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2621, lng: -75.5765 }),
                  },
                  {
                    name: "CAI San Antonio de Prado",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.1562, lng: -75.6257 }),
                  },
                  {
                    name: "CAI Guayabal",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2091, lng: -75.5855 }),
                  },
                  {
                    name: "CAI Niquía",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.3415, lng: -75.5173 }),
                  },
                  {
                    name: "CAI San Cristóbal",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.3240, lng: -75.6165 }),
                  },
                  {
                    name: "CAI El Trapiche",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2098, lng: -75.5942 }),
                  },
                  {
                    name: "CAI El Tesoro",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.1872, lng: -75.5680 }),
                  },
                  {
                    name: "CAI Aranjuez",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2671, lng: -75.5768 }),
                  },
                  {
                    name: "CAI Altavista",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2679, lng: -75.6012 }),
                  },
                  {
                    name: "CAI La América",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2443, lng: -75.5945 }),
                  },
                  {
                    name: "CAI Santa Cruz",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2349, lng: -75.5859 }),
                  },
                  {
                    name: "CAI Zamora",
                    phone: "6045334455",
                    distance: calculateDistance(selectedAlert.location, { lat: 6.2436, lng: -75.5667 }),
                  },
                  ]
                    .sort((a, b) => a.distance - b.distance)
                    .map((cai, index) => (
                      <div key={index} className={styles.stationCard}>
                        <div className={styles.stationName}>{cai.name}</div>
                        <div className={styles.stationDistance}>Distancia: {cai.distance.toFixed(2)} km</div>
                        <a href={`tel:${cai.phone}`} className={styles.stationPhone}>
                          {cai.phone}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.phoneIcon}
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </a>
                      </div>
                    ))}
                </div>
              </div>

              {selectedAlert.status !== "atendida" && (
                <div className={styles.actionSection}>
                  <Button className={styles.attendAlertButton} onClick={() => handleMarkAsAttended(selectedAlert.id)}>
                    Marcar como atendida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

