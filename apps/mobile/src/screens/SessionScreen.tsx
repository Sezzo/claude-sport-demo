import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../App';
import {useSocket} from '../hooks/useSocket';
import YouTubePlayer from '../components/YouTubePlayer';
import HRDisplay from '../components/HRDisplay';
import ZoneIndicator from '../components/ZoneIndicator';
import ApiService from '../services/api';
import type {VideoCue} from '../types';

type SessionScreenRouteProp = RouteProp<RootStackParamList, 'Session'>;

export default function SessionScreen() {
  const route = useRoute<SessionScreenRouteProp>();
  const {sessionId, videoId} = route.params;

  const {connected, sendPlayerControl, onPlayerControl, onHRUpdate, lastHRUpdate} = useSocket(sessionId);
  const [cues, setCues] = useState<VideoCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = React.useRef<any>(null);

  useEffect(() => {
    // Fetch cues for the session
    ApiService.getSessionCues(sessionId)
      .then(setCues)
      .catch(err => console.error('Failed to load cues:', err));
  }, [sessionId]);

  useEffect(() => {
    // Listen for player control events
    const unsubscribe = onPlayerControl(event => {
      if (!playerRef.current) return;

      switch (event.action) {
        case 'play':
          playerRef.current.play();
          break;
        case 'pause':
          playerRef.current.pause();
          break;
        case 'seek':
          if (event.position !== undefined) {
            playerRef.current.seekTo(event.position);
          }
          break;
        case 'load':
          if (event.videoId) {
            playerRef.current.loadVideo(event.videoId);
          }
          break;
      }
    });

    return unsubscribe;
  }, [onPlayerControl]);

  useEffect(() => {
    // Listen for HR updates
    const unsubscribe = onHRUpdate(event => {
      console.log('HR Update:', event.bpm, 'BPM');
    });

    return unsubscribe;
  }, [onHRUpdate]);

  const handlePlay = useCallback(() => {
    sendPlayerControl('play');
  }, [sendPlayerControl]);

  const handlePause = useCallback(() => {
    sendPlayerControl('pause');
  }, [sendPlayerControl]);

  const handleSeek = useCallback(
    (seconds: number) => {
      sendPlayerControl('seek', seconds);
    },
    [sendPlayerControl],
  );

  const getCurrentCue = useCallback(() => {
    return cues.find(
      cue => currentTime >= cue.startS && currentTime < cue.endS,
    );
  }, [cues, currentTime]);

  const currentCue = getCurrentCue();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Connection Status */}
        <View style={[styles.statusBar, connected ? styles.connected : styles.disconnected]}>
          <Text style={styles.statusText}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
          <Text style={styles.sessionIdText}>Session: {sessionId}</Text>
        </View>

        {/* YouTube Player */}
        <View style={styles.playerContainer}>
          <YouTubePlayer
            ref={playerRef}
            videoId={videoId}
            onReady={() => setPlayerReady(true)}
            onTimeUpdate={setCurrentTime}
          />
        </View>

        {/* Current Zone */}
        {currentCue && (
          <ZoneIndicator
            zoneCode={currentCue.zoneCode as any}
            label={currentCue.label}
          />
        )}

        {/* Heart Rate Display */}
        {lastHRUpdate && (
          <HRDisplay
            bpm={lastHRUpdate.bpm}
            userId={lastHRUpdate.userId}
            zoneCode={currentCue?.zoneCode as any}
          />
        )}

        {/* Player Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, !playerReady && styles.disabledButton]}
            onPress={handlePlay}
            disabled={!playerReady}>
            <Text style={styles.controlButtonText}>▶️ Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !playerReady && styles.disabledButton]}
            onPress={handlePause}
            disabled={!playerReady}>
            <Text style={styles.controlButtonText}>⏸️ Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !playerReady && styles.disabledButton]}
            onPress={() => handleSeek(60)}
            disabled={!playerReady}>
            <Text style={styles.controlButtonText}>⏩ Seek 1:00</Text>
          </TouchableOpacity>
        </View>

        {/* Cues Timeline */}
        {cues.length > 0 && (
          <View style={styles.cuesContainer}>
            <Text style={styles.cuesTitle}>Training Timeline</Text>
            {cues.map(cue => (
              <TouchableOpacity
                key={cue.id}
                style={styles.cueItem}
                onPress={() => handleSeek(cue.startS)}>
                <View style={styles.cueTimeContainer}>
                  <Text style={styles.cueTime}>
                    {Math.floor(cue.startS / 60)}:
                    {String(cue.startS % 60).padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.cueInfo}>
                  <Text style={styles.cueLabel}>
                    {cue.zoneCode.toUpperCase()} {cue.label || 'Training Zone'}
                  </Text>
                  <Text style={styles.cueDuration}>
                    {cue.endS - cue.startS}s
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Compliance Notice */}
        <View style={styles.complianceNotice}>
          <Text style={styles.complianceText}>
            ✅ YouTube ToS Compliant: Video player is visible
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  connected: {
    backgroundColor: '#E8F5E9',
  },
  disconnected: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionIdText: {
    fontSize: 12,
    color: '#666',
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cuesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  cuesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cueTimeContainer: {
    marginRight: 15,
  },
  cueTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cueInfo: {
    flex: 1,
  },
  cueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cueDuration: {
    fontSize: 12,
    color: '#666',
  },
  complianceNotice: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    alignItems: 'center',
  },
  complianceText: {
    fontSize: 12,
    color: '#007AFF',
  },
});
