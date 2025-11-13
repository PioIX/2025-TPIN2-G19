"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
const tipo = "checkbox"
import Button from "@/components/Button"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css";
import clsx from 'clsx';
import Usuarios from "@/components/Usuarios";
import { cardsCharacters, cardsWeapons, cardsRooms } from "@/classes/Card";
import FormsAcusacion from "@/components/FormsAcusacion";
import { useSocket } from "@/hooks/useSocket";

export default function Tablero() {
    const [usersInRoom, setUsersInRoom] = useState([])
    const [jugadores, setJugadores] = useState([])
    const [turnoActual, setTurnoActual] = useState(0)
    const [miIndice, setMiIndice] = useState(null)
    // ❌ PROBLEMA: Inicializar en 0 en lugar de null
    // const [userId, setUserId] = useState(0)
    // const [joinCode, setJoinCode] = useState(0)
    // ✅ SOLUCIÓN: Inicializar en null para detectar mejor cuando no están cargados
    const [userId, setUserId] = useState(null)
    const [joinCode, setJoinCode] = useState(null)
    const router = useRouter()
    const { socket, isConnected } = useSocket()
    const [numeroObtenido, setNumeroObtenido] = useState(0)
    const [modalAcusacion, setModalAcusacionAbierto] = useState(false)


    useEffect(() => {
        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")

        setJoinCode(joinCode)
        setUserId(userId)
        console.log("primero este")
        console.log(joinCode)
        console.log(userId)
    }, [])


    // ❌ PROBLEMA: Este useEffect NO tiene joinCode y userId en las dependencias
    // Por lo que cuando joinCode cambia de null al valor real, no se vuelve a ejecutar
    // useEffect(() => {
    //     console.log("entro al useEffect de socket")
    //     if (!socket || !isConnected) return
    //     console.log("segundo este")
    //
    //     if (joinCode) {
    //         socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode: joinCode })
    //
    //         socket.on("playerJoined", (data) => {
    //             console.log("Nuevo jugador se unió:", data)
    //             fetchPlayers(joinCode)
    //         })
    //     }
    // }, [socket, isConnected])
    
    // ✅ SOLUCIÓN: Agregar joinCode y userId a las dependencias
    useEffect(() => {
        console.log("entro al useEffect de socket")
        if (!socket || !isConnected) return
        // ✅ Validar que joinCode y userId existan
        if (!joinCode || !userId) {
            console.log("Esperando joinCode y userId...")
            return
        }
        console.log("segundo este")

        socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode: joinCode })
        console.log("se unio el ")

        socket.on("playerJoined", (data) => {
            console.log("Nuevo jugador se unió:", data)
            fetchPlayers(joinCode)
        })
        
        return () => {
            socket.off("playerJoined")
        }
    }, [socket, isConnected, joinCode, userId])

    // ❌ PROBLEMA: Este useEffect se ejecuta solo una vez al montar el componente
    // En ese momento joinCode es null y socket puede no estar conectado
    // useEffect(() => {
    //     setJugadores((prev) => [...prev, userId]);
    //     console.log("jugadores en el tablero: ", jugadores)
    //
    //     // Inicializar el juego
    //     initializeGame(joinCode);
    //     // ===== LISTENERS DEL SOCKET =====
    //
    //     // Cuando el juego se inicializa
    //     socket.on("initializeGame", (data) => {
    //         console.log("Juego inicializado:", data)
    //         setJugadores(data.players)
    //         setTurnoActual(data.currentTurn)
    //
    //         // Encontrar mi índice
    //         const miIdx = data.players.findIndex(p => p.userId == userId)
    //         setMiIndice(miIdx)
    //     })
    //
    //     // Cuando alguien tira el dado
    //     socket.on("diceRolled", (data) => {
    //         console.log("Dado tirado:", data)
    //         setNumeroObtenido(data.result)
    //     })
    //
    //     // Cuando un jugador se mueve
    //     socket.on("playerMoved", (data) => {
    //         console.log("Jugador movido:", data)
    //         setJugadores(prev =>
    //             prev.map(p =>
    //                 p.userid === data.playerId
    //                     ? { ...p, position: data.newPosition }
    //                     : p
    //             )
    //         )
    //     })
    //
    //     // Cuando cambia el turno
    //     socket.on("turnChanged", (data) => {
    //         console.log("Turno cambiado:", data)
    //         setTurnoActual(data.currentTurn)
    //         setNumeroObtenido(0) // Resetear el dado
    //     })
    //
    //     return () => {
    //         socket.off("gameInitialized")
    //         socket.off("diceRolled")
    //         socket.off("playerMoved")
    //         socket.off("turnChanged")
    //     }
    // }, [])
    
    // ✅ SOLUCIÓN: Mover estos listeners al useEffect anterior y agregar dependencias
    useEffect(() => {
        if (!socket || !isConnected || !joinCode || !userId) return
        
        console.log("Configurando listeners del juego")
        
        setJugadores((prev) => [...prev, userId]);
        console.log("jugadores en el tablero: ", jugadores)

        // Inicializar el juego
        socket.emit("initializeGame", { joinCode })
        
        // ===== LISTENERS DEL SOCKET =====

        // Cuando el juego se inicializa
        socket.on("initializeGame", (data) => {
            console.log("Juego inicializado:", data)
            setJugadores(data.players)
            setTurnoActual(data.currentTurn)

            // Encontrar mi índice
            const miIdx = data.players.findIndex(p => p.userId == userId)
            setMiIndice(miIdx)
        })

        // Cuando alguien tira el dado
        socket.on("diceRolled", (data) => {
            console.log("Dado tirado:", data)
            setNumeroObtenido(data.result)
        })

        // Cuando un jugador se mueve
        socket.on("playerMoved", (data) => {
            console.log("Jugador movido:", data)
            setJugadores(prev =>
                prev.map(p =>
                    p.userid === data.playerId
                        ? { ...p, position: data.newPosition }
                        : p
                )
            )
        })

        // Cuando cambia el turno
        socket.on("turnChanged", (data) => {
            console.log("Turno cambiado:", data)
            setTurnoActual(data.currentTurn)
            setNumeroObtenido(0) // Resetear el dado
        })

        return () => {
            socket.off("initializeGame")
            socket.off("diceRolled")
            socket.off("playerMoved")
            socket.off("turnChanged")
        }
    }, [socket, isConnected, joinCode, userId])

    const moverJugador = (nuevaPosicion) => {
        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")

        socket.emit("movePlayer", {
            joinCode,
            playerId: userId,
            newPosition: nuevaPosicion
        })
    }

    useEffect(() => {
        obtenerUsuarios()
    }, [])

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function obtenerNumeroAleatorio() {
        setNumeroObtenido(getRandomIntInclusive(1, 6))
        console.log(numeroObtenido)
    }

    function repartirCartas() {
        if (!Array.isArray(usersInRoom) || usersInRoom.length === 0) {
            console.log("No hay usuarios en la sala");
            return;
        }
    }

    const cartasDisponiblesCharacters = cardsCharacters.slice();
    const cartasDisponiblesWeapons = cardsWeapons.slice();
    const cartasDisponiblesRooms = cardsRooms.slice();

    async function fetchPlayers(code) {
        try {
            const response = await fetch(`http://localhost:4000/usersInRoom?joinCode=${code}`)
            const result = await response.json()
            setUsersInRoom(result)
        } catch (error) {
            console.error("Error al obtener usuarios:", error)
        }
    }

    async function obtenerUsuarios() {
        fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
            .then(response => response.json())
            .then(result => {
                setUsersInRoom(result)
            }
            )

        for (let i = cartasDisponiblesCharacters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartasDisponiblesCharacters[i], cartasDisponiblesCharacters[j]] = [cartasDisponiblesCharacters[j], cartasDisponiblesCharacters[i]];
        }

        for (let i = cartasDisponiblesWeapons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartasDisponiblesWeapons[i], cartasDisponiblesWeapons[j]] = [cartasDisponiblesWeapons[j], cartasDisponiblesWeapons[i]];
        }

        for (let i = cartasDisponiblesRooms.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartasDisponiblesRooms[i], cartasDisponiblesRooms[j]] = [cartasDisponiblesRooms[j], cartasDisponiblesRooms[i]];
        }

        const asignaciones = usersInRoom.map((user, i) => ({
            user,
            carta: cartasDisponiblesCharacters[i],
            key: i
        }));

        return asignaciones;
    }

    const abrirModalAcusacion = () => {
        setModalAcusacionAbierto(true)
        return modalAcusacion
        /*console.log("abrir modal")
        if (modalAcusacion==true){
            console.log("dhjdsjsj")
        }*/
    }

    const cerrarModalAcusacion = () => {
        setModalAcusacionAbierto(false)
    }


    const categorieSospechosos = ["Coronel Mostaza", "pepip", "asdasd"];
    const categoriesArmas = ["Coronel Mostaza", "pepip", "asdasd"];
    const categorieSHabitaciones = ["Coronel Mostaza", "pepip", "asdasd"];

    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla
                    currentUserId={userId}
                    players={jugadores}
                    currentTurn={turnoActual}
                    numeroObtenido={numeroObtenido}
                    onMoverJugador={moverJugador}
                />
                <button onClick={obtenerNumeroAleatorio}>numero aleatorio</button>
                <button onClick={repartirCartas}>repartir cartas</button>
                <button onClick={abrirModalAcusacion}>Hacer Acusación</button>
                <FormsAcusacion />
                <Usuarios></Usuarios>
            </div>
        </>
    )
}