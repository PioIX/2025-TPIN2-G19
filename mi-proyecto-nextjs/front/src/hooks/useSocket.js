import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = (options = { withCredentials: false }, serverUrl = "ws://localhost:4000/") => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);  // Estado para almacenar el estado del juego
  const [error, setError] = useState(null);

  useEffect(() => {
    // Crear la conexión con el servidor Socket.IO
    const socketIo = io(serverUrl, options);

    // Conexión exitosa
    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('Conectado a WebSocket');
    });

    // Desconexión
    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('Desconectado de WebSocket');
    });

    // Recibir el estado del juego (como los turnos, jugadores, etc.)
    socketIo.on('gameStateUpdate', (state) => {
      setGameState(state); // Actualizar el estado del juego con la respuesta del servidor
    });

    // Recibir eventos del juego como sugerencias, acusaciones y cambios de turno
    socketIo.on('sugerencia', (sugerencia) => {
      console.log(`Sugerencia recibida: ${JSON.stringify(sugerencia)}`);
      // Aquí puedes actualizar el estado del juego o la UI para reflejar la sugerencia
    });

    socketIo.on('acusacion', (acusacion) => {
      console.log(`Acusación recibida: ${JSON.stringify(acusacion)}`);
      // Aquí puedes verificar si la acusación es correcta y actualizar el estado
    });

    socketIo.on('turno', (turno) => {
      console.log(`Es el turno de: ${turno}`);
      // Aquí puedes actualizar la UI para mostrar quién tiene el turno
    });

    // Manejo de errores
    socketIo.on('connect_error', (err) => {
      setError(err.message);
      console.log('Error en la conexión:', err.message);
    });

    // Guardar la instancia del socket
    setSocket(socketIo);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      socketIo.disconnect();
    };
  }, [serverUrl, JSON.stringify(options)]);

  // Función para enviar una sugerencia
  const enviarSugerencia = (jugador, quien, queArma, enQueHabitacion) => {
    if (socket && isConnected) {
      const sugerencia = { jugador, quien, queArma, enQueHabitacion };
      socket.emit('sugerencia', sugerencia);  // Emitir la sugerencia al servidor
    }
  };

  // Función para hacer una acusación
  const hacerAcusacion = (jugador, quien, queArma, enQueHabitacion) => {
    if (socket && isConnected) {
      const acusacion = { jugador, quien, queArma, enQueHabitacion };
      socket.emit('acusacion', acusacion);  // Emitir la acusación al servidor
    }
  };

  // Función para cambiar el turno
  const cambiarTurno = () => {
    if (socket && isConnected) {
      socket.emit('turno', { nuevoTurno: true });  // Emitir el evento de cambio de turno
    }
  };

  return { socket, isConnected, gameState, enviarSugerencia, hacerAcusacion, cambiarTurno, error };
};

export { useSocket };
