"use client";

import React, { useState, useEffect } from "react";
import styles from "./Anotador.module.css";

export default function Anotador({ misCartas = [] }) {
    // Estado local para marcar cartas manualmente
    const [cartasMarcadas, setCartasMarcadas] = useState({});

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

    // Función que revisa si esa carta está en misCartas (cartas propias + reveladas)
    const tengoLaCarta = (nombre) => {
        return misCartas.some(carta =>
            carta.characterName === nombre ||
            carta.weaponName === nombre ||
            carta.roomName === nombre ||
            carta === nombre // para cartas reveladas que vienen como strings
        );
    };

    // Función para marcar/desmarcar cartas manualmente
    const toggleMarcado = (nombre) => {
        setCartasMarcadas(prev => ({
            ...prev,
            [nombre]: !prev[nombre]
        }));
    };

    // Verificar si una carta está marcada (propia, revelada o manual)
    const estaChecked = (nombre) => {
        return tengoLaCarta(nombre) || cartasMarcadas[nombre] || false;
    };

    return (
        <>
            <div className={styles.divPrincipal}>
                
                {/* Sospechosos */}
                <h2>Sospechosos</h2>
                <div className={styles.divSospechososContainer}>
                    {categorieSospechosos.map((categorie, index) => {
                        const esPropia = tengoLaCarta(categorie);
                        return (
                            <div key={`sospechoso-${index}`} className={styles.divSospechosos}>
                                <p style={{ 
                                    fontWeight: esPropia ? 'bold' : 'normal',
                                    color: esPropia ? '#4CAF50' : 'inherit'
                                }}>
                                    {categorie}
                                </p>
                                <input 
                                    type="checkbox" 
                                    checked={estaChecked(categorie)}
                                    onChange={() => !esPropia && toggleMarcado(categorie)}
                                    disabled={esPropia}
                                    style={{ cursor: esPropia ? 'not-allowed' : 'pointer' }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Armas */}
                <h2>Armas</h2>
                <div className={styles.divArmasContainer}>
                    {categorieArmas.map((categorie, index) => {
                        const esPropia = tengoLaCarta(categorie);
                        return (
                            <div key={`arma-${index}`} className={styles.divArmas}>
                                <p style={{ 
                                    fontWeight: esPropia ? 'bold' : 'normal',
                                    color: esPropia ? '#4CAF50' : 'inherit'
                                }}>
                                    {categorie}
                                </p>
                                <input 
                                    type="checkbox" 
                                    checked={estaChecked(categorie)}
                                    onChange={() => !esPropia && toggleMarcado(categorie)}
                                    disabled={esPropia}
                                    style={{ cursor: esPropia ? 'not-allowed' : 'pointer' }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Habitaciones */}
                <h2>Habitaciones</h2>
                <div className={styles.divHabitacionesContainer}>
                    {categorieHabitaciones.map((categorie, index) => {
                        const esPropia = tengoLaCarta(categorie);
                        return (
                            <div key={`habitacion-${index}`} className={styles.divHabitaciones}>
                                <p style={{ 
                                    fontWeight: esPropia ? 'bold' : 'normal',
                                    color: esPropia ? '#4CAF50' : 'inherit'
                                }}>
                                    {categorie}
                                </p>
                                <input 
                                    type="checkbox" 
                                    checked={estaChecked(categorie)}
                                    onChange={() => !esPropia && toggleMarcado(categorie)}
                                    disabled={esPropia}
                                    style={{ cursor: esPropia ? 'not-allowed' : 'pointer' }}
                                />
                            </div>
                        );
                    })}
                </div>

            </div>
        </>
    );
}