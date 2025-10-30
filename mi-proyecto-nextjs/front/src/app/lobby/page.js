"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Button from "@/components/Button"
import styles from "./lobby.module.css"

export default function Lobby() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [joinCode, setJoinCode] = useState("")
  const [roomName, setRoomName] = useState("")
  const [playerCount, setPlayerCount] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [createdRoomCode, setCreatedRoomCode] = useState("") // Para mostrar el código generado
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = searchParams.get('user_id') || sessionStorage.getItem("userId")
        console.log("User ID:", userId)
        
        if (!userId) {
          console.error("No se encontró user_id")
          router.push("/login")
          return
        }

        const res = await fetch(`http://localhost:4000/user/${userId}`)
        
        if (res.ok) {
          const data = await res.json()
          console.log("✅ Usuario obtenido:", data)
          setUser(data)
          sessionStorage.setItem("userId", userId)
        } else {
          console.error("❌ Error al obtener usuario:", res.status)
          router.push("/login")
        }
      } catch (error) {
        console.error("💥 Error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams, router])

  // Limpiar usuarios de salas anteriores al cargar
  useEffect(() => {
    const userId = sessionStorage.getItem("userId")
    if (userId) {
      fetch("http://localhost:4000/deleteUsersInRoom", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }).catch(err => console.error("Error al limpiar sala anterior:", err))
    }
  }, [])

  const handleJoinRoom = async () => {
    setError("")
    setSuccess("")
    
    if (!joinCode.trim()) {
      setError("Ingrese el código de sala")
      return
    }

    // Validar que sea un código de 4 dígitos
    if (!/^\d{4}$/.test(joinCode)) {
      setError("El código debe ser de 4 dígitos")
      return
    }

    try {
      const userId = sessionStorage.getItem("userId")
      
      const res = await fetch("http://localhost:4000/joinroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode,
          playerId: userId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al unirse a la sala")
        return
      }

      sessionStorage.setItem("gameRoomId", data.roomId)
      setSuccess(`¡Unido a la sala "${data.roomName}"!`)
      
      setTimeout(() => {
        router.push(`/tablero`)
      }, 1500)

    } catch (error) {
      console.error("Error de red:", error)
      setError("No se pudo conectar con el servidor")
    }
  }

  const handleCreateRoom = async () => {
    setError("")
    setSuccess("")
    
    if (!roomName.trim() || !playerCount) {
      setError("Complete todos los campos para crear una sala")
      return
    }

    try {
      const userId = sessionStorage.getItem("userId")
      
      const res = await fetch("http://localhost:4000/createroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          players: playerCount,
          admin: userId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear la sala")
        return
      }

      sessionStorage.setItem("gameRoomId", data.roomId)
      setCreatedRoomCode(data.joinCode) // Mostrar el código generado
      setSuccess(`¡Sala creada! Código: ${data.joinCode}`)
      
      setTimeout(() => {
        router.push(`/tablero`)
      }, 3000)

    } catch (error) {
      console.error("Error de red:", error)
      setError("No se pudo conectar con el servidor")
    }
  }

  const handleGoToAdminPanel = () => {
    router.push("/adminpanel")
  }

  const isAdmin = user && (user.admin === 1 || user.admin === "1" || user.admin === true || user.admin > 0)

  if (loading) {
    return <div className={styles.lobbyContainer}>Cargando...</div>
  }

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <h2>Unirse a una sala</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Código de 4 dígitos"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={styles.input}
            maxLength={4}
          />
          <Button text="Unirse" onClick={handleJoinRoom} page="lobby" />
        </div>

        <h2>Crear una sala</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Nombre de la sala"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(e.target.value)}
            className={styles.select}
          >
            <option value="">Cantidad de jugadores</option>
            <option value="3">3 jugadores</option>
            <option value="4">4 jugadores</option>
          </select>
          <Button text="Crear" onClick={handleCreateRoom} page="lobby" />
        </div>

        {/* Mostrar código de sala creada */}
        {createdRoomCode && (
          <div className={styles.roomCode}>
            <h3>Código de tu sala:</h3>
            <p className={styles.code}>{createdRoomCode}</p>
            <small>Compartí este código con tus amigos para que se unan</small>
          </div>
        )}

        {/* Mensajes de error y éxito */}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {/* Botón de admin */}
        {isAdmin && (
          <div className={styles.inputGroup}>
            <Button text="Panel Admin" onClick={handleGoToAdminPanel} page="lobby" />
          </div>
        )}
      </div>
    </div>
  )
}