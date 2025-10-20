"use client"

import { useRouter } from "next/navigation"
import clsx from "clsx"
import Button from "@/components/Button"
import FormContainer from "@/components/FormContainer"
import styles from "./page.module.css"

export default function Home() {
  const router = useRouter()

  return (
    <div className={clsx(styles.homeContainer)}>
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
