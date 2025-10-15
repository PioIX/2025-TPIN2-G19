"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./login.module.css"

export default function LoginPage() {
  const [usuarios, setUsuarios] = useState([])
  const [idUsuario, setIdUsuario] = useState(null)
  const [loginInput, setLoginInput] = useState("") // username o email
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then(response => response.json())
      .then(result => setUsuarios(result))
      .catch(err => {
        console.log("Error al conectar con el servidor:", err)
        setError("No se pudo conectar al servidor.")
      })
  }, [])

  function signIn() {
    setError("")
    let encontrado = false

    for (let i = 0; i < usuarios.length; i++) {
      const u = usuarios[i]
      const coincideUsuario = u.username === loginInput || u.email === loginInput

      if (coincideUsuario && u.password === password) {
        encontrado = true
        setIdUsuario(u.user_id)
        console.log("Login exitoso ✅", u)
        router.push(`/home?user_id=${u.user_id}`)
        break
      }
    }

    if (!encontrado) {
      setError("Usuario o contraseña incorrectos ❌")
    }
  }

  return (
    <div className={styles.container}>
      <h2>Iniciar Sesión</h2>
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault()
          signIn()
        }}
      >
        <input
          type="text"
          placeholder="Usuario o correo electrónico"
          value={loginInput}
          onChange={e => setLoginInput(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <p>
        ¿No tienes cuenta?{" "}
        <a href="/register" className={styles.link}>
          Regístrate aquí
        </a>
      </p>
    </div>
  )
}
