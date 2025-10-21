"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import Input from "@/components/Input"
import FormContainer from "@/components/FormContainer"
import styles from "./register.module.css"

export default function RegisterPage() {
  const [usuarios, setUsuarios] = useState([])
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function obtenerUsuarios() {
      try {
        const res = await fetch("http://localhost:4000/users")
        if (!res.ok) throw new Error("Error al obtener usuarios")
        const data = await res.json()
        setUsuarios(data)
      } catch (err) {
        console.error("Error al conectar con el servidor:", err)
        setError("No se pudo conectar con el servidor.")
      }
    }

    obtenerUsuarios()
  }, [])

  async function signUp(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    const existe = usuarios.some((u) => u.email === email)
    if (existe) {
      setError("Ese correo ya está registrado ⚠️")
      return
    }

    const nuevoUsuario = {
      username: nombre,
      email,
      password,
      photo: foto,
      wins: 0,
    }

    try {
      const res = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      })

      if (res.ok) {
        setSuccess("Registro exitoso ✅ Redirigiendo...")
        setTimeout(() => router.push("/login"), 1500)
      } else {
        setError("Error al crear el usuario ❌")
      }
    } catch (err) {
      console.error("Error al registrar usuario:", err)
      setError("No se pudo conectar con el servidor ❌")
    }
  }

  return (
    <div className={styles.RegisterContainer}>
      <div className={styles.FormBox}>
        <h2 className={styles.Title}>Crear cuenta</h2>

        <form className={styles.RegisterForm} onSubmit={signUp}>
          <input
            className={styles.Input}
            placeholder="Nombre de usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            className={styles.Input}
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.Input}
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.Button}>
            Registrarse
          </button>
        </form>

        {error && <p className={styles.Error}>{error}</p>}
        {success && <p className={styles.Success}>{success}</p>}

        <p className={styles.ChangeLink}>
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className={styles.Link}>
            Iniciá sesión aquí
          </a>
        </p>
      </div>
    </div>
  )
}
