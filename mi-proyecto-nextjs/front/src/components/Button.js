"use client"

import React from "react"
import "./Button.css"

export default function Button({ text, onClick, page, type = "button" }) {
  return (
    <button
      type={type}
      className={`btn ${page === "register" ? "btn-register" : "btn-login"}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
