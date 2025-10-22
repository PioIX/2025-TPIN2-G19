"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import Input from "@/components/Input"
import FormContainer from "@/components/FormContainer"
import styles from "./register.module.css"

export default function RegisterPage() {
  const [usuarios, setUsuarios] = useState([]) // Lista de usuarios para validar si el email ya existe
  const [nombre, setNombre] = useState("") // Nombre de usuario
  const [email, setEmail] = useState("") // Email del usuario
  const [password, setPassword] = useState("") // Contraseña
  const [foto, setFoto] = useState("") // Foto de perfil (opcional)
  const [error, setError] = useState("") // Errores que se mostrarán al usuario
  const [success, setSuccess] = useState("") // Mensaje de éxito al registrarse
  const router = useRouter() // Para redirigir al login después del registro

  // Obtener los usuarios existentes (si es necesario para validar si el email ya está en uso)
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

  // Función para registrar un nuevo usuario
  async function signUp(e) {
    e.preventDefault() // Evitar que el formulario se envíe por defecto
    setError("") // Limpiar cualquier error previo
    setSuccess("") // Limpiar el mensaje de éxito previo

    // Verificar si el email ya está registrado
    const existe = usuarios.some((u) => u.email === email)
    if (existe) {
      setError("Ese correo ya está registrado ⚠️")
      return
    }

    // Crear un nuevo objeto de usuario
    const nuevoUsuario = {
      username: nombre,
      email,
      password, // En el backend deberías encriptar la contraseña
      photo: foto,
      wins: 0, // Inicialmente 0 victorias
      admin: 0, // Por defecto, no es admin
    }

    try {
      // Enviar los datos al backend para registrar al usuario
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      })

      if (res.ok) {
        setSuccess("Registro exitoso ✅ Redirigiendo...") // Si se registra correctamente
        setTimeout(() => router.push("/login"), 1500) // Redirigir al login
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
          <input
            className={styles.Input}
            placeholder="URL de tu foto (opcional)"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
          />

          <button type="submit" className={styles.Button}>
            Registrarse
          </button>
        </form>

        {error && <p className={styles.Error}>{error}</p>} {/* Mostrar error si lo hay */}
        {success && <p className={styles.Success}>{success}</p>} {/* Mostrar éxito si lo hay */}

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
