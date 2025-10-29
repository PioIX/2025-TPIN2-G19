"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import styles from "./adminpanel.module.css"

export default function AdminPanel() {
  const router = useRouter()
  const [weapons, setWeapons] = useState([])
  const [characters, setCharacters] = useState([])
  const [selectedWeapon, setSelectedWeapon] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState("")
  const [newWeaponName, setNewWeaponName] = useState("")
  const [newCharacterName, setNewCharacterName] = useState("")
  const [loading, setLoading] = useState(true)

  // Cargar las armas y personajes
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener armas
      const weaponsRes = await fetch("http://localhost:4000/weapons")
      if (weaponsRes.ok) {
        const weaponsData = await weaponsRes.json()
        console.log("Armas obtenidas:", weaponsData)
        setWeapons(weaponsData)
      }

      // Obtener personajes
      const charactersRes = await fetch("http://localhost:4000/characters")
      if (charactersRes.ok) {
        const charactersData = await charactersRes.json()
        console.log("Personajes obtenidos:", charactersData)
        setCharacters(charactersData)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      alert("Error al cargar datos del servidor")
    } finally {
      setLoading(false)
    }
  }

  // ARMAS
  const handleAddWeapon = async () => {
    if (!newWeaponName.trim()) return alert("Ingrese el nombre del arma.")
    
    try {
      const res = await fetch("http://localhost:4000/weapons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWeaponName }),
      })
      
      if (res.ok) {
        alert("Arma agregada con éxito.")
        setNewWeaponName("")
        fetchData() // Recargar datos
      } else {
        alert("Error al agregar arma.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al agregar arma.")
    }
  }

  const handleRemoveWeapon = async () => {
    if (!selectedWeapon) return alert("Seleccione un arma para eliminar.")
    
    try {
      const res = await fetch(`http://localhost:4000/weapons/${selectedWeapon}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        alert("Arma eliminada con éxito.")
        setSelectedWeapon("")
        fetchData() // Recargar datos
      } else {
        alert("Error al eliminar arma.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al eliminar arma.")
    }
  }

  // PERSONAJES
  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) return alert("Ingrese el nombre del personaje.")
    
    try {
      const res = await fetch("http://localhost:4000/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCharacterName }),
      })
      
      if (res.ok) {
        alert("Personaje agregado con éxito.")
        setNewCharacterName("")
        fetchData() // Recargar datos
      } else {
        alert("Error al agregar personaje.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al agregar personaje.")
    }
  }

  const handleRemoveCharacter = async () => {
    if (!selectedCharacter) return alert("Seleccione un personaje para eliminar.")
    
    try {
      const res = await fetch(`http://localhost:4000/characters/${selectedCharacter}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        alert("Personaje eliminado con éxito.")
        setSelectedCharacter("")
        fetchData() // Recargar datos
      } else {
        alert("Error al eliminar personaje.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al eliminar personaje.")
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className={styles.adminPanelContainer}>
        <div className={styles.adminPanelCard}>
          <h1>Cargando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adminPanelContainer}>
      <div className={styles.adminPanelCard}>
        <h1>Panel de Administración</h1>

        {/* ARMAS */}
        <section className={styles.adminSection}>
          <h2>Armas</h2>
          
          {/* Agregar arma */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nombre del arma"
              value={newWeaponName}
              onChange={(e) => setNewWeaponName(e.target.value)}
              className={styles.input}
            />
            <Button text="Agregar" onClick={handleAddWeapon} page="lobby" />
          </div>

          {/* Eliminar arma */}
          <div className={styles.inputGroup}>
            <select
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccionar arma</option>
              {weapons.map((weapon) => (
                <option key={weapon.weaponId} value={weapon.weaponId}>
                  {weapon.name}
                </option>
              ))}
            </select>
            <Button text="Eliminar" onClick={handleRemoveWeapon} page="lobby" />
          </div>

          {/* Lista de armas */}
          <div className={styles.listContainer}>
            <p className={styles.listTitle}>Armas actuales ({weapons.length}):</p>
            <div className={styles.itemsList}>
              {weapons.map((weapon) => (
                <span key={weapon.weaponId} className={styles.item}>
                  {weapon.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* PERSONAJES */}
        <section className={styles.adminSection}>
          <h2>Personajes</h2>
          
          {/* Agregar personaje */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nombre del personaje"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className={styles.input}
            />
            <Button text="Agregar" onClick={handleAddCharacter} page="lobby" />
          </div>

          {/* Eliminar personaje */}
          <div className={styles.inputGroup}>
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccionar personaje</option>
              {characters.map((character) => (
                <option key={character.characterId} value={character.characterId}>
                  {character.name}
                </option>
              ))}
            </select>
            <Button text="Eliminar" onClick={handleRemoveCharacter} page="lobby" />
          </div>

          {/* Lista de personajes */}
          <div className={styles.listContainer}>
            <p className={styles.listTitle}>Personajes actuales ({characters.length}):</p>
            <div className={styles.itemsList}>
              {characters.map((character) => (
                <span key={character.characterId} className={styles.item}>
                  {character.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Botón volver */}
        <div className={styles.inputGroup} style={{marginTop: '2rem'}}>
          <Button text="Volver al Lobby" onClick={handleGoBack} page="lobby" />
        </div>
      </div>
    </div>
  )
}