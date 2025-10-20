"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
            
        </>
    )
}