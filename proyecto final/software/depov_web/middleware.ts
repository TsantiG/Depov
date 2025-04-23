import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función se puede marcar como `async` si se usa `await` dentro
export function middleware(request: NextRequest) {
  // Obtener la respuesta
  const response = NextResponse.next()

  // Agregar los headers CORS
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", "*") // Permite cualquier origen
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  // Si es una solicitud OPTIONS (preflight), devolver 200
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

// Configurar el middleware para que solo se ejecute en rutas de API
export const config = {
  matcher: "/api/:path*",
}

