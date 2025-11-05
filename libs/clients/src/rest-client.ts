// REST API Client
// This will be enhanced with generated types from OpenAPI

export class RestClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Session endpoints
  async createSession(data: {
    youtubeVideoId: string;
    title?: string;
  }) {
    return this.fetch('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSession(id: string) {
    return this.fetch(`/sessions/${id}`);
  }

  async joinSession(id: string, userId: string) {
    return this.fetch(`/sessions/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getSessionCues(id: string) {
    return this.fetch(`/sessions/${id}/cues`);
  }

  // Parser endpoint
  async parseYouTube(data: {
    videoId: string;
    description?: string;
    duration?: number;
  }) {
    return this.fetch('/parser/youtube', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new RestClient();
