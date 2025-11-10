
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import Input from "@/components/input";
import { useRouter } from 'next/navigation';
import styles from "@/app/signin/page.module.css";



export default function SignInPage() {
    const [login, setlogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [checkbox, setCheckbox] = useState(false);

    function validateEmail(value) {
        return /\S+@\S+\.\S+/.test(value);
    }

    function changeLogin() {
        if (login === true) {
            setlogin(false);
        } else {
            setlogin(true);
        }

    }

    function changeCheck() {
        if (checkbox === true) {
            setCheckbox(false);
        } else {
            setCheckbox(true);
        }

    }

    async function SignUp() {
        try {
            const response = await fetch('http://localhost:4000/regUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const resultReg = await response.json();
            console.log(resultReg);

            if (!email || !password) {
                alert("Por favor complete todos los campos");
                return;
            }
            else if (!validateEmail(email)) {
                alert("El email no tiene un formato válido");
                return;
            }
            else if (password.length < 6 && login) {
                alert("La contraseña debe tener al menos 6 caracteres");
                return;
            } else if (resultReg.message == "ok") {
                alert("registrado correctamente");

                const getId = await fetch(`http://localhost:4000/getIdCustomers?email=${email}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                let id = await getId.json();
                console.log(id[0].id);

                localStorage.setItem('id', id[0].id);
                console.log("IdCustomer:", localStorage.getItem('id'));
                if (checkbox) {
                    localStorage.setItem('keepSession', true);
                } else if (checkbox == false) {
                    localStorage.setItem('keepSession', false);
                }
                console.log("keepSession:", localStorage.getItem('keepSession'));
                router.push("/contacts")

            } else {
                alert(resultReg.message || 'Error al registrarse');
            }
        } catch (error) {
            console.error("Error en SignUp:", error);
        }
    }

    async function SignIn() {

        try {
            const response = await fetch('http://localhost:4000/verifyUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();
            console.log(result.message);

            if (!email || !password) {
                alert("Por favor complete todos los campos");
                return;
            } else if (result.message == "ok") {
                const getId = await fetch(`http://localhost:4000/getIdCustomers?email=${email}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                let id = await getId.json();
                console.log(id[0].id);

                localStorage.setItem('id', id[0].id);
                console.log("IdCustomer:", localStorage.getItem('id'));
                alert("Datos correctos");
                if (checkbox) {
                    localStorage.setItem('keepSession', true);
                } else if (checkbox == false) {
                    localStorage.setItem('keepSession', false);
                }
                console.log("keepSession:", localStorage.getItem('keepSession'));
                router.push("/contacts");

            } else
                alert(result.message || 'Error al iniciar sesión');
        }

        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log("IdCustomer:", localStorage.getItem('id'));
        console.log("keepSession actualizado:", localStorage.getItem("keepSession"));
    }, [Button])



    useEffect(() => {
        if(localStorage.getItem("keepSession") === "true" ){
            router.push("/contacts")
        }
        
    })


    return (
        <div className={styles.fondo}>
            <div className={styles.signinContainer}>

                <Input
                    title="Ingrese su Email"
                    placeholder="ejemplo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                />

                <Input
                    title="Ingrese su contraseña"
                    placeholder="********"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}

                />

                {login == false ?
                    <>
                        <Button onClick={SignIn} title="Iniciar sesión" className={styles.button} id="button" />
                        <p className={styles.p}>¿No tenés una cuenta? <a className={styles.a} onClick={changeLogin}>Creá una.</a></p>
                    </> :
                    <>
                        <Button onClick={SignUp} title="Registrarse" className={styles.button} id="button" />
                        <p className={styles.p}>¿Ya tenés cuenta? <a className={styles.a} onClick={changeLogin}>Iniciá sesión.</a></p>
                    </>
                }

                <Input
                    title="Mantener sesión iniciada"
                    type="checkbox"
                    value={checkbox}
                    onChange={changeCheck}
                />

            </div>
        </div>
    );
}
