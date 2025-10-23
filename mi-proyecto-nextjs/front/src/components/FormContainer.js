"use client"

import React from "react"
import clsx from "clsx"
import styles from "./FormContainer.module.css"


export default function FormContainer({ title, children, className }) {
  return (
    <div className={clsx(styles.formContainer, className)}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
