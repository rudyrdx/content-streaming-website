const router = require('express').Router();
const { append } = require('express/lib/response');
const fs = require('fs');
const mysql = require('mysql');
var pump = require('pump')

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
     console.log('Connected! Index');
});

router.get('/i/:sort?', (req, res) => {
     //get a list of all videos from videos table as promises
     req.session.pagetitle = 'index';
     var param = req.params.sort;
     console.log(param);
     const conn = new Promise((resolve, reject) => {
         if(param == 1) {
          connection.query('SELECT * FROM videos ORDER BY createdAt DESC', (err, result) => {
               if (err) {
                    reject(err);
               } else {
                    resolve(result);
               }
          });
          
         } else if (param == 2) {
          connection.query('SELECT * FROM videos ORDER BY createdAt ASC', (err, result) => {
               if (err) {
                    reject(err);
               } else {
                    resolve(result);
               }
          });

         } else {
          connection.query('SELECT * FROM videos', (err, result) => {
               if (err) {
                    reject(err);
               } else {
                    resolve(result);
               }
          });

         }
     });
     //render the index page with the list of videos
     try {
          conn.then((result) => {
               //console.table(result);
              // var myArr = result;
               res.render('index', { videos: result, session: req.session });
          });
     } catch (err) {
          console.log(err);
     }
});

//make / video route
router.get('/video/:id', (req, res) => {
     req.session.videoId = null;
     req.session.videoPath = null;
     //get the id from the url
     const id = req.params.id;
     //get the video from the videos table as a promise
     const conn = new Promise((resolve, reject) => {
          connection.query(`SELECT * FROM videos WHERE id = ${id}`, (err, result) => {
               if (err) {
                    reject(err);
               } else {
                    resolve(result);
               }
          });
     });
     //render the video page with the video
     try {
          conn.then((result) => {
               //update session variables for the video
               req.session.videoId = id;
               req.session.videoPath = result[0].location;
               res.render('video', { video: result[0], session: req.session });
          });
     } catch (err) {
          console.log(err);
     }
     if (req.session.loggedin) {
          //insert user history into the watchHistory table 
          connection.query(`INSERT INTO watchHistory (uid, vid, timestamp) VALUES(?, ?, ?)`,
               [req.session.userid, id, new Date()]);
     }
});

//setup video streamer 
router.get("/video", async (req, res) => {

     // Ensure there is a range given for the video
     const range = req.headers.range;
     if (!range) {
          res.status(400).send("Requires Range header");
     }

     // get video stats (about 61MB)
     if (!req.session.videoPath) return res.status(400).send("No video path");

     var videoPath = `./public${req.session.videoPath}`;
     var videoSize = fs.statSync(videoPath).size;
     var CHUNK_SIZE = null;
     // Parse Range
     // Example: "bytes=32324-"
     //manage CHUNK_SIZE according to the video size
     //if video size < 5 mb, CHUNK_SIZE = 2 mb
     //if video size > 5 mb, CHUNK_SIZE = 5 mb
     if (videoSize < 5000000) {
          CHUNK_SIZE = 2000000;
     } else if (videoSize > 5000000 && videoSize < 10000000) {
          CHUNK_SIZE = 3000000;
     }
     else {
          CHUNK_SIZE = 5000000;
     }
     // CHUNK_SIZE = 10 ** 6; // 1MB
     var start = Number(range.replace(/\D/g, ""));
     const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

     // Create headers
     const contentLength = end - start + 1;
     const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
     };

     // HTTP Status 206 for Partial Content
     res.writeHead(206, headers);

     // Pipe the video
     const readStream = fs.createReadStream(videoPath, { start, end });
     
     pump(readStream, res);
     //close the read stream when the video is done
     readStream.on('end', () => {
          readStream.close();
     });

     // pump(videoStream, function(err) {
     //      console.log('pipe finished', err)
     // })
     //destroy stream when the stream is done
     // videoStream.on("end", () => {
     //      res.destroy();
     //      videoStream.destroy();
     //      console.log("stream ended");
     //      res.end();
     //      CHUNK_SIZE = null;
     //      videoPath = null;
     //      videoSize = null;
     // });

     // res.on('close', () => {
     //      res.destroy();
     //      videoStream.destroy();
     //      CHUNK_SIZE = null;
     //      videoPath = null;
     //      videoSize = null;
     //      console.log("no stream");
          
     // });
    
     // res.on('finish', () => {
     //      res.destroy();
     //      videoStream.destroy();
     //      CHUNK_SIZE = null;
     //      videoPath = null;
     //      videoSize = null;
     //      console.log('finish');
     // });
});
module.exports = router;