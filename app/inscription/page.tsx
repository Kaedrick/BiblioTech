/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from 'react';
import axios from "axios";
import swal from 'sweetalert';
import DOMPurify from 'dompurify';
require('dotenv').config();
import './page.css';
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

export default function Register() {

    const [registerFirstname, setRegisterFirstname] = useState('');
    const [registerLastname, setRegisterLastname] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    const checkboxChange = () => {
        setShowPassword(switchShowPassword => !switchShowPassword);
    }

    const resetForm = () => {
        setRegisterFirstname('');
        setRegisterLastname('');
        setRegisterEmail('');
        setRegisterPassword('');
    }

    const checkIfLoggedIn = () => {
        axios.get(`${serverUrl}/check-auth`, { withCredentials: true })
            .then((res) => {
                if (res.data.isAuthenticated) {
                    window.location.href = '/';
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const register = (e: any) => {
        e.preventDefault();

        if (!registerFirstname || !registerLastname || !registerEmail || !registerPassword) {
            setErrorMessage('Tous les champs doivent être remplis.');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,32}$/;

        if (!emailRegex.test(registerEmail)) {
            setErrorMessage('Adresse e-mail invalide.');
            return;
        }

        if (!passRegex.test(registerPassword)) {
            setErrorMessage('Mot de passe invalide. Veuillez inclure au moins une majuscule, une minuscule, un caractère spécial, et un chiffre.');
            return;
        }

        const cleanFirstname = DOMPurify.sanitize(registerFirstname);
        const cleanLastname = DOMPurify.sanitize(registerLastname);
        const cleanEmail = DOMPurify.sanitize(registerEmail);
        const cleanPassword = DOMPurify.sanitize(registerPassword);

        const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN'));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;

        axios({
            method: "post",
            data: {
                email: cleanEmail,
                password: cleanPassword,
                firstname: cleanFirstname,
                lastname: cleanLastname
            },
            withCredentials: true,
            url: `${serverUrl}/inscription`,
            timeout: 5000,
            headers: {
                'CSRF-Token': csrfToken
            }
        }).then((res) => {
            swal("Information", "Compte créé avec succès. Un mail de validation vous a été envoyé.", "success");
            resetForm();
            setErrorMessage('');
        }).catch((err) => {
            if (err.response && err.response.status === 409) {
                swal('Erreur', 'Adresse email déjà inscrite.', 'error');
            } else {
                console.log(err);
                swal("Erreur", "Erreur lors de la création du compte.");
            }
        });
    }

    return (
        <div>
            <div className="content">
                <h1 className="textReg"><b>Inscription</b></h1>
                <h1 className="textWarn">
                    <img src='img/warn.png' className='imgWarn' alt="Avertissement"></img>
                    <b>Après votre inscription, avant de pouvoir réserver les livres en ligne,
                        il faudra :
                        <br /> - Vous présenter au guichet de la bibliothèque muni d'un papier d'identité,
                        <br /> - Confirmer votre inscription en cliquant sur le mail qui vous sera envoyé.
                    </b></h1>
                <form className="form" method='post' onSubmit={register}>
                    <label htmlFor="nom" className="label">Nom</label>
                    <input type="text" id="nom" name="nom" placeholder="Nom" required className="input" value={registerLastname} onChange={e => setRegisterLastname(e.target.value)} />

                    <label htmlFor="prénom" className="label">Prénom</label>
                    <input type="text" id="prénom" name="prénom" placeholder="Prénom" required className="input" value={registerFirstname} onChange={e => setRegisterFirstname(e.target.value)} />

                    <label htmlFor="email" className="label">E-mail</label>
                    <input type="email" id="email" name="email" placeholder="Email" required className="input" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} />

                    <label htmlFor="password" className="label">Mot de passe</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Mot de passe"
                        required
                        className="input"
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                    />

                    <div className="checkbox">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={checkboxChange}
                        />
                        <label htmlFor="showPassword">Afficher le mot de passe</label>
                    </div>

                    <button type="submit" className="submit">S'inscrire</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};
