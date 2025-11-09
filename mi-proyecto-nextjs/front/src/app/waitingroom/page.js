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
    console.log(joinCode)
    if (joinCode) {
      socket.emit("joinRoom", { room: joinCode, playerId:userId, joinCode:joinCode })
      socket.on("playerJoined", (data) => {
        console.log("Nuevo jugador se unió:", data)
        fetchPlayers(joinCode)
      })

      socket.on("gameStarted", () => {
        console.log("¡El juego ha comenzado!")
        router.push("/tablero")
      })
    }

    return () => {
      socket.off("playerJoined")
      socket.off("gameStarted")
    }
  }, [socket, isConnected, roomData, router])

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const joinCode = sessionStorage.getItem("joinCode")
        console.log(joinCode)
        const userId = sessionStorage.getItem("userId")

        if (!joinCode) {
          router.push(`/lobby?user_id=${userId}`)
          return
        }

        // Obtener datos de la sala
        const roomRes = await fetch(`http://localhost:4000/room?joinCode=${joinCode}`)
        if (!roomRes.ok) throw new Error("Sala no encontrada")
        
        const room = await roomRes.json()
        setRoomData(room)
        setIsAdmin(room.admin == userId)

        // Obtener jugadores en la sala
        fetchPlayers(joinCode)
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
      const res = await fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
      console.log("fetch players", res)
      if (!res.ok) throw new Error("Error al obtener jugadores")
      
      const data = await res.json()
      setPlayers(data)
      console.log("data fetch players ", data)
      
      // Verificar si todos los jugadores se unieron
      if (roomData && data.length == roomData.players) {
        setCanStart(true)
        console.log("Todos los jugadores se han unido. El juego puede comenzar.")
        router.push("/tablero")
      }
    } catch (error) {
      console.error("Error al obtener jugadores:", error)
    }
  }

  // Actualizar jugadores cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const gameRoomId = sessionStorage.getItem("gameRoomId")
      if (gameRoomId) {
        fetchPlayers(gameRoomId)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [roomData])

  const handleStartGame = () => {
    if (!canStart || !isAdmin) return

    const gameRoomId = sessionStorage.getItem("gameRoomId")
    socket.emit("startGame", { room: gameRoomId })
    router.push("/tablero")
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
                        src={player.photo || "/default-avatar.png"} 
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