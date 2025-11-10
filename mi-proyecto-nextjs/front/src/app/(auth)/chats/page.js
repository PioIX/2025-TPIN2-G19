"use client"

import Input from "@/components/input";
import Messages from "@/components/message";
import { useState } from "react";
import { useEffect } from "react";
import { useSocket } from "@/hook/useSocket"
import styles from "./page.module.css";

export default function Chats() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [id_customer, setIdCustomer] = useState(0)
  const [id_chat, setIdChat] = useState(0)
  const [contactInfo, setContactInfo] = useState({
    name: "Cargando...",
    photo: "",
    status: "En línea",
    initials: "C"
  })
  const {socket, isConnected} = useSocket()
  
  useEffect(() => {
    if (socket && id_chat && id_chat !== "0") {
      console.log("Uniéndose automáticamente a la sala:", id_chat);
      socket.emit("joinRoom", {
        room: id_chat
      });
    }
  }, [socket, id_chat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (data) => {
        console.log("Nuevo mensaje recibido:", data); 
        setMessages(prev => [...prev, data.message])
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket]);

  async function fetchContactInfo() {
    try {
      const currentContact = localStorage.getItem('currentContact');
      
      if (currentContact) {
        const contactData = JSON.parse(currentContact);
        const contactName = contactData.group_name || contactData.contact_name || contactData.name || "Contacto";
        const initials = contactName.charAt(0).toUpperCase();
        
        setContactInfo({
          name: contactName,
          photo: contactData.photo || "",
          status: "En línea",
          initials: initials
        });
      } else {
        setContactInfo({
          name: "Contacto",
          photo: "",
          status: "En línea",
          initials: "C"
        });
      }
    } catch (error) {
      console.error("Error cargando información del contacto:", error);
    }
  }

  async function fetchMessages(id_chat) {
    try {
        const response = await fetch(`http://localhost:4000/getMessages?id_chat=${id_chat}`);
        const result = await response.json();
        console.log("Mensajes recibidos:", result);
        setMessages(result);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      }
  }

  useEffect(() => {
    const chatId = localStorage.getItem("id_chat");
    const customerId = localStorage.getItem("id_customer");
    
    console.log("Datos del localStorage:", {
      id_chat: chatId,
      id_customer: customerId,
      currentContact: localStorage.getItem('currentContact')
    });
    
    if (chatId && chatId !== "0") {
      setIdChat(chatId);
      setIdCustomer(customerId);
      fetchMessages(chatId);
      fetchContactInfo();
    } else {
      console.error("No se encontró id_chat válido en localStorage");
    }
  }, []);

  function getSQLDateTimeNow() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async function sendMessage() {
    if (!message.trim()) return;
    
    try {
      const newMessage = {
        text: message,       
        id_customer: id_customer, 
        id_chat: id_chat,
        date_time: getSQLDateTimeNow()
      }

      socket.emit("sendMessage", {
        text: message,       
        id_customer: id_customer,
        id_chat: id_chat,          
        date_time: getSQLDateTimeNow()
      })

      const response = await fetch("http://localhost:4000/sendMessage", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta del servidor:', result);
      setMessage("")
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  }

  return (
    <div className={styles.fondo}>
      <div className={styles.chatHeader}>
        <div className={styles.contactPhoto}>
          {contactInfo.photo ? (
            <img 
              src={contactInfo.photo} 
              alt={contactInfo.name}
              style={{width: '100%', height: '100%', borderRadius: '50%'}}
            />
          ) : (
            <span>{contactInfo.initials}</span>
          )}
        </div>
        <div className={styles.contactInfo}>
          <h3 className={styles.contactName}>{contactInfo.name}</h3>
          <p className={styles.contactStatus}>{contactInfo.status}</p>
        </div>
      </div>
      
      <div className={styles.messagesContainer}>
        <Messages messages={messages} />
      </div>
      
      <div className={styles.inputContainer}>
        <input 
          type="text"
          placeholder="Escribe un mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.chatInput}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className={styles.sendButton}
          disabled={!message.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}