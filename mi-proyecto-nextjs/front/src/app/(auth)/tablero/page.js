"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/button"

const tipo = "checkbox"

export default function Tablero() {
    const [users, setUsers] = useState([])

    async function obtenerUsuarios() {
        fetch("http://localhost:4000/users")
            .then(response => response.json())
            .then(result => {
                setUsers(result)
            })
    }

    return (
        <>

            <h1>tablero</h1>


            <Anotador />
        </>
    )
}


const categorieSospechosos = ["Coronel Mostaza", "pepip", "asdasd"];
const categoriesArmas = ["Coronel Mostaza", "pepip", "asdasd"];
const categorieSHabitaciones = ["Coronel Mostaza", "pepip", "asdasd"];

const Anotador = () => {

    return<>
        <h1>Anotador</h1>
        <h2>Sospechosos</h2>
        {categorieSospechosos.map((categorie, index) => {
            return <>
                <div key={index}>
                    <p>{categorie}</p>
                    <input key={index} type={"checkbox"}></input>
                </div>

            </>
        })}

        <h2>Armas</h2>
        {categoriesArmas.map((categorie, index) => {
            return <>
                <div key={index}>
                    <p>{categorie}</p>
                    <input type={"checkbox"}></input>
                </div>

            </>
        })}
        <h2>Habitaciones</h2>
        {categorieSHabitaciones.map((categorie, index) => {
            return <>
                <div key={index}>
                    <p>{categorie}</p>
                    <input type={"checkbox"}></input>
                </div>

            </>
        })}

    </>
}