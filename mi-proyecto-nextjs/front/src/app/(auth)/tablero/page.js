"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css";
import clsx from 'clsx';
import Usuarios from "@/components/Usuarios"; 

export default function Tablero() {
    const [usersInRoom, setUsersInRoom] = useState([])
    //const [numeroObtenido, setNumeroObtenido] = useState(0)
    let numeroObtenido=0

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function obtenerNumeroAleatorio () {
        numeroObtenido = getRandomIntInclusive(1, 6)
        console.log(numeroObtenido)
    }


    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla></Grilla>
                <button onClick={obtenerNumeroAleatorio}>aaaa</button>
                <Usuarios users={users}></Usuarios>
            </div>
        </>
    )
}