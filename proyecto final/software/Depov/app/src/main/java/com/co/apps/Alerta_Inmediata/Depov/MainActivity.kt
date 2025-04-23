package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText

class MainActivity : AppCompatActivity() {
    private lateinit var btnLogin: MaterialButton
    private lateinit var btnRegister: MaterialButton
    private lateinit var facebookButton: ImageButton
    private lateinit var instagramButton: ImageButton
    private lateinit var twitterButton: ImageButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)
        // Inicializar vistas
        btnLogin = findViewById(R.id.btn_login_home)
        btnRegister = findViewById(R.id.btn_register_home)
        facebookButton = findViewById(R.id.facebookButton)
        instagramButton = findViewById(R.id.instagramButton)
        twitterButton = findViewById(R.id.twitterButton)

        // Configurar listeners
        setupClickListeners()

    }

    private fun setupClickListeners() {
        // Navegar a la pantalla de login
        btnLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
        }

        // Navegar a la pantalla de registro
        btnRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        // Configurar botones de redes sociales
        facebookButton.setOnClickListener {
            // Implementar acción para Facebook
            openSocialMedia("https://facebook.com/tuempresa")
        }

        instagramButton.setOnClickListener {
            // Implementar acción para Instagram
            openSocialMedia("https://instagram.com/tuempresa")
        }

        twitterButton.setOnClickListener {
            // Implementar acción para Twitter
            openSocialMedia("https://twitter.com/tuempresa")
        }
    }

    private fun openSocialMedia(url: String) {
        // Implementar apertura de URL
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
}