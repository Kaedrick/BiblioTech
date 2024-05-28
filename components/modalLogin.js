"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Modal.module.css';
import { useState } from 'react';
import swal from 'sweetalert';
import axios from 'axios';


const ModalLogin = ({ show, onClose }) => {
  const [ showPassword, setShowPassword ] = useState(false);
  const [ loginEmail, setLoginEmail ] = useState('');
  const [ loginPassword, setLoginPassword ] = useState('');

  const login = (e) => {
    e.preventDefault(); // Keeps page from refreshing
    axios({
      method: "post",
      data:{
        email: loginEmail,
        password: loginPassword
      },
      withCredentials: true,
      url: "http://localhost:3001/connexion",
      timeout: 5000
    }).then((res) => {
      if(res.status === 200) {
        swal("Succès", "Authentification réussie.", "success")
      }
    }).catch((err) => {
      if (err.response) {
          if (err.response.status === 401) {
              swal("Erreur", "Adresse e-mail incorrecte.", "error");
          } else if (err.response.status === 402) {
              swal("Erreur", "Mot de passe incorrect.", "error");
          } else {
          console.log(err);
          swal("Erreur", "Erreur de connexion au serveur.", "error");
      };
    }
  })
};
  
  const checkboxChange = () => {
    setShowPassword(switchShowPassword => !switchShowPassword);
  }

  if (!show) {
    return null;
  }
  
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Connectez-vous</h2>
        <form className={styles.modalForm} method='post'>
          <label htmlFor="email" className={styles.modalLabel}>E-mail</label>
          <input type="email" id="email" name="email" placeholder="Email" required className={styles.modalInput} onChange={e => setLoginEmail(e.target.value)}/>

          <label htmlFor="password" className={styles.modalLabel}>Mot de passe</label>
          <input 
            type={showPassword ? "text" : "password"} 
            id="password" 
            name="password" 
            placeholder="Mot de passe" 
            required 
            className={styles.modalInput} 
            onChange={e => setLoginPassword(e.target.value)}
            />

          <div className={styles.modalCheckbox}>
            <input 
              type="checkbox" 
              id="showPassword" 
              checked={showPassword}
              onChange={checkboxChange}
              />
            
            <label htmlFor="showPassword">Afficher le mot de passe</label>
          </div>

          <button type="submit" className={styles.modalSubmit} onClick={login}>Connexion</button>
        </form>
        <a className={styles.modalLink}>Mot de passe oublié ?</a>

        <Link href="/inscription" legacyBehavior>
          <button className={styles.registerBtn} onClick={onClose}>Pas encore de compte ? Cliquez ici</button>
        </Link>
      </div>
    </div>
  );
};

export default ModalLogin;
