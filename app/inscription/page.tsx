"use client";
import { useState } from 'react';
import React from 'react';
import './page.css';
import axios from "axios";
import swal from 'sweetalert';

export default function Register() {
    
    const [ registerFirstname, setRegisterFirstname ] = useState('');
    const [ registerLastname, setRegisterLastname ] = useState('');
    const [ registerEmail, setRegisterEmail ] = useState('');
    const [ registerPassword, setRegisterPassword ] = useState('');
    const [ showPassword, setShowPassword ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState('');
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,32}$/;

    const checkboxChange = () => {
    setShowPassword(switchShowPassword => !switchShowPassword);
    }

    const resetForm = () => {
      setRegisterFirstname('');
      setRegisterLastname('');
      setRegisterEmail('');
      setRegisterPassword('');
  }

    const register = (e: any) => {
      e.preventDefault(); // Keeps page from refreshing

      if (!registerFirstname || !registerLastname || !registerEmail || !registerPassword) {
        setErrorMessage('Tous les champs doivent être remplis.');
        return;
      }

      if (!emailRegex.test(registerEmail)) {
        setErrorMessage('Adresse e-mail invalide.');
        return;
    }

    if (!passRegex.test(registerPassword)) {
      setErrorMessage('Mot de passe invalide. Veuillez inclure au moins une majuscule, une minuscule, un caractère spécial, et un chiffre.');
      return;
  }

      axios({
        method: "post",
        data: {
          email: registerEmail,
          password: registerPassword,
          firstname: registerFirstname,
          lastname: registerLastname
        },
        withCredentials: true,
        url: "http://localhost:3001/inscription",
        timeout: 5000
      }).then((res) => {
        console.log(res)
        swal("Information", "Compte créé avec succès. Un mail de validation vous a été envoyé.", "success");
        resetForm();
        setErrorMessage('');
      }) .catch((err) =>{
        if(err.response && err.response.status === 409) {
          swal('Erreur', 'Adresse email déjà inscrite.', 'error');
        } else {
          console.log(err);
          swal("Erreur", "Erreur lors de la création du compte.");
        }
      });
    }
      
      return (
        // AJOUTER REDIRECTION SI UTILISATEUR DEJA LOG !!
        // Ajouter contrôle sécurité mdp (maj caractère special etc)
        <div>
          <div className="content">
            <h1 className="textReg"><b>Inscription</b></h1>
            <h1 className="textWarn">
                <img src='img/warn.png' className='imgWarn'></img>
                <b>Après votre inscription, avant de pouvoir réserver les livres en ligne, 
                il faudra : 
                <br/> - Vous présenter au guichet de la bibliothèque muni d'un papier d'identité, 
                <br/> - Confirmer votre inscription en cliquant sur le mail qui vous sera envoyé. 
                </b></h1>
            <form className="form" method='post'>
                <label htmlFor="Nom" className="label">Nom</label>
                <input type="text" id="nom" name="nom" placeholder="Nom" required className="input" value={registerLastname} onChange={e => setRegisterLastname(e.target.value)}/>

                <label htmlFor="Prénom" className="label">Prénom</label>
                <input type="text" id="prénom" name="prénom" placeholder="Prénom" required className="input" value={registerFirstname} onChange={e => setRegisterFirstname(e.target.value)}/>
            
                <label htmlFor="email" className="label">E-mail</label>
                <input type="email" id="email" name="email" placeholder="Email" required className="input" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)}/>

                <label htmlFor="password" className="label">Mot de passe</label>
                <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password" 
                placeholder="Mot de passe" 
                required 
                value={registerPassword}
                className="input"
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
    
                <button type="submit" className="submit" onClick={register}>S'inscrire</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      );
    };