// pages/livres/[idBook].tsx
"use client";
import { useParams } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePickerComponent from '../../../components/DatePickerComponent'; 
import './BookDetails.css'; 

export default function LivresDetails() {
    const { idBook } = useParams();
    const bookId = Array.isArray(idBook) ? idBook[0] : idBook;
    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<any>(null);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>(-1); // Initialized with a default value

    useEffect(() => {
        console.log("LivresDetails chargé.");

        // Fetch book details
        if (idBook) {
            const fetchBook = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/books?idBook=${idBook}`);
                    setBook(response.data[0]);
                } catch (error) {
                    console.error('Error fetching book details:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserId();
            fetchBook();
        }
    }, [idBook]);

    const fetchUserId = async () => {
        try {
            const response = await axios.get('http://localhost:3001/getUserID', {
                withCredentials: true
            });
            setUserId(response.data.userID || -1); 
        } catch (error) {
            console.error('Error fetching user ID:', error);
        }
    };

    

    const handleReserveClick = () => {
        if (!loading) { // Check if user ID is loaded before showing date picker
            setShowDatePicker(true);
        }
    };

    if (loading) {
        return <div className="loading">Chargement...</div>; 
    }

    if (!book) {
        return <div className="not-found">Livre introuvable.</div>; 
    }

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
                    <button className="reserve-button" onClick={handleReserveClick}>
                        Réserver
                    </button>
                </div>
            </div>
            {showDatePicker && (
                <div className="date-picker-overlay">
                    <DatePickerComponent idBook={bookId} userId = {userId} />
                </div>
            )}
        </div>
    );
}
