/* eslint-disable @next/next/no-img-element */
"use client";
import { useParams } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePickerComponent from '../../../components/DatePickerComponent'; 
import './BookDetails.css'; 
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';


export default function LivresDetails() {
    const { idBook } = useParams();
    const bookId = Array.isArray(idBook) ? idBook[0] : idBook;
    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<any>(null);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>(-1); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [reservationConditionCheck, setReservationConditionCheck] = useState(false);

    useEffect(() => {       
        console.log("LivresDetails chargé.");
        console.log(siteUrl, serverUrl);

        const fetchUserId = async () => {
            try {
                const response = await axios.get(`${serverUrl}/getUserID`, {
                    withCredentials: true
                });
                setUserId(response.data.userID || -1); 
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        const fetchBook = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/books?idBook=${idBook}`);
                setBook(response.data[0]);
            } catch (error) {
                console.error('Error fetching book details:', error);
            } 
        };

        const checkIfLoggedIn = async () => {
            try {
                const res = await axios.get(`${serverUrl}/check-auth`, { withCredentials: true });
                const { isAuthenticated } = res.data;
                if (isAuthenticated) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        const checkReservationConditions = async () => {
            try {
                const res = await axios.get(`${serverUrl}/check-conditions`, { withCredentials: true });
                const { strike, verified, emailConfirm } = res.data;
                if (strike < 3 && verified === 1 && emailConfirm === 1) {
                    setReservationConditionCheck(true);
                } else {
                    setReservationConditionCheck(false);
                }
            } catch (err) {
                console.log(err);
            }
        };

        if (idBook) {
            fetchUserId();
            fetchBook();
            checkIfLoggedIn();
            checkReservationConditions();
        }
        
    }, [idBook]);

    if (loading) {
        return <div className="loading">Chargement...</div>; 
    }

    if (!book) {
        return <div className="not-found">Livre introuvable.</div>; 
    }

     // If user clicks outside of the calendar, it'll close it
     document.body.addEventListener('click', (event: MouseEvent) => {
        if (!event.target) {
          return;
        }
      
        const closestDatePicker = (event.target as HTMLElement).closest('.date-picker-overlay');
      
        if (!closestDatePicker) {
          setShowDatePicker(false);
        }
      });

    return (
        <div className="container">
            <div className="book-details">
                <div className="book-image">
                    <img src={book.image} alt={book.title} />
                </div>
                <div className="book-info">
                    <h1 className="book-title">{book.title}</h1>
                    <h2 className="book-author">{book.author}</h2>
                    <p className="book-description">{book.description}</p>
                    {reservationConditionCheck && isAuthenticated && (
                        <>
                            <button className="reserve-button" onClick={() => setShowDatePicker(!showDatePicker)}>
                                Réserver
                            </button>  
                        </>
                    )}
                    {(!reservationConditionCheck || !isAuthenticated) && ( 
                        <>
                            <div className="userNotAuthDiv">
                                <p className="userNotAuth"> Pour pouvoir réserver, vous devez : <br/> </p>
                                <ul className="userNotAuthList">
                                    <li>Être connecté ;</li>
                                    <li>Avoir validé votre email (cliquer sur le mail de confirmation envoyé après votre inscription)</li>
                                    <li>Ne pas avoir rendu les livres en retard 3 fois ou plus.</li>
                                </ul>
                            </div>
                        </>  
                    )}
                </div>
            </div>
            {showDatePicker && (
                <div className="date-picker-overlay">
                    <DatePickerComponent idBook={bookId} userId = {userId} />
                </div>
            )}
        </div>
    );
};
