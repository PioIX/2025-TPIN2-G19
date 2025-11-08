"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
const tipo = "checkbox"
import Anotador from "@/components/Anotador"
import Grilla from "@/components/Grilla"
import styles from "./page.module.css";
import clsx from 'clsx';
import Usuarios from "@/components/Usuarios"; 
import { cardsCharacters, cardsWeapons, cardsRooms } from "@/classes/Card";
import FormsAcusacion from "@/components/FormsAcusacion";
import Button from "@/components/Button"



export default function Tablero() {
    const [usersInRoom, setUsersInRoom] = useState([])
    //const [numeroObtenido, setNumeroObtenido] = useState(0)
    let numeroObtenido=0
    
    /*useEffect(()=> {
        fetch('http://localhost:4000/usersInRoom')
        .then(response => response.json)
        .then(data => setUsersInRoom(data))
        .then(console.log("usersInRoom: ", usersInRoom))
    }, [usersInRoom])*/

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
        if (!Array.isArray(usersInRoom) || usersInRoom.length === 0) {
        console.log("No hay usuarios en la sala");
        return;
    }
        const cartasDisponiblesCharacters = cardsCharacters.slice();
        const cartasDisponiblesWeapons = cardsWeapons.slice();
        const cartasDisponiblesRooms = cardsRooms.slice();

    async function obtenerUsuarios() {
        fetch("http://localhost:4000/users")
            .then(response => response.json())
            .then(result => {
                setUsers(result)
            })
    for (let i = cartasDisponiblesCharacters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartasDisponiblesCharacters[i], cartasDisponiblesCharacters[j]] = [cartasDisponiblesCharacters[j], cartasDisponiblesCharacters[i]];
    }

     for (let i = cartasDisponiblesWeapons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartasDisponiblesWeapons[i], cartasDisponiblesWeapons[j]] = [cartasDisponiblesWeapons[j], cartasDisponiblesWeapons[i]];
    }
     for (let i = cartasDisponiblesRooms.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartasDisponiblesRooms[i], cartasDisponiblesRooms[j]] = [cartasDisponiblesRooms[j], cartasDisponiblesRooms[i]];
    }

    const asignaciones = usersInRoom.map((user, i) => ({
        user, 
        carta: cartasDisponiblesCharacters[i],
        key: i
    }));

    return asignaciones;
    }

    async function obtenerUsuariosEnElRoom(params) {
        fetch(`http://localhost:4000/usersInRoom`)
        .then(response => response.json())
        .then(result => {
            setUsersInRoom(result)
        })
    }

    async function obtenerNumeroAleatorio() {
        usersInRoom.map((user, index), numero => Math.floor(Math.random()))
    }

    const handleAcusacion = (valores) => {
        console.log("Valores seleccionados:", valores);
    }
    
    function volver(){
    }

    return (
        <>
            <div className={styles["pagina-tablero"]}>
                <Anotador></Anotador>
                <Grilla onClick={() => clickear(filaIndex, colIndex)}></Grilla>
                <button onClick={obtenerNumeroAleatorio}>numero aleatorio</button>
                <button onClick={repartirCartas}>repartir cartas</button>
                <FormsAcusacion onClick={volver} onSubmit={handleAcusacion}></FormsAcusacion>
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
}