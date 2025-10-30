"use client"

import React from "react"
import clsx from "clsx"
import styles from "./button.module.css"

export default function Button({ text, onClick, page, type = "button", className }) {
  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        page === "register" ? styles.btnRegister : styles.btnLogin,
        className
      )}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
