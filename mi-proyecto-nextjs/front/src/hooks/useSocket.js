import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // ESTADOS QUE EL TABLERO PUEDE ESCUCHAR
  const [playerJoined, setPlayerJoined] = useState(null);
  const [playerLeft, setPlayerLeft] = useState(null);
  const [gameInitialized, setGameInitialized] = useState(null);
  const [diceRolled, setDiceRolled] = useState(null);
  const [playerMoved, setPlayerMoved] = useState(null);
  const [turnChanged, setTurnChanged] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
      reconnection: true
    });

    socketRef.current = socket;

    // --- CONEXIÓN ---
    socket.on("connect", () => {
      console.log("✅ Conectado a WebSocket");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del WebSocket");
      setIsConnected(false);
    });

    // --- LISTENERS ÚNICOS ---
    socket.on("playerJoined", (data) => {
      console.log("👤 playerJoined:", data);
      setPlayerJoined(data);
    });

    socket.on("playerLeft", (data) => {
      console.log("👋 playerLeft:", data);
      setPlayerLeft(data);
    });

    socket.on("initializeGame", (data) => {
      console.log("🎮 initializeGame:", data);
      setGameInitialized(data);
    });

    socket.on("diceRolled", (data) => {
      console.log("🎲 diceRolled:", data);
      setDiceRolled(data);
    });

    socket.on("playerMoved", (data) => {
      console.log("🚶 playerMoved:", data);
      setPlayerMoved(data);
    });

    socket.on("turnChanged", (data) => {
      console.log("🔄 turnChanged:", data);
      setTurnChanged(data);
    });

    return () => {
      console.log("🔌 Socket cleanup");
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,

    // Eventos
    playerJoined,
    playerLeft,
    gameInitialized,
    diceRolled,
    playerMoved,
    turnChanged
  };
}