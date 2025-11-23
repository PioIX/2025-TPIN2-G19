"use client";

import React from "react";
import styles from "./Anotador.module.css";

export default function Anotador({ misCartas = [] }) {

    const categorieSospechosos = [
        "Señorita Escarlata",
        "Señora Azulino",
        "Profesor Moradillo",
        "Señor Verdi",
        "Señora Blanco"
    ];

    const categorieArmas = [
        "Cuchillo",
        "Revólver",
        "Soga",
        "Llave inglesa",
        "Veneno"
    ];

    const categorieHabitaciones = [
        "Habitación",
        "Comedor",
        "Cocina",
        "Baño"
    ];

    // 🔍 función que revisa si esa carta está en misCartas
    const tengoLaCarta = (nombre) => {
        return misCartas.some(carta =>
            carta.characterName === nombre ||
            carta.weaponName === nombre ||
            carta.roomName === nombre
        );
    };

    return (
        <>
            <div className={styles.divPrincipal}>
                
                {/* Sospechosos */}
                <h2>Sospechosos</h2>
                <div className={styles.divSospechososContainer}>
                    {categorieSospechosos.map((categorie, index) => (
                        <div key={`sospechoso-${index}`} className={styles.divSospechosos}>
                            <p>{categorie}</p>
                            <input 
                                type="checkbox" 
                                checked={tengoLaCarta(categorie)}
                                readOnly 
                            />
                        </div>
                    ))}
                </div>

                {/* Armas */}
                <h2>Armas</h2>
                <div className={styles.divArmasContainer}>
                    {categorieArmas.map((categorie, index) => (
                        <div key={`arma-${index}`} className={styles.divArmas}>
                            <p>{categorie}</p>
                            <input 
                                type="checkbox" 
                                checked={tengoLaCarta(categorie)}
                                readOnly
                            />
                        </div>
                    ))}
                </div>

                {/* Habitaciones */}
                <h2>Habitaciones</h2>
                <div className={styles.divHabitacionesContainer}>
                    {categorieHabitaciones.map((categorie, index) => (
                        <div key={`habitacion-${index}`} className={styles.divHabitaciones}>
                            <p>{categorie}</p>
                            <input 
                                type="checkbox" 
                                checked={tengoLaCarta(categorie)} 
                                readOnly
                            />
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
}
