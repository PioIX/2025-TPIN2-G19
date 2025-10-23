"use client"

import React from "react"

export default function User (props) {
    return (
        <>
            <img href={props.href}></img>
            <p>{props.text}</p>
        </>

    )
}