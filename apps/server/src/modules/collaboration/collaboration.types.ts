import type { WSContext, WSMessageReceive } from 'hono/ws';

// WebSocket event types
export type { WSContext };
export type WSMessageEvent = MessageEvent<WSMessageReceive>;
