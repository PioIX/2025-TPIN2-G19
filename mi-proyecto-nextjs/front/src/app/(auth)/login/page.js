"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./login.module.css"

export default function LoginPage() {
  const [usuarios, setUsuarios] = useState([]) // No es necesario ya que vamos a validar por backend
  const [loginInput, setLoginInput] = useState("") // Email o username
  const [password, setPassword] = useState("") // Contraseña
  const [error, setError] = useState("") // Error de login
  const router = useRouter()

  // Solo obtener los usuarios si es necesario (lo haremos por backend)
  useEffect(() => {
    async function obtenerUsuarios() {
      try {
        const res = await fetch("http://localhost:4000/users")
        if (!res.ok) throw new Error("Error al obtener usuarios")
        const data = await res.json()
        setUsuarios(data)
        console.log(data)
      } catch (err) {
        console.error("Error al conectar con el servidor:", err)
        setError("No se pudo conectar con el servidor.")
      }
    }

    obtenerUsuarios()
  }, [])

  // Función para manejar el login con validación backend
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("") // Limpiar errores previos

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginInput,  // Email ingresado
          password: password, // Contraseña ingresada
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Si el login es exitoso, redirigimos al usuario
        router.push(`/lobby?user_id=${data.userId}`) // Cambiar 'userId' por el nombre de campo adecuado
      } else {
        setError(data.mensaje || "Usuario o contraseña incorrectos ❌") // Mostrar error
      }
    } catch (err) {
      setError("Hubo un error al conectar con el servidor.")
      console.error("Error en login:", err)
    }
  }

  return (
    <div className={styles.LoginContainer}>
      <div className={styles.FormBox}>
        <h2 className={styles.Title}>Iniciar sesión</h2>

        <form onSubmit={handleLogin} className={styles.LoginForm}>
          <input
            type="text"
            placeholder="Ingrese correo electrónico o nombre de usuario"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className={styles.Input}
          />
          <input
            type="password"
            placeholder="Ingrese contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.Input}
          />
          <button type="submit" className={styles.Button}>
            Entrar
          </button>
        </form>

        {error && <p className={styles.Error}>{error}</p>}

        <p className={styles.RegisterText}>
          ¿No tenés cuenta?{" "}
          <a href="/register" className={styles.Link}>
            Registrate acá.
          </a>
        </p>
      </div>
    </div>
  )
}
