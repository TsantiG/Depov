package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.util.Patterns
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.co.apps.Alerta_Inmediata.Depov.ApiService
import com.co.apps.Alerta_Inmediata.Depov.RetrofitClient
import com.co.apps.Alerta_Inmediata.Depov.UserData
import com.co.apps.Alerta_Inmediata.Depov.UserUpdateRequest
import com.google.android.material.textfield.TextInputLayout
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UserPerfilActivity : AppCompatActivity() {
    private lateinit var name: EditText
    private lateinit var document: EditText
    private lateinit var phone: EditText
    private lateinit var address: EditText
    private lateinit var contact1Name: EditText
    private lateinit var contact1Phone: EditText
    private lateinit var contact2Name: EditText
    private lateinit var contact2Phone: EditText
    private lateinit var email: EditText
    private lateinit var btnbackhome: ImageView
    private lateinit var btnupdateuser: Button

    // TextInputLayouts para mostrar errores
    private lateinit var tilName: TextInputLayout
    private lateinit var tilDocument: TextInputLayout
    private lateinit var tilPhone: TextInputLayout
    private lateinit var tilAddress: TextInputLayout
    private lateinit var tilContact1Name: TextInputLayout
    private lateinit var tilContact1Phone: TextInputLayout
    private lateinit var tilContact2Name: TextInputLayout
    private lateinit var tilContact2Phone: TextInputLayout
    private lateinit var tilEmail: TextInputLayout

    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_perfil)

        // Inicializar SessionManager
        sessionManager = SessionManager(this)

        // Verificar si hay una sesión activa
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "Error: No se encontró información del usuario. Volviendo al inicio de sesión.", Toast.LENGTH_SHORT).show()
            // Redirigir al login
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            return
        }

        viewsInit()
        loadUserData() // Cargar datos actuales del usuario
        actions()
    }

    private fun viewsInit() {
        // EditTexts
        name = findViewById(R.id.et_name_actualizar)
        document = findViewById(R.id.et_document_actualizar)
        phone = findViewById(R.id.et_phone_actualizar)
        address = findViewById(R.id.et_address_actualizar)
        contact1Name = findViewById(R.id.et_contact1_name_actualizar)
        contact1Phone = findViewById(R.id.et_contact1_phone_actualizar)
        contact2Name = findViewById(R.id.et_contact2_name_actualizar)
        contact2Phone = findViewById(R.id.et_contact2_phone_actualizar)
        email = findViewById(R.id.et_email_actualizar)

        // TextInputLayouts
        tilName = findViewById(R.id.til_name_actualizar)
        tilDocument = findViewById(R.id.til_document_actualizar)
        tilPhone = findViewById(R.id.til_phone_actualizar)
        tilAddress = findViewById(R.id.til_address_actualizar)
        tilContact1Name = findViewById(R.id.til_contact1_name_actualizar)
        tilContact1Phone = findViewById(R.id.til_contact1_phone_actualizar)
        tilContact2Name = findViewById(R.id.til_contact2_name_actualizar)
        tilContact2Phone = findViewById(R.id.til_contact2_phone_actualizar)
        tilEmail = findViewById(R.id.til_email_actualizar)

        // Botones
        btnbackhome = findViewById(R.id.img_atras_actualizar)
        btnupdateuser = findViewById(R.id.btn_actualizar)
    }

    private fun loadUserData() {
        // Obtener ID del usuario desde SessionManager
        val userId = sessionManager.getUserId()

        if (userId == -1) {
            Toast.makeText(this, "Error: No se encontró información del usuario. Volviendo al inicio de sesión.", Toast.LENGTH_SHORT).show()
            // Redirigir al login
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            return
        }

        // Obtener datos actuales del usuario desde la API
        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val call = apiService.getUserById(userId)

        // Mostrar un indicador de carga
        val loadingDialog = AlertDialog.Builder(this)
            .setMessage("Cargando información del usuario...")
            .setCancelable(false)
            .create()
        loadingDialog.show()

        call.enqueue(object : Callback<UserData> {
            override fun onResponse(call: Call<UserData>, response: Response<UserData>) {
                loadingDialog.dismiss()

                if (response.isSuccessful) {
                    val userData = response.body()
                    userData?.let {
                        // Llenar los campos con los datos actuales
                        name.setText(it.name)
                        document.setText(it.document)
                        phone.setText(it.phone)
                        address.setText(it.address)
                        contact1Name.setText(it.contact1_name)
                        contact1Phone.setText(it.contact1_phone)
                        contact2Name.setText(it.contact2_name)
                        contact2Phone.setText(it.contact2_phone)
                        email.setText(it.email)
                    }
                } else {
                    // Log detallado del error
                    val errorBody = response.errorBody()?.string() ?: "Sin detalles"
                    Log.e("UserPerfil", "Error en respuesta: ${response.code()}, Detalles: $errorBody")

                    Toast.makeText(this@UserPerfilActivity, "Error al cargar datos: ${response.code()}", Toast.LENGTH_SHORT).show()

                    // Si el usuario no existe (404), redirigir al login
                    if (response.code() == 404) {
                        sessionManager.clearSession()
                        val intent = Intent(this@UserPerfilActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }
                }
            }

            override fun onFailure(call: Call<UserData>, t: Throwable) {
                loadingDialog.dismiss()

                // Log detallado del error
                Log.e("UserPerfil", "Error de conexión", t)

                Toast.makeText(this@UserPerfilActivity, "Fallo en la conexión: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun actions() {
        btnbackhome.setOnClickListener {
            val intent = Intent(this, HomeUserActivity::class.java)
            startActivity(intent)
            finish()
        }

        btnupdateuser.setOnClickListener {
            if (validateInputs()) {
                updateUserData()
            }
        }
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        // Validar nombre
        if (name.text.toString().trim().isEmpty()) {
            tilName.error = "El nombre es requerido"
            isValid = false
        } else {
            tilName.error = null
        }

        // Validar documento
        if (document.text.toString().trim().isEmpty()) {
            tilDocument.error = "El documento es requerido"
            isValid = false
        } else {
            tilDocument.error = null
        }

        // Validar email
        val emailText = email.text.toString().trim()
        if (emailText.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(emailText).matches()) {
            tilEmail.error = "Email inválido"
            isValid = false
        } else {
            tilEmail.error = null
        }

        // Validar teléfono
        if (phone.text.toString().trim().isEmpty()) {
            tilPhone.error = "El teléfono es requerido"
            isValid = false
        } else {
            tilPhone.error = null
        }

        // Validar dirección
        if (address.text.toString().trim().isEmpty()) {
            tilAddress.error = "La dirección es requerida"
            isValid = false
        } else {
            tilAddress.error = null
        }

        // Validar contacto 1 - nombre
        if (contact1Name.text.toString().trim().isEmpty()) {
            tilContact1Name.error = "El nombre del contacto 1 es requerido"
            isValid = false
        } else {
            tilContact1Name.error = null
        }

        // Validar contacto 1 - teléfono
        if (contact1Phone.text.toString().trim().isEmpty()) {
            tilContact1Phone.error = "El teléfono del contacto 1 es requerido"
            isValid = false
        } else {
            tilContact1Phone.error = null
        }

        // Validar contacto 2 - nombre
        if (contact2Name.text.toString().trim().isEmpty()) {
            tilContact2Name.error = "El nombre del contacto 2 es requerido"
            isValid = false
        } else {
            tilContact2Name.error = null
        }

        // Validar contacto 2 - teléfono
        if (contact2Phone.text.toString().trim().isEmpty()) {
            tilContact2Phone.error = "El teléfono del contacto 2 es requerido"
            isValid = false
        } else {
            tilContact2Phone.error = null
        }

        return isValid
    }

    private fun updateUserData() {
        val nameText = name.text.toString().trim()
        val emailText = email.text.toString().trim()
        val documentText = document.text.toString().trim()
        val phoneText = phone.text.toString().trim()
        val addressText = address.text.toString().trim()
        val contact1NameText = contact1Name.text.toString().trim()
        val contact1PhoneText = contact1Phone.text.toString().trim()
        val contact2NameText = contact2Name.text.toString().trim()
        val contact2PhoneText = contact2Phone.text.toString().trim()

        val request = UserUpdateRequest(
            name = nameText,
            document = documentText,
            email = emailText,
            phone = phoneText,
            address = addressText,
            contact1_name = contact1NameText,
            contact1_phone = contact1PhoneText,
            contact2_name = contact2NameText,
            contact2_phone = contact2PhoneText
        )

        val sharedPreferences = getSharedPreferences("user_session", MODE_PRIVATE)
        val userId = sessionManager.getUserId()

        if (userId == -1) {
            Toast.makeText(this, "Error: ID de usuario no encontrado", Toast.LENGTH_SHORT).show()
            return
        }

        // Crear instancia de ApiService
        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val call = apiService.updateUser(userId, request)

        // Mostrar indicador de carga
        btnupdateuser.isEnabled = false
        btnupdateuser.text = "Actualizando..."

        call.enqueue(object : Callback<UserData> {
            override fun onResponse(call: Call<UserData>, response: Response<UserData>) {
                // Restaurar botón
                btnupdateuser.isEnabled = true
                btnupdateuser.text = "Actualizar"

                if (response.isSuccessful) {
                    val userData = response.body()

                    // Actualizar datos en SessionManager
                    userData?.let {
                        sessionManager.saveUserSession(
                            userId = it.id,
                            username = it.name,
                            email = it.email
                        )
                    }

                    Toast.makeText(this@UserPerfilActivity, "Datos actualizados correctamente", Toast.LENGTH_SHORT).show()

                    // Opcional: volver a la pantalla anterior
                    finish()
                } else {
                    // Log detallado del error
                    val errorBody = response.errorBody()?.string() ?: "Sin detalles"
                    Log.e("UserPerfil", "Error en respuesta: ${response.code()}, Detalles: $errorBody")

                    // Manejar diferentes códigos de error
                    when (response.code()) {
                        400 -> Toast.makeText(this@UserPerfilActivity, "Error: Datos inválidos", Toast.LENGTH_SHORT).show()
                        404 -> Toast.makeText(this@UserPerfilActivity, "Error: Usuario no encontrado", Toast.LENGTH_SHORT).show()
                        else -> Toast.makeText(this@UserPerfilActivity, "Error al actualizar: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            }

            override fun onFailure(call: Call<UserData>, t: Throwable) {
                // Restaurar botón
                btnupdateuser.isEnabled = true
                btnupdateuser.text = "Actualizar"

                Toast.makeText(this@UserPerfilActivity, "Fallo en la conexión: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}