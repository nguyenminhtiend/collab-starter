import { useState, useEffect } from 'react';
import type { Route } from './+types/ws-test';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'WebSocket Connection Test' },
    { name: 'description', content: 'Test WebSocket connectivity' },
  ];
}

enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export default function WebSocketTest() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messageInput, setMessageInput] = useState('Hello from WebSocket!');

  const connect = () => {
    setStatus(ConnectionStatus.CONNECTING);
    setMessages((prev) => [...prev, 'Attempting to connect...']);

    // Connect via Vite proxy - it will forward to ws://localhost:3001
    // Using a real document ID from the database
    const socket = new WebSocket('ws://localhost:5173/collaboration/019b589a-424f-722f-8caf-0b8bd1cf73bd');

    socket.onopen = () => {
      setStatus(ConnectionStatus.CONNECTED);
      setMessages((prev) => [...prev, '✅ Connected to WebSocket server']);
    };

    socket.onmessage = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, `📨 [${timestamp}] Received: ${event.data}`]);
    };

    socket.onerror = (error) => {
      setStatus(ConnectionStatus.ERROR);
      setMessages((prev) => [...prev, `❌ Error: ${JSON.stringify(error)}`]);
    };

    socket.onclose = (event) => {
      setStatus(ConnectionStatus.DISCONNECTED);
      setMessages((prev) => [
        ...prev,
        `🔌 Connection closed: Code ${event.code}, Reason: ${event.reason || 'No reason provided'}`,
      ]);
    };

    setWs(socket);
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const sendMessage = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [...prev, '❌ Cannot send: WebSocket is not connected']);
      return;
    }

    // Create an update message with dummy data
    const updateMessage = {
      type: 'update',
      docId: '019b589a-424f-722f-8caf-0b8bd1cf73bd',
      data: Array.from(new TextEncoder().encode(messageInput)),
      userId: '019b589a-0000-7000-8000-000000000001', // Valid UUID format
    };

    const messageStr = JSON.stringify(updateMessage);
    const timestamp = new Date().toLocaleTimeString();

    ws.send(messageStr);
    setMessages((prev) => [...prev, `📤 [${timestamp}] Sent: ${messageInput}`]);
  };

  const sendTestUpdate = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [...prev, '❌ Cannot send: WebSocket is not connected']);
      return;
    }

    const randomMessage = `Test message ${Math.floor(Math.random() * 1000)}`;
    const randomUserNum = Math.floor(Math.random() * 100).toString().padStart(4, '0');
    const updateMessage = {
      type: 'update',
      docId: '019b589a-424f-722f-8caf-0b8bd1cf73bd',
      data: Array.from(new TextEncoder().encode(randomMessage)),
      userId: `019b589a-0000-7000-8000-0000${randomUserNum}`, // Valid UUID format
    };

    const timestamp = new Date().toLocaleTimeString();
    ws.send(JSON.stringify(updateMessage));
    setMessages((prev) => [...prev, `📤 [${timestamp}] Sent update: ${randomMessage}`]);
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'text-green-600 bg-green-50 border-green-200';
      case ConnectionStatus.CONNECTING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ConnectionStatus.ERROR:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">WebSocket Connection Test</h1>
          <p className="text-gray-300 mb-8">
            Test the WebSocket server connection, send messages, and see broadcasts
          </p>

          {/* Status Display */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center px-6 py-3 rounded-full font-semibold border-2 ${getStatusColor()}`}
            >
              <div className="w-3 h-3 rounded-full bg-current mr-3 animate-pulse"></div>
              Status: {status.toUpperCase()}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={connect}
              disabled={status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={status === ConnectionStatus.DISCONNECTED}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              Disconnect
            </button>
            <button
              onClick={() => setMessages([])}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-gray-600"
            >
              Clear Log
            </button>
          </div>

          {/* Send Message Section */}
          {status === ConnectionStatus.CONNECTED && (
            <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">💬</span>
                Send Message
              </h2>

              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-black/40 text-white rounded-lg border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  onClick={sendMessage}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Send
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendTestUpdate}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Send Random Update
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">
                  <strong>Expected Flow:</strong> Send → Server saves to DB → Broadcast to all clients → Receive ACK
                </p>
              </div>
            </div>
          )}

          {/* Message Log */}
          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📜</span>
              Connection Log
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 italic">No messages yet. Click Connect to start.</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono text-gray-200 bg-white/5 px-4 py-2 rounded-lg border border-white/10 break-all"
                  >
                    <span className="text-gray-500">[{index + 1}]</span> {message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connection Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">Connection Details:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                <span className="font-semibold">WebSocket URL:</span> ws://localhost:5173/collaboration/019b589a-424f-722f-8caf-0b8bd1cf73bd
              </li>
              <li>
                <span className="font-semibold">Server Port:</span> 3001 (proxied via Vite)
              </li>
              <li>
                <span className="font-semibold">Document ID:</span> 019b589a-424f-722f-8caf-0b8bd1cf73bd
              </li>
              <li>
                <span className="font-semibold">Message Format:</span> JSON with type, docId, data, userId
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
