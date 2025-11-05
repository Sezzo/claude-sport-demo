import { io } from 'socket.io-client';

const sessionId = process.env.SESSION_ID || 'demo-session';
const userId = process.env.USER_ID || 'sim-hr-1';
const apiUrl = process.env.API_URL || 'http://localhost:8080';

const s = io(apiUrl);
s.emit('session.join', { sessionId, userId });

console.log(`HR Simulator connected to ${apiUrl}`);
console.log(`Session: ${sessionId}, User: ${userId}`);

let t0 = Date.now();
function bpmAt(tms: number): number {
  const t = (tms - t0) / 1000;
  // Simple interval profile: warmup 100 -> peak 170 -> rest 120
  if (t < 300) return 100 + Math.round(t / 300 * 40);
  if (t < 900) return 140 + Math.round(Math.sin((t-300)/600 * Math.PI)*30);
  return 120;
}

setInterval(() => {
  const now = Date.now();
  const bpm = bpmAt(now);
  s.emit('hr.update', { sessionId, userId, bpm, t: now/1000, device: 'simulator' });
  console.log(`[${new Date().toISOString()}] Sent HR update: ${bpm} BPM`);
}, 1000);
