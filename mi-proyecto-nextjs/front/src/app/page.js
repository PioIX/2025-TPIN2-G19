"use client"

import { useRouter } from "next/navigation"
import Button from "@/components/button"
import FormContainer from "@/components/FormContainer"
import "./page.module.css"

export default function Home() {
  const router = useRouter()

  return (
    <div className="home-container">
      <FormContainer title="CLUE">
        <Button
          text="¡Comienza a jugar!"
          onClick={() => router.push("/login")}
          page="home"
        />
      </FormContainer>
    </div>
  )
}
 