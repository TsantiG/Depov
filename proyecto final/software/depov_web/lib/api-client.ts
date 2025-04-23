// Cliente API para hacer peticiones desde el frontend

// Función genérica para hacer peticiones a la API
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  
    const data = await response.json()
  
    if (!response.ok) {
      throw new Error(data.error || "Error en la petición")
    }
  
    return data as T
  }
  
  // Funciones específicas para cada endpoint
  
  // Usuarios
  export async function getUsers() {
    return fetchAPI<any[]>("/users")
  }
  
  export async function getUser(id: number) {
    return fetchAPI<any>(`/users/${id}`)
  }
  
  export async function createUser(userData: any) {
    return fetchAPI<{ success: boolean }>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }
  
  export async function updateUser(id: number, userData: any) {
    return fetchAPI<{ success: boolean }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }
  
  export async function deleteUser(id: number) {
    return fetchAPI<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    })
  }
  
  // Alertas
  export async function getAlerts() {
    return fetchAPI<any[]>("/alerts")
  }
  
  export async function getAlert(id: number) {
    return fetchAPI<any>(`/alerts/${id}`)
  }
  
  export async function createAlert(alertData: any) {
    return fetchAPI<{ success: boolean; alertId: number; nearbyStations: any[] }>("/alerts", {
      method: "POST",
      body: JSON.stringify(alertData),
    })
  }
  
  export async function updateAlertStatus(id: number, status: string) {
    return fetchAPI<{ success: boolean }>(`/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }
  
  // Autenticación
  export async function login(email: string, password: string) {
    return fetchAPI<{ success: boolean; userId: number; role: string; name: string }>("/auth", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }
  
  