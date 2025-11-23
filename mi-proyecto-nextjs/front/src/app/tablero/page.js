"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css"
import clsx from 'clsx'
import Usuarios from "@/components/Usuarios"
import { cardsCharacters, cardsWeapons, cardsRooms } from "@/classes/Card"
import FormsAcusacion from "@/components/FormsAcusacion"
import { useSocket } from "@/hooks/useSocket"

export default function Tablero() {
  const [usersInRoom, setUsersInRoom] = useState([])
  const [jugadores, setJugadores] = useState([])
  const [turnoActual, setTurnoActual] = useState(0)
  const [userId, setUserId] = useState(null)
  const [joinCode, setJoinCode] = useState(null)
  const [numeroObtenido, setNumeroObtenido] = useState(0)
  const [modalAcusacion, setModalAcusacionAbierto] = useState(false)
  const [seUnio, setSeUnio] = useState(false)
  const [misCartas, setMisCartas] = useState([])
  const [showModal, setShowModal] = useState(false);
  const router = useRouter()

  const { socket, isConnected, gameInitialized, diceRolled, playerMoved, turnChanged, cartasRepartidas } = useSocket()

  // Recuperar joinCode y userId de sessionStorage
  useEffect(() => {
    const joinCode = sessionStorage.getItem("joinCode")
    const userId = sessionStorage.getItem("userId")
    setJoinCode(joinCode)
    setUserId(userId)
  }, [])

  // Unirse al room
  useEffect(() => {
    if (!socket || !isConnected || seUnio) return
    if (!joinCode || !userId) return

    console.log("🔗 Uniéndose a la sala:", joinCode, "con userId:", userId);
    socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode })
    setSeUnio(true)
  }, [socket, isConnected, joinCode, userId, seUnio])

  // Inicializar juego (backend asigna posiciones iniciales)
  useEffect(() => {
    if (!socket || !isConnected || !joinCode) return
    socket.emit("initializeGame", { joinCode })
    console.log("🎮 Juego inicializado (emit initializeGame)")
  }, [socket, isConnected, joinCode])

  // Actualizar jugadores y turno al inicializar juego
  useEffect(() => {
    if (!gameInitialized) return
    console.log("📊 Datos de inicialización recibidos:", gameInitialized)
    setJugadores(gameInitialized.players)
    setTurnoActual(gameInitialized.currentTurn)
  }, [gameInitialized])

  // Actualizar dado tirado (recibido por socket)
  useEffect(() => {
    if (!diceRolled) return
    console.log("🎲 Actualizando dado:", diceRolled)
    // solo actualizar el número en el frontend; Grilla consumirá el movimiento cuando confirme
    setNumeroObtenido(diceRolled.diceValue)
    setShowModal(true)
  }, [diceRolled])

  // Actualizar posición de jugador movido (recibido por socket)
  useEffect(() => {
    if (!playerMoved) return
    console.log("🚶 Actualizando posición:", playerMoved)
    setJugadores(prev => prev.map(j =>
      j.userId === playerMoved.playerId ? { ...j, position: playerMoved.newPosition } : j
    ))
  }, [playerMoved])

  // Actualizar turno (recibido por socket)
  useEffect(() => {
    if (!turnChanged) return

    console.log("========================================");
    console.log("⏭️ EVENTO turnChanged RECIBIDO:", turnChanged);
    console.log("========================================");

    setTurnoActual(turnChanged.currentTurn)
    // al cambiar turno se reinicia el dado localmente
    setNumeroObtenido(0)
    setShowModal(false)
  }, [turnChanged])

  // Resetear dado cuando cambia el turno local (por si)
  useEffect(() => {
    console.log("🔄 Estado turnoActual actualizado a:", turnoActual);
    console.log("   - esMiTurno:", jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId);
    setNumeroObtenido(0)
  }, [turnoActual])

  // Obtener usuarios en la sala
  useEffect(() => {
    if (!socket || !isConnected || !joinCode) return

    const handleUsersInRoom = async () => {
      try {
        const res = await fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
        const usuarios = await res.json()
        setUsersInRoom(usuarios)
      } catch (err) {
        console.error("Error al obtener usuarios:", err)
      }
    }

    handleUsersInRoom()
  }, [socket, isConnected, joinCode])

  // Manejar cartas repartidas desde socket
  useEffect(() => {
    if (cartasRepartidas) {
      console.log("🃏 Cartas actualizadas:", cartasRepartidas)
      setMisCartas(cartasRepartidas)
    }
  }, [cartasRepartidas])

  // Función que recibe la confirmación de movimiento desde Grilla
  const moverJugador = (nuevaPosicion) => {
    if (!socket || !joinCode || !userId) return

    const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
    if (!miTurno) {
      alert("⚠️ No es tu turno")
      return
    }

    console.log("📍 Emitiendo movePlayer a server con:", nuevaPosicion)
    socket.emit("movePlayer", { joinCode, playerId: userId, newPosition: nuevaPosicion })

    // Consumir la tirada: una vez que confirmás movimiento, ya no podés mover más ese turno.
    setNumeroObtenido(0)
    setShowModal(false)
  }

  // Tirar dado (dispara evento rollDice)
  const obtenerNumeroAleatorio = () => {
    if (!socket || !joinCode || !userId) return

    const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
    if (!miTurno) {
      alert("⚠️ No es tu turno")
      return
    }

    // Verificar que no haya tirado ya
    if (numeroObtenido > 0) {
      alert("⚠️ Ya tiraste el dado este turno")
      return
    }

    const diceValue = Math.floor(Math.random() * 6) + 1
    console.log("🎲 Tirando dado (emit rollDice):", diceValue)
    // mostrar modal lo hago al recibir el evento diceRolled desde el server; de todas formas emitimos
    socket.emit("rollDice", { joinCode, playerId: userId, diceValue })
    // optimist: setNumeroObtenido(diceValue) queda a cargo del evento diceRolled para evitar desync
  }

  // Pasar turno
  const pasarTurno = () => {
    if (!socket || !joinCode || !userId) {
      console.error("❌ Faltan datos para pasar turno");
      return;
    }

    const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
    if (!miTurno) {
      alert("⚠️ No es tu turno")
      return
    }

    const nextTurn = (turnoActual + 1) % jugadores.length
    console.log("⏭️ Pasando turno de", turnoActual, "→", nextTurn, "en sala:", joinCode)
    socket.emit("changeTurn", { joinCode, nextTurn })
  }

  // Repartir cartas (botón debug)
  const repartirCartas = async () => {
    if (!joinCode || !userId) {
      console.error("❌ Faltan joinCode o userId");
      return;
    }

    try {
      console.log("🎴 Repartiendo cartas...");
      const res = await fetch("http://localhost:4000/iniciarPartida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode,
          cardsCharacters,
          cardsWeapons,
          cardsRooms
        })
      });

      const data = await res.json();

      if (!data.ok) {
        console.error("❌ Error en respuesta:", data);
        return;
      }

      console.log("✅ Cartas repartidas correctamente");

    } catch (err) {
      console.error("❌ Error al repartir cartas:", err);
    }
  };

  const abrirModalAcusacion = () => setModalAcusacionAbierto(true)
  const cerrarModalAcusacion = () => setModalAcusacionAbierto(false)

  // Verificar si es el turno del jugador actual
  const esMiTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId

  return (
    <div className={styles["pagina-tablero"]}>
      {/* Panel de info */}
      <div className={styles["info-panel"]}>
        <h3>📊 Info del Juego</h3>
        <p>🎮 <strong>Sala:</strong> {joinCode || "Cargando..."}</p>
        <p>👤 <strong>Tu ID:</strong> {userId || "..."}</p>
        <p className={esMiTurno ? styles["turno-destacado"] : ""}>
          🎯 <strong>Turno:</strong> Jugador {turnoActual + 1} {esMiTurno && "👈 ¡TU TURNO!"}
        </p>
        <p>🎲 <strong>Dado:</strong> {numeroObtenido || "Sin tirar"}</p>
        <p>👥 <strong>Jugadores:</strong> {jugadores.length}</p>
        <p>🔌 <strong>Conexión:</strong> {isConnected ? "✅ Conectado" : "❌ Desconectado"}</p>
      </div>

      <Anotador />

      <Grilla
        currentUserId={userId}
        jugadores={jugadores}
        currentTurn={turnoActual}
        numeroObtenido={numeroObtenido}
        onMoverJugador={moverJugador}     // ahora Tablero maneja lo que pasa al confirmar movimiento
        onPasarTurno={pasarTurno}
        esMiTurno={esMiTurno}
      />

      {/* Botones */}
      <div className={styles["botones-container"]}>
        <button
          onClick={obtenerNumeroAleatorio}
          disabled={!esMiTurno || numeroObtenido > 0}
          className={`${styles["btn-base"]} ${styles["btn-dado"]}`}
        >
          🎲 Tirar dado
        </button>

        <button
          onClick={pasarTurno}
          disabled={!esMiTurno}
          className={`${styles["btn-base"]} ${styles["btn-turno"]}`}
        >
          ⏭️ Pasar turno
        </button>

        <button
          onClick={repartirCartas}
          className={`${styles["btn-base"]} ${styles["btn-cartas"]}`}
        >
          🎴 Repartir cartas
        </button>

        <button
          onClick={abrirModalAcusacion}
          className={`${styles["btn-base"]} ${styles["btn-acusacion"]}`}
        >
          🔍 Hacer Acusación
        </button>
      </div>

      {/* Indicador de dado flotante */}
      {numeroObtenido > 0 && esMiTurno && showModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: '40px 60px',
          borderRadius: '20px',
          fontSize: '80px',
          fontWeight: 'bold',
          zIndex: 1500,
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
          border: '3px solid #4CAF50',
          animation: 'diceAppear 0.5s ease',
          textAlign: 'center'
        }}>
          🎲 {numeroObtenido}
          <div style={{ fontSize: '18px', marginTop: '15px', color: '#4CAF50' }}>
            ¡Selecciona dónde moverte!
          </div>
          <br />
          <Button onClick={() => setShowModal(false)} text="Cerrar" />
        </div>
      )}

      {modalAcusacion && (
        <div className={styles["modal-overlay"]} onClick={cerrarModalAcusacion}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <FormsAcusacion onCerrar={cerrarModalAcusacion} />
          </div>
        </div>
      )}

      <Usuarios jugadores={jugadores} />
    </div>
  )
}
