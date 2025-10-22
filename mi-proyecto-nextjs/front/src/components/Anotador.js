"use client"

import React from "react"

export default function Anotador (props) {

    const sospechosos = ["Señorita Escarlata", "Señora Azulino", "Profesor Moradillo", "Señor Verdi", "Señora Blanco"]
    const armas = ["Cuchillo", "Revólver", "Soga", "Llave inglesa", "Veneno"]
    const habitaciones = ["Habitación", "Comedor", "Cocina", "Baño"]


    const listaAnotador = (array, nombre) => {
        return array.map((elemento, index) => (
            <div key={`${nombre}-${index}`}>
            <p>{elemento}</p>
            <input type="checkbox" />
            </div>
        ));
    };

    return (
        <div>
        <h2>Sospechosos</h2>
        {generarLista(sospechosos, "sospechoso")}

        <h2>Armas</h2>
        {generarLista(armas, "arma")}

        <h2>Habitaciones</h2>
        {generarLista(habitaciones, "habitacion")}
        </div>
    );



    return<>
        <h2>sospechosos</h2>
        <p>Señorita Escarlata</p>
        <select type="checkbox"></select>
        <h2>armas</h2>
        <h2>habitaciones</h2>
    </>
}