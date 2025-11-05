package com.claude.sportdemo.watch

import androidx.compose.ui.graphics.Color

/**
 * Heart rate training zones based on percentage of max heart rate
 * Matches the shared-types Zone definitions from the monorepo
 */
enum class Zone(
    val code: String,
    val zoneName: String,
    val emoji: String,
    val color: Color,
    val minPercent: Int,
    val maxPercent: Int
) {
    WHITE(
        code = "white",
        zoneName = "Recovery",
        emoji = "⚪",
        color = Color(0xFFFFFFFF),
        minPercent = 0,
        maxPercent = 50
    ),
    GREY(
        code = "grey",
        zoneName = "Endurance",
        emoji = "⚫",
        color = Color(0xFF9E9E9E),
        minPercent = 50,
        maxPercent = 60
    ),
    BLUE(
        code = "blue",
        zoneName = "Tempo",
        emoji = "🔵",
        color = Color(0xFF2196F3),
        minPercent = 60,
        maxPercent = 70
    ),
    GREEN(
        code = "green",
        zoneName = "Threshold",
        emoji = "🟢",
        color = Color(0xFF4CAF50),
        minPercent = 70,
        maxPercent = 80
    ),
    YELLOW(
        code = "yellow",
        zoneName = "VO2 Max",
        emoji = "🟡",
        color = Color(0xFFFFEB3B),
        minPercent = 80,
        maxPercent = 90
    ),
    RED(
        code = "red",
        zoneName = "Anaerobic",
        emoji = "🔴",
        color = Color(0xFFF44336),
        minPercent = 90,
        maxPercent = 100
    );

    companion object {
        /**
         * Calculate maximum heart rate based on age
         * Formula: 211 - 0.64 * age
         */
        fun calculateHRMax(age: Int): Int {
            return (211 - 0.64 * age).toInt()
        }

        /**
         * Get the zone for a given BPM and max heart rate
         */
        fun getZoneForBPM(bpm: Int, hrMax: Int): Zone {
            if (hrMax == 0) return WHITE

            val percent = (bpm.toDouble() / hrMax.toDouble() * 100.0).toInt()

            return values().find { zone ->
                percent >= zone.minPercent && percent <= zone.maxPercent
            } ?: WHITE
        }

        /**
         * Get the zone by code string
         */
        fun fromCode(code: String): Zone? {
            return values().find { it.code == code }
        }
    }

    /**
     * Get the percentage of max HR for the current BPM
     */
    fun getPercentOfMax(bpm: Int, hrMax: Int): Int {
        if (hrMax == 0) return 0
        return (bpm.toDouble() / hrMax.toDouble() * 100.0).toInt()
    }

    /**
     * Get the BPM range for this zone given a max heart rate
     */
    fun getBPMRange(hrMax: Int): Pair<Int, Int> {
        val min = (hrMax * minPercent / 100.0).toInt()
        val max = (hrMax * maxPercent / 100.0).toInt()
        return Pair(min, max)
    }
}
