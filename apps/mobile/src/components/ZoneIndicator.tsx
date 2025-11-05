import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ZONES, type ZoneCode} from '../types';

interface ZoneIndicatorProps {
  zoneCode: ZoneCode;
  label?: string;
}

export default function ZoneIndicator({zoneCode, label}: ZoneIndicatorProps) {
  const zone = ZONES[zoneCode] || ZONES.white;

  return (
    <View style={[styles.container, {borderLeftColor: zone.color}]}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{zone.emoji}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.zoneName}>{zone.name} Zone</Text>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.rangeText}>
          {zone.minPercent}-{zone.maxPercent}% max HR
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emojiContainer: {
    marginRight: 15,
  },
  emoji: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rangeText: {
    fontSize: 12,
    color: '#999',
  },
});
