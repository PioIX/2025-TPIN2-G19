"use client"

import Button from "@/components/Button"
import Input from "@/components/Input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "@/app/(autentication)/register/register.module.css"

export default function RegisterPage() {
    const [usuarios, setUsuarios] = useState([])
    const [email, setEmail] = useState("")
    const [nombre, setNombre] = useState("")
    const [password, setPassword] = useState("")
    const [foto, setFoto] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    

    // async function singUp(e) {
    //     e.preventDefault()
    //     const nuevoUsuario = {
    //         email: email,
    //         password: password
    //     }

    //     const existe = usuarios.some(u => u.email === nuevoUsuario.email)

    //     if (existe) {
    //         setError("Ese correo ya está registrado")
    //         return
    //     }

    //     try {
    //         const response = await fetch("http://localhost:4006/usuarios", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(nuevoUsuario)
    //         })

    //         if (response.ok) {
    //             router.push("/login")
    //         } else {
    //             setError("Error al crear el usuario")
    //         }
    //     } catch (error) {
    //         setError("Hubo un problema con el registro")
    //     }
    // }
    function signUp() {
        console.log("hola")
    }



    return (
        <div className={styles.Contenedorbody}>
            <div className={styles.loginContainer}>
                <h2>Register</h2>
                <Input page="register" placeholder="Escriba su nombre" type="text" onChange={(e) => {setNombre(e.target.value)}}/>
                <Input page="register" placeholder="Escriba su Conraseña" type="password" onChange={(e) => {setPassword(e.target.value)}}/>
                <Input page="register" placeholder="Escriba su mail" type="email" onChange={(e) => {setEmail(e.target.value)}}/>
                <Input page="register" placeholder="Ponga el enlace de su foto (publico)" type="text" onChange={(e) => {setFoto(e.target.value)}}/>
                <Button onClick={signUp} page="register" text="hola como estas"></Button>
            </div>
            
        </div>
    )
}