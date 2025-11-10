"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function NewContact() {
    const router = useRouter();
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState(true);
    const [newGroup, setNewGroup] = useState(true);
    const [allContacts, setAllContacts] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [photo, setPhoto] = useState("");
    const [selectedEmail, setSelectedEmail] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    async function fetchAllContacts() {
        try {
            const response = await fetch(`http://localhost:4000/getAllContacts`);
            const data = await response.json();
            console.log("Contactos recibidos (/getAllContacts):", data);
            setAllContacts(data);
        } catch (error) {
            console.error("Error cargando contactos:", error);
        }
    }

    async function fetchAllGroups() {
        const id = localStorage.getItem("id");
        try {
            const response = await fetch(`http://localhost:4000/getGroups?id=${id}`);
            const data = await response.json();
            console.log("Grupos recibidos (/getGroups):", data);
            setAllGroups(data);
        } catch (error) {
            console.error("Error cargando grupos:", error);
        }
    }

    async function fetchContacts() {
        const id = localStorage.getItem("id");
        try {
            const response = await fetch(`http://localhost:4000/getContacts?id=${id}`);
            const data = await response.json();
            console.log("Contactos recibidos (/getContacts):", data);
            setContacts(data);
        } catch (error) {
            console.error("Error cargando contactos:", error);
        }
    }

    function changeToNewContact() {
        setNewGroup(false);
        setNewContact(true);
    }

    function changeToNewGroup() {
        setNewGroup(true);
        setNewContact(false);
    }

    useEffect(() => {
        fetchContacts();
        fetchAllContacts();
        fetchAllGroups();
    }, []);

    function Back() {
        setNewGroup(true);
        setNewContact(true);
    }

    function handleBackToContacts() {
        router.push('/contacts');
    }

    async function joinGroup() {
        const id = localStorage.getItem("id");
        try {
            const respuestaCustomer = await fetch(`http://localhost:4000/getCostumer?email=${selectedEmail}`);
            const dataCustomer = await respuestaCustomer.json();
            
            if (!dataCustomer || dataCustomer.length === 0) {
                console.error("No se encontró el usuario");
                alert("No se encontró el usuario con ese email");
                return;
            }

            const body = {
                id_chat: selectedGroup,
                user_id: dataCustomer[0].id,
                email: dataCustomer[0].email
            }

            const response = await fetch("http://localhost:4000/joinGroup", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);
            
            if (result.message === "ok") {
                alert("Usuario agregado al grupo exitosamente");
                setSelectedEmail("");
                setSelectedGroup("");
            }
        } catch (error) {
            console.error("Error al agregar usuario al grupo:", error);
            alert("Error al agregar usuario al grupo");
        }
    }

    async function addContact() {
        const id = localStorage.getItem("id");
        try {
            if (!selectedEmail) {
                alert("Por favor selecciona un contacto");
                return;
            }

            const respuestaId = await fetch(`http://localhost:4000/getIdCustomers?email=${encodeURIComponent(selectedEmail)}`);
            const ids = await respuestaId.json();
            if (!ids || ids.length === 0) {
                alert("No se encontró el contacto con ese email");
                return;
            }
            const id2 = ids[0].id;

            const response = await fetch("http://localhost:4000/addContact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user1_id: id,
                    user2_id: id2,
                    contact_name: newContactName || ids[0].name || "Contacto"
                })
            });

            const data = await response.json();
            console.log("Respuesta addContact:", data);

            if (data && data.message === "ok") {
                fetchContacts();
                fetchAllContacts();
                alert("Contacto agregado exitosamente");
                setSelectedEmail("");
                setNewContactName("");
            }
        } catch (error) {
            console.error("Error agregando contacto:", error);
            alert("Error agregando contacto");
        }
    }

    async function createGroup() {
        const id = localStorage.getItem("id");
        const groupName = newGroupName; 
        const groupPhoto = photo || null;

        if (!groupName) {
            alert("Por favor ingresa un nombre para el grupo");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/createGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group_name: groupName,
                    id_customer: id,
                    group_photo: groupPhoto
                }),
            });

            const data = await response.json();
            console.log("Respuesta createGroup:", data);

            if (data && data.id_chat) {
                fetchAllGroups(); 
                alert("Grupo creado exitosamente");
                setNewGroupName("");
                setPhoto("");
            }
        } catch (err) {
            console.error("Error creando grupo:", err);
            alert("Error creando grupo");
        }
    }

    return (
        <div className={styles.fondo}>
            <div className={styles.container}>
                <h2 className={styles.title}>Nuevo Contacto/Grupo</h2>
                
                {newContact === true && newGroup === true ? (
                    <div className={styles.menuButtons}>
                        <button className={styles.menuButton} onClick={changeToNewContact}>
                            Nuevo Contacto
                        </button>
                        <button className={styles.menuButton} onClick={changeToNewGroup}>
                            Nuevo Grupo
                        </button>
                        <button className={styles.backButton} onClick={handleBackToContacts}>
                            ← Volver a Contactos
                        </button>
                    </div>
                ) : null}

                {newGroup === false && newContact === true ? (
                    <div className={styles.formContainer}>
                        <button className={styles.backButton} onClick={Back}>
                            ← Volver
                        </button>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Seleccionar Contacto:</label>
                            <select 
                                className={styles.formSelect}
                                value={selectedEmail} 
                                onChange={(e) => setSelectedEmail(e.target.value)}
                            >
                                <option value="">Selecciona un contacto</option>
                                {allContacts.map((contact) => (
                                    <option key={contact.id} value={contact.email}>
                                        {contact.name} ({contact.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Nombre del Contacto:</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="Escribe el nombre del contacto"
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                            />
                        </div>

                        <button className={styles.submitButton} onClick={addContact}>
                            Agregar Contacto
                        </button>
                    </div>
                ) : null}

                {newGroup === true && newContact === false ? (
                    <div className={styles.formContainer}>
                        <button className={styles.backButton} onClick={Back}>
                            ← Volver
                        </button>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Agregar a Grupo Existente</h3>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Seleccionar Contacto:</label>
                                <select 
                                    className={styles.formSelect}
                                    value={selectedEmail} 
                                    onChange={(e) => setSelectedEmail(e.target.value)}
                                >
                                    <option value="">Selecciona un contacto</option>
                                    {allContacts.map((contact) => (
                                        <option key={contact.id} value={contact.email}>
                                            {contact.name} ({contact.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Seleccionar Grupo:</label>
                                <select 
                                    className={styles.formSelect}
                                    value={selectedGroup} 
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                >
                                    <option value="">Selecciona un grupo</option>
                                    {allGroups.map((group) => (
                                        <option key={group.id} value={group.id_chat || group.id}>
                                            {group.group_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button className={styles.submitButton} onClick={joinGroup}>
                                Agregar al Grupo
                            </button>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Crear Nuevo Grupo</h3>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nombre del Grupo:</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="Escribe el nombre del grupo"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>URL de la Foto (opcional):</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="URL de la foto del grupo"
                                    value={photo}
                                    onChange={(e) => setPhoto(e.target.value)}
                                />
                            </div>

                            <button className={styles.submitButton} onClick={createGroup}>
                                Crear Grupo
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}