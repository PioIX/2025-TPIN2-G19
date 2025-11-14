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

    socketInstance.on("connect", () => console.log("🔌 Socket conectado:", socketInstance.id) || setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));

    socketInstance.on("playerJoined", setPlayerJoined);
    socketInstance.on("playerLeft", setPlayerLeft);
    socketInstance.on("initializeGame", setGameInitialized);
    socketInstance.on("diceRolled", setDiceRolled);
    socketInstance.on("playerMoved", setPlayerMoved);
    socketInstance.on("turnChanged", setTurnChanged);
    socketInstance.on("cartas_repartidas", (cartas) => {
      console.log("🃏 Cartas recibidas por socket:", cartas);
      setCartasRepartidas(cartas);
    });
     socketInstance.on("gameStarted", () => {
      console.log("🎮 Evento gameStarted recibido");
      setGameInitialized(true); // esto indica que todos deben ir al tablero
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

