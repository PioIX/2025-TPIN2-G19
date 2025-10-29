"use client"

import { useState, useEffect } from "react"
import Button from "@/components/Button"
import styles from "./adminpanel.module.css"

export default function AdminPanel() {
  const [weapons, setWeapons] = useState([]) // Lista de armas
  const [characters, setCharacters] = useState([]) // Lista de personajes
  const [selectedWeapon, setSelectedWeapon] = useState("") // Arma seleccionada
  const [selectedCharacter, setSelectedCharacter] = useState("") // Personaje seleccionado

  // Cargar las armas y personajes
  useEffect(() => {
    const fetchWeaponsAndCharacters = async () => {
      try {
        // Obtener la lista de armas
        const weaponsRes = await fetch("http://localhost:4000/weapons")
        const weaponsData = await weaponsRes.json()
        setWeapons(weaponsData)

        // Obtener la lista de personajes
        const charactersRes = await fetch("http://localhost:4000/characters")
        const charactersData = await charactersRes.json()
        setCharacters(charactersData)
      } catch (error) {
        console.error("Error al cargar armas y personajes", error)
      }
    }

    fetchWeaponsAndCharacters()
  }, []) // Se ejecuta solo una vez cuando el componente se monta

  // Funciones para agregar y eliminar armas y personajes
  const handleAddWeapon = async () => {
    if (!selectedWeapon) return alert("Seleccione un arma para agregar.")
    try {
      const res = await fetch("http://localhost:4000/addWeapon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedWeapon }), // Usamos el nombre de la arma
      })
      if (res.ok) {
        alert("Arma agregada con éxito.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al agregar arma.")
    }
  }

  const handleRemoveWeapon = async () => {
    if (!selectedWeapon) return alert("Seleccione un arma para eliminar.")
    try {
      const res = await fetch("http://localhost:4000/removeWeapon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedWeapon }), // Usamos el nombre de la arma
      })
      if (res.ok) {
        alert("Arma eliminada con éxito.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al eliminar arma.")
    }
  }

  const handleAddCharacter = async () => {
    if (!selectedCharacter) return alert("Seleccione un personaje para agregar.")
    try {
      const res = await fetch("http://localhost:4000/addCharacter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedCharacter }), // Usamos el nombre del personaje
      })
      if (res.ok) {
        alert("Personaje agregado con éxito.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al agregar personaje.")
    }
  }

  const handleRemoveCharacter = async () => {
    if (!selectedCharacter) return alert("Seleccione un personaje para eliminar.")
    try {
      const res = await fetch("http://localhost:4000/removeCharacter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedCharacter }), // Usamos el nombre del personaje
      })
      if (res.ok) {
        alert("Personaje eliminado con éxito.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al eliminar personaje.")
    }
  }

  return (
    <div className={styles.adminPanelContainer}>
      <h1>Panel de Administración</h1>

      {/* Weapons */}
      <section className={styles.adminSection}>
        <h2>Weapons</h2>
        <div className={styles.inputGroup}>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecciona un arma</option>
            {weapons.map((weapon) => (
              <option key={weapon.weapongId} value={weapon.name}>
                {weapon.name}
              </option>
            ))}
          </select>
          <Button text="Agregar" onClick={handleAddWeapon} />
        </div>
        <div className={styles.inputGroup}>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecciona un arma</option>
            {weapons.map((weapon) => (
              <option key={weapon.weapongId} value={weapon.name}>
                {weapon.name}
              </option>
            ))}
          </select>
          <Button text="Eliminar" onClick={handleRemoveWeapon} />
        </div>
      </section>

      {/* Characters */}
      <section className={styles.adminSection}>
        <h2>Characters</h2>
        <div className={styles.inputGroup}>
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecciona un personaje</option>
            {characters.map((character) => (
              <option key={character.characterId} value={character.name}>
                {character.name}
              </option>
            ))}
          </select>
          <Button text="Agregar" onClick={handleAddCharacter} />
        </div>
        <div className={styles.inputGroup}>
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecciona un personaje</option>
            {characters.map((character) => (
              <option key={character.characterId} value={character.name}>
                {character.name}
              </option>
            ))}
          </select>
          <Button text="Eliminar" onClick={handleRemoveCharacter} />
        </div>
      </section>
    </div>
  )
}
