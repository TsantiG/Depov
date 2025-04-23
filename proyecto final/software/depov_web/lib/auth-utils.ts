// Funciones de utilidad para autenticación del lado del cliente

// Guardar información de sesión en localStorage
export function saveSession(userId: string, role: string, name: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("userId", userId)
      localStorage.setItem("userRole", role)
      localStorage.setItem("userName", name)
      console.log("Sesión guardada:", { userId, role, name })
    }
  }
  
  // Obtener información de sesión
  export function getSession() {
    if (typeof window === "undefined") return null
  
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")
    const userName = localStorage.getItem("userName")
  
    if (!userId || !userRole) {
      console.log("No se encontró sesión en localStorage")
      return null
    }
  
    console.log("Sesión recuperada:", { userId, userRole, userName })
    return {
      userId,
      userRole,
      userName,
    }
  }
  
  // Verificar si el usuario está autenticado
  export function isAuthenticated() {
    return getSession() !== null
  }
  
  // Verificar si el usuario tiene un rol específico
  export function hasRole(role: string) {
    const session = getSession()
    return session !== null && session.userRole === role
  }
  
  // Cerrar sesión
  export function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      console.log("Sesión cerrada")
    }
  }
  
  