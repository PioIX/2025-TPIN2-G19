"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSocket } from "@/hooks/useSocket";
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { socket, isConnected } = useSocket();


  //useEffect para guardar user_id
  useEffect(() => {
    const userId = searchParams.get("user_id") || sessionStorage.getItem("userId")
    const fetchUser = async () => {
      try {
        if (!userId) {
          console.error("No se encontró user id")
          router.push("/login")
          return
        }

        const res = await fetch(`http://localhost:4000/user/${userId}`) //trae toda la info del usuario
        
        if (res.ok) {
          const data = await res.json()
          setUser(data) // guarda la info del usuario en el estado
          sessionStorage.setItem("userId", userId)
          console.log(user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams, router])


  //useEffect para eliminar al usuario de cualquier room anterior
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

  //conectar al socket
  useEffect(() => {
    if (!socket) return;
    //Aquí entrará cuando reciba un evento
  }, [socket]);


  //handleJoinRoom
 const handleJoinRoom = async () => {
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch("http://localhost:4000/joinroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode, playerId: userId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al unirse a la sala");
      return;
    }

    localStorage.setItem("roomId", data.roomId);
    router.push(`/waitingroom?joinCode=${joinCode}`);

  } catch (error) {
    setError("No se pudo conectar con el servidor");
  }
};


  // handleCreateRoom
  const handleCreateRoom = async () => {
    setError("")
    setSuccess("")
    
    if (!roomName.trim() || !playerCount) {
      setError("Complete todos los campos para crear una sala")
      return
    }

    try {
      const userId = sessionStorage.getItem("userId")
      console.log(userId)
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

      const { roomId } = data;
      localStorage.setItem("roomId", roomId);
      router.push(`/tablero`);
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
    
    try {  
      sessionStorage.setItem("gameRoomId", data.roomId)
      setSuccess(`¡Sala creada con éxito!`)
      
      setTimeout(() => {
        router.push(`/waitingroom`)
      }, 1000)

    } catch (error) {
      console.error("Error de red:", error)
      setError("No se pudo conectar con el servidor")
    }
  }

  const handleGoToAdminPanel = () => {
    router.push("/adminpanel")
  }

  const isAdmin = user && (user.admin === 1 || user.admin === "1" || user.admin === true || user.admin > 0)

  /*if (loading) {
    return( <div className={styles.lobbyContainer}>Cargando...</div>)
  }*/

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

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {isAdmin && (
          <div className={styles.inputGroup}>
            <Button text="Panel Admin" onClick={handleGoToAdminPanel} page="lobby" />
          </div>
        )}
      </div>
    </div>
  )

}