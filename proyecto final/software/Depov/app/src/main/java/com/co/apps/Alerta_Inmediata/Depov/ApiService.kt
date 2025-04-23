package com.co.apps.Alerta_Inmediata.Depov

import com.google.gson.JsonObject
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.*
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface ApiService {

    // ---------------- AUTH ----------------

    // Login (POST /api/auth)
    @Headers(
        "Content-Type: application/json",
        "Accept: application/json"
    )
    @POST("auth")
    fun login(@Body loginRequest: LoginRequest): Call<AuthResponse>

    // ---------------- USERS ----------------

    // Registro (POST /api/users)
    @Headers(
        "Content-Type: application/json",
        "Accept: application/json"
    )
    @POST("users")
    fun register(@Body request: RegisterRequest): Call<AuthResponse>

    // Obtener usuario por ID (GET /api/users/{id})
    @GET("users/{id}")
    fun getUserById(@Path("id") id: Int): Call<UserData>

    // Editar usuario (PUT /api/users/{id}) - Cambiado de PATCH a PUT según tu backend
    @Headers(
        "Content-Type: application/json",
        "Accept: application/json"
    )
    @PUT("users/{id}")
    fun updateUser(
        @Path("id") id: Int,
        @Body userUpdate: UserUpdateRequest
    ): Call<UserData>

    // Eliminar usuario (DELETE /api/users/{id})
    @DELETE("users/{id}")
    fun deleteUser(@Path("id") id: Int): Call<JsonObject>

    // ---------------- ALERTS ----------------

    // Crear alerta (POST /api/alerts)
    @Headers(
        "Content-Type: application/json",
        "Accept: application/json"
    )
    @POST("alerts")
    fun createAlert(@Body alertData: AlertRequest): Call<AlertResponse>

    // Obtener todas las alertas (GET /api/alerts)
    @GET("alerts")
    fun getAllAlerts(): Call<List<AlertResponse>>

    // Obtener alerta por ID (GET /api/alerts/{id})
    @GET("alerts/{id}")
    fun getAlertById(@Path("id") id: Int): Call<AlertResponse>

    // Cambiar estado de alerta (PATCH /api/alerts/{id})
    @Headers(
        "Content-Type: application/json",
        "Accept: application/json"
    )
    @PATCH("alerts/{id}")
    fun updateAlertStatus(
        @Path("id") id: Int,
        @Body statusUpdate: StatusRequest
    ): Call<JsonObject>
}