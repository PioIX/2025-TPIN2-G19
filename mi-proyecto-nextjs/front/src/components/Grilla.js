"use client"

import React from "react"
import styles from "./Grilla.module.css"
import { useState, useEffect } from "react"
import FormsHipotesis from "@/components/FormsHipotesis"

export default function Grilla({ currentUserId, jugadores, currentTurn, numeroObtenido, onMoverJugador, onPasarTurno, esMiTurno }) {
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
    const [pathToMove, setPathToMove] = useState([]); // Ruta completa al movimiento
    const [mostrarDecisionEntrada, setMostrarDecisionEntrada] = useState(false);
    const [mostrarHipotesis, setMostrarHipotesis] = useState(false);
    const [habitacionActual, setHabitacionActual] = useState(null);

    const tipoHabitacion = (x, y) => {
        if (x === 2 && y === 9) return "Comedor";
        if (x === 3 && y === 1) return "Baño";
        if (x === 4 && y === 12) return "Sala";
        if (x === 8 && y === 5) return "Cocina";
        if (x === 9 && y === 10) return "Habitación";
        return "Habitación";
    };

    const calcularMovimientos = (x, y, pasos) => {
        const movimientos = [];
        const visitados = new Map(); // Guardar distancia a cada celda

        const explorar = (cx, cy, pasosRestantes, camino) => {
            const key = `${cx},${cy}`;
            
            // Si ya visitamos esta celda con más pasos disponibles, skip
            if (visitados.has(key) && visitados.get(key) >= pasosRestantes) {
                return;
            }
            
            visitados.set(key, pasosRestantes);

            if (pasosRestantes === 0) {
                movimientos.push({ x: cx, y: cy, pasos: pasos, camino: [...camino] });
                return;
            }

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
                        explorar(nx, ny, pasosRestantes - 1, [...camino, { x: nx, y: ny }]);
                    }
                }
            });
        };

        explorar(x, y, pasos, [{ x, y }]);
        
        // Filtrar solo las posiciones finales (exactamente a 'pasos' de distancia)
        return movimientos.filter(m => m.pasos === pasos);
    };

    const moverJugador = (nuevaPosicion) => {
        onMoverJugador(nuevaPosicion);
        setSelectedMove(null);
        setPossibleMoves([]);
        setPathToMove([]);

        const tipoCasilla = tablero[nuevaPosicion.x][nuevaPosicion.y];

        // Si entra a una habitación (entrada = 5)
        if (tipoCasilla === 5) {
            const habitacion = tipoHabitacion(nuevaPosicion.x, nuevaPosicion.y);
            setHabitacionActual(habitacion);
            setMostrarDecisionEntrada(true);
        }
    };

    const seleccionarCasilla = (x, y) => {
        if (!esMiTurno) {
            alert("⚠️ No es tu turno");
            return;
        }

        const moveData = possibleMoves.find(m => m.x === x && m.y === y);
        if (!moveData) return;
        
        console.log("📍 Casilla seleccionada:", { x, y }, "Pasos exactos:", moveData.pasos);
        setSelectedMove({ x, y });
        setPathToMove(moveData.camino || []);
    };

    const confirmarMovimiento = () => {
        if (!esMiTurno) {
            alert("⚠️ No es tu turno");
            return;
        }

        if (!selectedMove) return;
        
        console.log("✅ Confirmando movimiento:", selectedMove);
        moverJugador(selectedMove);
    };

    const decidirEntrarHabitacion = (entrar) => {
        setMostrarDecisionEntrada(false);
        
        if (entrar) {
            console.log("🚪 Jugador entra a la habitación:", habitacionActual);
            setMostrarHipotesis(true);
        } else {
            console.log("⏭️ Jugador decide no entrar");
            // Si no entra, pasa el turno automáticamente
            if (onPasarTurno) {
                onPasarTurno();
            }
            setHabitacionActual(null);
        }
    };

    const cerrarHipotesis = () => {
        console.log("✅ Cerrando modal de hipótesis");
        setMostrarHipotesis(false);
        setHabitacionActual(null);
        
        // Después de hacer hipótesis, pasar turno
        if (onPasarTurno) {
            onPasarTurno();
        }
    };

    // Calcular movimientos posibles cuando se tira el dado
    useEffect(() => {
        if (numeroObtenido > 0 && esMiTurno) {
            const currentPlayer = jugadores.find(p => p.userId === currentUserId);
            if (currentPlayer && currentPlayer.position) {
                console.log("📍 Calculando movimientos desde:", currentPlayer.position, "con pasos:", numeroObtenido);
                const moves = calcularMovimientos(
                    currentPlayer.position.x,
                    currentPlayer.position.y,
                    numeroObtenido
                );
                console.log("✅ Movimientos posibles (exactamente", numeroObtenido, "pasos):", moves.length);
                setPossibleMoves(moves);
            }
        } else {
            setPossibleMoves([]);
            setSelectedMove(null);
            setPathToMove([]);
        }
    }, [numeroObtenido, esMiTurno, jugadores, currentUserId]);

    // Obtener posición del usuario actual
    const userPosition = jugadores.find(p => p.userId == currentUserId)?.position || { x: -1, y: -1 };

    // Obtener posiciones de todos los jugadores para mostrarlos
    const obtenerJugadorEnCasilla = (x, y) => {
        return jugadores.find(j => j.position?.x === x && j.position?.y === y);
    };

    return (
        <>
            <div className={styles.tablero}>
                {tablero.map((fila, filaIndex) =>
                    fila.map((casilla, colIndex) => {
                        let clase = "";
                        let textoCasilla = "";
                        
                        if (casilla === 1) clase = "tunel", textoCasilla = "Túnel";
                        if (casilla === 2) clase = "salida", textoCasilla = "Salida";
                        if (casilla === 3) clase = "habitacion";
                        if (casilla === 4) clase = "casillaNormal";
                        if (casilla === 5) {
                            clase = "entrada";
                            textoCasilla = tipoHabitacion(filaIndex, colIndex);
                        }
                        
                        // Verificar si hay un jugador en esta casilla
                        const jugadorEnCasilla = obtenerJugadorEnCasilla(filaIndex, colIndex);
                        if (jugadorEnCasilla) {
                            clase += ' ocupado';
                            // Mostrar las iniciales del username o su ID
                            const iniciales = jugadorEnCasilla.username 
                                ? jugadorEnCasilla.username.substring(0, 2).toUpperCase() 
                                : `J${jugadorEnCasilla.userId}`;
                            textoCasilla = iniciales;
                        }
                        
                        // Marcar si es el usuario actual
                        if (userPosition.x === filaIndex && userPosition.y === colIndex) {
                            clase += ' usuario';
                            textoCasilla = "TÚ";
                        }
                        
                        const isPossible = possibleMoves.some(m => m.x === filaIndex && m.y === colIndex);
                        if (isPossible) clase += ' posible';
                        
                        if (selectedMove && selectedMove.x === filaIndex && selectedMove.y === colIndex) {
                            clase += ' seleccionado';
                        }
                        
                        return (
                            <div 
                                key={`${filaIndex}-${colIndex}`} 
                                className={styles[clase]} 
                                onClick={() => seleccionarCasilla(filaIndex, colIndex)}
                            >
                                {textoCasilla}
                            </div>
                        );
                    })
                )}
            </div>

            {selectedMove && esMiTurno && (
                <button 
                    onClick={confirmarMovimiento}
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px 40px',
                        fontSize: '18px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        zIndex: 1500,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    ✅ Confirmar movimiento
                </button>
            )}

            {/* Modal de decisión de entrada */}
            {mostrarDecisionEntrada && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>
                            🚪 Has llegado a la entrada de {habitacionActual}
                        </h3>
                        <p style={{ marginBottom: '30px', fontSize: '16px' }}>
                            ¿Deseas entrar a la habitación para hacer una hipótesis?
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={() => decidirEntrarHabitacion(true)}
                                style={{
                                    padding: '15px 30px',
                                    fontSize: '16px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✅ Entrar y hacer hipótesis
                            </button>
                            <button
                                onClick={() => decidirEntrarHabitacion(false)}
                                style={{
                                    padding: '15px 30px',
                                    fontSize: '16px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ❌ No entrar (pasar turno)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Hipótesis */}
            {mostrarHipotesis && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <FormsHipotesis
                            habitacion={habitacionActual}
                            onCerrar={cerrarHipotesis}
                        />
                    </div>
                </div>
            )}
        </>
    );
}