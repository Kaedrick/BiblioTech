const connection = require('./database.js'); 
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;

module.exports = function(passport) {   
    passport.use(
        new localStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },  (email, password, done) => {
            const query = "SELECT * FROM user WHERE email = ?";
            
            connection.query(query, [email], (err, rows) => {
                if(err)throw err;  
                if(rows.length === 0) {
                    return done(null, false, {message : 'Invalid Email'});
                }
                bcrypt.compare(password, rows[0].password, (err, result) => {
                    if (err) throw err;
                    if (result === true) {
                        return done(null, rows[0]);
                    } 
                    else {
                        return done(null, false, { message: 'Invalid Password' });
                    }
                })
            })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.idUser);
    })

    passport.deserializeUser((id, done) => {
        const query = "SELECT * FROM user WHERE id = ?";
        connection.query(query, [id], (err, rows) => {
            if(err) throw{err};
            const userInfo = {
                id: rows[0].idUser,
                idRole: rows[0].idRole,
                email: rows[0].email,
                firstname: rows[0].firstname,
                lastname: rows[0].lastname,
                emailConfirm: rows[0].emailConfirm,
                verified: rows[0].verified,
                strike: rows[0].strike
            }
            done(null, userInfo);
        })
    });
}
