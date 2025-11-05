"use client"

import React from "react"
import styles from "./Anotador.module.css"  

export default function Anotador (props) {

    const categorieSospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"]
    const categorieArmas  = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"]
    const categorieHabitaciones  = ["Habitación", "Comedor", "Cocina", "Baño"]


    return (
    <>
        <div className={styles.divPrincipal}>
                <h2>Sospechosos</h2>
            <div className="divSospechososContainer">
                {categorieSospechosos.map((categorie, index) => {
                    return (
                        <div key={`sospechoso-${index}`} className={styles.divSospechosos}>
                            <p>{categorie}</p>
                            <input type={"checkbox"}></input>
                        </div>)}
                        
                    )}
            </div>


            <h2>Armas</h2>
            <div className="divArmasContainer">
                {categorieArmas.map((categorie, index) => {
                    return (
                        <div key={`arma-${index}`} className={styles.divArmas}>
                            <p>{categorie}</p>
                            <input type={"checkbox"}></input>
                        </div>

                    )
                })}
            </div>

            <h2>Habitaciones</h2>
            <div className="divHabitacionesContainer">
                {categorieHabitaciones.map((categorie, index) => {
                    return (
                        <div key={`habitacion-${index}`} className={styles.divHabitaciones}>
                            <p>{categorie}</p>
                            <input type={"checkbox"}></input>
                        </div>

                    )
                })}
            </div>
        </div>

    </>
    )
}