package com.co.apps.Alerta_Inmediata.Depov

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val user: UserData, // Puede venir null si falla el login
    val token: String?    // En caso de que luego uses JWT
)
