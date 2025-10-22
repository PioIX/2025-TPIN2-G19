"use client"

import React from "react"

const categorieSospechosos = ["Coronel Mostaza", "pepip", "asdasd"];
const categoriesArmas = ["Coronel Mostaza", "pepip", "asdasd"];
const categorieSHabitaciones = ["Coronel Mostaza", "pepip", "asdasd"];

export default function Anotador() {

    <>
        <h1>Anotador</h1>
        <h2>Sospechosos</h2>
        {categorieSospechosos.map((categorie, index) => {
            return <>
                <div key={index}>
                    <p>{categorie}</p>
                    <input  key={index} type={"checkbox"}></input>
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
