"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "./register.styles.css"

export default function RegisterPage() {
  const [usuarios, setUsuarios] = useState([])
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [foto, setFoto] = useState("")
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
        setError("No se pudo obtener la lista de usuarios.")
      }
    }

    obtenerUsuarios()
  }, [])

  async function signUp(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!nombre || !email || !password) {
      setError("Completa todos los campos obligatorios ❌")
      return
    }

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
    <div className="register-container">
      <h2>Crear cuenta</h2>

      <form className="register-form" onSubmit={signUp}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="URL de tu foto (opcional)"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
        />
        <button type="submit">Registrarse</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <p className="login-text">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="link">
          Inicia sesión aquí
        </a>
      </p>
    </div>
  )
}
