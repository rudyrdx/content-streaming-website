const router = require('express').Router();
const mime = require('mime-types');
const fs = require('fs');
const mysql = require('mysql');
var exec = require('child_process').exec;

//'video.mp4', 'snapshot.png', '00:00:22', '200x125'
//make this function a promise
function makeThumb(path, destPath, time, size) {
    return new Promise((resolve, reject) => {
        if (time == null) {
            time = '00:00:01';
        }
        if (size == null) {
            size = '200x125';
        }
        // return exec('ffmpeg -ss ' + time + ' -i ' + path + ' -y -s ' + size + ' -vframes 1 -f image2 ' + destPath, function (err) {
        //     if (callback) {
        //         return callback(err);
        //     }
        // });
        exec(`ffmpeg -i ${path} -ss ${time} -s ${size} -vframes 1 ${destPath}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}
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
    console.log('Connected! Upload');
});

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        req.session.pagetitle = 'upload';
        res.render('upload', { session: req.session });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/', async (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        req.session.error = 'No files were uploaded.';
        return res.redirect('/upload')
    }
    else {
        //calculate upload progress
        const total = req.files.file.size;
        const current = req.files.file.data.length;
        const progress = Math.round((current / total) * 100);
        //send progress to client
        req.session.progress = progress;
        //save file to server
        const { title, description, tags } = await req.body;
        //console.table(req.files);
        //check if mimetype is video or not 
        const mimetype = mime.lookup(req.files.file.name);
        if (!mimetype.includes('video')) {
            req.session.error = 'Only video files are allowed';
            return res.redirect('/upload');
        }
        const file = req.files.file;
        var filename = file.name;
        //replace every space with underscore
        filename = filename.replace(/\s/g, '_');

        const size = file.size;
        //random string to prevent file name collision
        const random = Math.random().toString(36).substring(2, 9) + Math.random().toString(10).substring(2, 9);

        //check if path exists and upload file to path
        var path = null;
        const pathCheck = `public/uploads/${req.session.userid}/`;
        if (fs.existsSync(pathCheck)) {
            path = `./public/uploads/${req.session.userid}/${random + filename}`;
        }
        else {
            //create path
            fs.mkdirSync(pathCheck, { recursive: true });
            path = `./public/uploads/${req.session.userid}/${random + filename}`;
        }
        file.mv(path, async (err) => {
            if (err) {
                req.session.error = 'File upload failed';
                return res.redirect('/upload');
            }
            const thumbPath = `./public/uploads/${req.session.userid}/${random}_thumb.png`;

            //wait for the thumbnail to be made
            await makeThumb(path, thumbPath, null, null, (err) => { if (err) throw err; });
            
            if (!fs.existsSync(`./public/uploads/${req.session.userid}/${random}_thumb.png`, { recursive: true })) {
                req.session.error = 'Thumbnail creation failed';
                return res.redirect('/upload');
            }

            const conn = new Promise((resolve, reject) => {
                const newPath = `/uploads/${req.session.userid}/${random + filename}`;
                const newThumbPath = `/uploads/${req.session.userid}/${random}_thumb.png`;
                connection.query(`INSERT INTO videos (id, uid, title, location, thumbnail, size, description, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
                    [null, req.session.userid, title, newPath, newThumbPath, size, description, new Date()], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
            });
            try {
                await conn.then((result) => {
                    req.session.success = 'Video uploaded successfully';
                    res.redirect('/upload');
                });
            } catch (err) {
                console.log(err);
                req.session.error = 'Something went wrong after uploading';
                res.redirect('/upload');
            }
        });
    }
});

module.exports = router;