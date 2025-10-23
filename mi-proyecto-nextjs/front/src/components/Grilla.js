"use client"

import React from "react"
import styles from "./Grilla.module.css"  // Importa los estilos de CSS Modules

export default function Grilla (props) {
    const cuadrados = Array(144).fill(null); 
    return (
        <>
            <div className={styles.tablero}>
                {cuadrados.map((_, index) => (
                    <div key={index} className={styles.cuadrado}></div>
                ))}
            </div>
        </>
    )
}
