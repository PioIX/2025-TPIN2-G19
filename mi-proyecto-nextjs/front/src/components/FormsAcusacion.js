"use client"

import React from "react"
import clsx from "clsx"
import styles from "./FormContainer.module.css"
import Button from "./Button"


export default function FormContainer({porps}) {
  return (
    <div>
      <h1>Acusar</h1>
      <h2>RECORDÁ QUE SOLO PODES ACUSAR UNA VEZ Y SI TU ACUSACIÓN NO ES CORRECTA YA NO PODES JUGAR</h2>
      <Button></Button>
    </div>
  )
}