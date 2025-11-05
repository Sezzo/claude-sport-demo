package com.claude.sportdemo.watch

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Binder
import android.os.IBinder
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.health.services.client.HealthServices
import androidx.health.services.client.MeasureCallback
import androidx.health.services.client.data.Availability
import androidx.health.services.client.data.DataPointContainer
import androidx.health.services.client.data.DataType
import androidx.health.services.client.data.DeltaDataType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Foreground service for monitoring heart rate using Health Services API
 */
class HRMonitorService(private val context: Context) {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val healthServicesClient = HealthServices.getClient(context)
    private val measureClient = healthServicesClient.measureClient

    private val _hrDataFlow = MutableStateFlow(0)
    val hrDataFlow: StateFlow<Int> = _hrDataFlow.asStateFlow()

    private var isMonitoring = false

    private val measureCallback = object : MeasureCallback {
        override fun onAvailabilityChanged(
            dataType: DeltaDataType<*, *>,
            availability: Availability
        ) {
            when (availability) {
                is Availability.Available -> {
                    // HR sensor is available
                }
                is Availability.Unavailable -> {
                    // HR sensor is unavailable
                    _hrDataFlow.value = 0
                }
                else -> {
                    // Unknown state
                }
            }
        }

        override fun onDataReceived(data: DataPointContainer) {
            val heartRateData = data.getData(DataType.HEART_RATE_BPM)
            heartRateData.forEach { dataPoint ->
                val bpm = dataPoint.value.toInt()
                _hrDataFlow.value = bpm
            }
        }
    }

    /**
     * Check if body sensors permission is granted
     */
    fun hasPermissions(): Boolean {
        return ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.BODY_SENSORS
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Start monitoring heart rate
     */
    fun startMonitoring() {
        if (isMonitoring) return
        if (!hasPermissions()) {
            throw SecurityException("Body sensors permission not granted")
        }

        serviceScope.launch {
            try {
                // Check if HR measurement is available
                val capabilities = measureClient.getCapabilitiesAsync().await()
                val heartRateCapability = capabilities.supportedDataTypesMeasure.contains(
                    DataType.HEART_RATE_BPM
                )

                if (!heartRateCapability) {
                    throw UnsupportedOperationException("Heart rate measurement not supported")
                }

                // Register for heart rate updates
                measureClient.registerMeasureCallback(
                    DataType.HEART_RATE_BPM,
                    measureCallback
                )

                isMonitoring = true
            } catch (e: Exception) {
                throw Exception("Failed to start HR monitoring: ${e.message}")
            }
        }
    }

    /**
     * Stop monitoring heart rate
     */
    fun stopMonitoring() {
        if (!isMonitoring) return

        serviceScope.launch {
            try {
                measureClient.unregisterMeasureCallbackAsync(
                    DataType.HEART_RATE_BPM,
                    measureCallback
                ).await()

                isMonitoring = false
                _hrDataFlow.value = 0
            } catch (e: Exception) {
                // Ignore errors when stopping
            }
        }
    }

    /**
     * Clean up resources
     */
    fun cleanup() {
        stopMonitoring()
        serviceScope.cancel()
    }
}

/**
 * Foreground service wrapper for HR monitoring
 * Required for continuous heart rate monitoring in the background
 */
class HRMonitorForegroundService : Service() {

    private lateinit var hrMonitor: HRMonitorService
    private val binder = LocalBinder()

    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "hr_monitor_channel"
    }

    inner class LocalBinder : Binder() {
        fun getService(): HRMonitorForegroundService = this@HRMonitorForegroundService
    }

    override fun onCreate() {
        super.onCreate()
        hrMonitor = HRMonitorService(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Start HR monitoring
        try {
            hrMonitor.startMonitoring()
        } catch (e: Exception) {
            stopSelf()
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onDestroy() {
        hrMonitor.cleanup()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Heart Rate Monitoring",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Continuous heart rate monitoring for training"
        }

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Training Active")
            .setContentText("Monitoring heart rate...")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setOngoing(true)
            .build()
    }

    fun getHRDataFlow(): StateFlow<Int> {
        return hrMonitor.hrDataFlow
    }
}
