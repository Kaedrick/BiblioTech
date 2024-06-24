/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './page.css';
require('dotenv').config();
import swal from 'sweetalert';
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
import Cookies from 'js-cookie';
axios.defaults.withCredentials = true;
const csrfToken = Cookies.get('XSRF-TOKEN');

interface Book {
    idBook: number;
    title: string;
    author: string;
    description: string;
    image: string;
    quantity: number;
}

interface NewBook {
    title: string;
    author: string;
    description: string;
    image: string;
    quantity: number;
}

export default function BookAdmin() {
    const [books, setBooks] = useState<Book[]>([]);
    const [newBook, setNewBook] = useState<NewBook>({ title: '', author: '', description: '', image: '', quantity: 0 });
    const [showAddBookForm, setShowAddBookForm] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/books`);
                setBooks(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des livres :", error);
            }
        };
        fetchBooks();
    }, []);

    const handleBookUpdate = async (book: Book) => {
        try {
            await axios.put(`${serverUrl}/api/books/${book.idBook}`, book, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
                withCredentials: true,
            });
            swal("Succès", "Livre mis à jour avec succès.", "success");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du livre :", error);
            swal("Erreur", "Erreur lors de la mise à jour du livre.", "error");
        }
    };

    const handleBookDelete = async (bookId: number) => {
        try {
            await axios.delete(`${serverUrl}/api/books/${bookId}`, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
                withCredentials: true,
            });
            setBooks(books.filter(book => book.idBook !== bookId));
            swal("Succès", "Livre supprimé avec succès.", "success");
        } catch (error) {
            console.error("Erreur lors de la suppression du livre :", error);
            swal("Erreur", "Erreur lors de la suppression du livre.", "error");
        }
    };

    const handleBookAdd = async () => {
        try {
            const response = await axios.post(`${serverUrl}/api/books`, newBook, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
                withCredentials: true,
            });
            const addedBook = { ...newBook, idBook: response.data.insertId };
            setBooks([...books, addedBook]);
            setNewBook({ title: '', author: '', description: '', image: '', quantity: 0 });
            swal("Succès", "Livre ajouté avec succès.", "success");
        } catch (error) {
            console.error("Erreur lors de l'ajout du livre :", error);
            swal("Erreur", "Erreur lors de l'ajout du livre.", "error");
        }
    };

    return (
        <div>
            <h2>Gestion des Livres</h2>
            <button className='buttons' onClick={() => setShowAddBookForm(!showAddBookForm)}>Ajouter un livre</button>
            {showAddBookForm && (
                <div className="add-book-form">
                    <label>Titre: <input type="text" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} /></label>
                    <label>Auteur: <input type="text" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} /></label>
                    <label>Description: <textarea value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}></textarea></label>
                    <label>Image URL: <input type="text" value={newBook.image} onChange={(e) => setNewBook({ ...newBook, image: e.target.value })} /></label>
                    <label>Quantité: <input type="number" value={newBook.quantity} onChange={(e) => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })} /></label>
                    <button className='buttons' onClick={handleBookAdd}>Ajouter le livre</button>
                </div>
            )}
            <table className="book-list">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.idBook}>
                            <td>
                                <img src={book.image} alt={book.title} className="book-image" />
                                <br />
                                <td>
                                <input
                                    type="text"
                                    value={book.image}
                                    onChange={(e) => setBooks(books.map(b => b.idBook === book.idBook ? { ...b, image: e.target.value } : b))}
                                />
                            </td>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={book.title}
                                    onChange={(e) => setBooks(books.map(b => b.idBook === book.idBook ? { ...b, title: e.target.value } : b))}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={book.author}
                                    onChange={(e) => setBooks(books.map(b => b.idBook === book.idBook ? { ...b, author: e.target.value } : b))}
                                />
                            </td>
                            <td>
                                <textarea
                                    value={book.description}
                                    onChange={(e) => setBooks(books.map(b => b.idBook === book.idBook ? { ...b, description: e.target.value } : b))}
                                ></textarea>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={book.quantity}
                                    onChange={(e) => setBooks(books.map(b => b.idBook === book.idBook ? { ...b, quantity: parseInt(e.target.value) } : b))}
                                />
                            </td>
                            <td className="action-buttons">
                                <button className="apply" onClick={() => handleBookUpdate(book)}>Appliquer les modifications</button>
                                <button className="delete" onClick={() => handleBookDelete(book.idBook)}>Supprimer le livre</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

                           
