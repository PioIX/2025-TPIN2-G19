"use client"

import React from "react"
import "./Input.css"

export default function Input({
  page,
  placeholder,
  type = "text",
  value,
  onChange,
}) {
  return (
    <input
      className={`input ${page === "register" ? "input-register" : "input-login"}`}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  )
}
