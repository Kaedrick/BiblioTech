const express = require('express');
const boddParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const connection = require('./database.js'); 

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

app.post('/inscription', (req, res) => {
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

app.post('/connexion', (req, res, next) => {
    console.log(req.body); 
    passport.authenticate('local', (err, user, info) => {
        if(err) {return console.log(err);}
        if(!user) {
            // Si aucun utilisateur n'est trouvé, vérifiez si c'est dû à un mauvais e-mail
            // ou à un mauvais mot de passe.
            if(info && info.message === 'Invalid Email') {
                return res.status(401).send('Adresse e-mail incorrecte.');
            }
            if(info && info.message === 'Invalid Password') {
                return res.status(402).send('Mot de passe incorrect.');
            }
            // Si l'utilisateur est null et aucune info n'est disponible, renvoyer une erreur générale.
            return res.status(403).send('Erreur d\'authentification.');
        }
        // Si l'utilisateur est trouvé et authentifié avec succès, loggez-le.
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

app.listen(3001, () =>{
    console.log("Server started on port 3001");
});