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
    const [userId, setUserId] = useState(null)
    const [joinCode, setJoinCode] = useState(null)
    const router = useRouter()
    const { socket, isConnected } = useSocket()
    const [numeroObtenido, setNumeroObtenido] = useState(0)
    const [modalAcusacion, setModalAcusacionAbierto] = useState(false)
    const [seUnio, setSeUnio] = useState(false)

    useEffect(() => {
        const joinCode = sessionStorage.getItem("joinCode")
        const userId = sessionStorage.getItem("userId")
        const playerId = sessionStorage.getItem("playerId")

        setJoinCode(joinCode)
        setUserId(userId)
        console.log("primero este")
        console.log(joinCode)
        console.log(userId)
    }, [])

    useEffect(() => {
        console.log("entro al useEffect de socket")
        if (!socket || !isConnected) return
        if (seUnio == true) return

        if (!joinCode || !userId) {
            console.log("Esperando joinCode y userId...")
            return
        }

        socket.emit("joinRoom", { room: joinCode, playerId: userId, joinCode: joinCode })
        console.log("se unio el jugador", userId, "en el room ", joinCode)
        setSeUnio(true)

        return () => { }
    }, [socket, isConnected, joinCode, userId])

    useEffect(() => {
        if (!socket || !isConnected || !joinCode || !userId) return

        console.log("JUGADORES EN LA SALA: ", jugadores)

        socket.emit("initializeGame", { joinCode })

        return () => { }
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

        const cartasDisponiblesCharacters = cardsCharacters.slice();
        const cartasDisponiblesWeapons = cardsWeapons.slice();
        const cartasDisponiblesRooms = cardsRooms.slice();

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
                    jugadores={jugadores}
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
