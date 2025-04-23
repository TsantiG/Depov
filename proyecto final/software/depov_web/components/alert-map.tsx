"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./alert-map.module.css"

interface Location {
  lat: number
  lng: number
}

interface PoliceStation {
  name: string
  lat: number
  lng: number
}

interface AlertMapProps {
  alert: any | null
  policeStations: PoliceStation[]
}

export default function AlertMap({ alert, policeStations }: AlertMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Cargar Leaflet dinámicamente en el cliente
  useEffect(() => {
    // Solo cargar el mapa una vez
    if (mapLoaded) return

    // Función para cargar el script de Leaflet
    const loadLeaflet = async () => {
      try {
        // Verificar si Leaflet ya está cargado
        if (window.L) {
          console.log("Leaflet ya está cargado")
          setMapLoaded(true)
          initializeMap()
          return
        }

        // Cargar CSS de Leaflet
        const linkElement = document.createElement("link")
        linkElement.rel = "stylesheet"
        linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(linkElement)

        // Cargar script de Leaflet
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.async = true

        script.onload = () => {
          console.log("Leaflet cargado correctamente")
          setMapLoaded(true)
          initializeMap()
        }

        script.onerror = (e) => {
          console.error("Error al cargar Leaflet:", e)
        }

        document.body.appendChild(script)
      } catch (error) {
        console.error("Error en loadLeaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

  // Inicializar el mapa una vez que Leaflet esté cargado
  function initializeMap() {
    try {
      if (!mapRef.current) {
        console.error("mapRef.current es null")
        return
      }

      if (!window.L) {
        console.error("window.L no está definido")
        return
      }

      // Coordenadas de Medellín
      const medellinCoords = [6.2476, -75.5658]

      // Crear el mapa
      const map = window.L.map(mapRef.current).setView(medellinCoords, 13)

      // Añadir capa de OpenStreetMap
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Guardar referencia al mapa
      leafletMapRef.current = map

      // Si hay una alerta seleccionada, mostrarla
      if (alert && alert.location) {
        updateMap(alert.location)
      }
    } catch (error) {
      console.error("Error en initializeMap:", error)
    }
  }

  // Actualizar el mapa cuando cambia la alerta seleccionada
  useEffect(() => {
    if (mapLoaded && leafletMapRef.current && alert && alert.location) {
      updateMap(alert.location)
    }
  }, [alert, mapLoaded])

  // Modificar la función updateMap para cambiar el color del marcador del usuario a rojo
  // y los marcadores de los CAIs a azul
  function updateMap(location: Location) {
    try {
      if (!leafletMapRef.current || !window.L) {
        console.error("Mapa no inicializado")
        return
      }

      const map = leafletMapRef.current

      // Validar la ubicación
      if (
        !location ||
        typeof location.lat !== "number" ||
        typeof location.lng !== "number" ||
        isNaN(location.lat) ||
        isNaN(location.lng)
      ) {
        console.error("Ubicación inválida:", location)
        return
      }

      // Limpiar marcadores anteriores
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          if (marker) {
            try {
              map.removeLayer(marker)
            } catch (error) {
              console.error("Error al eliminar marcador:", error)
            }
          }
        })
      }
      markersRef.current = []

      // Centrar el mapa en la ubicación de la alerta
      map.setView([location.lat, location.lng], 14)

      // Crear un icono rojo personalizado para la alerta del usuario
      const redIcon = window.L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      // Crear marcador rojo para la alerta del usuario
      const alertMarker = window.L.marker([location.lat, location.lng], {
        icon: redIcon,
      })
        .addTo(map)
        .bindPopup(`<b>Alerta de Emergencia</b><br>Coordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`)

      markersRef.current.push(alertMarker)

      // Crear un icono azul para los CAIs
      const blueIcon = window.L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      // Añadir marcadores para los CAIs cercanos si existen
      if (Array.isArray(policeStations) && policeStations.length > 0) {
        // Calcular distancias para todos los CAIs
        const stationsWithDistance = policeStations.map((station) => ({
          ...station,
          distance: calculateDistance(location, station),
        }))

        // Ordenar por distancia y tomar los 3 más cercanos
        const nearestStations = stationsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3)

        // Mostrar los CAIs más cercanos
        nearestStations.forEach((station) => {
          // Validar la estación
          if (
            !station ||
            typeof station.lat !== "number" ||
            typeof station.lng !== "number" ||
            isNaN(station.lat) ||
            isNaN(station.lng)
          ) {
            console.error("Estación inválida:", station)
            return
          }

          try {
            // Usar marcador azul para las estaciones
            const stationMarker = window.L.marker([station.lat, station.lng], {
              icon: blueIcon,
            })
              .addTo(map)
              .bindPopup(`<b>${station.name || "CAI"}</b><br>Distancia: ${station.distance.toFixed(2)} km`)

            markersRef.current.push(stationMarker)

            // Dibujar línea entre la alerta y el CAI
            try {
              const line = window.L.polyline(
                [
                  [location.lat, location.lng],
                  [station.lat, station.lng],
                ],
                { color: "#3b82f6", weight: 2, opacity: 0.7, dashArray: "5, 5" },
              ).addTo(map)

              markersRef.current.push(line)
            } catch (lineError) {
              console.error("Error al dibujar línea:", lineError)
            }
          } catch (stationError) {
            console.error("Error al procesar estación:", stationError)
          }
        })
      }
    } catch (error) {
      console.error("Error en updateMap:", error)
    }
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(point1: Location, point2: Location): number {
    try {
      const R = 6371 // Earth's radius in km
      const dLat = deg2rad(point2.lat - point1.lat)
      const dLng = deg2rad(point2.lng - point1.lng)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    } catch (error) {
      console.error("Error en calculateDistance:", error)
      return 0 // Valor por defecto
    }
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  return (
    <div className={styles.mapContainer} ref={mapRef}>
      {!mapLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <p>Cargando mapa...</p>
          </div>
        </div>
      )}

      {!alert && mapLoaded && (
        <div className={styles.noAlertOverlay}>
          <div className={styles.noAlertContent}>
            <p>Selecciona una alerta para ver su ubicación en el mapa</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Extender la interfaz Window para incluir Leaflet
declare global {
  interface Window {
    L: any
  }
}

