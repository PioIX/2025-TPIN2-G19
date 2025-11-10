"use client";

import { useEffect, useState } from "react";
import ContactsList from "../../components/contactsList";
import { useRouter } from 'next/navigation';
import styles from "@/app/contacts/page.module.css";

export default function Contacts({ }) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);

  async function fetchContacts() {
    const id = localStorage.getItem("id");
    try {
      const response = await fetch(`http://localhost:4000/getContacts?id=${id}`);
      const data = await response.json();
      console.log("Contactos recibidos:", data);
      setContacts(data);
    } catch (error) {
      console.error("Error cargando contactos:", error);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  function newContact() {
    console.log("ok")
    router.push("/newContact")
  }
  
  return (
    <div className={styles.fondo}>
      <h2>Contactos</h2>
      <ContactsList contacts={contacts} />
      <button className={styles.newContactButton} onClick={newContact}>
        +
      </button>
    </div>
  );
}