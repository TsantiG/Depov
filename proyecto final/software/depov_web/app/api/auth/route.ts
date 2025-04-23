import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validar datos de entrada
    if (!email || !password) {
      return NextResponse.json({ error: "Correo electrónico y contraseña son requeridos" }, { status: 400 })
    }

    // En una aplicación real, la contraseña estaría hasheada
    const query = `
      SELECT id, name, role 
      FROM users 
      WHERE email = ? AND password = ?
    `

    const results = (await executeQuery(query, [email, password])) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = results[0]

    // En lugar de usar cookies directamente, vamos a devolver los datos
    // para que el cliente los maneje con localStorage o similar
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: email, // si quieres devolverlo
        role: user.role
      }
    })
  } catch (error) {
    console.error("Error en la autenticación:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

