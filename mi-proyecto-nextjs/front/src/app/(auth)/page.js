"use client"

import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import FormContainer from "@/components/FormContainer"
import styles from "./page.module.css"

export default function Home() {
  const router = useRouter()

  return (
    <div className={styles.HomeContainer}>
      <div className={styles.FormBox}>
        <h1 className={styles.Title}>CLUE</h1>
        <Button
          text="¡Comienza a jugar!"
          onClick={() => router.push("/login")}
          page="home"
        />
      </div>
    </div>
  )
}
