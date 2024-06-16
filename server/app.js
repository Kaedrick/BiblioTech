const express = require('express');
const boddParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const connection = require('./database.js'); 
const { addDays: addDaysDateFns } = require('date-fns');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

app.use(boddParser.json());
app.use(boddParser.urlencoded({ extended: true }));
app.use(expressSession({ secret : 'mySecretKey', resave:false, saveUninitialized: false }));

app.use(cors({
    origin: `${siteUrl}`,
    credentials: true
}));

app.use(cookieParser('mySecretKey'));

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bibliotech.assist@gmail.com',
        pass: 'qxkguopsnihpvzpg'
    }
});

const jwtSecret = 'jwtSecretK3y0910!'; 

app.get('/inscription', checkNotAuthenticated, (req, res) => {
    res.render('inscription');
});

app.post('/inscription', checkNotAuthenticated, async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    const query = "INSERT INTO user (`email`, `password`, `firstname`, `lastname`, `emailConfirm`) VALUES (?, ?, ?, ?, ?)";
    const query2 = "SELECT * FROM user WHERE email = ?"; // Checking if email exists

    connection.query(query2, [email], async (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length > 0) { // If result.length > 0, then email exists
            return res.status(409).send({ message: "Adresse mail déjà inscrite." });
        }
        if (result.length === 0) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const emailConfirm     = 0; // Set emailConfirm to 0 initially
            connection.query(query, [email, hashedPassword, firstname, lastname, emailConfirm], async (err, result) => {
                if (err) {
                    throw err;
                }
                // Create verification token
                const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });

                // Send verification email
                const mailOptions = {
                    from: 'bibliotech.assist@gmail.com',
                    to: email,
                    subject: 'BiblioTech - Activez votre compte',
                    text: `Merci pour votre inscription! Merci de valider votre mail en cliquant sur le lien suivant : ${serverUrl}/verify-email?token=${token}`
                };

                try {
                    await transporter.sendMail(mailOptions);
                    res.send({ message: "Utilisateur créé. Veuillez vérifier votre email pour compléter l'inscription." });
                } catch (emailErr) {
                    console.error('Error sending email:', emailErr);
                    res.status(500).send({ message: "Erreur lors de l'envoi de l'email de vérification." });
                }
            });
        }
    });
});


app.get('/connexion', checkNotAuthenticated, (req, res) => {
    res.render('connexion'); 
});

app.post('/connexion', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {return console.log(err);}
        if(!user) {
            if(info && info.message === 'Invalid Email') {
                return res.status(401).send('Adresse e-mail incorrecte.');
            }
            if(info && info.message === 'Invalid Password') {
                return res.status(402).send('Mot de passe incorrect.');
            }
            return res.status(403).send('Erreur d\'authentification.');
        }
        // Success login
        req.login(user, (err) => {
            if(err) { console.log(err); }
            res.send("Utilisateur authentifié avec succès");
            console.log(user);
        });
    })(req, res, next);
});

app.get('/getUser', (req, res) => {
    res.send(req.user);
})

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/'); // Redirect to mp
    }
    next();
}

app.get('/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.send({ isAuthenticated: true });
    } else {
        res.send({ isAuthenticated: false });
    }
});

app.get('/check-conditions', (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.idUser;
        const query = 'SELECT strike, verified, emailConfirm FROM user WHERE idUser = ?';
        connection.query(query, [userId], (error, results) => {
            if (error) {
                return res.status(500).json({error: 'Internal server error' });
            }
            if (results.length > 0) {
                const user = results[0];
                res.json({
                    strike: user.strike,
                    verified: user.verified,
                    emailConfirm: user.emailConfirm
                });
            } else {
                res.json({message: "NOT OK"});
            }
        });
    } else {
        res.json({ message: "NOT OK 2"});
    }
});


app.post('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.status(200).send('Déconnecté avec succès.');
    });
  });

  app.get('/api/books', (req, res) => {
    const idBook = req.query.idBook;

    let query = 'SELECT idBook, title, author, description, image FROM book';
    if (idBook) {
        query += ` WHERE idBook = ${idBook}`;
    }

    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching books data:", error);
            res.status(500).json({ message: "Error fetching books data" });
        } else {
            res.status(200).json(results); // Send books data as JSON response
        }
    });
});

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

app.get('/api/books/reserved-dates/:idBook', async (req, res) => {
    const idBook = req.params.idBook;

    try {
        // Fetch book quantity
        const bookQuery = `
            SELECT quantity
            FROM book
            WHERE idBook = ?
        `;
        const bookResult = await new Promise((resolve, reject) => {
            connection.query(bookQuery, [idBook], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        const quantity = bookResult.quantity;

        // DB request to return book's reservations
        const reservationQuery = `
            SELECT reservationStartDate, reservationEndDate
            FROM reservation
            WHERE idBook = ? AND status = 1
        `;
        // basically try catch (tbr)
        const reservations = await new Promise((resolve, reject) => {
            connection.query(reservationQuery, [idBook], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        // Create map to count active reservations per date
        const dateCountMap = new Map();

        reservations.forEach((reservation) => {
            let currentDate = moment(reservation.reservationStartDate);
            const endDate = moment(reservation.reservationEndDate);
            while (currentDate.isSameOrBefore(endDate)) {
                const dateString = currentDate.format('YYYY-MM-DD');
                dateCountMap.set(dateString, (dateCountMap.get(dateString) || 0) + 1);
                currentDate.add(1, 'days');
            }
        });

        // Filter dates to block according to book availability
        const blockedDates = [];
        dateCountMap.forEach((count, date) => {
            if (count >= quantity) {
                blockedDates.push(date);
            }
        });

        res.status(200).json(blockedDates);
    } catch (error) {
        console.error("Erreur lors de la récupération des dates réservées :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des dates réservées" });
    }
});

app.post('/api/books/reservations', async (req, res) => {
    const { userId, idBook, reservationStartDate } = req.body;
    const reservationEndDate = moment(reservationStartDate).add(21, 'days').format('YYYY-MM-DD'); // Adds 21 days from the start of reservation date

    try {
        // Book availability check
        const query = `
            SELECT COUNT(*) AS numReservations
            FROM reservation
            WHERE idBook = ? AND reservationStartDate <= ? AND reservationEndDate >= ? AND status = 1
        `;
        const { numReservations } = await new Promise((resolve, reject) => {
            connection.query(query, [idBook, reservationEndDate, reservationStartDate], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        // Checks if reservation number below quantity
        const quantityQuery = `
            SELECT quantity
            FROM book
            WHERE idBook = ?
        `;
        const [{ quantity }] = await new Promise((resolve, reject) => {
            connection.query(quantityQuery, [idBook], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (numReservations >= quantity) {
            return res.status(400).json({ message: "Toutes les copies de ce livre sont déjà réservées pour cette date." });
        }

        // Create reservation
        const insertQuery = `
            INSERT INTO reservation (idBook, userId, reservationStartDate, reservationEndDate, status, reservationDate)
            VALUES (?, ?, ?, ?, 1, ?)
        `;
        await new Promise((resolve, reject) => {
            connection.query(insertQuery, [idBook, userId, reservationStartDate, reservationEndDate, moment().format('YYYY-MM-DD')], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        res.status(200).json({ message: "Réservation réussie." });
    } catch (error) {
        console.error("Erreur lors de la création de la réservation :", error);
        res.status(500).json({ message: "Erreur lors de la création de la réservation." });
    }
});


app.get('/api/user/profile/:userId', (req, res) => {
    const userId = req.params.userId; // Get user ID from parameter
    const query = 'SELECT * FROM user WHERE idUser = ?'; 
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Erreur lors de la récupération des détails de l'utilisateur :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des détails de l'utilisateur." });
        } else {
            if (results.length > 0) {
                const user = results[0];
                // send user details as JSON reponse
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: "Utilisateur non trouvé." });
            }
        }
    });
});

app.get('/api/current_user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'User not authenticated' });
    }
  });

app.get('/getUserID', (req, res) => {
    const userID = req.user.idUser;
    res.json({ userID });
});

module.exports = {
    jwtSecret: ''
};

app.get('/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send({ message: "Token manquant." });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(400).send({ message: "Token invalide ou expiré." });
        }

        const email = decoded.email;
        const query = "UPDATE user SET emailConfirm = 1 WHERE email = ?";

        connection.query(query, [email], (err, result) => {
            if (err) {
                return res.status(500).send("Erreur interne du serveur. Veuillez réessayer plus tard.");
            }
            if (result.affectedRows === 0) {
                return res.status(400).send("Utilisateur non trouvé.");
            }

            res.send(`
                <html>
                    <head>
                        <title>Validation du compte terminée</title>
                    </head>
                    <body>
                        <h1>Validation du compte terminée</h1>
                        <p>Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.</p>
                        <a href="${siteUrl}" target="_blank">Page principale</a>
                    </body>
                </html>
            `);
        });
    });
});

app.post('/api/user/change-password', (req, res) => {
    const { userId, oldPassword, newPassword, confirmNewPassword } = req.body;
    
    // Verifies all necessary fields are filled
    if (!userId || !oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Verify if new pass and confirm new pass are the same
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'Le nouveau mot de passe ne correspond pas à la confirmation.' });
    }

    // Checks if old password is correct
    const query = 'SELECT password FROM user WHERE idUser = ?';
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Erreur lors de la récupération du mot de passe de l'utilisateur :", error);
            return res.status(500).json({ message: "Erreur lors de la récupération du mot de passe de l'utilisateur." });
        } else {
            if (results.length > 0) {
                const hashedPassword = results[0].password;
                bcrypt.compare(oldPassword, hashedPassword, (err, result) => {
                    if (err) {
                        console.error("Erreur lors de la comparaison des mots de passe :", err);
                        return res.status(500).json({ message: "Erreur lors de la comparaison des mots de passe." });
                    }
                    if (!result) {
                        return res.status(401).json({ message: "L'ancien mot de passe est incorrect." });
                    }
                    // If old password is correct, hash it and update it in the db
                    bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
                        if (err) {
                            console.error("Erreur lors du hachage du nouveau mot de passe :", err);
                            return res.status(500).json({ message: "Erreur lors du hachage du nouveau mot de passe." });
                        }
                        const updateQuery = 'UPDATE user SET password = ? WHERE idUser = ?';
                        connection.query(updateQuery, [hashedNewPassword, userId], (error) => {
                            if (error) {
                                console.error("Erreur lors de la mise à jour du mot de passe :", error);
                                return res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
                            }
                            return res.status(200).json({ message: "Le mot de passe a été mis à jour avec succès." });
                        });
                    });
                });
            } else {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
        }
    });
});

// POST request to resend verification email
app.post('/resend-verification-email', async (req, res) => {
    const { email } = req.body;

    // Create verification token
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });

    // Send verification email
    const mailOptions = {
        from: 'bibliotech.assist@gmail.com',
        to: email,
        subject: 'BiblioTech - Activez votre compte',
        text: `Merci pour votre inscription! Merci de valider votre mail en cliquant sur le lien suivant : ${serverUrl}/verify-email?token=${token}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send({ message: "Email de vérification renvoyé avec succès." });
    } catch (emailErr) {
        console.error('Error sending email:', emailErr);
        res.status(500).send({ message: "Erreur lors de l'envoi de l'email de vérification." });
    }
});

// Gets user's reservations
app.get('/api/user/reservations', (req, res) => {
    const userId = req.user.idUser;
    const query = 'SELECT * FROM reservation WHERE userId = ? AND status = 1'; // Only retrieve active reservations
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Erreur lors de la récupération des réservations de l'utilisateur :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des réservations de l'utilisateur." });
        } else {
            res.status(200).json(results);
        }
    });
});

// Cancel a user's reservation
app.put('/api/user/reservations/:idReservation/cancel', (req, res) => {
    const userId = req.user.idUser;
    const idReservation = req.params.idReservation;

    // Checks if user has that said reservation
    const checkReservationQuery = 'SELECT * FROM reservation WHERE idReservation = ? AND userId = ? AND status = 1'; // Check if reservation exists and is active
    connection.query(checkReservationQuery, [idReservation, userId], (error, results) => {
        if (error) {
            console.error("Erreur lors de la vérification de la réservation de l'utilisateur :", error);
            res.status(500).json({ message: "Erreur lors de la vérification de la réservation de l'utilisateur." });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Réservation non trouvée." });
            }

            // Changes reservation status to 0 to cancel it
            const cancelReservationQuery = 'UPDATE reservation SET status = 0 WHERE idReservation = ?';
            connection.query(cancelReservationQuery, [idReservation], (error) => {
                if (error) {
                    console.error("Erreur lors de l'annulation de la réservation :", error);
                    res.status(500).json({ message: "Erreur lors de l'annulation de la réservation." });
                } else {
                    res.status(200).json({ message: "Réservation annulée avec succès." });
                }
            });
        }
    });
});


// app.listen(3001, () =>{
//     console.log("Server started on port 3001");
// });

module.exports = app;