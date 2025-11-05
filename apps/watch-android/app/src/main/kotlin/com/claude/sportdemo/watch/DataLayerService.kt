package com.claude.sportdemo.watch

import android.content.Context
import com.google.android.gms.wearable.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

/**
 * Service for communicating with the phone app via Wearable Data Layer API
 */
class DataLayerService(
    private val context: Context,
    private val eventCallback: (DataLayerEvent) -> Unit
) {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val dataClient: DataClient = Wearable.getDataClient(context)
    private val messageClient: MessageClient = Wearable.getMessageClient(context)
    private val nodeClient: NodeClient = Wearable.getNodeClient(context)

    companion object {
        private const val HR_UPDATE_PATH = "/hr_update"
        private const val SESSION_COMMAND_PATH = "/session_command"
        private const val PING_PATH = "/ping"
    }

    private val messageListener = MessageClient.OnMessageReceivedListener { messageEvent ->
        when (messageEvent.path) {
            SESSION_COMMAND_PATH -> {
                handleSessionCommand(String(messageEvent.data))
            }
            PING_PATH -> {
                handlePing()
            }
        }
    }

    private val capabilityListener = CapabilityClient.OnCapabilityChangedListener { capabilityInfo ->
        checkPhoneConnection()
    }

    init {
        messageClient.addListener(messageListener)
        Wearable.getCapabilityClient(context).addListener(
            capabilityListener,
            "phone_app"
        )
        checkPhoneConnection()
    }

    /**
     * Check if phone is connected
     */
    private fun checkPhoneConnection() {
        serviceScope.launch {
            try {
                val nodes = nodeClient.connectedNodes.await()
                if (nodes.isNotEmpty()) {
                    eventCallback(DataLayerEvent.Connected)
                } else {
                    eventCallback(DataLayerEvent.Disconnected)
                }
            } catch (e: Exception) {
                eventCallback(DataLayerEvent.Disconnected)
            }
        }
    }

    /**
     * Handle session commands from phone
     */
    private fun handleSessionCommand(jsonString: String) {
        try {
            val json = JSONObject(jsonString)
            val action = json.getString("action")

            when (action) {
                "sessionStarted" -> {
                    val sessionId = json.getString("sessionId")
                    eventCallback(DataLayerEvent.SessionStarted(sessionId))
                }
                "sessionEnded" -> {
                    eventCallback(DataLayerEvent.SessionEnded)
                }
            }
        } catch (e: Exception) {
            // Ignore malformed messages
        }
    }

    /**
     * Handle ping from phone
     */
    private fun handlePing() {
        eventCallback(DataLayerEvent.Connected)
    }

    /**
     * Send heart rate update to phone
     */
    fun sendHRUpdate(sessionId: String, bpm: Int, zoneCode: String) {
        serviceScope.launch {
            try {
                val nodes = nodeClient.connectedNodes.await()
                if (nodes.isEmpty()) {
                    eventCallback(DataLayerEvent.Disconnected)
                    return@launch
                }

                val json = JSONObject().apply {
                    put("action", "hrUpdate")
                    put("sessionId", sessionId)
                    put("bpm", bpm)
                    put("zoneCode", zoneCode)
                    put("timestamp", System.currentTimeMillis())
                    put("device", "Wear OS")
                }

                val message = json.toString().toByteArray()

                // Send to all connected nodes (typically just the phone)
                nodes.forEach { node ->
                    messageClient.sendMessage(node.id, HR_UPDATE_PATH, message).await()
                }
            } catch (e: Exception) {
                // Failed to send - phone might be disconnected
                eventCallback(DataLayerEvent.Disconnected)
            }
        }
    }

    /**
     * Send a ping to the phone to check connection
     */
    fun ping() {
        serviceScope.launch {
            try {
                val nodes = nodeClient.connectedNodes.await()
                nodes.forEach { node ->
                    messageClient.sendMessage(node.id, PING_PATH, ByteArray(0)).await()
                }
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }

    /**
     * Disconnect and clean up
     */
    fun disconnect() {
        messageClient.removeListener(messageListener)
        Wearable.getCapabilityClient(context).removeListener(capabilityListener)
        serviceScope.cancel()
    }
}

/**
 * Listener service for receiving messages from phone
 * Declared in AndroidManifest.xml
 */
class DataLayerListenerService : WearableListenerService() {

    override fun onMessageReceived(messageEvent: MessageEvent) {
        super.onMessageReceived(messageEvent)

        // Messages are handled by DataLayerService when the app is running
        // This service ensures messages are received even when app is in background
        when (messageEvent.path) {
            "/session_command" -> {
                // Could start the app here if needed
            }
        }
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        super.onDataChanged(dataEvents)
        // Handle data item changes if needed
    }

    override fun onCapabilityChanged(capabilityInfo: CapabilityInfo) {
        super.onCapabilityChanged(capabilityInfo)
        // Handle capability changes if needed
    }
}
