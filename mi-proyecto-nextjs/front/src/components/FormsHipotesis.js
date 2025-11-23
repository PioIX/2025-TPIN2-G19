"use client"

import React, { useState } from "react"
import styles from "./FormsAcusacion.module.css"

export default function FormsHipotesis({ isOpen, onSubmit, habitacion }) {
  const [seleccionSospechosos, setSeleccionSospechosos] = useState("");
  const [seleccionArmas, setSeleccionArmas] = useState("");
  const [seleccionHabitacion, setSeleccionHabitacion] = useState("");

  const categorieSospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"];
  const categorieArmas = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"];

  const handleSelectSospechosos = (e) => {
    setSeleccionSospechosos(e.target.value);
  };

  const handleSelectArmas = (e) => {
    setSeleccionArmas(e.target.value);
  };

  const handleSelectHabitacion = (e) => {
    setSeleccionHabitacion(e.target.value);
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();

    onSubmit({
      sospechoso: seleccionSospechosos,
      arma: seleccionArmas,
      habitacion: seleccionHabitacion,
    });

    // limpiar
    setSeleccionSospechosos("");
    setSeleccionArmas("");
    setSeleccionHabitacion("");
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={manejarEnvio} className={styles.modal}>
      <h1>Acusar</h1>
      <h2>RECORDÁ QUE SOLO PODES ACUSAR UNA VEZ</h2>

      <h2>Sospechosos</h2>
      <select className={styles.selectSospechosos} onChange={handleSelectSospechosos} value={seleccionSospechosos}>
        <option value="">¿Quién?</option>
        {categorieSospechosos.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      <h2>Armas</h2>
      <select className={styles.selectArmas} onChange={handleSelectArmas} value={seleccionArmas}>
        <option value="">¿Con qué arma?</option>
        {categorieArmas.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      <h2>Habitación</h2>
      <select className={styles.selectHabitaciones} onChange={handleSelectHabitacion} value={seleccionHabitacion}>
        <option value="">¿Dónde?</option>
        <option value={habitacion}>{habitacion}</option>
      </select>

      <button type="submit">Preguntar</button>
    </form>
  );
}