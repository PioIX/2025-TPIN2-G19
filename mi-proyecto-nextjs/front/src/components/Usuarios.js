"use client"

import React, { useState, useEffect } from "react";
import styles from '@/components/usuarios.module.css'

export default function Usuarios(props) {
    const [usuarios, setUsuarios] = useState([]);
    const joinCode = sessionStorage.getItem("joinCode");

    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const response = await fetch(`http://localhost:4000/usersInRoom?joinCode=${joinCode}`);
                const data = await response.json();
                setUsuarios(data);
                console.log("Usuarios obtenidos:", data);
            } catch (err) {
                console.error("Error al obtener usuarios:", err);
            }
        };

        if (joinCode) {
            obtenerUsuarios();
        }
    }, [joinCode]);

    return (
        <div className={styles.divUsuariosPrincipal}>
            <h2>Usuarios ({usuarios.length})</h2>
            <div>
                {usuarios.map((usuario) => (
                    <div key={usuario.userId} className={styles.divUsuarios}>
                        <img src={usuario.photo} alt={`Foto de ${usuario.username}`} />
                        <p>{usuario.username}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}