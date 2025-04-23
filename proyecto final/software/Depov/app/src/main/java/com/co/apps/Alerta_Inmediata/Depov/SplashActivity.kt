package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    private val TAG = "SplashActivity"
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        sessionManager = SessionManager(this)

        // Delay for 1.5 seconds to show splash screen
        Handler(Looper.getMainLooper()).postDelayed({
            checkUserSession()
        }, 1500)
    }

    private fun checkUserSession() {
        Log.d(TAG, "Checking user session")
        if (sessionManager.isLoggedIn()) {
            Log.d(TAG, "User is logged in, redirecting to HomeUserActivity")

            // Check if there's an active alert
            val activeAlertId = sessionManager.getActiveAlertId()
            if (activeAlertId != -1) {
                Log.d(TAG, "Active alert found with ID: $activeAlertId")
                // Redirect to active alert screen
                val intent = Intent(this, ActiveAlertActivity::class.java)
                intent.putExtra("alert_id", activeAlertId)
                startActivity(intent)
            } else {
                // Redirect to home screen
                startActivity(Intent(this, HomeUserActivity::class.java))
            }
        } else {
            Log.d(TAG, "User is not logged in, redirecting to LoginActivity")
            startActivity(Intent(this, LoginActivity::class.java))
        }
        finish()
    }
}