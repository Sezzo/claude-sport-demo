import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ZONES, type ZoneCode} from '../types';

interface HRDisplayProps {
  bpm: number;
  userId: string;
  zoneCode?: ZoneCode;
  hrMax?: number;
}

export default function HRDisplay({
  bpm,
  userId,
  zoneCode,
  hrMax = 190,
}: HRDisplayProps) {
  const percentOfMax = useMemo(() => {
    return Math.round((bpm / hrMax) * 100);
  }, [bpm, hrMax]);

  const detectedZone = useMemo(() => {
    if (zoneCode) {
      return ZONES[zoneCode];
    }

    // Auto-detect zone based on percentage
    for (const zone of Object.values(ZONES)) {
      if (
        percentOfMax >= zone.minPercent &&
        percentOfMax <= zone.maxPercent
      ) {
        return zone;
      }
    }

    return ZONES.white;
  }, [percentOfMax, zoneCode]);

  return (
    <View style={[styles.container, {backgroundColor: detectedZone.color}]}>
      <View style={styles.header}>
        <Text style={styles.userLabel}>👤 {userId}</Text>
        <Text style={styles.zoneLabel}>
          {detectedZone.emoji} {detectedZone.name}
        </Text>
      </View>

      <View style={styles.bpmContainer}>
        <Text style={styles.bpmValue}>{bpm}</Text>
        <Text style={styles.bpmUnit}>BPM</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.percentText}>
          {percentOfMax}% of max HR ({hrMax})
        </Text>
        <Text style={styles.rangeText}>
          Target: {detectedZone.minPercent}-{detectedZone.maxPercent}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  zoneLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 15,
  },
  bpmValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: -2,
  },
  bpmUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rangeText: {
    fontSize: 12,
    color: '#555',
  },
});
