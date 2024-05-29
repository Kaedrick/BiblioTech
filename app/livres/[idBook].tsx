// pages/livres/[idLivre].tsx

import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function LivresDetails() {
    const router = useRouter();
    const { idBook } = router.query;
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
        console.log("LivresDetails chargé.")

        if (idBook) {
            const fetchBooks = async () => {
                try {
                  const response = await axios.get(`http://localhost:3001/api/books?idBook=${idBook}`);
                  setBook(response.data);
                } catch (error: any) {
                  console.error("Erreur lors de la récupération des livres :", error);
                }
              };
          
              fetchBooks();
        }
    }, [idBook]);

    return (
        <div>
            <h1>Détails du livre {book.description}</h1>
            {/* Afficher les détails du livre ici */}
        </div>
    );
}
