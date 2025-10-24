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

    async function obtenerUsuarios() {
        fetch ("http://localhost:4000/users")
        .then(response => response.json())
        .then(result => {
            setUsers(result)
        })
    }

    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla></Grilla>
                <Usuarios users={users}></Usuarios>
            </div>
        </>
    )
}