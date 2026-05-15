const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/music', express.static('music_uploads'));
app.use('/covers', express.static('covers'));

if (!fs.existsSync('music_uploads')) {
    fs.mkdirSync('music_uploads');
}

if (!fs.existsSync('covers')) {
    fs.mkdirSync('covers');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'music_uploads/');
    },
    filename: (req, file, cb) => {
    	cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('music'), (req, res) => {
    res.redirect('/');
});

app.get('/songs', (req, res) => {
    fs.readdir('music_uploads', (err, files) => {
        if (err) {
            return res.status(500).json([]);
        }

        const songs = files.map(file => ({
            name: file,
            url: '/music/' + encodeURIComponent(file)
        }));

        res.json(songs);
    });
});

app.delete('/delete/:name', (req, res) => {
    const filePath = path.join(__dirname, 'music_uploads', req.params.name);

    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).send('Delete failed');
        }

        res.send('Deleted');
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});