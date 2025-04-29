const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

// Pour lire les fichiers statiques (CSS, images)
app.use(express.static('public'));

// Pour utiliser EJS comme moteur de template
app.set('view engine', 'ejs');

// Middleware pour lire les données du formulaire
app.use(express.urlencoded({ extended: true }));

// Configure Multer pour gérer l'upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { matricule, date } = req.body;
    const dir = path.join(__dirname, 'uploads', matricule, date);

    // Créer le dossier s’il n'existe pas
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route GET : page d’accueil
app.get('/', (req, res) => {
  res.render('index');
});

// Route POST : traitement du formulaire
app.post('/upload', upload.array('photos', 10), (req, res) => {
  res.send('✅ Photos ajoutées avec succès ! <a href="/">Retour</a>');
});

// Route GET : voir toutes les photos
app.get('/gallery', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const data = [];

  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach(matricule => {
      const carDir = path.join(uploadsDir, matricule);
      fs.readdirSync(carDir).forEach(date => {
        const dateDir = path.join(carDir, date);
        const photos = fs.readdirSync(dateDir).map(file => ({
          url: `/uploads/${matricule}/${date}/${file}`,
          file,
          date,
          matricule
        }));
        data.push(...photos);
      });
    });
  }

  res.render('gallery', { data });
});

// Sert les photos depuis le dossier "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
