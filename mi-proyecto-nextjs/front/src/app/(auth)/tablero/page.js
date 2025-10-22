"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Anotador from "@/components/Anotador"
import styles from "./page.module.css";
import clsx from 'clsx';

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
                <h1>tablero</h1>
            <div className="{pagina-tablero}">
                <Anotador></Anotador>
            </div>
        </>
    )
}