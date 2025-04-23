package com.co.apps.Alerta_Inmediata.Depov

data class RegisterRequest(
    val name: String,
    val document: String,
    val phone: String,
    val address: String,
    val contact1_name: String,
    val contact1_phone: String,
    val contact2_name: String,
    val contact2_phone: String,
    val email: String,
    val password: String
)
