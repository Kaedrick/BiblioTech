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
const cron = require('node-cron');  
const moment = require('moment');

app.use(boddParser.json());
app.use(boddParser.urlencoded({ extended: true }));
app.use(expressSession({ secret : 'mySecretKey', resave:false, saveUninitialized: false }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cookieParser('mySecretKey'));

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.get('/inscription', checkNotAuthenticated, (req, res) => {
    res.render('inscription');
});

app.post('/inscription', checkNotAuthenticated,  (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    const query = "INSERT INTO user (`email`, `password`, `firstname`, `lastname`) VALUES (?, ?, ?, ?)"
    const query2 = "SELECT * FROM user WHERE email = ?"; // Checking if email exists

    connection.query(query2, [email], (err, result) => {
        if(err) {throw err;}
        if(result.length > 0) { // If result.length > 0, then email exists
            return res.status(409).send({message: "Adresse mail déjà inscrite."})
        }
        if(result.length === 0) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            connection.query(query, [email, hashedPassword, firstname, lastname], (err, result) => {
                if(err) throw {err};
                res.send({message : "Utilisateur créé."});
            })
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
        // Requête à la base de données pour récupérer les réservations pour ce livre
        const query = `
            SELECT reservationStartDate, reservationEndDate
            FROM reservation
            WHERE idBook = ? AND status = 1
        `;
        const reservations = await new Promise((resolve, reject) => {
            connection.query(query, [idBook], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        // Requête pour récupérer la quantité de livres disponibles
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

        // Traitement des réservations pour générer les dates réservées
        const dateCountMap = new Map();
        reservations.forEach((reservation) => {
            let currentDate = moment(reservation.reservationStartDate);
            const endDate = moment(reservation.reservationEndDate);
            while (currentDate <= endDate) {
                const dateString = currentDate.format('YYYY MM DD');
                dateCountMap.set(dateString, (dateCountMap.get(dateString) || 0) + 1);
                currentDate.add(1, 'day');
            }
        });

        // Envoi des dates réservées et de la quantité disponible en réponse
        res.status(200).json({
            reservedDates: Array.from(dateCountMap),
            availableQuantity: quantity - reservations.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des dates réservées :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des dates réservées" });
    }
});

app.post('/api/books/reservations', async (req, res) => {
    const { userId, idBook, reservationStartDate } = req.body;
    const reservationEndDate = moment(reservationStartDate).add(21, 'days').format('YYYY-MM-DD'); // Ajout de 21 jours à la date de début de réservation

    try {
        // Vérification de la disponibilité des exemplaires du livre
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

        // Vérification si le nombre de réservations est inférieur à la quantité disponible
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

        // Création de la réservation
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



// Make the copy of a book available again (manual, admin interface) - MODIFY !!
app.post('/api/return', (req, res) => {
    // REDO WITHOUT TABLE COPY : SIMPLY CHANGE QUANTITY!
});

app.get('/api/current_user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'User not authenticated' });
    }
  });

app.get('/api/books/available-copies', (req, res) => {
    // REDO WITHOUT IDCOPY
});


app.get('/getUserID', (req, res) => {
    const userID = req.user.idUser;
    res.json({ userID });
});


app.listen(3001, () =>{
    console.log("Server started on port 3001");
});