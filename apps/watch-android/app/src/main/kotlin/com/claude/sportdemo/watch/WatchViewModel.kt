package com.claude.sportdemo.watch

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * UI state for the watch app
 */
data class WatchUiState(
    val currentBPM: Int = 0,
    val currentZone: Zone? = null,
    val percentOfMax: Int = 0,
    val isConnected: Boolean = false,
    val sessionStatus: String = "Not Connected",
    val isMonitoring: Boolean = false,
    val hasPermissions: Boolean = false,
    val sessionId: String? = null,
    val userAge: Int = 30 // Default age, can be configured
)

/**
 * ViewModel managing the watch app state and coordinating services
 */
class WatchViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(WatchUiState())
    val uiState: StateFlow<WatchUiState> = _uiState.asStateFlow()

    private var hrMonitorService: HRMonitorService? = null
    private var dataLayerService: DataLayerService? = null

    private val hrMax: Int
        get() = Zone.calculateHRMax(_uiState.value.userAge)

    init {
        initializeServices()
        checkPermissions()
    }

    /**
     * Initialize HR monitoring and data layer services
     */
    private fun initializeServices() {
        viewModelScope.launch {
            try {
                // Initialize HR monitor service
                hrMonitorService = HRMonitorService(getApplication())

                // Initialize data layer service
                dataLayerService = DataLayerService(getApplication()) { event ->
                    handleDataLayerEvent(event)
                }

                // Observe HR updates
                hrMonitorService?.hrDataFlow?.collect { bpm ->
                    updateHeartRate(bpm)
                }
            } catch (e: Exception) {
                updateSessionStatus("Error: ${e.message}")
            }
        }
    }

    /**
     * Check if body sensors permission is granted
     */
    private fun checkPermissions() {
        viewModelScope.launch {
            val hasPermission = hrMonitorService?.hasPermissions() ?: false
            _uiState.value = _uiState.value.copy(hasPermissions = hasPermission)
        }
    }

    /**
     * Request body sensors permission
     */
    fun requestPermissions() {
        // Permission request is handled by the Activity
        // This method is called from UI to trigger the request
        viewModelScope.launch {
            checkPermissions()
        }
    }

    /**
     * Update heart rate and calculate zone
     */
    private fun updateHeartRate(bpm: Int) {
        val zone = Zone.getZoneForBPM(bpm, hrMax)
        val percent = zone.getPercentOfMax(bpm, hrMax)

        _uiState.value = _uiState.value.copy(
            currentBPM = bpm,
            currentZone = zone,
            percentOfMax = percent
        )

        // Send HR update to phone if in a session
        if (_uiState.value.sessionId != null && _uiState.value.isMonitoring) {
            sendHRUpdateToPhone(bpm, zone)
        }
    }

    /**
     * Start a training session
     */
    fun startSession() {
        viewModelScope.launch {
            if (!_uiState.value.hasPermissions) {
                updateSessionStatus("Permissions required")
                return@launch
            }

            try {
                hrMonitorService?.startMonitoring()
                _uiState.value = _uiState.value.copy(
                    isMonitoring = true,
                    sessionStatus = "Monitoring..."
                )
            } catch (e: Exception) {
                updateSessionStatus("Error starting: ${e.message}")
            }
        }
    }

    /**
     * Stop the training session
     */
    fun stopSession() {
        viewModelScope.launch {
            try {
                hrMonitorService?.stopMonitoring()
                _uiState.value = _uiState.value.copy(
                    isMonitoring = false,
                    sessionStatus = "Stopped",
                    currentBPM = 0,
                    currentZone = null,
                    percentOfMax = 0
                )
            } catch (e: Exception) {
                updateSessionStatus("Error stopping: ${e.message}")
            }
        }
    }

    /**
     * Handle events from the data layer (phone app)
     */
    private fun handleDataLayerEvent(event: DataLayerEvent) {
        when (event) {
            is DataLayerEvent.SessionStarted -> {
                _uiState.value = _uiState.value.copy(
                    sessionId = event.sessionId,
                    sessionStatus = "Session Active",
                    isConnected = true
                )
                startSession()
            }
            is DataLayerEvent.SessionEnded -> {
                stopSession()
                _uiState.value = _uiState.value.copy(
                    sessionId = null,
                    isConnected = false,
                    sessionStatus = "Session Ended"
                )
            }
            is DataLayerEvent.Connected -> {
                _uiState.value = _uiState.value.copy(
                    isConnected = true,
                    sessionStatus = "Connected to Phone"
                )
            }
            is DataLayerEvent.Disconnected -> {
                _uiState.value = _uiState.value.copy(
                    isConnected = false,
                    sessionStatus = "Phone Disconnected"
                )
            }
        }
    }

    /**
     * Send HR update to phone via data layer
     */
    private fun sendHRUpdateToPhone(bpm: Int, zone: Zone) {
        viewModelScope.launch {
            dataLayerService?.sendHRUpdate(
                sessionId = _uiState.value.sessionId ?: return@launch,
                bpm = bpm,
                zoneCode = zone.code
            )
        }
    }

    /**
     * Update session status message
     */
    private fun updateSessionStatus(status: String) {
        _uiState.value = _uiState.value.copy(sessionStatus = status)
    }

    override fun onCleared() {
        super.onCleared()
        hrMonitorService?.stopMonitoring()
        dataLayerService?.disconnect()
    }
}

/**
 * Events from the data layer service
 */
sealed class DataLayerEvent {
    data class SessionStarted(val sessionId: String) : DataLayerEvent()
    object SessionEnded : DataLayerEvent()
    object Connected : DataLayerEvent()
    object Disconnected : DataLayerEvent()
}
