import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener todas las alertas
export async function GET(request: Request) {
  try {
    // En una implementación real, verificaríamos la autenticación aquí

    const query = `
      SELECT a.id, a.user_id, a.latitude, a.longitude, a.status, a.timestamp,
             u.name as user_name, u.document, u.phone, u.address,
             u.contact1_name, u.contact1_phone, u.contact2_name, u.contact2_phone
      FROM alerts a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
    `

    const alerts = (await executeQuery(query)) as any[]

    // Formatear los datos para la respuesta
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      userId: alert.user_id,
      timestamp: alert.timestamp,
      location: {
        lat: Number.parseFloat(alert.latitude),
        lng: Number.parseFloat(alert.longitude),
      },
      status: alert.status,
      user: {
        id: alert.user_id,
        name: alert.user_name,
        document: alert.document,
        phone: alert.phone,
        address: alert.address,
        contact1_name: alert.contact1_name,
        contact1_phone: alert.contact1_phone,
        contact2_name: alert.contact2_name,
        contact2_phone: alert.contact2_phone,
      },
    }))

    return NextResponse.json(formattedAlerts)
  } catch (error) {
    console.error("Error al obtener alertas:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Crear una nueva alerta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, location } = body

    console.log("Recibida solicitud de alerta en tiempo real:", { userId, location })

    // Validar datos de entrada
    if (!userId || !location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      console.log("Datos inválidos:", { userId, location })
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Verificar que el usuario existe y obtener sus datos completos
    const checkUserQuery = `
      SELECT id, name, document, phone, address, 
             contact1_name, contact1_phone, contact2_name, contact2_phone, email
      FROM users 
      WHERE id = ?
    `
    const userResults = (await executeQuery(checkUserQuery, [userId])) as any[]

    if (userResults.length === 0) {
      console.log("Usuario no encontrado:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userData = userResults[0]
    console.log("Usuario verificado, insertando alerta con ubicación en tiempo real")

    // Obtener la fecha y hora actual
    const currentTimestamp = new Date().toISOString()

    // Insertar nueva alerta con la ubicación en tiempo real
    const insertAlertQuery = `
      INSERT INTO alerts (user_id, latitude, longitude, status, timestamp)
      VALUES (?, ?, ?, 'pendiente', ?)
    `

    const result = (await executeQuery(insertAlertQuery, [
      userId, 
      location.lat, 
      location.lng, 
      currentTimestamp
    ])) as any

    const alertId = result.insertId
    console.log("Alerta en tiempo real creada con ID:", alertId)

    // Encontrar los CAIs más cercanos y asignarlos
    const findStationsQuery = `
      SELECT id, name, latitude, longitude, phone,
      (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
      FROM police_stations
      ORDER BY distance
      LIMIT 3
    `

    const nearbyStations = (await executeQuery(findStationsQuery, [location.lat, location.lng, location.lat])) as any[]
    console.log("Estaciones cercanas encontradas para alerta en tiempo real:", nearbyStations.length)

    // Asignar los CAIs cercanos a la alerta
    const assignmentPromises = nearbyStations.map((station) => {
      const insertAssignmentQuery = `
        INSERT INTO alert_assignments (alert_id, police_station_id, distance)
        VALUES (?, ?, ?)
      `

      return executeQuery(insertAssignmentQuery, [alertId, station.id, station.distance])
    })

    await Promise.all(assignmentPromises)
    console.log("Asignaciones completadas para alerta en tiempo real")

    // Formatear la respuesta para que coincida con AlertResponse
    const response = {
      id: alertId,
      userId: userId,
      timestamp: currentTimestamp,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      status: 'pendiente',
      user: {
        id: userData.id,
        name: userData.name,
        document: userData.document,
        phone: userData.phone,
        address: userData.address,
        contact1_name: userData.contact1_name,
        contact1_phone: userData.contact1_phone,
        contact2_name: userData.contact2_name,
        contact2_phone: userData.contact2_phone,
        email: userData.email
      },
      nearbyStations: nearbyStations.map(station => ({
        id: station.id,
        name: station.name,
        distance: station.distance,
        location: {
          lat: station.latitude,
          lng: station.longitude
        },
        phone: station.phone || ""  // Valor por defecto si phone es null
      }))
    }

    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error("Error al crear alerta en tiempo real:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}