"use client"

import React from "react"
import styles from "./Grilla.module.css"  // Importa los estilos de CSS Modules
import { useState , useEffect } from "react"

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


export default function Grilla ({currentUserId, players, currentTurn, numeroObtenido, onMoverJugador }){
    const tablero = [
        
        [1,3,3, 3, 3, 3, 4, 2, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3,3],
        [4,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3,3],
        [2,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,4],
        [4,4,4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,2],
        [3,3,5, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3,3],
        [3,3,3, 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 3, 3,1]
        
    ];

    const [possibleMoves, setPossibleMoves] = useState([]);
    const [selectedMove, setSelectedMove] = useState(null);  

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
            movimientos.push({x: cx, y: cy});
            return;
        }
        
        const key = `${cx},${cy}`;
        if (visitados.has(key)) return;
        visitados.add(key);
        
        const direcciones = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0},
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];
        
        direcciones.forEach(({dx, dy}) => {
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

    const moverJugador = (nuevaPosicion) => {
        onMoverJugador(nuevaPosicion);
        setSelectedMove(null);
        setPossibleMoves([]);
    };

    const seleccionarCasilla = (x, y) => {
        const isPossible = possibleMoves.some(m => m.x === x && m.y === y);
        if (!isPossible) return;
        setSelectedMove({x, y});   
    };

    const confirmarMovimiento = () => {
        if (!selectedMove) return;
        moverJugador(selectedMove);
        setSelectedMove(null);
        setPossibleMoves([]);
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
  
    </>

    );
}

