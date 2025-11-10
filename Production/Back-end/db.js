const mysql = require('mysql2/promise');

// TODO: Remplacez les valeurs ci-dessous par vos informations de connexion à la base de données MySQL
const pool = mysql.createPool({
  host: 'localhost', // ou l'adresse de votre serveur de base de données
  user: 'root', // votre nom d'utilisateur
  password: '', // votre mot de passe
  database: 'demolition_expert', // le nom de votre base de données
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Connexion au pool MySQL établie.');

// Fonction pour exécuter des requêtes SQL
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur de requête SQL:', error.message);
    // Dans un environnement de production, vous voudriez peut-être logger l'erreur différemment
    throw new Error('Erreur lors de l\'exécution de la requête à la base de données.');
  }
};

module.exports = { query };
