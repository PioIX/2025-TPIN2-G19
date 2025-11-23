"use client"

import React from "react"
import styles from "./Grilla.module.css"
import { useState, useEffect } from "react"
import FormsHipotesis from "@/components/FormsHipotesis"

// Coordenadas de los túneles: (hay 2). Ajustá si cambiás tablero.
const TUNNELS = [
  { x: 0, y: 0 },
  { x: 11, y: 15 }
];

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
  const [pathToMove, setPathToMove] = useState([]);
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

  // helper: encuentra al jugador actual en el array de jugadores
  const getCurrentPlayer = () => jugadores.find(p => p.userId == currentUserId);

  // BFS que retorna todas las celdas alcanzables con <= pasos (incluye túnel teletransporte)
  const calcularMovimientosHasta = (startX, startY, maxPasos) => {
    const resultados = [];
    const filas = tablero.length;
    const cols = tablero[0].length;

    // visited guardará la máxima cantidad de pasos sobrantes que vimos en esa celda
    const visited = new Map();

    const enqueue = (x, y, pasosRestantes, camino) => {
      const key = `${x},${y}`;
      if (x < 0 || x >= filas || y < 0 || y >= cols) return;
      // Si visitamos con >= pasosRestantes, no sirve
      if (visited.has(key) && visited.get(key) >= pasosRestantes) return;
      visited.set(key, pasosRestantes);

      // guardamos la casilla actual como alcanzable (podés detenerte aquí)
      resultados.push({ x, y, pasosRestantes, camino: [...camino] });

      if (pasosRestantes === 0) return;

      // direcciones
      const dirs = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
      ];

      for (const { dx, dy } of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= filas || ny < 0 || ny >= cols) continue;
        const tipo = tablero[nx][ny];

        // Podés caminar por casillas normales (4), entradas (5), salidas (2) y túneles (1).
        // Habitaciones interiores (3) NO se pueden recorrer por fuera; asumimos que las 3 no se transitan.
        if (tipo === 3) continue;

        // avanzar consume 1 paso
        enqueue(nx, ny, pasosRestantes - 1, [...camino, { x: nx, y: ny }]);

        // si llegás al túnel, además de considerar la casilla túnel, permitimos teletransportar
        if (tipo === 1) {
          // buscar otro túnel
          const other = TUNNELS.find(t => !(t.x === nx && t.y === ny));
          if (other) {
            // al teletransportar consumimos el mismo paso (ya contamos el paso que nos llevó al túnel).
            enqueue(other.x, other.y, pasosRestantes - 1, [...camino, { x: nx, y: ny }, { x: other.x, y: other.y }]);
          }
        }
      }
    };

    enqueue(startX, startY, maxPasos, [{ x: startX, y: startY }]);

    // Filtramos por posiciones distintas de la inicial y únicas (x,y), y convertimos a forma {x,y,camino}
    const unique = new Map();
    for (const r of resultados) {
      const key = `${r.x},${r.y}`;
      // guardamos la ruta con más pasos restantes (no necesario pero consistente)
      if (!unique.has(key) || unique.get(key).pasosRestantes < r.pasosRestantes) {
        unique.set(key, { x: r.x, y: r.y, camino: r.camino, pasosRestantes: r.pasosRestantes });
      }
    }

    // Excluir la posición inicial (no nos interesa quedarnos en la misma casilla)
    const output = Array.from(unique.values())
      .filter(item => !(item.x === startX && item.y === startY))
      .map(item => ({ x: item.x, y: item.y, camino: item.camino }));

    return output;
  };

  const seleccionarCasilla = (x, y) => {
    if (!esMiTurno) {
      alert("⚠️ No es tu turno");
      return;
    }

    const moveData = possibleMoves.find(m => m.x === x && m.y === y);
    if (!moveData) return;

    setSelectedMove({ x, y });
    setPathToMove(moveData.camino || []);
  };

  const confirmarMovimiento = () => {
    if (!esMiTurno) {
      alert("⚠️ No es tu turno");
      return;
    }
    if (!selectedMove) return;

    // Llamamos al handler del padre (Tablero) para emitir movePlayer y consumir la tirada.
    onMoverJugador(selectedMove);

    // Si la casilla donde estamos entrando es una entrada (5), mostramos la decisión.
    const tipoCasilla = tablero[selectedMove.x][selectedMove.y];
    if (tipoCasilla === 5) {
      setHabitacionActual(tipoHabitacion(selectedMove.x, selectedMove.y));
      setMostrarDecisionEntrada(true);
    }

    // limpiar selección y posibles movimientos (ya consumiste la acción)
    setSelectedMove(null);
    setPossibleMoves([]);
    setPathToMove([]);
  };

  const decidirEntrarHabitacion = (entrar) => {
    setMostrarDecisionEntrada(false);

    if (entrar) {
      setMostrarHipotesis(true);
    } else {
      // si decide no entrar, pasar turno (lo maneja el padre a través de onPasarTurno)
      if (onPasarTurno) onPasarTurno();
      setHabitacionActual(null);
    }
  };

  // Al cerrar la hipótesis (cuando FormsHipotesis hace submit), pasar turno
  const handleHipotesisSubmit = (datos) => {
    console.log("Hipótesis enviada:", datos);
    setMostrarHipotesis(false);
    setHabitacionActual(null);
    if (onPasarTurno) onPasarTurno();
  };

  // Calcular movimientos posibles cuando se tira el dado (<= numeroObtenido)
  useEffect(() => {
    if (numeroObtenido > 0 && esMiTurno) {
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer && currentPlayer.position) {
        const moves = calcularMovimientosHasta(currentPlayer.position.x, currentPlayer.position.y, numeroObtenido);
        // moves son las celdas alcanzables (<= pasos). Guardamos
        setPossibleMoves(moves);
      } else {
        setPossibleMoves([]);
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

  // Render
  return (
    <>
      <div className={styles.tablero}>
        {tablero.map((fila, filaIndex) =>
          fila.map((casilla, colIndex) => {
            const classNames = [];

            // Base visual segun tipo
            if (casilla === 1) classNames.push("tunel");
            else if (casilla === 2) classNames.push("salida");
            else if (casilla === 3) classNames.push("habitacion");
            else if (casilla === 4) classNames.push("casillaNormal");
            else if (casilla === 5) classNames.push("entrada");

            // si hay jugador en la casilla, mostrarmos solo ocupado (prioritario)
            const jugadorEnCasilla = obtenerJugadorEnCasilla(filaIndex, colIndex);
            if (jugadorEnCasilla) {
              // prioridad: ocupado
              classNames.length = 0; // limpiar otras clases
              classNames.push("ocupado");
            }

            // marcar si es la posición del usuario actual (tú)
            if (userPosition.x === filaIndex && userPosition.y === colIndex) {
              // prioridad: usuario visual
              classNames.length = 0;
              classNames.push("usuario");
            }

            // marcar movimientos posibles (solo si no estás encima del jugador actual)
            const isPossible = possibleMoves.some(m => m.x === filaIndex && m.y === colIndex);
            if (isPossible && classNames[0] !== "usuario" && classNames[0] !== "ocupado") {
              classNames.push("posible");
            }

            // seleccionado
            if (selectedMove && selectedMove.x === filaIndex && selectedMove.y === colIndex) {
              // para la selección no queremos que se pierdan las clases base (pero destacamos)
              classNames.push("seleccionado");
            }

            // construir className desde el módulo CSS (evita strings con espacios)
            const className = classNames.map(c => styles[c]).filter(Boolean).join(" ");

            // texto a mostrar dentro de la casilla
            let textoCasilla = "";
            if (casilla === 1) textoCasilla = "Túnel";
            if (casilla === 2) textoCasilla = "Salida";
            if (casilla === 3) textoCasilla = "";
            if (casilla === 4) textoCasilla = "";
            if (casilla === 5) textoCasilla = tipoHabitacion(filaIndex, colIndex);

            if (jugadorEnCasilla) {
              const iniciales = jugadorEnCasilla.username
                ? jugadorEnCasilla.username.substring(0, 2).toUpperCase()
                : `J${jugadorEnCasilla.userId}`;
              textoCasilla = iniciales;
            }

            if (userPosition.x === filaIndex && userPosition.y === colIndex) {
              textoCasilla = "TÚ";
            }

            return (
              <div
                key={`${filaIndex}-${colIndex}`}
                className={className}
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
          className={styles.btnConfirmar}
        >
          ✅ Confirmar movimiento
        </button>
      )}

      {/* Modal de decisión de entrada */}
      {mostrarDecisionEntrada && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>
              🚪 Has llegado a la entrada de {habitacionActual}
            </h3>
            <p style={{ marginBottom: '30px', fontSize: '16px' }}>
              ¿Deseas entrar a la habitación para hacer una hipótesis?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => decidirEntrarHabitacion(true)} style={{ padding: '15px 30px', fontSize: '16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ✅ Entrar y hacer hipótesis
              </button>
              <button onClick={() => decidirEntrarHabitacion(false)} style={{ padding: '15px 30px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ❌ No entrar (pasar turno)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Hipótesis */}
      {mostrarHipotesis && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <FormsHipotesis
              isOpen={true}
              habitacion={habitacionActual}
              onSubmit={handleHipotesisSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
}
