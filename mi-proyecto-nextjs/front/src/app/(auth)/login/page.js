"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./login.module.css"

export default function LoginPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loginInput, setLoginInput] = useState("")
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
        console.log(data)
      } catch (err) {
        console.error("Error al conectar con el servidor:", err)
      }
    }

    obtenerUsuarios()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validar campos vacíos
    if (!loginInput.trim() || !password.trim()) {
      setError("Por favor, completá todos los campos")
      return
    }

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginInput,
          password: password,
        }),
      })

      // Intentar parsear la respuesta JSON
      const data = await response.json()

      if (response.ok) {
        // Login exitoso
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...")
        sessionStorage.setItem("userId", data.userId)
        sessionStorage.setItem("isLoggedIn", "true")
        
        setTimeout(() => {
          router.push(`/lobby?user_id=${data.userId}`)
        }, 1000)
      } else {
        // Error del servidor (400, 401, etc.)
        setError(data.mensaje || data.message || "Usuario o contraseña incorrectos ❌")
      }
    } catch (err) {
      // Error de red o servidor no disponible
      console.error("Error en login:", err)
      setError("No se pudo conectar con el servidor. Verificá tu conexión.")
    }
  }

  return (
    <div className={styles.LoginContainer}>
      <div className={styles.FormBox}>
        <h2 className={styles.Title}>Iniciar sesión</h2>

        <form onSubmit={handleLogin} className={styles.LoginForm}>
          <input
            type="text"
            placeholder="Ingrese correo electrónico"
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
        {success && <p className={styles.Success}>{success}</p>}

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