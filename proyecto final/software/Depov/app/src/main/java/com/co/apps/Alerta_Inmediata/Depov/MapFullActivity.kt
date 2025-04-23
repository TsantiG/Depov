package com.co.apps.Alerta_Inmediata.Depov

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions

class MapFullActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var googleMap: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var btnBack: ImageButton

    private val LOCATION_PERMISSION_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map_full)

        // Inicializar vistas
        btnBack = findViewById(R.id.btn_back_map)

        // Configurar el botón de retroceso
        btnBack.setOnClickListener {
            finish()
        }

        // Inicializar el cliente de ubicación
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Obtener el fragmento del mapa y notificar cuando esté listo
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map_fragment) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map

        // Configurar el mapa
        googleMap.uiSettings.isZoomControlsEnabled = true
        googleMap.uiSettings.isCompassEnabled = true
        googleMap.uiSettings.isMyLocationButtonEnabled = true

        // Verificar y solicitar permisos de ubicación si es necesario
        if (checkLocationPermission()) {
            showUserLocation()
        } else {
            requestLocationPermission()
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
            }
        }
    }

    private fun showUserLocation() {
        if (checkLocationPermission()) {
            googleMap.isMyLocationEnabled = true

            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    val userLatLng = LatLng(it.latitude, it.longitude)
                    googleMap.addMarker(
                        MarkerOptions()
                            .position(userLatLng)
                            .title("Tu ubicación")
                    )
                    googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(userLatLng, 15f))
                }
            }
        }
    }
}