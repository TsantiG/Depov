package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import com.google.android.material.button.MaterialButton
import com.google.gson.JsonObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ConfgActivity : AppCompatActivity() {
    lateinit var btnBack: ImageButton
    lateinit var btnTheme: MaterialButton
    lateinit var btnTextSize: MaterialButton
    lateinit var btnPrivacy: MaterialButton
    lateinit var btnTerms: MaterialButton
    lateinit var btnNotifications: MaterialButton
    lateinit var btnSupport: MaterialButton
    lateinit var btnHelp: MaterialButton
    lateinit var btnDeleteAccount: MaterialButton


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_confg)
        initViews()
    }

    fun initViews() {
        btnBack = findViewById(R.id.img_back_options)
        btnTheme = findViewById(R.id.btn_theme)
        btnTextSize = findViewById(R.id.btn_text_size)
        btnPrivacy = findViewById(R.id.btn_privacy)
        btnTerms = findViewById(R.id.btn_terms)
        btnNotifications = findViewById(R.id.btn_notifications)
        btnSupport = findViewById(R.id.btn_support)
        btnHelp = findViewById(R.id.btn_help)
        btnDeleteAccount = findViewById(R.id.btn_delete_account)
    }


    fun setActions() {
        btnBack.setOnClickListener {
            val intent = Intent(this, HomeUserActivity::class.java)
            startActivity(intent)
            finish()
        }

        btnTheme.setOnClickListener {
            // Cambiar entre modo claro y oscuro
            val nightMode = AppCompatDelegate.getDefaultNightMode()
            if (nightMode == AppCompatDelegate.MODE_NIGHT_YES) {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            } else {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            }
        }

        btnTextSize.setOnClickListener {
            Toast.makeText(this, "Funcionalidad de tamaño de texto pendiente", Toast.LENGTH_SHORT).show()
        }

        btnPrivacy.setOnClickListener {
            Toast.makeText(this, "Configuración de permisos próximamente", Toast.LENGTH_SHORT).show()
        }

        btnTerms.setOnClickListener {
            Toast.makeText(this, "Mostrando términos y condiciones", Toast.LENGTH_SHORT).show()
        }

        btnNotifications.setOnClickListener {
            Toast.makeText(this, "Configuración de notificaciones pendiente", Toast.LENGTH_SHORT).show()
        }

        btnSupport.setOnClickListener {
            Toast.makeText(this, "Redirigiendo a soporte técnico...", Toast.LENGTH_SHORT).show()
        }

        btnHelp.setOnClickListener {
            Toast.makeText(this, "Centro de ayuda no disponible aún", Toast.LENGTH_SHORT).show()
        }

        btnDeleteAccount.setOnClickListener {
            confirmarEliminarCuenta()
        }
    }

    fun eliminarCuenta() {
        val userId = getSharedPreferences("user_session", MODE_PRIVATE).getInt("user_id", -1)

        if (userId == -1) {
            Toast.makeText(this, "Usuario no identificado", Toast.LENGTH_SHORT).show()
            return
        }

        val call = RetrofitClient.instance.create(ApiService::class.java).deleteUser(userId)
        call.enqueue(object : Callback<JsonObject> {
            override fun onResponse(call: Call<JsonObject>, response: Response<JsonObject>) {
                if (response.isSuccessful) {
                    // Limpiar sesión y redirigir
                    val prefs = getSharedPreferences("user_session", MODE_PRIVATE)
                    prefs.edit().clear().apply()

                    Toast.makeText(this@ConfgActivity, "Cuenta eliminada", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this@ConfgActivity, LoginActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this@ConfgActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<JsonObject>, t: Throwable) {
                Toast.makeText(this@ConfgActivity, "Fallo de red: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun confirmarEliminarCuenta() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Eliminar cuenta")
        builder.setMessage("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")

        builder.setPositiveButton("Sí, eliminar") { _, _ ->
            eliminarCuenta()
        }

        builder.setNegativeButton("Cancelar") { dialog, _ ->
            dialog.dismiss()
        }

        builder.create().show()
    }



}