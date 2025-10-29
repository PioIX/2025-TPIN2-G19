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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = searchParams.get('user_id')
        console.log("User ID desde URL:", userId)
        
        if (!userId) {
          console.error("No se encontró user_id en la URL")
          setLoading(false)
          return
        }

        // Llamar DIRECTAMENTE al backend Node.js
        const res = await fetch(`http://localhost:4000/user/${userId}`)
        console.log("Respuesta del backend:", res.status)
        
        if (res.ok) {
          const data = await res.json()
          console.log("✅ Usuario obtenido del backend:", data)
          console.log("✅ Admin value:", data.admin, "Type:", typeof data.admin)
          setUser(data)
        } else {
          console.error("❌ Error al obtener usuario:", res.status)
        }
      } catch (error) {
        console.error("💥 Error en la llamada al backend:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams])

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return alert("Ingrese un código para unirse.")
    router.push(`/game/${joinCode}`)
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerCount)
      return alert("Complete todos los campos para crear una sala.")
    try {
      const res = await fetch("http://localhost:4000/createroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          cant_players: Number(playerCount),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/game/${data.roomId}`)
      } else {
        alert("Error al crear la sala.")
      }
    } catch (error) {
      console.error(error)
      alert("No se pudo crear la sala.")
    }
  }

  const handleGoToAdminPanel = () => {
    router.push("/adminpanel")
  }

  // Verificar si es admin - aceptar 1, "1", true, o cualquier valor truthy
  const isAdmin = user && (user.admin === 1 || user.admin === "1" || user.admin === true || user.admin > 0)

  console.log("🎯 Estado del usuario completo:", user)
  console.log("🎯 Valor de admin:", user?.admin)
  console.log("🎯 ¿Es admin?:", isAdmin)

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <h2>Unirse a una sala</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Ingrese el código"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className={styles.input}
          />
          <Button text="Unirse" onClick={handleJoinRoom} page="lobby" />
        </div>

        <h2>Crear una sala</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Nombre"
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
            <option value="5">5 jugadores</option>
          </select>
          <Button text="Crear" onClick={handleCreateRoom} page="lobby" />
        </div>

        {/* Mostrar botón de admin */}
        {!loading && isAdmin && (
          <div className={styles.inputGroup}>
            <Button text="Panel Admin" onClick={handleGoToAdminPanel} page="lobby" />
          </div>
        )}
      </div>
    </div>
  )
}