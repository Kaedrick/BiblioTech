const express = require('express');
const boddParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const connection = require('./database.js'); 
const { addDays } = require('date-fns');
const cron = require('node-cron');  

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
    console.log(req.body); 
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


app.get('/api/reservations', (req, res) => {
    const idBook = req.query.idBook;
    const query = `
        SELECT r.idReservation, r.idCopy, r.reservationDate
        FROM reservation r
        JOIN copy c ON r.idCopy = c.idCopy
        WHERE c.idBook = ? AND r.status = 0
    `;
    connection.query(query, [idBook], (error, results) => {
        if (error) {
            console.error("Error fetching reservations data:", error);
            res.status(500).json({ message: "Error fetching reservations data" });
        } else {
            res.status(200).json(results);
        }
    });
});

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

app.post('/api/reservations', (req, res) => {
    const { userId, idBook, reservationStartDate } = req.body;
    const reservationDate = new Date();
    const reservationEndDate = addDays(new Date(reservationStartDate), 21);

    const getAvailableCopy = `
        SELECT idCopy 
        FROM copy 
        WHERE idBook = ? AND isAvailable = 1 
        LIMIT 1
    `;

    connection.query(getAvailableCopy, [idBook], (err, results) => {
        if (err) {
            console.error("Error finding available copy:", err);
            return res.status(500).json({ message: "Error finding available copy" });
        }
        
        if (results.length === 0) {
            return res.status(400).json({ message: "No available copies for this book" });
        }

        const idCopy = results[0].idCopy;

        const insertReservationQuery = `
            INSERT INTO reservation (idCopy, userId, reservationDate, status, reservationStartDate, reservationEndDate)
            VALUES (?, ?, ?, 1, ?, ?)
        `;

        connection.query(insertReservationQuery, [idCopy, userId, reservationDate, reservationStartDate, reservationEndDate], (err, result) => {
            if (err) {
                console.error("Error creating reservation:", err);
                return res.status(500).json({ message: "Error creating reservation" });
            }

            // Schedule a job to set isAvailable to 0 when the reservation starts
            cron.schedule(new Date(reservationStartDate), () => {
                const updateCopyQuery = `
                    UPDATE copy 
                    SET isAvailable = 0 
                    WHERE idCopy = ?
                `;

                connection.query(updateCopyQuery, [idCopy], (err, updateResult) => {
                    if (err) {
                        console.error("Error updating copy availability:", err);
                    } else {
                        console.log(`Copy ${idCopy} set to unavailable for reservation`);
                    }
                });
            });

            res.status(200).json({ message: "Reservation successful", reservationId: result.insertId });
        });
    });
});

// Make the copy of a book available again (manual, admin interface)
app.post('/api/return', (req, res) => {
    const { idCopy } = req.body;

    const updateCopyQuery = `
        UPDATE copy 
        SET isAvailable = 1 
        WHERE idCopy = ?
    `;

    connection.query(updateCopyQuery, [idCopy], (err, result) => {
        if (err) {
            console.error("Error updating copy availability:", err);
            return res.status(500).json({ message: "Error updating copy availability" });
        }

        res.status(200).json({ message: "Book returned successfully and is now available" });
    });
});


app.listen(3001, () =>{
    console.log("Server started on port 3001");
});