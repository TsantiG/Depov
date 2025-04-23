"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth-utils"
import { getUser, createAlert } from "@/lib/api-client"
import { useToast } from "@/components/ui/toaster"
import AuthGuard from "@/components/auth-guard"
import styles from "./dashboard.module.css"
import Footer from "@/components/ui/footer"

// Extender la interfaz Window para incluir Leaflet
declare global {
  interface Window {
    L: any
  }
}

export default function Dashboard() {
  const { addToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const session = getSession()
        if (!session) {
          console.log("No hay sesión en el dashboard")
          return
        }

        console.log("Cargando perfil para el usuario:", session.userId)
        const userData = await getUser(Number.parseInt(session.userId))
        setUser(userData)
        console.log("Perfil cargado:", userData)
      } catch (error) {
        console.error("Error loading profile:", error)
        addToast({
          title: "Error",
          description: "No se pudo cargar tu perfil. Por favor intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()

    // Iniciar el seguimiento de ubicación en tiempo real
    startLocationTracking()

    // Cargar Leaflet para mostrar el mapa
    loadLeaflet()

    // Limpiar al desmontar
    return () => {
      stopLocationTracking()
      // Limpiar el mapa al desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Efecto para inicializar el mapa cuando Leaflet y el contenedor del mapa estén listos
  useEffect(() => {
    if (leafletLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [leafletLoaded, location])

  // Modificar la función loadLeaflet para asegurar que el mapa se inicialice correctamente
  const loadLeaflet = async () => {
    try {
      if (typeof window === "undefined") return

      // Si ya existe un script de Leaflet, no lo cargamos de nuevo
      if (window.L) {
        console.log("Leaflet ya está cargado")
        setLeafletLoaded(true)
        return
      }

      // Cargar CSS de Leaflet
      const linkElement = document.createElement("link")
      linkElement.rel = "stylesheet"
      linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      linkElement.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      linkElement.crossOrigin = ""
      document.head.appendChild(linkElement)

      // Cargar script de Leaflet
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.async = true

      script.onload = () => {
        console.log("Leaflet cargado correctamente")
        setLeafletLoaded(true)
      }

      script.onerror = (e) => {
        console.error("Error al cargar Leaflet:", e)
      }

      document.body.appendChild(script)
    } catch (error) {
      console.error("Error en loadLeaflet:", error)
    }
  }

  // Modificar la función initializeMap para mejorar el debuggeo
  const initializeMap = () => {
    try {
      console.log("Intentando inicializar mapa:", {
        mapRef: mapRef.current,
        windowL: typeof window !== "undefined" ? !!window.L : false,
        mapInstance: !!mapInstanceRef.current,
      })

      if (!mapRef.current) {
        console.error("mapRef.current no está definido")
        return
      }

      if (!window.L) {
        console.error("window.L no está definido")
        return
      }

      if (mapInstanceRef.current) {
        console.log("El mapa ya está inicializado")
        // Si ya tenemos la ubicación, actualizar el mapa
        if (location) {
          updateMapLocation(location)
        }
        return
      }

      // Asegurarse de que el contenedor del mapa tenga dimensiones
      mapRef.current.style.width = "100%"
      mapRef.current.style.height = "400px"

      console.log("Inicializando mapa en el elemento:", mapRef.current)

      try {
        // Coordenadas de Medellín por defecto
        const defaultCoords = location ? [location.lat, location.lng] : [6.2476, -75.5658]

        // Crear el mapa con un ID único para evitar conflictos
        const mapId = `map-${Date.now()}`
        mapRef.current.id = mapId

        // Crear el mapa
        const map = window.L.map(mapId).setView(defaultCoords, 13)

        // Añadir capa de OpenStreetMap
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Guardar referencia al mapa
        mapInstanceRef.current = map
        console.log("Mapa inicializado correctamente")
        setMapLoaded(true)

        // Invalidar el tamaño del mapa después de que se haya renderizado
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)

        // Si ya tenemos la ubicación, actualizar el mapa
        if (location) {
          updateMapLocation(location)
        }
      } catch (mapError) {
        console.error("Error al crear el mapa:", mapError)
      }
    } catch (error) {
      console.error("Error en initializeMap:", error)
    }
  }

  // Actualizar la ubicación en el mapa
  const updateMapLocation = (loc: { lat: number; lng: number }, accuracy = 100) => {
    try {
      if (!mapInstanceRef.current || !window.L) {
        console.error("Mapa no inicializado")
        return
      }

      const map = mapInstanceRef.current

      // Centrar el mapa en la ubicación actual
      map.setView([loc.lat, loc.lng], 16) // Aumentar el zoom para mayor detalle

      // Si ya existe un marcador, actualizarlo
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([loc.lat, loc.lng])
      } else {
        // Crear un icono rojo personalizado para el usuario
        const redIcon = window.L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        // Añadir marcador para el usuario
        userMarkerRef.current = window.L.marker([loc.lat, loc.lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(`Tu ubicación actual<br>Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)}`)
      }

      // Eliminar círculos de precisión anteriores
      if (map.accuracyCircle) {
        map.accuracyCircle.remove()
      }

      // Añadir un círculo para mostrar la precisión aproximada
      map.accuracyCircle = window.L.circle([loc.lat, loc.lng], {
        radius: accuracy || 100, // Radio en metros basado en la precisión
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
      }).addTo(map)

      // Actualizar el popup con la información de ubicación
      userMarkerRef.current.setPopupContent(
        `<b>Tu ubicación actual</b><br>` +
          `Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)}<br>` +
          `Precisión: ${Math.round(accuracy || 100)} metros`,
      )

      // Abrir el popup automáticamente
      userMarkerRef.current.openPopup()
    } catch (error) {
      console.error("Error en updateMapLocation:", error)
    }
  }

  // Iniciar el seguimiento de ubicación
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta la geolocalización")
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    // Opciones de alta precisión para geolocalización
    const geoOptions = {
      enableHighAccuracy: true, // Solicitar la mayor precisión posible
      timeout: 15000, // Aumentar el tiempo de espera a 15 segundos
      maximumAge: 0, // Siempre obtener una posición fresca
    }

    // Obtener la ubicación inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        console.log("Ubicación inicial obtenida:", newLocation, "Precisión:", position.coords.accuracy, "metros")

        // Guardar información adicional de precisión
        const locationWithAccuracy = {
          ...newLocation,
          accuracy: position.coords.accuracy,
        }

        setLocation(newLocation)
        setIsGettingLocation(false)

        // Mostrar toast con información de precisión
        addToast({
          title: "Ubicación obtenida",
          description: `Precisión: ${Math.round(position.coords.accuracy)} metros`,
        })
      },
      (error) => {
        console.error("Error getting initial location:", error)
        handleLocationError(error)
        setIsGettingLocation(false)
      },
      geoOptions,
    )

    // Configurar el seguimiento continuo de la ubicación
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        console.log("Ubicación actualizada:", newLocation, "Precisión:", position.coords.accuracy, "metros")

        setLocation(newLocation)
        setLocationError(null)

        // Actualizar el mapa si ya está inicializado
        if (mapInstanceRef.current && userMarkerRef.current) {
          updateMapLocation(newLocation, position.coords.accuracy)
        }
      },
      (error) => {
        console.error("Error watching location:", error)
        handleLocationError(error)
      },
      geoOptions,
    )
  }

  // Detener el seguimiento de ubicación
  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  // Manejar errores de geolocalización
  const handleLocationError = (error: GeolocationPositionError) => {
    let errorMessage = "Error desconocido al obtener la ubicación"

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Has denegado el permiso de ubicación. Por favor habilítalo para usar esta función."
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = "La información de ubicación no está disponible en este momento."
        break
      case error.TIMEOUT:
        errorMessage = "Se agotó el tiempo de espera al obtener tu ubicación."
        break
    }

    setLocationError(errorMessage)
    addToast({
      title: "Error de ubicación",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Refrescar manualmente la ubicación
  const refreshLocation = () => {
    setIsGettingLocation(true)

    // Opciones de alta precisión
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(newLocation)
        setIsGettingLocation(false)

        // Actualizar el mapa con la precisión
        if (mapInstanceRef.current) {
          updateMapLocation(newLocation, position.coords.accuracy)
        }

        addToast({
          title: "Ubicación actualizada",
          description: `Precisión: ${Math.round(position.coords.accuracy)} metros`,
        })
      },
      (error) => {
        console.error("Error refreshing location:", error)
        handleLocationError(error)
        setIsGettingLocation(false)
      },
      geoOptions,
    )
  }

  async function handleSendAlert() {
    if (!location) {
      addToast({
        title: "Error",
        description: "No se pudo obtener tu ubicación. Por favor habilita los permisos de ubicación.",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const session = getSession()
      if (!session) {
        console.error("No hay sesión al enviar alerta")
        addToast({
          title: "Error",
          description: "No se pudo verificar tu sesión. Por favor intenta iniciar sesión nuevamente.",
          variant: "destructive",
        })
        setSending(false)
        return
      }

      console.log("Enviando alerta para el usuario:", session.userId, "con ubicación:", location)

      const response = await createAlert({
        userId: Number.parseInt(session.userId),
        location: location,
      })

      console.log("Respuesta de alerta:", response)

      addToast({
        title: "Alerta enviada",
        description: "Tu alerta de emergencia ha sido enviada. La policía ha sido notificada.",
      })
    } catch (error) {
      console.error("Error sending alert:", error)
      addToast({
        title: "Error",
        description: "No se pudo enviar la alerta. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
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
          <p>No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="container">
        <h1 className={styles.pageTitle}>Panel de Usuario</h1>

        <div className={styles.dashboardGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Tu información registrada en el sistema</CardDescription>
            </CardHeader>
            <CardContent className={styles.userInfoContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nombre:</span> {user.name}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Documento:</span> {user.document}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Correo:</span> {user.email}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Teléfono:</span> {user.phone}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Dirección:</span> {user.address}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contactos de Emergencia</CardTitle>
              <CardDescription>Personas que serán notificadas en caso de emergencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.contactCard}>
                <div className={styles.contactName}>{user.contact1_name}</div>
                <div className={styles.contactPhone}>
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
                    className={styles.phoneIcon}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {user.contact1_phone}
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactName}>{user.contact2_name}</div>
                <div className={styles.contactPhone}>
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
                    className={styles.phoneIcon}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {user.contact2_phone}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de ubicación actual */}
        <Card className={styles.mapCard}>
          <CardHeader>
            <div className={styles.mapHeader}>
              <CardTitle>Tu Ubicación Actual</CardTitle>
              <Button
                variant="outline"
                onClick={refreshLocation}
                disabled={isGettingLocation}
                className={styles.refreshButton}
              >
                {isGettingLocation ? (
                  <>
                    <div className={styles.smallSpinner}></div>
                    Actualizando...
                  </>
                ) : (
                  <>
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
                      className={styles.locationIcon}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Actualizar ubicación
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Esta es tu ubicación en tiempo real que será enviada en caso de emergencia
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.mapContent}>
            <div ref={mapRef} className={styles.mapContainer} style={{ height: "400px", width: "100%" }}>
              {!mapLoaded && (
                <div className={styles.mapLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Cargando mapa...</p>
                </div>
              )}
            </div>
            {locationError && <div className={styles.locationError}>{locationError}</div>}
          </CardContent>
        </Card>

        {/* Botón de alerta */}
        <Card className={styles.alertCard}>
          <CardHeader className={styles.alertHeader}>
            <CardTitle className={styles.alertTitle}>
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
                className={styles.alertIcon}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Alerta de Emergencia
            </CardTitle>
            <CardDescription className={styles.alertDescription}>
              Usa este botón solo en caso de emergencia real
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.alertContent}>
            <div className={styles.locationInfo}>
              {location ? (
                <div className={styles.currentLocation}>
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
                    className={styles.locationIcon}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Ubicación actual: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
              ) : (
                <div className={styles.noLocation}>
                  {isGettingLocation ? (
                    <>
                      <div className={styles.smallSpinner}></div>
                      Obteniendo tu ubicación...
                    </>
                  ) : (
                    "No se pudo obtener tu ubicación. Por favor, actualiza la ubicación."
                  )}
                </div>
              )}
            </div>
            <p className={styles.alertInfo}>
              Al presionar el botón de emergencia, se enviará una alerta a la policía de Medellín con tu ubicación
              exacta en tiempo real. Los CAI más cercanos serán notificados para asistirte.
            </p>
          </CardContent>
          <CardFooter>
            
          </CardFooter>
        </Card><Button
  showLogo                                                 // Añadido para mostrar el logo
  className={styles.emergencyButton}
  disabled={sending || !location || isGettingLocation}
  onClick={handleSendAlert}
>
  {sending ? (
    <>
      <div className={styles.buttonSpinner}></div>
      <br></br>
      Enviando alerta...
    </>
    
  ) : (

    "click aqui"
  )}
</Button>
      </div>
    </AuthGuard>
  )
}

