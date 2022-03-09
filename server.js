const express = require('express');
const app = express();
const fileupload = require('express-fileupload');
app.set('view engine', 'ejs');
app.use(require('express-ejs-layouts'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

const session = require('express-session');
app.use(session({
    secret: 'asdjb@hjqasdb1823kjmasbned#@#',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const dashboardRouter = require('./routes/dashboard');
const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');

app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/dashboard', dashboardRouter);
app.use('/upload', uploadRouter);
app.use('/', indexRouter);

app.get('/logout', (req, res) => {
    if(req.session.loggedin) {
        req.session.destroy(() => {
            res.redirect('/i');
        })
    }
   
});

app.listen(3000, _ => console.log('Server started on port 3000'));

