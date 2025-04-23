package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.co.apps.Alerta_Inmediata.Depov.ApiService
import com.co.apps.Alerta_Inmediata.Depov.AuthResponse
import com.co.apps.Alerta_Inmediata.Depov.RegisterRequest
import com.co.apps.Alerta_Inmediata.Depov.RetrofitClient
import com.co.apps.Alerta_Inmediata.Depov.UserData
import com.co.apps.Alerta_Inmediata.Depov.response
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {
    private lateinit var btnbackhome: ImageView
    private lateinit var btncreateuser: Button
    private lateinit var et_Email: TextInputEditText
    private lateinit var et_pass: TextInputEditText
    private lateinit var et_name: TextInputEditText
    private lateinit var et_document: TextInputEditText
    private lateinit var et_phone: TextInputEditText
    private lateinit var et_address: TextInputEditText
    private lateinit var et_contact1_name: TextInputEditText
    private lateinit var et_contact1_number: TextInputEditText
    private lateinit var et_contact2_name: TextInputEditText
    private lateinit var et_contact2_number: TextInputEditText

    private lateinit var til_Email: TextInputLayout
    private lateinit var til_pass: TextInputLayout
    private lateinit var til_name: TextInputLayout
    private lateinit var til_document: TextInputLayout
    private lateinit var til_phone: TextInputLayout
    private lateinit var til_address: TextInputLayout


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_register)

        viewsInit()
        actions()

    }

    fun viewsInit() {
        btnbackhome = findViewById(R.id.img_atras_register)
        btncreateuser = findViewById(R.id.btn_register)
        et_Email = findViewById(R.id.et_email)
        et_pass = findViewById(R.id.et_password)
        et_name = findViewById(R.id.et_name)
        et_document = findViewById(R.id.et_document)
        et_phone = findViewById(R.id.et_phone)
        et_address = findViewById(R.id.et_address)
        et_contact1_name = findViewById(R.id.et_contact1_name)
        et_contact1_number = findViewById(R.id.et_contact1_phone)
        et_contact2_name = findViewById(R.id.et_contact2_name)
        et_contact2_number = findViewById(R.id.et_contact2_phone)

        til_Email = findViewById(R.id.til_email)
        til_pass = findViewById(R.id.til_password)
        til_name = findViewById(R.id.til_name)
        til_document = findViewById(R.id.til_document)
        til_phone = findViewById(R.id.til_phone)
        til_address = findViewById(R.id.til_address)


    }


    fun actions() {
        btncreateuser.setOnClickListener {
            val email = et_Email.text.toString().trim()
            val password = et_pass.text.toString().trim()
            val name = et_name.text.toString().trim()
            val document = et_document.text.toString().trim()
            val phone = et_phone.text.toString().trim()
            val address = et_address.text.toString().trim()
            val contact1_name = et_contact1_name.text.toString().trim()
            val contact1_number = et_contact1_number.text.toString().trim()
            val contact2_name = et_contact2_name.text.toString().trim()
            val contact2_number = et_contact2_number.text.toString().trim()


            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                til_Email.error = "Correo inválido"
                return@setOnClickListener
            } else til_Email.error = null

            if (password.length < 6) {
                til_pass.error = "Debe tener al menos 6 caracteres"
                return@setOnClickListener
            } else til_pass.error = null

            if (name.isEmpty()) {
                til_name.error = "El nombre es obligatorio"
                return@setOnClickListener
            } else til_name.error = null

            if (document.isEmpty()) {
                til_document.error = "Documento requerido"
                return@setOnClickListener
            } else til_document.error = null

            if (phone.isEmpty()) {
                til_phone.error = "Número de teléfono requerido"
                return@setOnClickListener
            } else til_phone.error = null

            if (address.isEmpty()) {
                til_address.error = "Dirección requerida"
                return@setOnClickListener
            } else til_address.error = null


            Log.d(
                "Registro",
                "Enviando: email=$email, password=$password, name=$name, document=$document, phone=$phone, address=$address, contact1_name=$contact1_name, contact1_number=$contact1_number, contact2_name=$contact2_name, contact2_number=$contact2_number"
            )

            val apiService = RetrofitClient.instance.create(ApiService::class.java)
            val usuario = RegisterRequest(
                name = name,
                document = document,
                phone = phone,
                address = address,
                contact1_name = contact1_name,
                contact1_phone = contact1_number,
                contact2_name = contact2_name,
                contact2_phone = contact2_number,
                email = email,
                password = password
            )

            val call = apiService.register(usuario)
            call.enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    Log.d("API_RESPONSE", "Código: ${response.code()}, Cuerpo: ${response.body()}")
                    if (response.isSuccessful) {
                        Toast.makeText(
                            applicationContext,
                            "Usuario registrado debidamente",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        Toast.makeText(
                            applicationContext,
                            "Error al registrar usuario",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    Log.e("API_ERROR", "Error: ${t.message}")
                    Toast.makeText(applicationContext, "Error de conexión", Toast.LENGTH_SHORT).show()
                }
            })
        }


        btnbackhome.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }
    }

}