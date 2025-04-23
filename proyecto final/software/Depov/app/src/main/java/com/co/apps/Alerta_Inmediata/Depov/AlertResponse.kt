package com.co.apps.Alerta_Inmediata.Depov

data class AlertResponse(
    val id: Int,
    val userId: Int,
    val timestamp: String,
    val location: LocationData,
    val status: String,
    val user: UserInfo,
    val nearbyStations: List<PoliceStationData>
)

