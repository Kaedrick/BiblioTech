/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './page.css';
import swal from "sweetalert";
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
import Cookies from 'js-cookie';
import Link from 'next/link';
axios.defaults.withCredentials = true;
const csrfToken = Cookies.get('XSRF-TOKEN');

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {

    const loadReservations = async () => { 
        fetchReservations();
    };

    loadReservations();
  }, []);

  const fetchReservations = async () => {
    try {
        const response = await axios.get(`${serverUrl}/api/user/reservations`);
        setReservations(response.data);
        
    } catch (error) {
        console.error('Erreur lors du chargement des réservations :', error);
    }
};

const handleCancelReservation = async (reservationId: any) => {
    swal({
        title: "Êtes-vous sûr?",
        text: "Voulez-vous vraiment annuler cette réservation?",
        icon: "warning",
        buttons: {
            cancel: {
                text: "Non, garder la réservation",
                value: false,
                visible: true,
                className: "",
                closeModal: true,
            },
            confirm: {
                text: "Oui, annuler la réservation",
                value: true,
                visible: true,
                className: "btn-danger",
                closeModal: true
            }
        },
    }).then(async (willDelete) => {
        if (willDelete) {
            try {
              await axios.put(`${serverUrl}/api/user/reservations/cancel/`, 
                {idReservation: reservationId}, 
                    {
                        headers: {
                            "X-CSRF-TOKEN": csrfToken,
                        },
                        withCredentials: true,
                    }
                );
                // Actualise la liste après l'annulation de la réservation
                fetchReservations();
                swal("Succès", "La réservation a été annulée avec succès.", "success");
            } catch (error) {
                console.error('Erreur lors de l\'annulation de la réservation :', error);
                swal("Erreur", "Erreur lors de l'annulation de la réservation.", "error");
            }
        } else {
            swal("Annulation", "Votre réservation est toujours active.", "info");
        }
    });
};


  return (
    <div className="table-container">
      <h1>Mes réservations</h1>
      {(reservations.length === 0) ? (
        <p>Vous n'avez aucune réservation pour le moment.</p>
      ) : (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Livre</th>
              <th>Date de début</th>
              <th>Date de fin</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.idReservation}>
                <td>
                  <Link legacyBehavior href={`/livres/${reservation.bookId}`}>
                    <a className='bookLink'>{reservation.bookTitle}</a>
                  </Link>
                  <Link legacyBehavior href={`/livres/${reservation.bookId}`}>
                    <img className='img' src={reservation.bookImage} alt={reservation.bookTitle} style={{ width: '100px', height: '150px', marginTop: '10px' }} />
                  </Link>
                </td>
                <td>{reservation.reservationStartDate.split('T')[0]}</td>
                <td>{reservation.reservationEndDate.split('T')[0]}</td>
                <td>
                  <button 
                    className="button-cancel" 
                    onClick={() => handleCancelReservation(reservation.idReservation)}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReservationsPage;
