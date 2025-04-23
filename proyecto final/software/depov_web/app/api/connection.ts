import mysql from "mysql2/promise"

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "emergency_alert_system2",
}

// Función para crear una conexión a la base de datos
export async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error)
    throw new Error("No se pudo conectar a la base de datos")
  }
}

// Función para ejecutar una consulta SQL
export async function executeQuery(query: string, params: any[] = []) {
  let connection

  try {
    connection = await connectToDatabase()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

