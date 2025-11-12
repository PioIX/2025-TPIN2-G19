"use client"

import React from "react"
import styles from "./Grilla.module.css"  // Importa los estilos de CSS Modules
import { useState, useEffect } from "react"
import FormsHipotesis from "@/components/FormsHipotesis"

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


export default function Grilla({ currentUserId, players, currentTurn, numeroObtenido, onMoverJugador }) {
    const tablero = [

        [1, 3, 3, 3, 3, 3, 4, 2, 4, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 3, 3, 3, 3, 3, 3],
        [3, 5, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 5, 3, 3, 3],
        [2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2],
        [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 3, 3, 1]

    ];

    const [possibleMoves, setPossibleMoves] = useState([]);
    const [selectedMove, setSelectedMove] = useState(null);
    const [mostrarDecisionEntrada, setMostrarDecisionEntrada] = useState(false);
    const [mostrarHipotesis, setMostrarHipotesis] = useState(false);
    const [habitacionActual, setHabitacionActual] = useState(null);

    const miTurno = () => {
        const currentPlayer = players.find(p => p.turnOrder === currentTurn);
        return currentPlayer && currentPlayer.userId === currentUserId;
    };

    const pasarTurno = () => {
        const nextTurn = (currentTurn + 1) % players.length;
        changeToNextTurn(joinCode, nextTurn);
    };

    const calcularMovimientos = (x, y, pasos) => {
        const movimientos = [];
        const visitados = new Set();

        const explorar = (cx, cy, pasosRestantes) => {
            if (pasosRestantes === 0) {
                movimientos.push({ x: cx, y: cy });
                return;
            }

            const key = `${cx},${cy}`;
            if (visitados.has(key)) return;
            visitados.add(key);

            const direcciones = [
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
            ];

            direcciones.forEach(({ dx, dy }) => {
                const nx = cx + dx;
                const ny = cy + dy;

                if (nx >= 0 && nx < tablero.length && ny >= 0 && ny < tablero[0].length) {
                    const casilla = tablero[nx][ny];
                    if (casilla === 4 || casilla === 5) {
                        explorar(nx, ny, pasosRestantes - 1);
                    }
                }
            });
        };

        explorar(x, y, pasos);
        return movimientos;
    };

    const tipoHabitacion = (x, y) => {
        if (x === 2 && y === 9) return "Comedor";
        if (x === 3 && y === 1) return "Baño";
        if (x === 4 && y === 12) return "Comedor";
        if (x === 8 && y === 5) return "Cocina";
        if (x === 9 && y === 10) return "Habitacion";
    };

    const moverJugador = (nuevaPosicion) => {
        onMoverJugador(nuevaPosicion);
        setSelectedMove(null);
        setPossibleMoves([]);

        const tipoCasilla = tablero[nuevaPosicion.x][nuevaPosicion.y];
        
        if (tipoCasilla === 5) {
            const habitacion = tipoHabitacion(nuevaPosicion.x, nuevaPosicion.y);
            setHabitacionActual(habitacion);
            setMostrarDecisionEntrada(true);
        }
    };


    const seleccionarCasilla = (x, y) => {
        const isPossible = possibleMoves.some(m => m.x === x && m.y === y);
        if (!isPossible) return;
        setSelectedMove({ x, y });
    };

    const confirmarMovimiento = () => {
        if (!selectedMove) return;
        moverJugador(selectedMove);
        setSelectedMove(null);
        setPossibleMoves([]);
    };

    const decidirEntrarHabitacion = (entrar) => {
        setMostrarDecisionEntrada(false);
        if (entrar) {
            setMostrarHipotesis(true);
        }
    };

    const cerrarHipotesis = () => {
        setMostrarHipotesis(false);
        setHabitacionActual(null);
    };


    useEffect(() => {
        if (numeroObtenido > 0 && miTurno()) {
            const currentPlayer = players.find(p => p.userId === currentUserId);
            if (currentPlayer) {
                const moves = calcularMovimientos(
                    currentPlayer.position.x,
                    currentPlayer.position.y,
                    numeroObtenido
                );
                setPossibleMoves(moves);
            }
        }
    }, [numeroObtenido]);

    const userPosition = players.find(p => p.userId == currentUserId)?.position || { x: -1, y: -1 };

    return (
    <>
        <div className={styles.tablero}>
            {tablero.map((fila, filaIndex) =>
                fila.map((casilla, colIndex) => {
                    let clase = "";
                    let textoCasilla = "";
                    if (casilla === 1) clase = "tunel", textoCasilla = "Tunel";
                    if (casilla === 2) clase = "salida", textoCasilla = "Salida";
                    if (casilla === 3) clase = "habitacion";
                    if (casilla === 4) clase = "casillaNormal";
                    if (casilla === 5) clase = "entrada", textoCasilla = "entrada";
                    if (userPosition.x === filaIndex && userPosition.y === colIndex) clase = ' usuario';
                    const isPossible = possibleMoves.some(m => m.x === filaIndex && m.y === colIndex);
                    if (isPossible) clase += ' posible';
                    if (selectedMove && selectedMove.x === filaIndex && selectedMove.y === colIndex) clase += ' seleccionado';
                    return <div key={`${filaIndex}-${colIndex}`} className={styles[clase]} onClick={() => seleccionarCasilla(filaIndex, colIndex)}>{textoCasilla}</div>;
                })
            )}
        </div>

        {selectedMove && miTurno() && (
            <button onClick={confirmarMovimiento}>Confirmar movimiento</button>
        )}

        {/* Modal de decisión de entrada */}
        {mostrarDecisionEntrada && (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <h3>Has llegado a la entrada de {habitacionActual}</h3>
                    <p>¿Deseas entrar a la habitación?</p>
                    <div style={styles.modalButtons}>
                        <button
                            onClick={() => decidirEntrarHabitacion(true)}
                            style={{ ...styles.btn, ...styles.btnEntrar }}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => decidirEntrarHabitacion(false)}
                            style={{ ...styles.btn, ...styles.btnEsperar }}
                        >
                            Esperar al próximo turno
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de Hipótesis */}
        {mostrarHipotesis && Hipotesis && (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContentHipotesis}>
                    <FormsHipotesis
                        habitacion={habitacionActual}
                        onCerrar={cerrarHipotesis}
                    />
                </div>
            </div>
        )}

    </>

    );
};