
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [playerJoined, setPlayerJoined] = useState(null);
  const [playerLeft, setPlayerLeft] = useState(null);
  const [gameInitialized, setGameInitialized] = useState(null);
  const [diceRolled, setDiceRolled] = useState(null);
  const [playerMoved, setPlayerMoved] = useState(null);
  const [turnChanged, setTurnChanged] = useState(null);
  const [cartasRepartidas, setCartasRepartidas] = useState(null);

  useEffect(() => {
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🔌 Socket conectado:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket desconectado");
      setIsConnected(false);
    });

    socketInstance.on("playerJoined", setPlayerJoined);
    socketInstance.on("playerLeft", setPlayerLeft);
    
    // ✅ IMPORTANTE: El evento correcto es "gameInitialized" (desde el servidor)
    socketInstance.on("gameInitialized", (data) => {
      console.log("🎮 Juego inicializado recibido:", data);
      setGameInitialized(data);
    });

    socketInstance.on("diceRolled", (data) => {
      console.log("🎲 Dado tirado:", data);
      setDiceRolled(data);
    });

    socketInstance.on("playerMoved", (data) => {
      console.log("🚶 Jugador movido:", data);
      setPlayerMoved(data);
    });

    socketInstance.on("turnChanged", (data) => {
      console.log("⏭️ Turno cambiado recibido:", data);
      setTurnChanged(data);
    });

    socketInstance.on("cartas_repartidas", (cartas) => {
      console.log("🃏 Cartas recibidas:", cartas);
      setCartasRepartidas(cartas);
    });

    socketInstance.on("gameStarted", () => {
      console.log("🎮 Evento gameStarted recibido");
    });

    return () => socketInstance.disconnect();
  }, []);

  return {
    socket,
    isConnected,
    playerJoined,
    playerLeft,
    gameInitialized,
    diceRolled,
    playerMoved,
    turnChanged,
    cartasRepartidas
  };
}