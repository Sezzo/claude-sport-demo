package com.claude.sportdemo.watch

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*

/**
 * Display card showing session status and control buttons
 */
@Composable
fun SessionStatusCard(
    isConnected: Boolean,
    sessionStatus: String,
    isMonitoring: Boolean,
    onStartClick: () -> Unit,
    onStopClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = { },
        modifier = modifier.fillMaxWidth(),
        enabled = false
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Connection status indicator
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .padding(end = 4.dp)
                ) {
                    androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
                        drawCircle(
                            color = if (isConnected) Color(0xFF4CAF50) else Color(0xFFFF5252)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(4.dp))

                Text(
                    text = sessionStatus,
                    style = MaterialTheme.typography.caption1,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colors.onSurface
                )
            }

            // Control buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // Start button
                Button(
                    onClick = onStartClick,
                    enabled = !isMonitoring && isConnected,
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                ) {
                    Text(
                        text = "Start",
                        style = MaterialTheme.typography.button,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Stop button
                Button(
                    onClick = onStopClick,
                    enabled = isMonitoring,
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = MaterialTheme.colors.error
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                ) {
                    Text(
                        text = "Stop",
                        style = MaterialTheme.typography.button,
                        color = Color.White
                    )
                }
            }
        }
    }
}
