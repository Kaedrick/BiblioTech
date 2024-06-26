"use client";
import React, { useState, useEffect } from 'react';
import UserAdmin from './useradmin/page';
import BookAdmin from './bookadmin/page';
import axios from "axios";
import './page.css';
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

export default function Admin() {

    useEffect(() => {
        const checkAdmin = () => {
            axios.get(`${serverUrl}/check-admin`, { withCredentials: true })
            .then((res) => {
                if (!res.data.isAuthenticated) {
                    window.location.href = '/';
                }
            })
            .catch((err) => {
                console.log(err);
            });
        }
        checkAdmin();
      }, []);
    
    const [section, setSection] = useState('users');

    return (
        <div className="admin-container">
            <h1>Administration</h1>
            <div className="admin-nav">
                <button className='buttons' onClick={() => setSection('users')}>Utilisateurs</button>
                <button className='buttons' onClick={() => setSection('books')}>Livres</button>
            </div>
            <div className="admin-content">
                {section === 'users' ? <UserAdmin /> : <BookAdmin />}
            </div>
        </div>
    );
}
