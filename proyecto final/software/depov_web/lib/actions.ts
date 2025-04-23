"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// This is a mock database implementation
// In a real application, you would use a real database like MySQL with XAMPP

// Mock data
const users = [
  {
    id: 1,
    name: "Juan Pérez",
    document: "1234567890",
    email: "juan@example.com",
    phone: "3001234567",
    address: "Calle 10 #30-45, Medellín",
    password: "password123", // In a real app, this would be hashed
    role: "user",
    contact1_name: "María Pérez",
    contact1_phone: "3009876543",
    contact2_name: "Carlos Pérez",
    contact2_phone: "3005678901",
  },
  {
    id: 2,
    name: "Admin",
    document: "0987654321",
    email: "admin@example.com",
    phone: "3001112233",
    address: "Calle 50 #40-30, Medellín",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    contact1_name: "Contact 1",
    contact1_phone: "3001234567",
    contact2_name: "Contact 2",
    contact2_phone: "3007654321",
  },
  {
    id: 3,
    name: "Oficial García",
    document: "5678901234",
    email: "policia@example.com",
    phone: "3004445566",
    address: "Estación Central, Medellín",
    password: "policia123", // In a real app, this would be hashed
    role: "police",
    contact1_name: "Contact 1",
    contact1_phone: "3001234567",
    contact2_name: "Contact 2",
    contact2_phone: "3007654321",
  },
]

let alerts = [
  {
    id: 1,
    userId: 1,
    user: users[0],
    timestamp: "2025-03-25T14:30:00Z",
    location: { lat: 6.2476, lng: -75.5658 },
    status: "pendiente",
  },
]

// User actions
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const document = formData.get("document") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const password = formData.get("password") as string
  const contact1_name = formData.get("contact1_name") as string
  const contact1_phone = formData.get("contact1_phone") as string
  const contact2_name = formData.get("contact2_name") as string
  const contact2_phone = formData.get("contact2_phone") as string

  // Check if user already exists
  if (users.some((user) => user.email === email)) {
    throw new Error("User with this email already exists")
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    document,
    email,
    phone,
    address,
    password, // In a real app, this would be hashed
    role: "user",
    contact1_name,
    contact1_phone,
    contact2_name,
    contact2_phone,
  }

  users.push(newUser)

  return { success: true }
}

export async function loginUser(email: string, password: string) {
  // Find user
  const user = users.find((user) => user.email === email && user.password === password)

  if (!user) {
    return { success: false }
  }

  // Set session cookie
  cookies().set("userId", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  cookies().set("userRole", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true, role: user.role }
}

export async function getUserProfile() {
  const userId = cookies().get("userId")?.value

  if (!userId) {
    redirect("/login")
  }

  const user = users.find((user) => user.id === Number.parseInt(userId))

  if (!user) {
    redirect("/login")
  }

  // Don't return password
  const { password, ...userWithoutPassword } = user

  return userWithoutPassword
}

export async function getAllUsers() {
  // Check if admin
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  // Return users without passwords
  return users.map(({ password, ...user }) => user)
}

export async function getUserById(id: number) {
  // Check if admin
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  const user = users.find((user) => user.id === id)

  if (!user) {
    throw new Error("User not found")
  }

  // Don't return password
  const { password, ...userWithoutPassword } = user

  return userWithoutPassword
}

export async function updateUser(userData: any) {
  // Check if admin
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  const index = users.findIndex((user) => user.id === userData.id)

  if (index === -1) {
    throw new Error("User not found")
  }

  // Update user data
  users[index] = {
    ...users[index],
    ...userData,
  }

  revalidatePath("/admin/dashboard")

  return { success: true }
}

export async function deleteUser(id: number) {
  // Check if admin
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  const index = users.findIndex((user) => user.id === id)

  if (index === -1) {
    throw new Error("User not found")
  }

  // Remove user
  users.splice(index, 1)

  // Remove associated alerts
  alerts = alerts.filter((alert) => alert.userId !== id)

  revalidatePath("/admin/dashboard")

  return { success: true }
}

// Alert actions
export async function sendEmergencyAlert(alertData: any) {
  const userId = cookies().get("userId")?.value

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = users.find((user) => user.id === Number.parseInt(userId))

  if (!user) {
    throw new Error("User not found")
  }

  // Create new alert
  const newAlert = {
    id: alerts.length + 1,
    userId: Number.parseInt(userId),
    user: user,
    timestamp: alertData.timestamp,
    location: alertData.location,
    status: "pendiente",
  }

  alerts.push(newAlert)

  return { success: true }
}

export async function getAllAlerts() {
  // Check if admin
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "admin" && userRole !== "police") {
    throw new Error("Unauthorized")
  }

  return alerts
}

export async function getActiveAlerts() {
  // Check if police
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "police" && userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  // Return alerts sorted by timestamp (newest first)
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function updateAlertStatus(alertId: number, status: string) {
  // Check if police
  const userRole = cookies().get("userRole")?.value

  if (userRole !== "police" && userRole !== "admin") {
    throw new Error("Unauthorized")
  }

  const index = alerts.findIndex((alert) => alert.id === alertId)

  if (index === -1) {
    throw new Error("Alert not found")
  }

  // Update alert status
  alerts[index].status = status

  revalidatePath("/police/dashboard")
  revalidatePath("/admin/dashboard")

  return { success: true }
}

