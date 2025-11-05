import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

declare global { interface Window { YT: any; onYouTubeIframeAPIReady: any; } }

export default function Home() {
  const [ready, setReady] = useState(false);
  const [sessionId] = useState('demo-session');
  const [videoId] = useState('dQw4w9WgXcQ');
  const [hrData, setHrData] = useState<{ bpm: number; userId: string } | null>(null);
  const playerRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => setReady(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const s = io(apiUrl);
    socketRef.current = s;
    s.emit('session.join', { sessionId, userId: 'web-u1' });

    s.on('player.control', (payload: any) => {
      if (!playerRef.current) return;
      if (payload.action === 'load') playerRef.current.loadVideoById(payload.videoId);
      if (payload.action === 'play') playerRef.current.playVideo();
      if (payload.action === 'pause') playerRef.current.pauseVideo();
      if (payload.action === 'seek') playerRef.current.seekTo(payload.position, true);
    });

    s.on('hr.update', (data: any) => {
      setHrData({ bpm: data.bpm, userId: data.userId });
    });

    return () => { s.disconnect(); };
  }, [sessionId]);

  useEffect(() => {
    if (!ready) return;
    playerRef.current = new window.YT.Player('player', {
      videoId,
      width: '640',
      height: '360',
      events: {
        onReady: () => console.log('Player ready'),
        onStateChange: () => {}
      }
    });
  }, [ready, videoId]);

  const send = (action: string, position?: number) => {
    socketRef.current.emit('player.control', {
      sessionId,
      action,
      videoId,
      position,
      issuedAt: Date.now()/1000
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sync Training Demo</h1>
      <div id="player" style={{ marginBottom: '20px' }}></div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => send('play')} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Play
        </button>
        <button onClick={() => send('pause')} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Pause
        </button>
        <button onClick={() => send('seek', 60)} style={{ padding: '10px 20px' }}>
          Seek 1:00
        </button>
      </div>
      {hrData && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Heart Rate Data</h3>
          <p>User: {hrData.userId}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {hrData.bpm} BPM
          </p>
        </div>
      )}
    </div>
  );
}
