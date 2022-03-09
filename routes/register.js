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
    console.log('Connected! Registration');
});

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        req.session.pagetitle = 'register';
        res.render('register', { session: req.session });
    }
});

router.post('/', async (req, res) => {
    const { username, password, email } = await req.body;
    //validate the input
    if (RegExpValidate(email, username, password)) {
        const hash = bcrypt.hashSync(password, 10);
        const conn = new Promise((resolve, reject) => {
            connection.query(`INSERT INTO users (id, email, username, password, created_at) VALUES(?, ?, ?, ?, ?)`,
            [null, email, username, hash, new Date()], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        try {
            await conn.then((result) => {
                res.redirect('/login');
            })
        } catch (err) {
            console.log(err);
            switch (err.code) {
                case 'ER_DUP_ENTRY':
                    req.session.error = 'Username already exists';
                    res.redirect('/register');
                    break;
                default:
                    req.session.error = 'Something went wrong';
                    res.redirect('/register');
                    break;
            }
        }
    } else {
        req.session.error = 'Invalid input';
        res.redirect('/register');
    }
});
function RegExpValidate(email, username, password) {
    const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const usernameReg = /^[a-zA-Z0-9]{3,}$/;
    if (emailReg.test(email) && usernameReg.test(username) && passwordReg.test(password)) {
        return true;
    } else {
        return false;
    }
}
module.exports = router;