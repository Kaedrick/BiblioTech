// pages/livres/[idLivre].tsx
"use client";
import { useParams } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './BookDetails.css'; 

export default function LivresDetails() {
    const { idBook } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
      console.log("LivresDetails chargé.")

      if (idBook) {
          const fetchBook = async () => {
              try {
                  const response = await axios.get(`http://localhost:3001/api/books?idBook=${idBook}`);
                  setBook(response.data[0]); 
              } catch (error: any) {
                  console.error("Erreur lors de la récupération du livre :", error);
              } finally {
                  setLoading(false); // Stops loading once everything's charged
              }
          };
        
          fetchBook();
      }
  }, [idBook]);

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
                <button className="reserve-button">Réserver</button>
            </div>
        </div>
    </div>
);
}