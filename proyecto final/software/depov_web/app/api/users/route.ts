import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener todos los usuarios
export async function GET(request: Request) {
  try {
    // En una implementación real, verificaríamos la autenticación aquí

    const query = `
      SELECT id, name, document, email, phone, address, role, 
             contact1_name, contact1_phone, contact2_name, contact2_phone 
      FROM users
    `

    const users = await executeQuery(query)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      document,
      email,
      phone,
      address,
      password,
      contact1_name,
      contact1_phone,
      contact2_name,
      contact2_phone,
    } = body

    // Validar datos de entrada
    if (
      !name ||
      !document ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !contact1_name ||
      !contact1_phone ||
      !contact2_name ||
      !contact2_phone
    ) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el correo ya existe
    const checkQuery = "SELECT id FROM users WHERE email = ?"
    const existingUsers = (await executeQuery(checkQuery, [email])) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO users (
        name, document, email, phone, address, password, role,
        contact1_name, contact1_phone, contact2_name, contact2_phone
      ) VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, ?)
    `

    await executeQuery(insertQuery, [
      name,
      document,
      email,
      phone,
      address,
      password, // En una app real, esto estaría hasheado
      contact1_name,
      contact1_phone,
      contact2_name,
      contact2_phone,
    ])

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

