package com.claude.sportdemo.watch

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.*
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        // Permission result is handled by the ViewModel
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                WatchApp(
                    onRequestPermission = {
                        requestBodySensorsPermission()
                    }
                )
            }
        }
    }

    private fun requestBodySensorsPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.BODY_SENSORS
            ) == PackageManager.PERMISSION_GRANTED -> {
                // Permission already granted
            }
            else -> {
                // Request permission
                permissionLauncher.launch(Manifest.permission.BODY_SENSORS)
            }
        }
    }
}

@Composable
fun WatchApp(
    onRequestPermission: () -> Unit
) {
    val viewModel: WatchViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()

    ScalingLazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colors.background),
        contentPadding = PaddingValues(
            top = 32.dp,
            start = 10.dp,
            end = 10.dp,
            bottom = 40.dp
        ),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        item {
            Text(
                text = "Training",
                style = MaterialTheme.typography.title3,
                color = MaterialTheme.colors.primary
            )
        }

        // HR Display
        item {
            HRDisplayCard(
                bpm = uiState.currentBPM,
                zone = uiState.currentZone,
                percentOfMax = uiState.percentOfMax
            )
        }

        // Zone Indicator
        if (uiState.currentZone != null) {
            item {
                ZoneIndicatorCard(zone = uiState.currentZone!!)
            }
        }

        // Session Status
        item {
            SessionStatusCard(
                isConnected = uiState.isConnected,
                sessionStatus = uiState.sessionStatus,
                isMonitoring = uiState.isMonitoring,
                onStartClick = { viewModel.startSession() },
                onStopClick = { viewModel.stopSession() }
            )
        }

        // Permission Status
        if (!uiState.hasPermissions) {
            item {
                PermissionCard(
                    onRequestClick = {
                        onRequestPermission()
                        viewModel.requestPermissions()
                    }
                )
            }
        }
    }
}
