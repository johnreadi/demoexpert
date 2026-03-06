#!/bin/bash

# Démolition Expert - Script de déploiement
# Ce script configure l'environnement de production

set -e

echo "🚀 Démarrage du déploiement de Démolition Expert..."

# Variables de configuration
PROJECT_NAME="demolition-expert"
BACKEND_DIR="./Production/Back-end"
FRONTEND_DIR="./Production/Front-end"
DB_SCHEMA="./Production/database_schema.sql"

# Vérifier les prérequis
command -v node >/dev/null 2>&1 || { echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo "❌ MySQL n'est pas installé. Veuillez l'installer d'abord."; exit 1; }

echo "✅ Prérequis vérifiés"

# Configuration de la base de données
echo "📊 Configuration de la base de données..."
if [ -f "$DB_SCHEMA" ]; then
    echo "📄 Création du schéma de base de données..."
    mysql -u root -p < "$DB_SCHEMA"
    echo "✅ Schéma de base de données créé"
else
    echo "⚠️  Fichier de schéma non trouvé: $DB_SCHEMA"
fi

# Installation et build du backend
echo "🔧 Installation et build du backend..."
cd "$BACKEND_DIR"
npm install
npm run build
echo "✅ Backend installé et buildé"

# Installation et build du frontend
echo "🎨 Installation et build du frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build
echo "✅ Frontend installé et buildé"

# Configuration des variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."

# Créer le fichier .env de production pour le backend
cat > "$BACKEND_DIR/.env.production" << EOL
# Configuration de production
NODE_ENV=production
PORT=5000

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=demolition_expert
DB_USER=demolition_user
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_production_jwt_secret_change_this
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=https://yourdomain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# IA Google
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOL

# Créer le fichier .env pour le frontend
cat > "$FRONTEND_DIR/.env.production" << EOL
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME="Démolition Expert"
VITE_APP_VERSION="1.0.0"
EOL

echo "✅ Variables d'environnement configurées"

# Instructions de déploiement
echo ""
echo "🎉 Déploiement préparé avec succès!"
echo ""
echo "📋 Étapes suivantes:"
echo "1. Configurez votre serveur web (Nginx/Apache)"
echo "2. Configurez SSL avec Let's Encrypt"
echo "3. Mettez à jour les variables d'environnement avec vos vraies valeurs"
echo "4. Configurez la base de données MySQL avec les identifiants corrects"
echo "5. Démarrez le backend: cd $BACKEND_DIR && npm start"
echo "6. Servez le frontend depuis $FRONTEND_DIR/dist"
echo ""
echo "📁 Structure de production créée:"
echo "├── Production/"
echo "│   ├── Back-end/          # API Node.js/Express"
echo "│   ├── Front-end/         # Application React"
echo "│   └── database_schema.sql # Schéma MySQL"
echo ""
echo "🔗 URLs de production:"
echo "Frontend: https://yourdomain.com"
echo "Backend API: https://api.yourdomain.com"
