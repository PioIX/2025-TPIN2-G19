"use client"

import React from "react"
import styles from "./Anotador.module.css"

export default function Usuarios(props) {

    const users = []

    async function obtenerUsuarios(room) {
      try {
        const res = await fetch("http://localhost:4000/usersInRoom")
        if (!res.ok) throw new Error("Error al obtener usuarios")
        const data = await res.json()
        setUsuarios(data)
      } catch (err) {
        console.error("Error al conectar con el servidor:", err)
        setError("No se pudo obtener la lista de usuarios.")
      }
    }

    return (
    <>
        <div className={styles.divUsuariosPrincipal}>
                <h2>Usuarios</h2>
            <div>
                {users.map((user, index) => {
                    return <>
                        <div key={index} className={styles.divUsuarios}>
                            <img href={props.href}></img>
                            <p>{user}</p>
                        </div>

                    </>
                    
                })}
            </div>
        </div>

    </>
    )
}