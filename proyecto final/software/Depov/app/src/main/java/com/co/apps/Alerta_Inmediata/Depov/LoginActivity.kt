package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {
    private lateinit var btnBackToHome: ImageView
    private lateinit var btnLogin: Button
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var tilEmail: TextInputLayout
    private lateinit var tilPassword: TextInputLayout
    private lateinit var sessionManager: SessionManager
    private lateinit var btnregister: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Inicializar SessionManager
        sessionManager = SessionManager(this)

        // Si ya hay una sesión activa, ir directamente a HomeUserActivity
        if (sessionManager.isLoggedIn()) {
            navigateToHome()
            return
        }

        viewsInit()
        actions()
    }

    private fun viewsInit() {
        btnBackToHome = findViewById(R.id.img_atras_login)
        btnLogin = findViewById(R.id.btn_login)
        etEmail = findViewById(R.id.et_email)
        etPassword = findViewById(R.id.et_password)
        tilEmail = findViewById(R.id.til_email)
        tilPassword = findViewById(R.id.til_password)
        btnregister = findViewById(R.id.tv_register)
    }

    private fun actions() {
        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            // Validación de campos
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.error = "Correo inválido"
                return@setOnClickListener
            } else {
                tilEmail.error = null
            }

            if (password.isEmpty()) {
                tilPassword.error = "Contraseña requerida"
                return@setOnClickListener
            } else {
                tilPassword.error = null
            }

            // Realizar login
            performLogin(email, password)
        }

        btnBackToHome.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }

        btnregister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    private fun performLogin(email: String, password: String) {
        Log.d("Login", "Intentando login con: email=$email")

        val loginRequest = LoginRequest(email, password)

        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val call = apiService.login(loginRequest)

        call.enqueue(object : Callback<AuthResponse> {
            override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                Log.d("API_RESPONSE", "Código: ${response.code()}, Cuerpo: ${response.body()}")

                if (response.isSuccessful) {
                    val authResponse = response.body()

                    // Guardar datos de usuario en SessionManager
                    authResponse?.let {
                        val user = it.user
                        if (user != null) {
                            sessionManager.saveUserSession(
                                userId = user.id,
                                username = user.name,
                                email = user.email
                            )
                            Log.d("SESSION", "Datos del usuario guardados correctamente en SessionManager")
                        } else {
                            Log.e("SESSION", "Usuario nulo en la respuesta")
                        }
                    }

                    Toast.makeText(
                        applicationContext,
                        "Inicio de sesión exitoso",
                        Toast.LENGTH_SHORT
                    ).show()

                    // Navegar a la pantalla principal
                    navigateToHome()
                } else {
                    // Manejar errores específicos según el código de respuesta
                    when (response.code()) {
                        401 -> {
                            Toast.makeText(
                                applicationContext,
                                "Credenciales incorrectas",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                        else -> {
                            Toast.makeText(
                                applicationContext,
                                "Error al iniciar sesión",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                Log.e("API_ERROR", "Error: ${t.message}")
                Toast.makeText(
                    applicationContext,
                    "Error de conexión",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }

    private fun navigateToHome() {
        // Iniciar el servicio de detección de botones
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(Intent(this, AlertButtonService::class.java))
        } else {
            startService(Intent(this, AlertButtonService::class.java))
        }

        // Navegar a la pantalla principal
        val intent = Intent(this, HomeUserActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}