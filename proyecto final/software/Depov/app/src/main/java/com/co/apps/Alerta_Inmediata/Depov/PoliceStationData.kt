package com.co.apps.Alerta_Inmediata.Depov

data class PoliceStationData(
    val id: Int,
    val name: String,
    val distance: Double,
    val location: LocationData,
    val phone: String
)