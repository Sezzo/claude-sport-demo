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
 * Display card for requesting body sensors permission
 */
@Composable
fun PermissionCard(
    onRequestClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onRequestClick,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Warning icon
            Text(
                text = "⚠️",
                style = MaterialTheme.typography.title1,
                textAlign = TextAlign.Center
            )

            // Permission message
            Text(
                text = "Body Sensors Permission Required",
                style = MaterialTheme.typography.caption1,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colors.onSurface
            )

            // Description
            Text(
                text = "Tap to grant permission for heart rate monitoring",
                style = MaterialTheme.typography.caption2,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Request button
            Button(
                onClick = onRequestClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp),
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = MaterialTheme.colors.primary
                )
            ) {
                Text(
                    text = "Grant Permission",
                    style = MaterialTheme.typography.button,
                    color = Color.White
                )
            }
        }
    }
}
