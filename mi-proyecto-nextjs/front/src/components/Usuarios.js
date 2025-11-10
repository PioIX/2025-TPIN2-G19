"use client"

import React, { useState, useEffect } from "react";
import styles from '@/components/usuarios.module.css'

export default function Usuarios (props) {

    const [users, setUsers] = useState([]);
    const [photos, setPhotos] = useState([]);
    const joinCode=sessionStorage.getItem("joinCode")

    /*async function obtenerUsuarios() {
      try {
        fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`)
          .then(response => response.json())
          .then((console.log(response)))
          setUsers(response)
          console.log(users)
      } catch (err) {
        console.error("Error al obtener usuarios:", err)
      }
    };*/

    async function obtenerFotos() {
      try {
        const res = await fetch(`http://localhost:4000/photoUsersInRoom?joinCode=${joinCode}`)
        if (!res.ok) throw new Error("Error al obtener fotos")
        const data = await res.json()
        setPhotos(data)
      } catch (err) {
        console.error("Error al conectar con el servidor:", err)
      }
    };

    // Este useEffect se ejecutará solo una vez cuando el componente se monte
  /*useEffect(() => {
    obtenerUsuarios();
    obtenerFotos();
  }, []);*/ // El arreglo vacío asegura que solo se ejecute una vez

    return (
        <>
            <div className={styles.divUsuariosPrincipal}>
                <h2>Usuarios</h2>
                <div>
                    {users.map((user, index) => (
                        <div key={index} className={styles.divUsuarios}>
                            <img src={photos[index]} alt={`Foto de ${user}`} />
                            <p>{user}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
