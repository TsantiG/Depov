import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener un usuario por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // En una implementación real, verificaríamos la autenticación aquí
    const id = params.id

    const query = `
      SELECT id, name, document, email, phone, address, role,
             contact1_name, contact1_phone, contact2_name, contact2_phone 
      FROM users 
      WHERE id = ?
    `

    const results = (await executeQuery(query, [id])) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}


// Actualizar un usuario
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, document, email, phone, address, contact1_name, contact1_phone, contact2_name, contact2_phone } = body

    if (
      !name || !document || !email || !phone || !address ||
      !contact1_name || !contact1_phone || !contact2_name || !contact2_phone
    ) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const updateQuery = `
      UPDATE users 
      SET name = ?, document = ?, email = ?, phone = ?, address = ?,
          contact1_name = ?, contact1_phone = ?, contact2_name = ?, contact2_phone = ?
      WHERE id = ?
    `
    await executeQuery(updateQuery, [
      name, document, email, phone, address,
      contact1_name, contact1_phone, contact2_name, contact2_phone,
      id,
    ])

    // Obtener los datos actualizados
    const selectQuery = `SELECT * FROM users WHERE id = ?`

    type User = {
      id: number
      name: string
      document: string
      email: string
      phone: string
      address: string
      contact1_name: string
      contact1_phone: string
      contact2_name: string
      contact2_phone: string
    }
    
    const results = await executeQuery(selectQuery, [id]) as User[]
    const updatedUser = results[0]

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Eliminar un usuario
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    // En una implementación real, verificaríamos la autenticación aquí

    // Eliminar usuario
    const deleteQuery = "DELETE FROM users WHERE id = ?"
    await executeQuery(deleteQuery, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

