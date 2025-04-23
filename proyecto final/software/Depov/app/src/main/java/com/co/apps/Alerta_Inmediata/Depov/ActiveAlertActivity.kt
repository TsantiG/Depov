package com.co.apps.Alerta_Inmediata.Depov

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.gson.JsonObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import androidx.activity.OnBackPressedCallback

class ActiveAlertActivity : AppCompatActivity(), OnMapReadyCallback {
    private val TAG = "ActiveAlertActivity"
    private lateinit var imgAlert: ImageView
    private lateinit var tvAlertStatus: TextView
    private lateinit var tvAlertTimestamp: TextView
    private lateinit var tvStationsTitle: TextView
    private lateinit var rvPoliceStations: RecyclerView
    private lateinit var btnCancelAlert: Button
    private lateinit var sessionManager: SessionManager
    private var alertId: Int = -1
    private var retryCount = 0
    private val MAX_RETRIES = 3
    private val RETRY_DELAY = 2000L // 2 segundos

    private lateinit var mMap: GoogleMap
    private var userLocation: LatLng? = null
    private var policeStations: List<PoliceStationData> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_active_alert)
        Log.d(TAG, "Iniciando ActiveAlertActivity")

        // Inicializar SessionManager
        sessionManager = SessionManager(this)

        // Evitar que el usuario pueda volver atrás con el botón de retroceso
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                Toast.makeText(
                    this@ActiveAlertActivity,
                    "Debes cancelar la alerta antes de volver",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }

        onBackPressedDispatcher.addCallback(this, callback)

        // Inicializar vistas
        imgAlert = findViewById(R.id.img_active_alert)
        tvAlertStatus = findViewById(R.id.tv_alert_status)
        tvAlertTimestamp = findViewById(R.id.tv_alert_timestamp)
        tvStationsTitle = findViewById(R.id.tv_stations_title)
        rvPoliceStations = findViewById(R.id.rv_police_stations)
        btnCancelAlert = findViewById(R.id.btn_cancel_alert)

        // Configurar RecyclerView
        rvPoliceStations.layoutManager = LinearLayoutManager(this)

        // Inicializar el mapa
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        // Obtener el ID de la alerta del intent o de la sesión
        alertId = intent.getIntExtra("alert_id", -1)

        // Si no se recibió el ID por intent, intentar obtenerlo de la sesión
        if (alertId == -1) {
            alertId = sessionManager.getActiveAlertId()
            Log.d(TAG, "ID de alerta obtenido de la sesión: $alertId")
        } else {
            Log.d(TAG, "ID de alerta recibido por intent: $alertId")
            // Guardar el ID en la sesión
            sessionManager.setActiveAlertId(alertId)
        }

        if (alertId == -1) {
            Toast.makeText(this, "Error: No se pudo identificar la alerta", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        // Configurar el botón de cancelar alerta
        btnCancelAlert.setOnClickListener {
            updateAlertStatus("atendida")
        }

        // Mostrar información inicial mientras se carga
        tvAlertStatus.text = "Estado: Cargando..."
        tvAlertTimestamp.text = "Alerta enviada: Cargando..."
        tvStationsTitle.text = "Buscando estaciones cercanas..."

        // Cargar información de la alerta con un pequeño retraso
        Handler(Looper.getMainLooper()).postDelayed({
            loadAlertInfo()
        }, 1000) // Esperar 1 segundo antes de cargar la información
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        mMap.uiSettings.isZoomControlsEnabled = true

        // Si ya tenemos datos, actualizar el mapa
        if (userLocation != null && policeStations.isNotEmpty()) {
            updateMap()
        }
    }

    private fun updateMap() {
        if (!::mMap.isInitialized) return

        mMap.clear()

        // Añadir marcador para la ubicación del usuario
        userLocation?.let { location ->
            mMap.addMarker(
                MarkerOptions()
                    .position(location)
                    .title("Tu ubicación")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED))
            )

            // Mover la cámara a la ubicación del usuario
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(location, 14f))

            // Añadir marcadores para las estaciones de policía
            for (station in policeStations) {
                val stationLocation = LatLng(station.location.lat, station.location.lng)
                mMap.addMarker(
                    MarkerOptions()
                        .position(stationLocation)
                        .title(station.name)
                        .snippet("Distancia: ${String.format("%.2f", station.distance)} km")
                        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE))
                )
            }
        }
    }

    private fun loadAlertInfo() {
        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val call = apiService.getAlertById(alertId)

        Log.d(TAG, "Intentando cargar información de la alerta ID: $alertId (intento ${retryCount + 1})")

        call.enqueue(object : Callback<AlertResponse> {
            override fun onResponse(call: Call<AlertResponse>, response: Response<AlertResponse>) {
                if (response.isSuccessful) {
                    val alertResponse = response.body()
                    if (alertResponse != null) {
                        Log.d(TAG, "Información de alerta cargada correctamente")
                        retryCount = 0 // Reiniciar contador de intentos
                        updateUI(alertResponse)
                    } else {
                        Log.e(TAG, "Respuesta nula del servidor")
                        handleLoadError("Error: Respuesta vacía del servidor")
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Sin detalles"
                    Log.e(TAG, "Error en respuesta: ${response.code()}, Detalles: $errorBody")

                    // Si es un error 404 y aún no hemos excedido los intentos, reintentamos
                    if (response.code() == 404 && retryCount < MAX_RETRIES) {
                        retryCount++
                        Log.d(TAG, "Alerta no encontrada, reintentando en $RETRY_DELAY ms (intento $retryCount de $MAX_RETRIES)")

                        Handler(Looper.getMainLooper()).postDelayed({
                            loadAlertInfo()
                        }, RETRY_DELAY)
                    } else {
                        handleLoadError("Error al cargar información de la alerta: ${response.code()}")
                    }
                }
            }

            override fun onFailure(call: Call<AlertResponse>, t: Throwable) {
                Log.e(TAG, "Error de conexión", t)

                // Reintentar si no hemos excedido el número máximo de intentos
                if (retryCount < MAX_RETRIES) {
                    retryCount++
                    Log.d(TAG, "Error de conexión, reintentando en $RETRY_DELAY ms (intento $retryCount de $MAX_RETRIES)")

                    Handler(Looper.getMainLooper()).postDelayed({
                        loadAlertInfo()
                    }, RETRY_DELAY)
                } else {
                    handleLoadError("Error de conexión: ${t.message}")
                }
            }
        })
    }

    private fun handleLoadError(message: String) {
        Toast.makeText(this@ActiveAlertActivity, message, Toast.LENGTH_SHORT).show()
        tvAlertStatus.text = "Estado: Error"
        tvAlertTimestamp.text = "Error al cargar información"
        tvStationsTitle.text = "No se pudieron cargar las estaciones cercanas"

        // Habilitar el botón de cancelar para que el usuario pueda salir
        btnCancelAlert.isEnabled = true
        btnCancelAlert.text = "Volver"
        btnCancelAlert.setOnClickListener {
            // Limpiar la alerta activa de la sesión
            sessionManager.clearActiveAlertId()

            // Volver a HomeUserActivity
            val intent = Intent(this@ActiveAlertActivity, HomeUserActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }
    }

    private fun updateUI(alertResponse: AlertResponse) {
        // Actualizar el estado de la alerta
        tvAlertStatus.text = "Estado: ${alertResponse.status}"
        tvAlertTimestamp.text = "Alerta enviada: ${formatTimestamp(alertResponse.timestamp)}"

        // Guardar la ubicación del usuario y las estaciones
        userLocation = LatLng(alertResponse.location.lat, alertResponse.location.lng)
        policeStations = alertResponse.nearbyStations

        // Actualizar el mapa
        updateMap()

        // Actualizar la lista de estaciones
        if (policeStations.isNotEmpty()) {
            tvStationsTitle.text = "Estaciones de policía cercanas:"
            val adapter = PoliceStationAdapter(policeStations) { station ->
                // Al hacer clic en una estación, centrar el mapa en ella
                val stationLocation = LatLng(station.location.lat, station.location.lng)
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(stationLocation, 15f))
            }
            rvPoliceStations.adapter = adapter
        } else {
            tvStationsTitle.text = "No se encontraron estaciones de policía cercanas"
        }

        // Deshabilitar el botón si la alerta ya no está pendiente
        if (alertResponse.status != "pendiente") {
            btnCancelAlert.isEnabled = false
            btnCancelAlert.text = "Alerta ${alertResponse.status}"

            // Si la alerta ya no está pendiente, limpiar la sesión después de un tiempo
            Handler(Looper.getMainLooper()).postDelayed({
                sessionManager.clearActiveAlertId()
            }, 5000) // 5 segundos
        }
    }

    private fun formatTimestamp(timestamp: String): String {
        // Aquí puedes implementar un formato más amigable para la fecha/hora
        // Por simplicidad, devolvemos el timestamp tal cual
        return timestamp
    }

    private fun updateAlertStatus(newStatus: String) {
        val apiService = RetrofitClient.instance.create(ApiService::class.java)
        val statusRequest = StatusRequest(status = newStatus)
        val call = apiService.updateAlertStatus(alertId, statusRequest)

        btnCancelAlert.isEnabled = false
        btnCancelAlert.text = "Procesando..."

        call.enqueue(object : Callback<JsonObject> {
            override fun onResponse(call: Call<JsonObject>, response: Response<JsonObject>) {
                if (response.isSuccessful) {
                    // Limpiar la alerta activa de la sesión
                    sessionManager.clearActiveAlertId()

                    Toast.makeText(
                        this@ActiveAlertActivity,
                        "Alerta cancelada correctamente",
                        Toast.LENGTH_SHORT
                    ).show()

                    // Volver a HomeUserActivity
                    val intent = Intent(this@ActiveAlertActivity, HomeUserActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    btnCancelAlert.isEnabled = true
                    btnCancelAlert.text = "Cancelar alerta"

                    Toast.makeText(
                        this@ActiveAlertActivity,
                        "Error al cancelar la alerta",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<JsonObject>, t: Throwable) {
                btnCancelAlert.isEnabled = true
                btnCancelAlert.text = "Cancelar alerta"

                Toast.makeText(
                    this@ActiveAlertActivity,
                    "Error de conexión: ${t.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }
}