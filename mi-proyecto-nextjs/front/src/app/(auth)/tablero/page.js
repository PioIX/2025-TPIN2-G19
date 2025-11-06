"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/button"
const tipo = "checkbox"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css";
import clsx from 'clsx';
import Usuarios from "@/components/Usuarios"; 
//import {Card} from "Card.js"


export default function Tablero() {
    const [usersInRoom, setUsersInRoom] = useState([])
    //const [numeroObtenido, setNumeroObtenido] = useState(0)
    let numeroObtenido=0

    
    useEffect(()=> {
        fetch('http://localhost:4000/usersInRoom')
        .then(response => response.json)
        .then(data => setUsersInRoom(data))
        .then(console.log("usersInRoom: ", usersInRoom))
    }, [usersInRoom])

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function obtenerNumeroAleatorio () {
        numeroObtenido = getRandomIntInclusive(1, 6)
        console.log(numeroObtenido)
    }
    
    function repartirCartas() {

    async function obtenerUsuarios() {
        fetch("http://localhost:4000/users")
            .then(response => response.json())
            .then(result => {
                setUsers(result)
            })
    }

    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla></Grilla>
                <button onClick={obtenerNumeroAleatorio}>aaaa</button>
                {/*<Usuarios users={users}></Usuarios>*/}
            </div>
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