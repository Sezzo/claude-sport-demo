package com.claude.sportdemo.watch

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

/**
 * Display card showing the current training zone
 */
@Composable
fun ZoneIndicatorCard(
    zone: Zone,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = { },
        modifier = modifier
            .fillMaxWidth()
            .height(80.dp),
        enabled = false
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(zone.color.copy(alpha = 0.2f))
                .padding(12.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Zone emoji
                Text(
                    text = zone.emoji,
                    fontSize = 24.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Zone name
                Text(
                    text = zone.zoneName,
                    style = MaterialTheme.typography.title3,
                    color = zone.color,
                    textAlign = TextAlign.Center
                )

                // Zone range
                Text(
                    text = "${zone.minPercent}-${zone.maxPercent}%",
                    style = MaterialTheme.typography.caption2,
                    color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center,
                    fontSize = 10.sp
                )
            }
        }
    }
}
