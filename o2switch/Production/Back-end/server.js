require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./api');

const app = express();
// Le port sera fourni par Phusion Passenger (o2switch), mais nous définissons un fallback.
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmente la limite pour les images en base64
app.use(express.urlencoded({ extended: true }));

// Routes de l'API préfixées par /api
app.use('/api', apiRoutes);

// Sert les fichiers statiques de l'application React
// Le dossier 'public' contiendra le résultat de 'npm run build' du front-end
app.use(express.static(path.join(__dirname, 'public')));

// Le gestionnaire "catchall" : pour toute requête qui ne correspond pas à une route API
// ou à un fichier statique, renvoie le fichier index.html de React.
// Cela permet à React Router de gérer la navigation côté client.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
