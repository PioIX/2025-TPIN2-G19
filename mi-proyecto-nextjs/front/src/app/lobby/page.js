"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Button from "@/components/Button"
import styles from "./lobby.module.css"

export default function Lobby() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [roomName, setRoomName] = useState("")
  const [playerCount, setPlayerCount] = useState("")
  const userId = localStorage.getItem("userId")

  useEffect( () => {
    fetch(`http://localhost:4000/deleteUsersInRoom`)
  }, [])

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return alert("Ingrese el código de sala.");

    try {
      const res = await fetch("http://localhost:4000/joinroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode, // ID o código de la sala
          playerId: userId, // el ID del usuario actual (igual que admin en create)
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Error al unirse a la sala:", errText);
        return alert(errText || "Error al unirse a la sala.");
      }

      const { roomId } = await res.json();
      localStorage.setItem("gameRoomId", roomId);
      router.push(`/tablero`);

    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerCount)
      return alert("Complete todos los campos para crear una sala.");

    try {
      const userId = localStorage.getItem("userId")
      const res = await fetch("http://localhost:4000/createroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          players: playerCount,
          admin: userId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Error al crear sala:", errText);
        return alert("Error al crear la sala.");
      }

      const { roomId } = await res.json();
      localStorage.setItem("gameRoomId", roomId);
      router.push(`/tablero`);
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };


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
          </select>
          <Button text="Crear" onClick={handleCreateRoom} page="lobby" />
        </div>
      </div>
    </div>
  )
}
