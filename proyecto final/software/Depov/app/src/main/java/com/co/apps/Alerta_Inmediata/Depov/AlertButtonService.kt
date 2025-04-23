package com.co.apps.Alerta_Inmediata.Depov

import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.*
import android.util.Log
import android.view.KeyEvent
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import androidx.core.content.ContextCompat


class AlertButtonService : Service() {
    private val TAG = "AlertButtonService"

    private var buttonPressCount = 0
    private val REQUIRED_PRESSES = 6
    private val RESET_DELAY = 3000L // 3 segundos

    private val resetHandler = Handler(Looper.getMainLooper())
    private val resetRunnable = Runnable {
        buttonPressCount = 0
        Log.d(TAG, "Contador de pulsaciones reiniciado")
    }

    private lateinit var sessionManager: SessionManager
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private val volumeButtonReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == Intent.ACTION_CLOSE_SYSTEM_DIALOGS) {
                val reason = intent.getStringExtra("reason")
                if (reason == "globalactions" || reason == "homekey") {
                    // Ignorar cuando se presiona el botón de inicio o se abre el menú de apagado
                    return
                }
            }

            // Verificar si es una pulsación de botón de volumen
            val keyCode = intent.getIntExtra("android.media.EXTRA_KEY_EVENT", 0)
            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                handleButtonPress()
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Servicio de alerta creado")

        sessionManager = SessionManager(this)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // ACTION_CLOSE_SYSTEM_DIALOGS
        val filter = IntentFilter(Intent.ACTION_CLOSE_SYSTEM_DIALOGS)
        ContextCompat.registerReceiver(this, volumeButtonReceiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)

        // VOLUME_CHANGED_ACTION
        val volumeFilter = IntentFilter("android.media.VOLUME_CHANGED_ACTION")
        ContextCompat.registerReceiver(this, volumeButtonReceiver, volumeFilter, ContextCompat.RECEIVER_NOT_EXPORTED)

        // Acción personalizada
        val customFilter = IntentFilter("com.co.apps.Alerta_Inmediata.Depov.VOLUME_BUTTON_PRESSED")
        ContextCompat.registerReceiver(this, volumeButtonReceiver, customFilter, ContextCompat.RECEIVER_NOT_EXPORTED)

    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Servicio de alerta iniciado")

        // Si es una notificación de pulsación de botón desde la actividad
        if (intent?.action == "com.co.apps.Alerta_Inmediata.Depov.VOLUME_BUTTON_PRESSED") {
            handleButtonPress()
        }

        // Crear un canal de notificación (requerido para Android 8.0+)
        createNotificationChannel()

        // Crear una notificación para el servicio en primer plano
        val notification = createNotification()

        // Iniciar el servicio en primer plano
        startForeground(NOTIFICATION_ID, notification)

        return START_STICKY
    }

    private fun handleButtonPress() {
        buttonPressCount++
        Log.d(TAG, "Botón presionado. Contador: $buttonPressCount")

        // Reiniciar el temporizador de reinicio
        resetHandler.removeCallbacks(resetRunnable)
        resetHandler.postDelayed(resetRunnable, RESET_DELAY)

        // Verificar si se alcanzó el número requerido de pulsaciones
        if (buttonPressCount >= REQUIRED_PRESSES) {
            buttonPressCount = 0
            resetHandler.removeCallbacks(resetRunnable)

            // Vibrar para dar feedback
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(500)
            }

            // Enviar alerta
            Log.d(TAG, "Número de pulsaciones alcanzado. Enviando alerta...")
            sendAlert()
        }
    }

    private fun sendAlert() {
        // Verificar si el usuario está logueado
        if (!sessionManager.isLoggedIn()) {
            Log.e(TAG, "No hay sesión activa. No se puede enviar la alerta.")
            return
        }

        // Verificar si ya hay una alerta activa
        if (sessionManager.getActiveAlertId() != -1) {
            Log.d(TAG, "Ya hay una alerta activa. No se enviará otra.")

            // Abrir la actividad de alerta activa
            val intent = Intent(this, ActiveAlertActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            return
        }

        // Obtener la ubicación actual
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    val latitude = it.latitude
                    val longitude = it.longitude

                    // Enviar la alerta al servidor
                    sendAlertToServer(latitude, longitude)
                } ?: run {
                    Log.e(TAG, "No se pudo obtener la ubicación")
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Error de permisos al obtener ubicación", e)
        }
    }

    private fun sendAlertToServer(latitude: Double, longitude: Double) {
        // Obtener el ID del usuario desde SessionManager
        val userId = sessionManager.getUserId()

        if (userId == -1) {
            Log.e(TAG, "Error: No se pudo identificar al usuario")
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

                        Log.d(TAG, "Alerta enviada con éxito. ID: ${it.id}")

                        // Mostrar una notificación
                        showAlertNotification()

                        // Abrir la actividad de alerta activa
                        val intent = Intent(this@AlertButtonService, ActiveAlertActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        intent.putExtra("alert_id", it.id)
                        startActivity(intent)
                    }
                } else {
                    Log.e(TAG, "Error al enviar alerta: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<AlertResponse>, t: Throwable) {
                Log.e(TAG, "Error de conexión al enviar alerta", t)
            }
        })
    }

    private fun showAlertNotification() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val intent = Intent(this, ActiveAlertActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, ALERT_CHANNEL_ID)
            .setContentTitle("¡Alerta Activa!")
            .setContentText("Se ha enviado una alerta de emergencia")
            .setSmallIcon(R.drawable.depov123)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(ALERT_NOTIFICATION_ID, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Canal para el servicio en primer plano
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Servicio de Alerta",
                NotificationManager.IMPORTANCE_LOW
            )
            serviceChannel.description = "Canal para el servicio de detección de botones"

            // Canal para notificaciones de alerta
            val alertChannel = NotificationChannel(
                ALERT_CHANNEL_ID,
                "Alertas de Emergencia",
                NotificationManager.IMPORTANCE_HIGH
            )
            alertChannel.description = "Canal para notificaciones de alertas de emergencia"

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
            manager.createNotificationChannel(alertChannel)
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, HomeUserActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Alerta de Emergencia Activa")
            .setContentText("Presiona el botón de volumen ${REQUIRED_PRESSES} veces rápidamente para enviar una alerta")
            .setSmallIcon(R.drawable.depov123)
            .setContentIntent(pendingIntent)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(volumeButtonReceiver)
        } catch (e: IllegalArgumentException) {
            // El receptor no estaba registrado
        }
        resetHandler.removeCallbacks(resetRunnable)
        Log.d(TAG, "Servicio de alerta destruido")
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    companion object {
        private const val CHANNEL_ID = "AlertServiceChannel"
        private const val ALERT_CHANNEL_ID = "EmergencyAlertChannel"
        private const val NOTIFICATION_ID = 1001
        private const val ALERT_NOTIFICATION_ID = 1002
    }
}