"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"
import Button from "@/components/Button"
import styles from "./waitingroom.module.css"

export default function WaitingRoom() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [roomData, setRoomData] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canStart, setCanStart] = useState(false)

  console.log("ENTRO A WAITING ROOM")

  // Socket: Escuchar cuando un jugador se une
  useEffect(() => {
    console.log("entro al useEffect de socket")
    if (!socket || !isConnected) return

    const joinCode = sessionStorage.getItem("joinCode")
    const userId = sessionStorage.getItem("userId")
    console.log("Socket joinCode:", joinCode)
    
    if (joinCode) {
      socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode: joinCode })
      
      socket.on("playerJoined", (data) => {
        console.log("Nuevo jugador se unió:", data)
        fetchPlayers(joinCode)
      })

      // ✅ ESTE ES EL CAMBIO CLAVE: todos escuchan gameStarted y redirigen
      socket.on("gameStarted", (data) => {
        console.log("¡El juego ha comenzado! Redirigiendo al tablero...", data)
        router.push(`/tablero?joinCode=${joinCode}`)
      })
    }

    return () => {
      socket.off("playerJoined")
      socket.off("gameStarted")
    }
  }, [socket, isConnected, router])

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")
        
        console.log("Fetching room data con joinCode:", joinCode)

        if (!joinCode) {
          console.log("No hay joinCode, redirigiendo al lobby")
          router.push(`/lobby?user_id=${userId}`)
          return
        }

        // Obtener datos de la sala
        const roomRes = await fetch(`http://localhost:4000/room?joinCode=${joinCode}`)
        console.log("Room response status:", roomRes.status)
        
        if (!roomRes.ok) {
          console.error("Error al obtener sala, status:", roomRes.status)
          throw new Error("Sala no encontrada")
        }
        
        const room = await roomRes.json()
        console.log("Room data obtenida:", room)
        
        setRoomData(room)
        setIsAdmin(room.admin == userId)

        // Obtener jugadores en la sala
        await fetchPlayers(joinCode)
      } catch (error) {
        console.error("Error al obtener sala:", error)
        router.push("/lobby?user_id=" + sessionStorage.getItem("userId"))
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [router])

  const fetchPlayers = async (joinCode) => {
    try {
      console.log("Fetching players con joinCode:", joinCode)
      const res = await fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
      console.log("fetch players response:", res)
      
      if (!res.ok) throw new Error("Error al obtener jugadores")
      
      const data = await res.json()
      console.log("data fetch players:", data)
      setPlayers(data)
      
      // Verificar si todos los jugadores se unieron
      if (roomData && data.length == roomData.players) {
        setCanStart(true)
        console.log("Todos los jugadores se han unido. El juego puede comenzar.")
      }
    } catch (error) {
      console.error("Error al obtener jugadores:", error)
    }
  }

  // Actualizar jugadores cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const joinCode = sessionStorage.getItem("joinCode")
      if (joinCode) {
        console.log("Polling players con joinCode:", joinCode)
        fetchPlayers(joinCode)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [roomData])

  const handleStartGame = () => {
    if (!canStart || !isAdmin) return

    const joinCode = sessionStorage.getItem("joinCode")
    
    // ✅ SOLO emitir el evento, NO hacer router.push aquí
    // El redirect lo hará el listener de gameStarted (arriba)
    console.log("🎮 Admin emitiendo startGame para sala:", joinCode)
    socket.emit("startGame", { room: joinCode })
    
    // ❌ REMOVER esta línea:
    // router.push("/tablero")
  }

  const handleLeaveRoom = async () => {
    try {
      const userId = sessionStorage.getItem("userId")
      await fetch("http://localhost:4000/deleteUsersInRoom", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      
      sessionStorage.removeItem("gameRoomId")
      sessionStorage.removeItem("joinCode")
      router.push("/lobby")
    } catch (error) {
      console.error("Error al salir de la sala:", error)
    }
  }

  const handleCopyCode = () => {
    if (roomData?.joinCode) {
      navigator.clipboard.writeText(roomData.joinCode)
      alert("¡Código copiado al portapapeles!")
    }
  }

  if (loading) {
    return <div className={styles.waitingContainer}>Cargando...</div>
  }

  if (!roomData) {
    return <div className={styles.waitingContainer}>Sala no encontrada</div>
  }

  // Crear array de slots para mostrar
  const playerSlots = Array.from({ length: roomData.players }, (_, index) => {
    return players[index] || null
  })

  return (
    <div className={styles.waitingContainer}>
      <div className={styles.waitingCard}>
        <h1 className={styles.title}>{roomData.nameRoom}</h1>
        
        <div className={styles.codeSection}>
          <p className={styles.codeLabel}>Código de sala:</p>
          <div className={styles.codeBox} onClick={handleCopyCode}>
            <span className={styles.code}>{roomData.joinCode}</span>
            <span className={styles.copyHint}>Click para copiar</span>
          </div>
        </div>

        <div className={styles.playersSection}>
          <h2>Jugadores ({players.length}/{roomData.players})</h2>
          <div className={styles.playersGrid}>
            {playerSlots.map((player, index) => (
              <div 
                key={index} 
                className={`${styles.playerSlot} ${player ? styles.filled : styles.empty}`}
              >
                {player ? (
                  <>
                    <div className={styles.playerAvatar}>
                      <img 
                        src={`/imagenes/${player.photo || "default.jpg"}`}
                        alt={player.username}
                      />
                    </div>
                    <p className={styles.playerName}>{player.username}</p>
                    {roomData.admin == player.userId && (
                      <span className={styles.adminBadge}>👑 Admin</span>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.emptyAvatar}>
                      <span className={styles.questionMark}>?</span>
                    </div>
                    <p className={styles.waitingText}>Esperando jugador...</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          {isAdmin && canStart && (
            <Button 
              text="¡Comenzar juego!" 
              onClick={handleStartGame} 
              page="waiting"
            />
          )}
          {isAdmin && !canStart && (
            <p className={styles.waitingMessage}>
              Esperando a que todos los jugadores se unan...
            </p>
          )}
          {!isAdmin && (
            <p className={styles.waitingMessage}>
              Esperando a que el admin inicie el juego...
            </p>
          )}
          
          <Button 
            text="Salir de la sala" 
            onClick={handleLeaveRoom} 
            page="waiting"
          />
        </div>
      </div>
    </div>
  )
}