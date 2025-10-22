"use client"

import React from "react"

export default function Anotador (props) {

    const sospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"]
    const armas = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"]
    const habitaciones = ["Habitación", "Comedor", "Cocina", "Baño"]

    /*sospechosos.map( () => (sospechoso, index) {
        <p>{sospechoso}</p>
        <input key={index} type="checkbox"></input>
    })*/

    return<>
        <h2>sospechosos</h2>
        <p>Señorita Escarlata</p>
        <select type="checkbox"></select>
        <h2>armas</h2>
        <h2>habitaciones</h2>
    </>
}