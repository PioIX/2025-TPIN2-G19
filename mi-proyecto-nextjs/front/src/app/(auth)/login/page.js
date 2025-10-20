"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/Input"
import Button from "@/components/Button"
import FormContainer from "@/components/FormContainer"
import "./login.styles.css"

export default function LoginPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loginInput, setLoginInput] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
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

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")

    const user = usuarios.find(
      (u) =>
        (u.username === loginInput || u.email === loginInput) &&
        u.password === password
    )

    if (user) {
      router.push(`/home?user_id=${user.user_id}`)
    } else {
      setError("Usuario o contraseña incorrectos ❌")
    }
  }

  return (
    <div className="login-container">
      <FormContainer title="Iniciar Sesión">
        <form onSubmit={handleLogin} className="login-form">
          <Input
            page="login"
            placeholder="Usuario o correo electrónico"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
          />
          <Input
            page="login"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button text="Entrar" type="submit" page="login" />
        </form>

        {error && <p className="error">{error}</p>}

        <p className="register-text">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="link">
            Regístrate aquí
          </a>
        </p>
      </FormContainer>
    </div>
  )
}
