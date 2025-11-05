package com.claude.sportdemo.watch

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

/**
 * Display card showing current heart rate with zone coloring
 */
@Composable
fun HRDisplayCard(
    bpm: Int,
    zone: Zone?,
    percentOfMax: Int,
    modifier: Modifier = Modifier
) {
    val backgroundColor = zone?.color?.copy(alpha = 0.3f) ?: MaterialTheme.colors.surface
    val textColor = zone?.color ?: MaterialTheme.colors.onSurface

    Card(
        onClick = { },
        modifier = modifier
            .fillMaxWidth()
            .height(120.dp),
        enabled = false
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundColor)
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // BPM value
                Text(
                    text = if (bpm > 0) bpm.toString() else "--",
                    style = MaterialTheme.typography.display1,
                    color = textColor,
                    fontSize = 48.sp,
                    textAlign = TextAlign.Center
                )

                // BPM label
                Text(
                    text = "BPM",
                    style = MaterialTheme.typography.caption1,
                    color = textColor.copy(alpha = 0.8f),
                    textAlign = TextAlign.Center
                )

                // Percentage of max
                if (percentOfMax > 0) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$percentOfMax% of max",
                        style = MaterialTheme.typography.caption2,
                        color = textColor.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
