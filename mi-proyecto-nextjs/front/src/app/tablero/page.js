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
  const [showModal, setShowModal] = useState(false)
  
  // Estados para el sistema de hipótesis
  const [modalHipotesis, setModalHipotesis] = useState(null)
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  const [cartasReveladas, setCartasReveladas] = useState([])

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

  // Inicializar juego
  useEffect(() => {
    if (!socket || !isConnected || !joinCode) return
    socket.emit("initializeGame", { joinCode })
    console.log("🎮 Juego inicializado (emit initializeGame)")
  }, [socket, isConnected, joinCode])

  // Actualizar jugadores y turno
  useEffect(() => {
    if (!gameInitialized) return
    console.log("📊 Datos de inicialización recibidos:", gameInitialized)
    setJugadores(gameInitialized.players)
    setTurnoActual(gameInitialized.currentTurn)
  }, [gameInitialized])

  // Actualizar dado tirado
  useEffect(() => {
    if (!diceRolled) return
    console.log("🎲 Actualizando dado:", diceRolled)
    setNumeroObtenido(diceRolled.diceValue)
    setShowModal(true)
  }, [diceRolled])

  // Actualizar posición de jugador
  useEffect(() => {
    if (!playerMoved) return
    console.log("🚶 Actualizando posición:", playerMoved)
    setJugadores(prev => prev.map(j =>
      j.userId === playerMoved.playerId ? { ...j, position: playerMoved.newPosition } : j
    ))
  }, [playerMoved])

  // Actualizar turno
  useEffect(() => {
    if (!turnChanged) return

    console.log("========================================");
    console.log("⏭️ EVENTO turnChanged RECIBIDO:", turnChanged);
    console.log("========================================");

    setTurnoActual(turnChanged.currentTurn)
    setNumeroObtenido(0)
    setShowModal(false)
  }, [turnChanged])

  useEffect(() => {
    console.log("🔄 Estado turnoActual actualizado a:", turnoActual);
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

  // Manejar cartas repartidas
  useEffect(() => {
    if (cartasRepartidas) {
      console.log("🃏 Cartas actualizadas:", cartasRepartidas)
      setMisCartas(cartasRepartidas)
    }
  }, [cartasRepartidas])

  // 🆕 Escuchar eventos de hipótesis del servidor
  useEffect(() => {
    if (!socket) return

    // Mostrar hipótesis a todos los jugadores
    socket.on("hypothesisAnnounced", (data) => {
      console.log("📢 Hipótesis anunciada:", data)
      setModalHipotesis(data)
      setEsperandoRespuesta(true)
    })

    // Solicitar respuesta a un jugador específico
    socket.on("requestHypothesisResponse", (data) => {
      console.log("❓ Se solicita respuesta de hipótesis:", data)
      setModalHipotesis(prev => ({ ...prev, currentResponderId: data.responderId }))
      // Solo el jugador al que le toca responder verá los botones
      if (data.responderId === userId) {
        setEsperandoRespuesta(true)
      }
    })

    // Resultado de la hipótesis (carta revelada o nadie tiene)
    socket.on("hypothesisResult", (data) => {
      console.log("✅ Resultado de hipótesis:", data)
      
      if (data.cardRevealed) {
        // Alguien tenía una carta
        alert(`${data.responderName} tiene una de las cartas!`)
        
        // Si yo hice la hipótesis, marcar la carta revelada
        if (data.hypothesisPlayerId === userId) {
          setCartasReveladas(prev => [...prev, data.cardRevealed])
        }
      } else {
        // Nadie tenía cartas
        alert("¡Nadie tiene ninguna de las cartas mencionadas!")
      }
      
      setModalHipotesis(null)
      setEsperandoRespuesta(false)
    })

    return () => {
      socket.off("hypothesisAnnounced")
      socket.off("requestHypothesisResponse")
      socket.off("hypothesisResult")
    }
  }, [socket, userId])

  // Función para responder a una hipótesis
  const responderHipotesis = (cartaRevelada) => {
    if (!socket || !joinCode) return

    console.log("💬 Enviando respuesta de hipótesis:", cartaRevelada)
    
    socket.emit("respondHypothesis", {
      joinCode,
      playerId: userId,
      cardRevealed: cartaRevelada // null si no tiene cartas
    })

    setEsperandoRespuesta(false)
  }

  const moverJugador = (nuevaPosicion) => {
    if (!socket || !joinCode || !userId) return

    const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
    if (!miTurno) {
      alert("⚠️ No es tu turno")
      return
    }

    console.log("📍 Emitiendo movePlayer a server con:", nuevaPosicion)
    socket.emit("movePlayer", { joinCode, playerId: userId, newPosition: nuevaPosicion })

    setNumeroObtenido(0)
    setShowModal(false)
  }

  const obtenerNumeroAleatorio = () => {
    if (!socket || !joinCode || !userId) return

    const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
    if (!miTurno) {
      alert("⚠️ No es tu turno")
      return
    }

    if (numeroObtenido > 0) {
      alert("⚠️ Ya tiraste el dado este turno")
      return
    }

    const diceValue = Math.floor(Math.random() * 6) + 1
    console.log("🎲 Tirando dado (emit rollDice):", diceValue)
    socket.emit("rollDice", { joinCode, playerId: userId, diceValue })
  }

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

  const esMiTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId

  // Verificar si debo responder a la hipótesis
  const deboResponder = modalHipotesis && esperandoRespuesta && modalHipotesis.currentResponderId === userId

  // Obtener cartas que puedo mostrar
  const cartasQuePuedoMostrar = () => {
    if (!modalHipotesis) return []
    
    const { sospechoso, arma, habitacion } = modalHipotesis.hypothesis
    
    return misCartas.filter(carta => 
      carta.characterName === sospechoso ||
      carta.weaponName === arma ||
      carta.roomName === habitacion
    )
  }

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

      <Anotador misCartas={[...misCartas, ...cartasReveladas]} />

      <Grilla
        currentUserId={userId}
        jugadores={jugadores}
        currentTurn={turnoActual}
        numeroObtenido={numeroObtenido}
        onMoverJugador={moverJugador}
        onPasarTurno={pasarTurno}
        esMiTurno={esMiTurno}
        socket={socket}
        joinCode={joinCode}
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

      {/* Modal de hipótesis (visible para todos) */}
      {modalHipotesis && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px', 
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 10px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              🔍 {modalHipotesis.playerName} ha hecho una hipótesis
            </h2>
            
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '25px', 
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '10px', color:'#000000ff' }}>
                <strong>🕵️ Sospechoso:</strong> {modalHipotesis.hypothesis.sospechoso}
              </p>
              <p style={{ fontSize: '18px', marginBottom: '10px', color:'#000000ff'  }}>
                <strong>🔪 Arma:</strong> {modalHipotesis.hypothesis.arma}
              </p>
              <p style={{ fontSize: '18px', color:'#000000ff' }}>
                <strong>🏠 Habitación:</strong> {modalHipotesis.hypothesis.habitacion}
              </p>
            </div>

            {deboResponder ? (
              <div>
                <p style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>
                  ¡Es tu turno de responder!
                </p>
                
                {cartasQuePuedoMostrar().length > 0 ? (
                  <div>
                    <p style={{ marginBottom: '15px' }}>Selecciona una carta para mostrar:</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {cartasQuePuedoMostrar().map((carta, idx) => {
                        const nombreCarta = carta.characterName || carta.weaponName || carta.roomName
                        return (
                          <button
                            key={idx}
                            onClick={() => responderHipotesis(nombreCarta)}
                            style={{
                              padding: '15px 25px',
                              fontSize: '16px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            {nombreCarta}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => responderHipotesis(null)}
                    style={{
                      padding: '15px 30px',
                      fontSize: '16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ No tengo ninguna carta
                  </button>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '16px', color: '#666' }}>
                Esperando respuesta de {modalHipotesis.currentResponderName}...
              </p>
            )}
          </div>
        </div>
      )}

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