import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener una alerta por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // En una implementación real, verificaríamos la autenticación aquí
    const id = params.id

    const query = `
      SELECT a.id, a.user_id, a.latitude, a.longitude, a.status, a.timestamp,
             u.name as user_name, u.document, u.phone, u.address,
             u.contact1_name, u.contact1_phone, u.contact2_name, u.contact2_phone
      FROM alerts a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `

    const results = (await executeQuery(query, [id])) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 })
    }

    const alert = results[0]

    // Mejorar la respuesta de la API para asegurar que todos los datos necesarios estén presentes
    // Añadir más validación y manejo de errores

    // En la función GET, añadir más validación antes de formatear la respuesta:
    if (!alert || !alert.user_id || !alert.latitude || !alert.longitude) {
      console.error("Datos de alerta incompletos:", alert)
      return NextResponse.json({ error: "Datos de alerta incompletos o inválidos" }, { status: 500 })
    }

    // Asegurarse de que las coordenadas sean números válidos
    const latitude = Number.parseFloat(alert.latitude)
    const longitude = Number.parseFloat(alert.longitude)

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Coordenadas inválidas:", { latitude, longitude })
      return NextResponse.json({ error: "Coordenadas inválidas en la alerta" }, { status: 500 })
    }

    // Obtener las asignaciones de CAIs para esta alerta
    const assignmentsQuery = `
      SELECT aa.police_station_id, aa.distance, ps.name, ps.latitude, ps.longitude, ps.phone
      FROM alert_assignments aa
      JOIN police_stations ps ON aa.police_station_id = ps.id
      WHERE aa.alert_id = ?
      ORDER BY aa.distance
    `

    const assignments = (await executeQuery(assignmentsQuery, [id])) as any[]

    // Formatear los datos para la respuesta con valores por defecto para evitar undefined
    const formattedAlert = {
      id: alert.id,
      userId: alert.user_id,
      timestamp: alert.timestamp || new Date().toISOString(),
      location: {
        lat: latitude,
        lng: longitude,
      },
      status: alert.status || "pendiente",
      user: {
        id: alert.user_id,
        name: alert.user_name || "Usuario sin nombre",
        document: alert.document || "Sin documento",
        phone: alert.phone || "Sin teléfono",
        address: alert.address || "Sin dirección",
        contact1_name: alert.contact1_name || "Sin contacto 1",
        contact1_phone: alert.contact1_phone || "Sin teléfono de contacto 1",
        contact2_name: alert.contact2_name || "Sin contacto 2",
        contact2_phone: alert.contact2_phone || "Sin teléfono de contacto 2",
      },
      nearbyStations: assignments.map((station) => ({
        id: station.police_station_id,
        name: station.name || "Estación sin nombre",
        distance: Number.parseFloat(station.distance) || 0,
        location: {
          lat: Number.parseFloat(station.latitude) || 0,
          lng: Number.parseFloat(station.longitude) || 0,
        },
        phone: station.phone || "Sin teléfono",
      })),
    }

    return NextResponse.json(formattedAlert)
  } catch (error) {
    console.error("Error al obtener alerta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Actualizar el estado de una alerta
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { status } = body

    // Validar datos de entrada
    if (!status || !["pendiente", "atendida"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Actualizar estado de la alerta
    const updateQuery = `
      UPDATE alerts 
      SET status = ?
      WHERE id = ?
    `

    await executeQuery(updateQuery, [status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar alerta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

