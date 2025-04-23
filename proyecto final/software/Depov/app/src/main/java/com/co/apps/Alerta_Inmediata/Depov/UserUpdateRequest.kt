package com.co.apps.Alerta_Inmediata.Depov

data class UserUpdateRequest(
    val name: String,
    val document: String,
    val email: String,
    val phone: String,
    val address: String,
    val contact1_name: String,
    val contact1_phone: String,
    val contact2_name: String,
    val contact2_phone: String
)
