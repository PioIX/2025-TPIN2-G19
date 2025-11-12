"use client"

import React, { use } from "react"
import clsx from "clsx"
import styles from "./FormsAcusacion.module.css"
import Button from "@/components/Button"
import { useState , useEffect } from "react"


export default function FormsHipotesis({props}) {
  const [isOpen, setIsOpen] = useState(false);
  const [seleccionSospechosos, setSeleccionSospechosos] = useState("");
  const [seleccionArmas, setSeleccionArmas] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const categorieSospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"]
  const categorieArmas = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"]

  const handleSelectSospechosos = (e) => {
    setSeleccionSospechosos(e.target.value);
  };

  const handleSelectArmas = (e) => {
    setSeleccionArmas(e.target.value);
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    onSubmit({
      sospechoso: seleccionSospechosos,
      arma: seleccionArmas,
      habitacion: seleccionHabitaciones
    })
    setSeleccionSospechosos("");
    setSeleccionArmas("");
  };

  if (!isOpen) return null;
    
  return (
    <form onSubmit={manejarEnvio}>
      <h1>Acusar</h1>
      <h2>RECORDÁ QUE SOLO PODES ACUSAR UNA VEZ Y SI TU ACUSACIÓN NO ES CORRECTA YA NO PODES JUGAR</h2>
      <h2>Sospechosos</h2>
      <div className="divSospechososContainer">
        <select className={styles.selectSospechosos} onChange={handleSelectSospechosos}>
          <option>¿Quién?</option>
          {categorieSospechosos.map((categorie, index) => {
            return (<option key={`sospechoso-${index}`} value={`${categorie}`}>{categorie}</option>)
          })}
        </select>
      </div>

      <h2>Armas</h2>
      <div className="divArmasContainer">
        <select className={styles.selectArmas} onChange={handleSelectArmas}>
          <option>¿Con qué arma?</option>
          {categorieArmas.map((categorie, index) => {
            return (<option key={`arma-${index}`} value={`${categorie}`}>{categorie}</option>)
          })}
        </select>
      </div>

      <h2>Habitaciones</h2>
      <div className="divHabitacionesContainer">
        <select className={styles.selectHabitaciones}>
          <option>¿Dónde?</option>
          <option key={`habitacion`} value={props.habitacion}>{props.habitacion}</option>
        </select>
      </div>
      <button type="submit">Preguntar</button>
      
    </form>
  )
}