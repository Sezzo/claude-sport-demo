import {useEffect, useState, useCallback} from 'react';
import socketService from '../services/socket';
import type {PlayerControlEvent, HRUpdateEvent} from '../types';

export function useSocket(sessionId: string | null) {
  const [connected, setConnected] = useState(false);
  const [lastHRUpdate, setLastHRUpdate] = useState<HRUpdateEvent | null>(null);

  useEffect(() => {
    socketService.connect();
    setConnected(socketService.isConnected());

    const checkConnection = setInterval(() => {
      setConnected(socketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sessionId && connected) {
      socketService.joinSession(sessionId);
    }
  }, [sessionId, connected]);

  const sendPlayerControl = useCallback(
    (action: 'play' | 'pause' | 'seek' | 'load', position?: number, videoId?: string) => {
      if (sessionId) {
        const event: PlayerControlEvent = {
          sessionId,
          action,
          position,
          videoId,
          issuedAt: Date.now() / 1000,
        };
        socketService.sendPlayerControl(event);
      }
    },
    [sessionId],
  );

  const onPlayerControl = useCallback((callback: (event: PlayerControlEvent) => void) => {
    socketService.onPlayerControl(callback);
    return () => socketService.offPlayerControl(callback);
  }, []);

  const onHRUpdate = useCallback((callback: (event: HRUpdateEvent) => void) => {
    const wrappedCallback = (event: HRUpdateEvent) => {
      setLastHRUpdate(event);
      callback(event);
    };
    socketService.onHRUpdate(wrappedCallback);
    return () => socketService.offHRUpdate(wrappedCallback);
  }, []);

  return {
    connected,
    sendPlayerControl,
    onPlayerControl,
    onHRUpdate,
    lastHRUpdate,
  };
}
