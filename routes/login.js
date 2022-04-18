const router = require('express').Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});
connection.getConnection((err) => {
    if (err) {
        console.log(err);
    }
    console.log('Connected! Login');
});

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/i');
    } else {
        req.session.pagetitle = 'login';
        res.render('login', { session: req.session });
    }
});

router.post('/', async (req, res) => {

    const { username, password } = await req.body;
    const conn = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users WHERE username = ?`, [username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

    try {
        await conn.then((result) => {
            if (result.length > 0) {
                const hash = result[0].password;
                const isMatch = bcrypt.compareSync(password, hash);
                if (isMatch) {
                    req.session.loggedin = true;
                    req.session.username = result[0].username;
                    req.session.email = result[0].email;
                    req.session.userid = result[0].id;
                    req.session.created_at = result[0].created_at;
                    res.redirect('/i');
                } else {
                    req.session.error = 'Wrong password';
                    res.redirect('/login');
                }
            } else {
                req.session.error = 'Username not found';
                res.redirect('/login');
            }
        })
        
    } catch (err) {
        console.log(err);
        req.session.error = 'Something went wrong';
        res.redirect('/login');
    }

});
module.exports = router;
