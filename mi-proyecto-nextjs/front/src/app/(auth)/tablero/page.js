"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css";
import clsx from 'clsx';
import Usuarios from "@/components/Usuarios";

export default function Tablero() {
    const [users, setUsers] = useState([])
    const [usersInRoom, setUsersInRoom] = useState([])
    const [numeros, setNumeros] = useState([])

    async function obtenerUsuarios() {
        fetch ("http://localhost:4000/users")
        .then(response => response.json())
        .then(result => {
            setUsers(result)
        })
    }

    async function obtenerUsuariosEnElRoom(params) {
        fetch(`http://localhost:4000/usersInRoom`)
        .then(response => response.json())
        .then(result => {
            setUsers(result)
        })
    }

    async function ontenerNumeroAleatorio() {
        usersInRoom.map((user, index), numero => Math.floor(Math.random()))
    }

    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla></Grilla>
                <Usuarios></Usuarios>
            </div>
        </>
    )
}