const express = require('express');
const cors = require('cors');
const { query } = require('./db');

const app = express();
const port = process.env.PORT || 3001; // Port pour le serveur back-end

// Middlewares
app.use(cors()); // Autorise les requêtes cross-origin (depuis votre front-end)
app.use(express.json()); // Pour parser le corps des requêtes en JSON

// Route de test pour les produits
app.get('/api/products', async (req, res) => {
  try {
    // La requête SQL sélectionne toutes les colonnes de la table 'products'
    // Assurez-vous que votre table s'appelle bien 'products'
    const products = await query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des produits.' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur back-end démarré sur http://localhost:${port}`);
});
