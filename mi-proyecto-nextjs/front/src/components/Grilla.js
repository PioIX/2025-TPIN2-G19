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


export default function Grilla ({currentUserId}){
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

    const { socket, movePlayerOnBoard, changeToNextTurn } = useSocket();
    
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [selectedMove, setSelectedMove] = useState(null);

   useEffect(() => {
        if (!socket) return;

        socket.on("playerMoved", (data) => {
            setPlayers(prev => prev.map(p => 
                p.userId === data.userId 
                    ? { ...p, position: data.newPosition }
                    : p
            ));
            
            if (data.userId === currentUserId) {
                setPossibleMoves([]);
                setSelectedMove(null);
            }
        });

        socket.on("turnChanged", (data) => {
            setCurrentTurn(data.currentTurn);
        });

        return () => {
            socket.off("playerMoved");
            socket.off("turnChanged");
        };
    }, [socket, currentUserId]);

    useEffect(() => {
        if (isMyTurn()) {
            const currentPlayer = players.find(i => i.userId === currentUserId);
            if (currentPlayer) {
                const moves = calcularMovimientos(currentPlayer.position.x, currentPlayer.position.y,numeroObtenido);
                setPossibleMoves(moves);
            }
        }
    }, [numeroObtenido]);

    const calcularMovimientos = (x, y, pasos) => {
        const movimientos = [];
        
        const direcciones = [
        { dx: -1, dy: 0 },  
        { dx: 1, dy: 0 },   
        { dx: 0, dy: -1 },  
        { dx: 0, dy: 1 }    
        ];
        
    };


    const salidas = [
        { x: 0, y: 7 },    
        { x: 5, y: 0 },    
        { x: 6, y: 15 }, 
        { x: 11, y: 9 } 
    ];

    const jugadoresInicializados = users.map((user, index) => ({
        userId: user.userId,
        username: user.username,
        photo: user.photo,
        position: salidas[index % salidas.length], 
        turnOrder: index  
    }));

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
            if (casilla === 5) clase = "entrada", textoCasilla = "entrada";
            if (userPosition.x === filaIndex && userPosition.y === colIndex) clase = ' usuario';
            return <div key={`${filaIndex}-${colIndex}`} className={styles[clase]} onClick={() => clickear(filaIndex, colIndex)}>{textoCasilla}</div>;
        })
        )}
        </div>
    )
}

