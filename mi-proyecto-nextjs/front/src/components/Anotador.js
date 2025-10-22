"use client"

import React from "react"
import styles from "./Anotador.module.css"

export default function Anotador (props) {

    const categorieSospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"]
    const categorieArmas  = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"]
    const categorieHabitaciones  = ["Habitación", "Comedor", "Cocina", "Baño"]


    return(
    <>
        <div className={styles.divPrincipal}>
            <h2>Sospechosos</h2>
            {categorieSospechosos.map((categorie, index) => {
                return <>
                        <p>{categorie}</p>
                    <div key={index} className={styles.divSospechosos}>
                        <input key={index} type={"checkbox"}></input>
                    </div>

                </>
                
            })}

            <h2>Armas</h2>
            {categorieArmas.map((categorie, index) => {
                return <>
                        <p>{categorie}</p>
                    <div key={index} className={styles.divArmas}>
                        <input type={"checkbox"}></input>
                    </div>

                </>
            })}

            <h2>Habitaciones</h2>
            {categorieHabitaciones.map((categorie, index) => {
                return <>
                        <p>{categorie}</p>
                    <div key={index} className={styles.divHabitaciones}>
                        <input type={"checkbox"}></input>
                    </div>

                </>
            })}
        </div>

        </>
    )
}