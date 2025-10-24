"use client"

import React from "react"
import styles from "./Grilla.module.css"  // Importa los estilos de CSS Modules

/*export default function Grilla (props) {
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
}*/


export default function Grilla (props){
    const tablero = [
        
        [1,3,3, 3, 3, 3, 4, 2, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [4,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3,3],
        [2,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,4],
        [4,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,2],
        [3,3,3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 3, 3,1]
        
        ];

    return (
        <div className={styles.tablero}>
        {tablero.map((fila, filaIndex) =>
            fila.map((casilla, colIndex) => {
            let clase = "";
            let textoCasilla = "";
            if (casilla === 1) clase = "tunel", textoCasilla = "Tunel";
            if (casilla === 2) clase = "salida", textoCasilla = "Salida";
            if (casilla === 3) clase = "habitacion";
            if (casilla === 4) clase = "casillaNormal";
            return <div key={`${filaIndex}-${colIndex}`} className={styles[clase]}>{textoCasilla}</div>;
        })
        )}
        </div>
    )
}

