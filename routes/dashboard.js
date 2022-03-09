const router = require('express').Router();
const mysql = require('mysql');
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
    console.log('Connected! Dashboard');
});

// router.get('/', (req, res) => {
//     if(!req.session.loggedin) return res.redirect('/login');

//     req.session.pagetitle = 'dashboard';
//     res.render('dashboard', {session: req.session});
   
// });

router.get('/', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');

    req.session.pagetitle = 'userHome';

    res.render('userHome', {session: req.session});
  
});

router.get('/userVideos', async (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');

    req.session.pagetitle = 'userVideos';
    
    const conn = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM videos WHERE uid = ${req.session.userid}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
    try {
        await conn.then((result) => {
            console.table(result);
            res.render('userVideos', { videos: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
  
});

router.get('/', async (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
   // if(req.session.username != 'admin') return res.redirect('/userHome');

    req.session.pagetitle = 'adminHome';

    //show the watchHistory of all users
    const conn = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM watchhistory`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.table(result);
                resolve(result);
            }
        });
    });
    try {
        await conn.then((result) => {
            ///console.table(result);
            res.render('userHome', { history: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
});

router.get('/adminVideos', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    if(req.session.username != 'admin') return res.redirect('/userVideos');
    req.session.pagetitle = 'adminVideos';
    const conn  = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM videos`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
    try {
        conn.then((result) => {
            console.table(result);
            res.render('adminVideos', { videos: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
});

router.get('/adminUsers', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    if(req.session.username != 'admin') return res.redirect('/userHome');
    req.session.pagetitle = 'adminUsers';
    const conn  = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
    try {
        conn.then((result) => {
            console.table(result);
            res.render('adminUsers', { users: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
  
});

module.exports = router;