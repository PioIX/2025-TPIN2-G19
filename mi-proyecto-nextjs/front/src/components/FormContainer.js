"use client"

import React from "react"
import "./FormContainer.css"

export default function FormContainer(props) {
  return (
    <div className="form-container">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  )
}
