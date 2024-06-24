/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./page.css";
require("dotenv").config();
const serverUrl = process.env.BASE_URL || "http://localhost:3001";
import swal from "sweetalert";
import moment from "moment";
import Cookies from "js-cookie";
axios.defaults.withCredentials = true;
const csrfToken = Cookies.get("XSRF-TOKEN");

// Types
type User = {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  verified: boolean;
  strike: number;
  reservations: Reservation[];
};

type Reservation = {
  idReservation: number;
  bookTitle: string;
  reservationStartDate: string;
  reservationEndDate: string;
};

export default function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/users`, {
          params: { searchTerms },
        });
        setUsers(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs :",
          error
        );
      }
    };
    fetchUsers();
  }, [searchTerms]);

  const handleUserSelect = async (user: User) => {
    try {
      if (user) {
        const res = await axios.get(`${serverUrl}/api/user/reservations`, {
          params: {userId:user.idUser},
        });
        setSelectedUser(user);
        setReservations(res.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      swal(
        "Erreur",
        "Erreur lors de la récupération de l'utilisateur.",
        "error"
      );
    }
  };

  const handleUserUpdate = async () => {
    try {
      if (selectedUser) {
        await axios.put(
          `${serverUrl}/api/users/${selectedUser.idUser}`,
          selectedUser,
          {
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
            withCredentials: true,
          }
        );
        swal("Succès", "Utilisateur mis à jour avec succès.", "success");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      swal(
        "Erreur",
        "Erreur lors de la mise à jour de l'utilisateur.",
        "error"
      );
    }
  };

  const handleCancelReservation = async (idReservation: number) => {
    try {
      await axios.put(`${serverUrl}/api/useradmin/reservations/cancel/`, 
        {idReservation}, 
        {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
        withCredentials: true,
      });
      swal("Succès", "Réservation annulée avec succès.", "success");
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          reservations: reservations.filter(
            (res) => res.idReservation !== idReservation
          ),
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation :", error);
      swal("Erreur", "Erreur lors de l'annulation de la réservation.", "error");
    }
  };

  const handleModifyReservation = async (idReservation: number) => {
    const newStartDate = prompt(
      "Entrez la nouvelle date de début (YYYY-MM-DD) :"
    );
    if (newStartDate) {
      try {
        const newEndDate = moment(newStartDate)
          .add(21, "days")
          .format("YYYY-MM-DD");
        await axios.put(
          `${serverUrl}/api/reservations/${idReservation}`,
          {
            reservationStartDate: newStartDate,
            reservationEndDate: newEndDate,
          },
          {
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
            withCredentials: true,
          }
        );
        swal("Succès", "Réservation mise à jour avec succès.", "success");

        // update to reflect changes in UI
        if (selectedUser) {
          const updatedReservations = reservations.map((res) => {
            if (res.idReservation === idReservation) {
              return {
                ...res,
                reservationStartDate: newStartDate,
                reservationEndDate: newEndDate,
              };
            }
            return res;
          });
          setSelectedUser({
            ...selectedUser,
            reservations: updatedReservations,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la réservation :",
          error
        );
        swal(
          "Erreur",
          "Erreur lors de la mise à jour de la réservation.",
          "error"
        );
      }
    }
  };

  return (
    <div>
      <input
        type="search"
        className="search-bar"
        placeholder="Rechercher utilisateur..."
        value={searchTerms}
        onChange={(e) => setSearchTerms(e.target.value)}
      />
      <div className="user-list">
        {users.map((user) => (
          <div key={user.idUser} onClick={() => handleUserSelect(user)}>
            {user.firstname} {user.lastname} - {user.email}
          </div>
        ))}
      </div>
      {selectedUser && (
        <div className="user-details">
          <h2>Détails de l'utilisateur</h2>
          <label>
            Nom:{" "}
            <input
              type="text"
              value={selectedUser.lastname}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, lastname: e.target.value })
              }
            />
          </label>
          <label>
            Prénom:{" "}
            <input
              type="text"
              value={selectedUser.firstname}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, firstname: e.target.value })
              }
            />
          </label>
          <label>
            Email:{" "}
            <input
              type="text"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
            />
          </label>
          <label>
            Vérifié:{" "}
            <input
              type="checkbox"
              checked={selectedUser.verified}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, verified: e.target.checked })
              }
            />
          </label>
          <label>
            Strike:
            <button
              onClick={() =>
                setSelectedUser({
                  ...selectedUser,
                  strike: selectedUser.strike - 1,
                })
              }
            >
              -
            </button>
            {selectedUser.strike}
            <button
              onClick={() =>
                setSelectedUser({
                  ...selectedUser,
                  strike: selectedUser.strike + 1,
                })
              }
            >
              +
            </button>
          </label>
          <button onClick={handleUserUpdate}>Appliquer</button>
          <h3>Réservations</h3>
          <table>
            <thead>
              <tr>
                <th>Livre</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations?.map((reservation: any) => (
                <tr key={reservation.idReservation}>
                  <td>{reservation.bookTitle}</td>
                  <td>{reservation.reservationStartDate.split("T")[0]}</td>
                  <td>{reservation.reservationEndDate.split("T")[0]}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleCancelReservation(reservation.idReservation)
                      }
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() =>
                        handleModifyReservation(reservation.idReservation)
                      }
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
