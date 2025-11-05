import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../../App';
import ApiService from '../services/api';
import Config from 'react-native-config';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [videoId, setVideoId] = useState(
    Config.DEFAULT_VIDEO_ID || 'dQw4w9WgXcQ',
  );
  const [sessionId, setSessionId] = useState(
    Config.DEFAULT_SESSION_ID || 'demo-session',
  );
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    if (!videoId.trim()) {
      Alert.alert('Error', 'Please enter a YouTube video ID');
      return;
    }

    setLoading(true);
    try {
      const session = await ApiService.createSession(
        videoId.trim(),
        title.trim() || undefined,
      );
      navigation.navigate('Session', {
        sessionId: session.id,
        videoId: session.youtubeVideoId,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create session: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (!sessionId.trim()) {
      Alert.alert('Error', 'Please enter a session ID');
      return;
    }

    navigation.navigate('Session', {
      sessionId: sessionId.trim(),
      videoId: videoId.trim(),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Synchronized Training</Text>
        <Text style={styles.subheading}>
          Join a session to train together with synchronized video and heart
          rate zones
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Session</Text>

          <TextInput
            style={styles.input}
            placeholder="YouTube Video ID"
            value={videoId}
            onChangeText={setVideoId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Session Title (optional)"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCreateSession}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Session'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Existing Session</Text>

          <TextInput
            style={styles.input}
            placeholder="Session ID"
            value={sessionId}
            onChangeText={setSessionId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleJoinSession}>
            <Text style={styles.buttonText}>Join Session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 YouTube ToS Compliance</Text>
          <Text style={styles.infoText}>
            This app displays YouTube videos in a visible player, complying
            with YouTube's Terms of Service. Audio-only playback is not enabled
            in production builds.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🎨 COLOUR CODE Zones</Text>
          <Text style={styles.infoText}>
            ⚪ White (Recovery) 0-50%{'\n'}
            ⚫️ Grey (Easy) 50-59%{'\n'}
            🔵 Blue (Aerobic) 60-69%{'\n'}
            🟢 Green (Tempo) 70-79%{'\n'}
            🟡 Yellow (Threshold) 80-89%{'\n'}
            🔴 Red (VO2 Max) 90-100%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
