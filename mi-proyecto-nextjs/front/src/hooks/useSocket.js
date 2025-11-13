import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = (options = { withCredentials: true }, serverUrl = "http://localhost:4000") => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);

  useEffect(() => {
    // Crear la conexión con el servidor Socket.IO
    const socketIo = io(serverUrl, options);

    // Conexión exitosa
    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Conectado a WebSocket');
    });

    // Desconexión
    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Desconectado de WebSocket');
    });

    // Recibir el estado del juego (como los turnos, jugadores, etc.)
    socketIo.on('gameStateUpdate', (state) => {
      setGameState(state);
      console.log('🎮 Estado del juego actualizado:', state);
    });

    // EVENTOS DEL WAITING ROOM
    socketIo.on('playerJoined', (data) => {
      console.log('👤 Jugador se unió a la sala:', data);
      // Aquí puedes actualizar la lista de jugadores en la UI
    });

    socketIo.on('gameStarted', (data) => {
      console.log('🚀 ¡El juego ha comenzado!', data);
      // El componente waiting room manejará la redirección
    });

    socketIo.on('playerLeft', (data) => {
      console.log('👋 Jugador salió de la sala:', data);
    });

    // EVENTOS DEL JUEGO
    socketIo.on('sugerencia', (sugerencia) => {
      console.log(`💡 Sugerencia recibida: ${JSON.stringify(sugerencia)}`);
      // Aquí puedes actualizar el estado del juego o la UI para reflejar la sugerencia
    });

    socketIo.on('acusacion', (acusacion) => {
      console.log(`⚖️ Acusación recibida: ${JSON.stringify(acusacion)}`);
      // Aquí puedes verificar si la acusación es correcta y actualizar el estado
    });

    
    socketIo.on('gameInitialized', (data) => {
      console.log('🎮 Juego inicializado:', data);
      setGameState(data);
    });

    socketIo.on('turno', (turno) => {
      console.log(`🎯 Es el turno de: ${turno}`);
      // Aquí puedes actualizar la UI para mostrar quién tiene el turno
    });

    socketIo.on('gameOver', (data) => {
      console.log('🏆 ¡Juego terminado!', data);
      // Mostrar ganador y estadísticas
    });

    socketIo.on('initializeGame', (data) => {
      console.log('🎮 Juego inicializado:', data);
      setGameState(data);
    });

    // Manejo de errores
    socketIo.on('connect_error', (err) => {
      setError(err.message);
      console.log('💥 Error en la conexión:', err.message);
    });

    // Guardar la instancia del socket
    setSocket(socketIo);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      socketIo.disconnect();
    };
  }, [serverUrl, JSON.stringify(options)]);

  // ========== FUNCIONES PARA WAITING ROOM ==========

  // Unirse a una sala
  const joinRoom = (roomId, playerId, joinCode) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', {
        room: roomId,
        playerId: playerId,
        joinCode: joinCode
      });
      console.log('🚪 Uniéndose a la sala:', roomId, 'playerId: ', playerId, 'joinCode', joinCode);
    }
  };

  // Salir de una sala
  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leaveRoom', { room: roomId });
      console.log('👋 Saliendo de la sala:', roomId);
    }
  };

  // Iniciar el juego (solo admin)
  const startGame = (roomId) => {
    if (socket && isConnected) {
      socket.emit('startGame', { room: roomId });
      console.log('🎮 Iniciando juego en sala:', roomId);
    }
  };

  // ========== FUNCIONES PARA EL JUEGO ==========

  const initializeGame = (joinCode) => {
    if (socket && isConnected) {
      socket.emit('initializeGame', { joinCode });
      console.log('🎮 Inicializando juego:', joinCode);
    } else {
      console.error('❌ Socket no conectado');
    }
  };
  // Enviar una sugerencia
  const enviarSugerencia = (jugador, quien, queArma, enQueHabitacion) => {
    if (socket && isConnected) {
      const sugerencia = { jugador, quien, queArma, enQueHabitacion };
      socket.emit('sugerencia', sugerencia);
      console.log('💡 Sugerencia enviada:', sugerencia);
    }
  };

  // Hacer una acusación
  const hacerAcusacion = (jugador, quien, queArma, enQueHabitacion) => {
    if (socket && isConnected) {
      const acusacion = { jugador, quien, queArma, enQueHabitacion };
      socket.emit('acusacion', acusacion);
      console.log('⚖️ Acusación enviada:', acusacion);
    }
  };

  // Cambiar el turno
  const cambiarTurno = (siguienteJugador) => {
    if (socket && isConnected) {
      socket.emit('turno', { siguienteJugador });
      console.log('🔄 Cambiando turno a:', siguienteJugador);
    }
  };

  // Tirar dados
  const tirarDados = (jugador) => {
    if (socket && isConnected) {
      socket.emit('tirarDados', { jugador });
      console.log('🎲 Tirando dados para:', jugador);
    }
  };

  // Mover personaje
  const moverPersonaje = (jugador, posicion) => {
    if (socket && isConnected) {
      socket.emit('moverPersonaje', { jugador, posicion });
      console.log('🚶 Moviendo personaje a:', posicion);
    }
  };

      // Enviar mensaje de chat
      const sendMessage = (roomId, message) => {
        if (socket && isConnected) {
          socket.emit('sendMessage', { room: roomId, message });
          console.log('💬 Mensaje enviado:', message);
        }
      };

      return {
        socket,
        isConnected,
        gameState,
        roomPlayers,
        error,
        // Funciones del Waiting Room
        joinRoom,
        leaveRoom,
        startGame,
        // Funciones del Juego
        enviarSugerencia,
        hacerAcusacion,
        //initializeGame,
        cambiarTurno,
        tirarDados,
        moverPersonaje,
        sendMessage
      };
    };

    export { useSocket };