"use client"
import { useState } from "react"
import styles from "./gameboard.module.css"
import { socket } from "@/utils/socket"

export default function GameBoard() {
  const [showAccusation, setShowAccusation] = useState(false)

  return (
    <div className={styles.boardContainer}>
      {/* Lado izquierdo */}
      <div className={styles.sidebar}>
        <div className={styles.players}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.player}>
              <div className={styles.avatar}></div>
              <p>Jugador {i}</p>
            </div>
          ))}
        </div>
        <button
          className={styles.accuseButton}
          onClick={() => setShowAccusation(true)}
        >
          Hacer acusación
        </button>
      </div>

      {/* Tablero */}
      <div className={styles.board}>
        <p className={styles.tableroText}>Tablero</p>
      </div>

      {/* Panel derecho */}
      <div className={styles.notebook}>
        <h3>Anotador</h3>
      </div>

      {/* Modal de acusación */}
      {showAccusation && (
        <div className={styles.accuseModal}>
          <h2>Elegí las cartas</h2>
          <select><option>¿Quién?</option></select>
          <select><option>¿Dónde?</option></select>
          <select><option>¿Con qué arma?</option></select>
          <button className={styles.confirmButton}>Acusar</button>
          <button onClick={() => setShowAccusation(false)}>Volver</button>
        </div>
      )}
    </div>
  )
}
