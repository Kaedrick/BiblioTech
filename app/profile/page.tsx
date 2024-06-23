"use client";
import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import axios from "axios";
import "./page.css";
import swal from "sweetalert";
import DOMPurify from "dompurify";
require("dotenv").config();
const serverUrl = process.env.BASE_URL || "http://localhost:3001";
const siteUrl = process.env.SITE_URL || "http://localhost:3000";
import Cookies from 'js-cookie';
axios.defaults.withCredentials = true;
const csrfToken = Cookies.get('XSRF-TOKEN');

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<number>(-1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,32}$/;
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage("Tous les champs doivent être remplis.");
      return;
    }

    if (!passRegex.test(newPassword)) {
      swal(
        "Erreur",
        "Nouveau mot de passe invalide. Veuillez inclure au moins une majuscule, une minuscule, un caractère spécial, et un chiffre.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/user/change-password`,
        {
          userId,
          oldPassword: DOMPurify.sanitize(oldPassword),
          newPassword: DOMPurify.sanitize(newPassword),
          confirmNewPassword: DOMPurify.sanitize(confirmNewPassword),
        },
        {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      console.log("Réponse du serveur:", response.data);
      swal("Information", "Mot de passe changé avec succès", "success");
      setErrorMessage("");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        swal({
          icon: "error",
          title: "Erreur lors du changement de mot de passe",
          text: error.response.data.message,
        });
      } else {
        swal("Erreur", "Erreur lors du changement de mot de passe.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchCurrentUserID = async () => {
      try {
        const response = await axios.get(`${serverUrl}/getUserID`, {
          withCredentials: true,
        });
        const userId = response.data.userID;
        return userId;
      } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error;
      }
    };

    const fetchData = async () => {
      try {
        // Fetch the user ID
        const userIdResponse = await fetchCurrentUserID();
        setUserId(userIdResponse);
        // Fetch user data using the retrieved user ID
        const userDataResponse = await axios.get(
          `${serverUrl}/api/user/profile/${userIdResponse}`,
          { withCredentials: true }
        );
        setUser(userDataResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCurrentUserID(); // remove ?
    fetchData(); // Call the fetchData function
  }, []);

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    setIsSendingEmail(true);

    try {
      const response = await axios.post(
        `${serverUrl}/resend-verification-email`,
        { email: user.email },
        {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      swal("Succès", response.data.message, "success");

      // Starts 60s timer
      setRemainingTime(60);
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      // Stops timer after 6às
      setTimeout(() => {
        setIsSendingEmail(false);
        clearInterval(timer);
      }, 60000);
    } catch (error) {
      console.error(
        "Erreur lors de la tentative de renvoi du mail de confirmation:",
        error
      );
      swal(
        "Erreur",
        "Une erreur s'est produite lors de la tentative de renvoi du mail de confirmation.",
        "error"
      );
      setIsSendingEmail(false);
    }
  };

  if (!user) {
    return (
      <div>
        Chargement...
        <br /> Si le chargement est bloqué, vérifiez que vous êtes bien
        authentifiés.
      </div>
    );
  }

  return (
    <div className="profileContainer">
      <div className="userDetails">
        {user.firstname && user.lastname && (
          <p>
            {user.lastname.toUpperCase()}{" "}
            {user.firstname.charAt(0).toUpperCase()}
            {user.firstname.slice(1).toLowerCase()}
          </p>
        )}
        <p>{user.email}</p>
      </div>

      {user.emailConfirm === 0 && (
        <div className="warning">
          <p>Votre adresse email n'est pas encore confirmée.</p>
          <button
            className="sendEmail"
            onClick={resendVerificationEmail}
            disabled={isSendingEmail}
          >
            Renvoyer le mail de validation
          </button>
          {isSendingEmail && (
            <span style={{ marginLeft: "10px" }}>
              {" "}
              (Bloqué pendant {remainingTime} secondes)
            </span>
          )}
        </div>
      )}

      {user.verified === 0 && (
        <div className="warning">
          <p>
            Votre compte n'est pas encore vérifié. Veuillez vous rendre à la
            bibliothèque muni de votre carte d'identité pour valider votre
            compte.
          </p>
        </div>
      )}

      <div className="passwordChange">
        <h3 className="passwordChangeTitle">Changement du mot de passe</h3>
        <button
          className="showPasswordsButton"
          onClick={() => setShowPasswords(!showPasswords)}
        >
          {showPasswords
            ? "Cacher les mots de passe"
            : "Afficher les mots de passe"}
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="oldPassword">Ancien mot de passe:</label>
            <input
              type={showPasswords ? "text" : "password"}
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword">Nouveau mot de passe:</label>
            <input
              type={showPasswords ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(DOMPurify.sanitize(e.target.value))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword">
              Confirmer le nouveau mot de passe:
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) =>
                setConfirmNewPassword(DOMPurify.sanitize(e.target.value))
              }
              required
            />
          </div>
          <button type="submit">Changer le mot de passe</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
