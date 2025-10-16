"use client"

import React from "react"
import "./FormContainer.css"

export default function FormContainer({ title, children }) {
  return (
    <div className="form-container">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
