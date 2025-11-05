import Config from 'react-native-config';
import type {Session, VideoCue} from '../types';

const API_URL = Config.API_URL || 'http://localhost:8080';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async createSession(
    videoId: string,
    title?: string,
  ): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        youtubeVideoId: videoId,
        title,
        hostUserId: 'mobile-user',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return response.json();
  }

  async joinSession(sessionId: string, userId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/sessions/${sessionId}/join`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId}),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to join session: ${response.statusText}`);
    }
  }

  async getSessionCues(sessionId: string): Promise<VideoCue[]> {
    const response = await fetch(
      `${this.baseUrl}/sessions/${sessionId}/cues`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get cues: ${response.statusText}`);
    }

    return response.json();
  }

  async parseYouTubeDescription(
    videoId: string,
    description: string,
    duration: number,
  ): Promise<{cues: VideoCue[]}> {
    const response = await fetch(`${this.baseUrl}/parser/youtube`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({videoId, description, duration}),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse description: ${response.statusText}`);
    }

    return response.json();
  }
}

export default new ApiService();
