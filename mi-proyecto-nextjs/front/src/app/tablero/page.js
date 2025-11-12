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
    
    const router = useRouter()
    const { socket, isConnected } = useSocket()
    const joinCode = sessionStorage.getItem("joinCode")
    const userId = sessionStorage.getItem("userId")
    const [numeroObtenido, setNumeroObtenido] = useState(0)    
    
    useEffect(() => {
        if (!socket || !isConnected) return

        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")

        if (!joinCode || !userId) {
        router.push("/lobby")
        return
        }

        console.log("Conectado al tablero")

        // Unirse a la sala
        socket.emit("joinRoom", { 
        room: joinCode, 
        playerId: userId, 
        joinCode: joinCode 
        })

        // Inicializar el juego
        socket.emit("initializeGame", { joinCode })

        // ===== LISTENERS DEL SOCKET =====

        // Cuando el juego se inicializa
        socket.on("gameInitialized", (data) => {
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
                    p.userId === data.playerId 
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

        // Si alguien se desconecta
        socket.on("playerLeft", (data) => {
            alert("Un jugador abandonó el juego")
            router.push("/lobby")
        })

        return () => {
            socket.off("gameInitialized")
            socket.off("diceRolled")
            socket.off("playerMoved")
            socket.off("turnChanged")
            socket.off("playerLeft")
        }
    }, [socket, isConnected, router])

    const moverJugador = (nuevaPosicion) => {
        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")

        socket.emit("movePlayer", {
            joinCode,
            playerId: userId,
            newPosition: nuevaPosicion
        })
    }

    useEffect (() => {
        obtenerUsuarios()
    })

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function obtenerNumeroAleatorio () {
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


    async function obtenerNumeroAleatorio() {
        usersInRoom.map((user, index), numero => Math.floor(Math.random()))
    }

    async function handleAcusacion(valores) {
        console.log("Valores seleccionados:", valores);
    }

    async function volver() {
        console.log("jhsdsjdh");
    }
    
    const categorieSospechosos = ["Coronel Mostaza", "pepip", "asdasd"];
    const categoriesArmas = ["Coronel Mostaza", "pepip", "asdasd"];
    const categorieSHabitaciones = ["Coronel Mostaza", "pepip", "asdasd"];

    return (
        <>
            <h1>Anotador</h1>
            <h2>Sospechosos</h2>
            {categorieSospechosos.map((categorie, index) => {
                return <>
                    <div key={index}>
                        <p>{categorie}</p>
                        <input key={index} type={"checkbox"}></input>
                    </div>

                </>
            })}

            <h2>Armas</h2>
            {categoriesArmas.map((categorie, index) => {
                return <>
                    <div key={index}>
                        <p>{categorie}</p>
                        <input type={"checkbox"}></input>
                    </div>

                </>
            })}
            <h2>Habitaciones</h2>
            {categorieSHabitaciones.map((categorie, index) => {
                return <>
                    <div key={index}>
                        <p>{categorie}</p>
                        <input type={"checkbox"}></input>
                    </div>

                </>
            })}

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
                <FormsAcusacion onClick={volver} onSubmit={handleAcusacion}></FormsAcusacion>
                {/*<Usuarios usersInRoom={usersInRoom}></Usuarios>*/}
            </div>
        </>
    )
}