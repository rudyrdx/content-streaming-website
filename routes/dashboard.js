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
    console.log('Connected! Dashboard');
});

// router.get('/', (req, res) => {
//     if(!req.session.loggedin) return res.redirect('/login');

//     req.session.pagetitle = 'dashboard';
//     res.render('dashboard', {session: req.session});
   
// });

// router.get('/', (req, res) => {
//     if(!req.session.loggedin) return res.redirect('/login');

//     req.session.pagetitle = 'userHome';

//     res.render('userHome', {session: req.session});
  
// });

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

    req.session.pagetitle = 'userHome';
    var senti = null;
    //show the watchHistory of all users
    const conn = new Promise((resolve, reject) => {
        connection.query(`select v.title, w.timestamp from videos v, watchhistory w where w.vid = v.id and w.uid = ${req.session.userid}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
              //  console.table(result);
                resolve(result);
            }
        });
        connection.query(`select sum(score) / count(score) as avg from usentiment where uid = ${req.session.userid}`, (err, result) => {
            if (err) {
                 console.log(err);
            } else {
                 req.session.sentiment = result[0].avg;
                 console.log(req.session.sentiment);
                 if(req.session.sentiment > 0.0) {
                    senti = 'positive';
               } else if (req.session.sentiment < 0.0) {
                    senti = 'negative';
               } else {
                    senti = 'neutral';
               }
               console.log(senti);
            }
       });
    });
    try {
        await conn.then((result) => {
            res.render('userHome', { history: result, session: req.session , senti: senti });
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
        connection.query(`SELECT v.id, v.title, v.description, v.location, v.createdAt, u.username from videos v, users u where v.uid = u.id`, (err, result) => {
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
        connection.query(`SELECT * FROM users where id <> ${req.session.userid}`, (err, result) => {
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

router.get('/manageUsers', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    req.session.pagetitle = 'manageUsers';
    try {
       
        res.render('manageUsers', {session: req.session });
    
    } catch (err) {
        console.log(err);
    }
  
});

router.get('/edit/:id', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    if(req.session.username != 'admin') return res.redirect('/userHome');
    req.session.pagetitle = 'editpage';
    const param = req.params.id;
    const conn  = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users where id = ${param}`, (err, result) => {
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
            res.render('edituser', { users: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
  
});

//handle delete post request of the user take the userid from params
router.post('/deleteuser', async (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    if(req.session.username != 'admin') return res.redirect('/userHome');
    const param = await req.body.id;
    const conn  = new Promise((resolve, reject) => {
        connection.query(`DELETE FROM users WHERE id = ${param}`, (err, result) => {
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
            res.redirect('adminUsers');
        });
    } catch (err) {
        console.log(err);
    }
});
//update user post request check old hash pass and new hash pass is same or not then update details
router.post('/updateuser', async (req, res) => {

});

//handle delete post request of the user take the userid from params
router.post('/deleteuserU', async (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    const param = await req.body.id;//now this is less secure but mehh
    const conn  = new Promise((resolve, reject) => {
        connection.query(`DELETE FROM users WHERE id = ${param}`, (err, result) => {
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
            res.redirect('/login');
        });
    } catch (err) {
        console.log(err);
    }
});
//update user post request check old pass and new pass is same or not then update details
router.post('/updateuserU', async (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    const param = await req.body.id;
    const oldpass = await req.body.opassword;
    const newpass = await req.body.npassword;
    const usname = await req.body.username;
    const email = await req.body.email;
    const conn  = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users where id = ${param}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
    try {
        conn.then((result) => {
            //check if old pass is same as the old pass in database
            const isMatch = bcrypt.compareSync(oldpass, result[0].password);
            if(isMatch) {
                if(req.session.email != email) {
                    connection.query(`UPDATE users SET email = '${email}' WHERE id = ${req.session.userid}`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                          
                            console.table(result);
                        }
                    });
                }
                if(req.session.username != usname) {
                    connection.query(`UPDATE users SET username = '${usname}' WHERE id = ${req.session.userid}`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                           
                            console.table(result);
                        }
                    });
                }
                req.session.username = usname;
                req.session.email = email;
                res.redirect('/dashboard/manageUsers');
            }
        });

    } catch (err) {
        console.log(err);
    }
});
router.get('/editU/:id', (req, res) => {
    if(!req.session.loggedin) return res.redirect('/login');
    if(req.session.userid != req.params.id) return res.redirect('/userHome');
    req.session.pagetitle = 'editupage';
    const param = req.params.id;
    const conn  = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users where id = ${param}`, (err, result) => {
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
            res.render('userEdit', { users: result, session: req.session });
        });
    } catch (err) {
        console.log(err);
    }
  
});

module.exports = router;