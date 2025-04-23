package com.co.apps.Alerta_Inmediata.Depov

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

class SessionManager(context: Context) {
    private val TAG = "SessionManager"
    private val PREF_NAME = "AlertaInmediataSession"
    private val KEY_IS_LOGGED_IN = "isLoggedIn"
    private val KEY_USER_ID = "userId"
    private val KEY_USERNAME = "username"
    private val KEY_EMAIL = "email"
    private val KEY_ACTIVE_ALERT_ID = "activeAlertId"

    private val sharedPreferences: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    private val editor: SharedPreferences.Editor = sharedPreferences.edit()

    // Método sin token
    fun saveUserSession(userId: Int, username: String, email: String) {
        Log.d(TAG, "Guardando sesión para usuario ID: $userId")
        editor.putBoolean(KEY_IS_LOGGED_IN, true)
        editor.putInt(KEY_USER_ID, userId)
        editor.putString(KEY_USERNAME, username)
        editor.putString(KEY_EMAIL, email)
        editor.apply()
    }

    fun setActiveAlertId(alertId: Int) {
        Log.d(TAG, "Estableciendo ID de alerta activa: $alertId")
        editor.putInt(KEY_ACTIVE_ALERT_ID, alertId)
        editor.apply()
    }

    fun clearActiveAlertId() {
        Log.d(TAG, "Limpiando ID de alerta activa")
        editor.remove(KEY_ACTIVE_ALERT_ID)
        editor.apply()
    }

    fun getActiveAlertId(): Int {
        val alertId = sharedPreferences.getInt(KEY_ACTIVE_ALERT_ID, -1)
        Log.d(TAG, "Obteniendo ID de alerta activa: $alertId")
        return alertId
    }

    fun getUserId(): Int {
        val userId = sharedPreferences.getInt(KEY_USER_ID, -1)
        Log.d(TAG, "Obteniendo ID de usuario: $userId")
        return userId
    }

    fun getUsername(): String? {
        return sharedPreferences.getString(KEY_USERNAME, null)
    }

    fun getEmail(): String? {
        return sharedPreferences.getString(KEY_EMAIL, null)
    }

    fun isLoggedIn(): Boolean {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
    }

    fun clearSession() {
        Log.d(TAG, "Limpiando sesión de usuario")
        editor.clear()
        editor.apply()
    }
}