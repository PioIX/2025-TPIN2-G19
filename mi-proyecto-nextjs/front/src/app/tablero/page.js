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

        socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode })
        setSeUnio(true)
    }, [socket, isConnected, joinCode, userId, seUnio])

    // Inicializar juego
    useEffect(() => {
        if (!socket || !isConnected || !joinCode) return
        socket.emit("initializeGame", { joinCode })
    }, [socket, isConnected, joinCode])

    // Actualizar jugadores y turno al inicializar juego
    useEffect(() => {
        if (!gameInitialized) return
        setJugadores(gameInitialized.players)
        setTurnoActual(gameInitialized.currentTurn)
    }, [gameInitialized])

    // Actualizar dado tirado
    useEffect(() => {
        if (!diceRolled) return
        setNumeroObtenido(diceRolled.diceValue)
    }, [diceRolled])

    // Actualizar posición de jugador movido
    useEffect(() => {
        if (!playerMoved) return
        setJugadores(prev => prev.map(j => 
            j.userId === playerMoved.playerId ? { ...j, position: playerMoved.newPosition } : j
        ))
    }, [playerMoved])

    // Actualizar turno
    useEffect(() => {
        if (!turnChanged) return
        setTurnoActual(turnChanged.currentTurn)
        setNumeroObtenido(0)
    }, [turnChanged])

    // Obtener usuarios en la sala
    useEffect(() => {
        if (!socket || !isConnected || !joinCode) return

        const handleUsersInRoom = async () => {
            try {
                const res = await fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
                const usuarios = await res.json()
                setUsersInRoom(usuarios)
                setJugadores(usuarios)
            } catch (err) {
                console.error("Error al obtener usuarios:", err)
            }
        }

        handleUsersInRoom()
    }, [socket, isConnected, joinCode])

    // Manejar cartas repartidas desde socket
    useEffect(() => {
        if (!socket) return
        const handleCartas = (cartas) => setMisCartas(cartas)
        socket.on("cartas_repartidas", handleCartas)
        return () => socket.off("cartas_repartidas", handleCartas)
    }, [socket])

    // Mantener cartasRepartidas del hook
    useEffect(() => {
        if (cartasRepartidas) setMisCartas(cartasRepartidas)
    }, [cartasRepartidas])

    // Función para mover jugador
    const moverJugador = (nuevaPosicion) => {
        if (!socket || !joinCode || !userId) return
        socket.emit("movePlayer", { joinCode, playerId: userId, newPosition: nuevaPosicion })
    }

    // Tirar dado
    const obtenerNumeroAleatorio = () => {
        if (!socket || !joinCode || !userId) return

        const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
        if (!miTurno) {
            alert("⚠️ No es tu turno")
            return
        }

        const diceValue = Math.floor(Math.random() * 6) + 1
        socket.emit("rollDice", { joinCode, playerId: userId, diceValue })
    }

    // Pasar turno
    const pasarTurno = () => {
        if (!socket || !joinCode || !userId) return

        const miTurno = jugadores.find(j => j.turnOrder === turnoActual)?.userId === userId
        if (!miTurno) {
            alert("⚠️ No es tu turno")
            return
        }

        const nextTurn = (turnoActual + 1) % jugadores.length
        socket.emit("changeTurn", { joinCode, nextTurn })
    }

    // Repartir cartas
    const repartirCartas = async () => {
        if (!joinCode || !userId) return
        try {
            const res = await fetch("http://localhost:4000/iniciarPartida", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joinCode, userId, cardsCharacters, cardsWeapons, cardsRooms })
            })
            const data = await res.json()
            if (data.cartasJugador) setMisCartas(data.cartasJugador)
            console.log("🎴 Mis cartas:", data.cartasJugador)
        } catch (err) {
            console.error("❌ Error al repartir cartas:", err)
        }
    }

    const abrirModalAcusacion = () => setModalAcusacionAbierto(true)
    const cerrarModalAcusacion = () => setModalAcusacionAbierto(false)

    return (
        <div className={styles["pagina-tablero"]}>
            {/* Panel de info */}
            <div style={{
                position: 'fixed', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.9)',
                color: 'white', padding: '15px', borderRadius: '8px', fontSize: '14px',
                zIndex: 1000, minWidth: '200px'
            }}>
                <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #4CAF50', paddingBottom: '5px' }}>
                    📊 Info
                </h3>
                <p>🎮 <strong>Sala:</strong> {joinCode || "..."}</p>
                <p>👤 <strong>Tu ID:</strong> {userId || "..."}</p>
                <p>🎯 <strong>Turno:</strong> Jugador {turnoActual + 1}</p>
                <p>🎲 <strong>Dado:</strong> {numeroObtenido || "❌"}</p>
                <p>👥 <strong>Jugadores:</strong> {jugadores.length}</p>
                <p>🔌 <strong>Socket:</strong> {isConnected ? "✅" : "❌"}</p>
            </div>

            <Anotador />

            <Grilla
                currentUserId={userId}
                jugadores={jugadores}
                currentTurn={turnoActual}
                numeroObtenido={numeroObtenido}
                onMoverJugador={moverJugador}
            />

            {/* Botones */}
            <div style={{
                position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '10px', zIndex: 1000
            }}>
                <button onClick={obtenerNumeroAleatorio} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🎲 Tirar dado
                </button>

                <button onClick={pasarTurno} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ⏭️ Pasar turno
                </button>

                <button onClick={repartirCartas} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🎴 Repartir cartas
                </button>

                <button onClick={abrirModalAcusacion} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🔍 Hacer Acusación
                </button>
            </div>

            {modalAcusacion && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <FormsAcusacion onCerrar={cerrarModalAcusacion} />
                </div>
            )}

            <Usuarios jugadores={jugadores} />
        </div>
    )
}