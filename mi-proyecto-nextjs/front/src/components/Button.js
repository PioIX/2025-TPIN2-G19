"use client"

import React from "react"
import "./Button.css"

export default function Button(props) {
  return (
    <button
      type="button"
      className={`btn ${page === "register" ? "btn-register" : "btn-login"}`}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  )
}
