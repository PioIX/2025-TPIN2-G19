"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Button from "@/components/Button"
import styles from "./lobby.module.css"

export default function Lobby() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [roomName, setRoomName] = useState("")
  const [playerCount, setPlayerCount] = useState("")

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return alert("Ingrese un código para unirse.")
    // Aquí harías un fetch al backend para validar el código y entrar
    router.push(`/game/${joinCode}`)
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerCount)
      return alert("Complete todos los campos para crear una sala.")
    try {
      // Luego conectarás con tu backend
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
      </div>
    </div>
  )
}
