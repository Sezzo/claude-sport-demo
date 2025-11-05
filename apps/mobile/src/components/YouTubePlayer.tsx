import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  loadVideo: (videoId: string) => void;
}

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  autoPlay?: boolean;
}

const YouTubePlayerComponent = forwardRef<
  YouTubePlayerRef,
  YouTubePlayerProps
>(({videoId, onReady, onTimeUpdate, autoPlay = false}, ref) => {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);

  useImperativeHandle(ref, () => ({
    play: () => {
      setPlaying(true);
    },
    pause: () => {
      setPlaying(false);
    },
    seekTo: async (seconds: number) => {
      if (playerRef.current) {
        await playerRef.current.seekTo(seconds);
      }
    },
    loadVideo: (newVideoId: string) => {
      setCurrentVideoId(newVideoId);
      setPlaying(true);
    },
  }));

  const handleReady = () => {
    setReady(true);
    setLoading(false);
    onReady?.();
  };

  const handleChangeState = (state: string) => {
    console.log('Player state:', state);
    if (state === 'playing') {
      setPlaying(true);
    } else if (state === 'paused') {
      setPlaying(false);
    }
  };

  useEffect(() => {
    if (!ready || !onTimeUpdate) return;

    // Poll for current time every second
    const interval = setInterval(async () => {
      if (playerRef.current && playing) {
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          onTimeUpdate(currentTime);
        } catch (error) {
          console.error('Failed to get current time:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, playing, onTimeUpdate]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading YouTube Player...</Text>
        </View>
      )}
      <YoutubePlayer
        ref={playerRef}
        height={220}
        play={playing}
        videoId={currentVideoId}
        onReady={handleReady}
        onChangeState={handleChangeState}
        webViewStyle={styles.webView}
        webViewProps={{
          androidLayerType: 'hardware',
        }}
      />
      <View style={styles.complianceOverlay}>
        <Text style={styles.complianceText}>
          ✅ Visible Video (YouTube ToS Compliant)
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  webView: {
    backgroundColor: '#000',
  },
  complianceOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  complianceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default YouTubePlayerComponent;
