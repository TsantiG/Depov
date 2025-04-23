package com.co.apps.Alerta_Inmediata.Depov

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.KeyEvent
import android.view.MotionEvent
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.os.Build
import android.os.Handler
import android.os.Looper

class HomeUserActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var btnShield: ImageButton
    private lateinit var imgUserMenu: ImageView
    private lateinit var imgInfoUserMenu: ImageView
    private lateinit var imgConfUserMenu: ImageView
    private lateinit var cardMapHomeUser: CardView
    private lateinit var tvHomeUser: TextView
    private lateinit var mapView: MapView
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var googleMap: GoogleMap? = null

    private val LOCATION_PERMISSION_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_user)

        val sessionManager = SessionManager(this)
        val userId = sessionManager.getUserId()

        if (userId == -1 || !sessionManager.isLoggedIn()) {
            Toast.makeText(this, "Error: No se encontró información del usuario. Volviendo al inicio de sesión.", Toast.LENGTH_SHORT).show()
            // Redirigir al login
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            return
        }

        // Inicializar vistas
        initViews()

        // Inicializar el mapa
        initMap(savedInstanceState)

        // Inicializar el cliente de ubicación
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Configurar listeners
        setupClickListeners()

        // Aplicar animaciones
        applyAnimations()

        // Cargar datos del usuario
        loadUserData()

        // Iniciar el servicio de detección de botones si no está en ejecución
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(Intent(this, AlertButtonService::class.java))
        } else {
            startService(Intent(this, AlertButtonService::class.java))
        }
    }

    // Sobrescribir onKeyDown para detectar pulsaciones de botones de volumen cuando la app está en primer plano
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            // Notificar al servicio sobre la pulsación del botón
            val intent = Intent(this, AlertButtonService::class.java)
            intent.action = "com.co.apps.Alerta_Inmediata.Depov.VOLUME_BUTTON_PRESSED"
            startService(intent)
            return true // Consumir el evento
        }
        return super.onKeyDown(keyCode, event)
    }

    private fun initViews() {
        btnShield = findViewById(R.id.btn_shield_icon_home_user)
        imgUserMenu = findViewById(R.id.img_user_menu)
        imgInfoUserMenu = findViewById(R.id.img_info_user_menu)
        imgConfUserMenu = findViewById(R.id.img_conf_user_menu)
        cardMapHomeUser = findViewById(R.id.card_map_home_user)
        tvHomeUser = findViewById(R.id.tv_home_user)

        // Reemplazar la ImageView del mapa con un MapView
        // Nota: Esto requiere modificar el XML para incluir un MapView dentro del CardView
        mapView = findViewById(R.id.map_view)
    }

    private fun initMap(savedInstanceState: Bundle?) {
        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync(this)
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map

        // Configurar el mapa
        googleMap?.uiSettings?.isZoomControlsEnabled = true

        // Verificar y solicitar permisos de ubicación si es necesario
        if (checkLocationPermission()) {
            showUserLocation()
        } else {
            requestLocationPermission()
        }

        // Configurar el clic en el mapa para abrir una actividad de mapa completo
        googleMap?.setOnMapClickListener {
            val intent = Intent(this, MapFullActivity::class.java)
            startActivity(intent)
        }
    }

    private fun checkLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            LOCATION_PERMISSION_REQUEST_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                showUserLocation()
            } else {
                Toast.makeText(
                    this,
                    "Se requiere permiso de ubicación para mostrar tu posición",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun showUserLocation() {
        if (checkLocationPermission()) {
            googleMap?.isMyLocationEnabled = true

            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    val userLatLng = LatLng(it.latitude, it.longitude)
                    googleMap?.addMarker(
                        MarkerOptions()
                            .position(userLatLng)
                            .title("Tu ubicación")
                    )
                    googleMap?.moveCamera(CameraUpdateFactory.newLatLngZoom(userLatLng, 15f))
                }
            }
        }
    }

    private fun loadUserData() {
        // Obtener datos del usuario desde SessionManager
        val sessionManager = SessionManager(this)
        val userName = sessionManager.getUsername() ?: "Usuario"

        // Actualizar UI con datos del usuario
        tvHomeUser.text = "Bienvenid@ $userName"
    }

    private fun setupClickListeners() {
        // Botón de alerta (escudo)
        btnShield.setOnClickListener {
            // Implementar acción de alerta
            showAlertDialog()
        }

        // Menú de usuario
        imgUserMenu.setOnClickListener {
            // Navegar al perfil de usuario
            val intent = Intent(this, UserPerfilActivity::class.java)
            startActivity(intent)
        }

        imgInfoUserMenu.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Cerrar sesión")
                .setMessage("¿Estás seguro de que quieres cerrar sesión?")
                .setPositiveButton("Sí") { dialog, _ ->
                    val sessionManager = SessionManager(this)
                    sessionManager.clearSession()

                    // Redirigir al login
                    val intent = Intent(this, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
                .setNegativeButton("Cancelar") { dialog, _ ->
                    dialog.dismiss()
                }
                .show()
        }

        imgConfUserMenu.setOnClickListener {
            // Navegar a la pantalla de configuración
            val intent = Intent(this, ConfgActivity::class.java)
            startActivity(intent)
        }

        // Mapa
        cardMapHomeUser.setOnClickListener {
            // Navegar a la pantalla de mapa completo
            val intent = Intent(this, MapFullActivity::class.java)
            startActivity(intent)
        }

        googleMap?.setOnMapClickListener {
            // Evitar que el clic se propague al CardView
            val intent = Intent(this, MapFullActivity::class.java)
            startActivity(intent)
        }
    }

    private fun showAlertDialog() {
        // Aquí implementarías un diálogo para confirmar la alerta
        // Por ahora, solo mostraremos un Toast y enviaremos la alerta
        Toast.makeText(this, "Enviando alerta...", Toast.LENGTH_SHORT).show()
        sendAlert()
    }

    private fun sendAlert() {
        if (checkLocationPermission()) {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    val latitude = it.latitude
                    val longitude = it.longitude

                    // Enviar la alerta al servidor
                    sendAlertToServer(latitude, longitude)
                }
            }
        } else {
            requestLocationPermission()
        }
    }

    private fun sendAlertToServer(latitude: Double, longitude: Double) {
        // Obtener el ID del usuario desde SessionManager
        val sessionManager = SessionManager(this)
        val userId = sessionManager.getUserId()

        if (userId == -1) {
            Toast.makeText(this, "Error: No se pudo identificar al usuario", Toast.LENGTH_SHORT).show()
            return
        }

        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val locationData = LocationData(
            lat = latitude,
            lng = longitude
        )

        val alertRequest = AlertRequest(
            userId = userId,
            location = locationData
        )

        val call = apiService.createAlert(alertRequest)
        call.enqueue(object : Callback<AlertResponse> {
            override fun onResponse(call: Call<AlertResponse>, response: Response<AlertResponse>) {
                if (response.isSuccessful) {
                    val alertResponse = response.body()
                    alertResponse?.let {
                        // Guardar el ID de la alerta en la sesión
                        sessionManager.setActiveAlertId(it.id)

                        Toast.makeText(
                            applicationContext,
                            "Alerta enviada con éxito",
                            Toast.LENGTH_SHORT
                        ).show()

                        // Agregar un pequeño retraso antes de navegar a la pantalla de alerta activa
                        Handler(Looper.getMainLooper()).postDelayed({
                            val intent = Intent(this@HomeUserActivity, ActiveAlertActivity::class.java)
                            intent.putExtra("alert_id", it.id)
                            startActivity(intent)
                        }, 500) // 500ms de retraso
                    }
                } else {
                    Toast.makeText(
                        applicationContext,
                        "Error al enviar alerta: ${response.code()}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<AlertResponse>, t: Throwable) {
                Toast.makeText(
                    applicationContext,
                    "Error de conexión: ${t.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }

    private fun applyAnimations() {
        // Efecto de pulsación para todos los botones
        setupButtonTouchEffect(btnShield)
        setupButtonTouchEffect(imgUserMenu)
        setupButtonTouchEffect(imgInfoUserMenu)
        setupButtonTouchEffect(imgConfUserMenu)
        setupButtonTouchEffect(cardMapHomeUser)
    }

    private fun setupButtonTouchEffect(view: android.view.View) {
        view.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.animate().scaleX(0.9f).scaleY(0.9f).setDuration(100).start()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(100).start()
                }
            }
            false // Permite que el evento de clic se procese normalmente
        }
    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onStart() {
        super.onStart()
        mapView.onStart()
    }

    override fun onStop() {
        super.onStop()
        mapView.onStop()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
    }

    override fun onDestroy() {
        if (::mapView.isInitialized) {
            mapView.onDestroy()
        }
        super.onDestroy()
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView.onLowMemory()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        mapView.onSaveInstanceState(outState)
    }
}