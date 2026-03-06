#!/bin/bash

# Script de déploiement automatique pour o2Switch
# Démolition Expert - Production

set -e

echo "🚀 Déploiement automatique sur o2Switch..."

# Configuration
DOMAIN="votre-domaine.com"
CPANEL_USER="votre-utilisateur-cpanel"
DB_NAME="demolition_expert"
DB_USER="demolition_user"
DB_PASS="votre_mot_de_passe_mysql"
NODE_VERSION="18"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification des prérequis
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js n'est pas installé localement${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm n'est pas installé${NC}"; exit 1; }

echo -e "${GREEN}✅ Prérequis vérifiés${NC}"

# Étape 1 : Préparation des fichiers
echo -e "${YELLOW}📦 Préparation des fichiers...${NC}"

# Créer les répertoires nécessaires
mkdir -p uploads logs

# Copier et adapter les fichiers de configuration
cp .env.example .env 2>/dev/null || echo "Fichier .env.example non trouvé"

# Demander les informations de configuration
echo ""
echo -e "${YELLOW}Configuration requise :${NC}"
read -p "Nom de domaine (ex: mon-domaine.com): " DOMAIN
read -p "Utilisateur cPanel: " CPANEL_USER
read -p "Mot de passe MySQL: " DB_PASS
read -p "Secret JWT (32 caractères min): " JWT_SECRET

# Mettre à jour le fichier .env
cat > .env << EOL
NODE_ENV=production
PORT=3001

# Base de données o2Switch
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=https://${DOMAIN}

# Configuration o2Switch
CPANEL_USER=${CPANEL_USER}
CPANEL_DOMAIN=${DOMAIN}

# Optimisations pour l'environnement mutualisé
NODE_OPTIONS=--max-old-space-size=256
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=50
EOL

echo -e "${GREEN}✅ Fichier .env configuré${NC}"

# Étape 2 : Installation des dépendances
echo -e "${YELLOW}🔧 Installation des dépendances...${NC}"

npm install --production
echo -e "${GREEN}✅ Dépendances installées${NC}"

# Étape 3 : Build de l'application
echo -e "${YELLOW}🏗️ Build de l'application...${NC}"

npm run build
echo -e "${GREEN}✅ Application buildée${NC}"

# Étape 4 : Préparation du frontend
echo -e "${YELLOW}🎨 Préparation du frontend...${NC}"

cd ../Front-end
npm install --production
npm run build

# Créer le fichier .env pour le frontend
cat > .env << EOL
VITE_API_BASE_URL=https://${DOMAIN}/Back-end
EOL

echo -e "${GREEN}✅ Frontend configuré${NC}"

# Étape 5 : Création du script de migration
echo -e "${YELLOW}📊 Préparation de la migration...${NC}"

cd ../Back-end
cat > migrate-o2switch.js << 'EOL'
#!/usr/bin/env node

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const BCRYPT_ROUNDS = 10;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'demolition_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demolition_expert'
};

async function migrate() {
  console.log('🚀 Migration des données pour o2Switch...');

  const connection = await mysql.createConnection(dbConfig);

  try {
    // Les données sont déjà dans le schéma SQL
    console.log('✅ Migration terminée - données importées via phpMyAdmin');
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
  } finally {
    await connection.end();
  }
}

migrate();
EOL

echo -e "${GREEN}✅ Script de migration créé${NC}"

# Étape 6 : Création du guide d'installation
cat > INSTALL-o2Switch.txt << EOL
================================================================
          DÉPLOIEMENT DÉMOLITION EXPERT SUR O2SWITCH
================================================================

1. CONNEXION CPANEL
   - URL: https://${DOMAIN}:2083
   - Utilisateur: ${CPANEL_USER}

2. CONFIGURATION NODE.JS
   - cPanel > Configuration Node.js
   - Domaine: ${DOMAIN}
   - Version: Node.js 18
   - Script: Back-end/dist/server.js
   - Port: 3001

3. BASE DE DONNÉES MYSQL
   - cPanel > Bases de données MySQL
   - Base: ${DB_NAME}
   - Utilisateur: ${DB_USER}
   - Mot de passe: ${DB_PASS}

4. IMPORT DU SCHÉMA
   - cPanel > phpMyAdmin
   - Base: ${DB_NAME}
   - Importer: database_schema.sql

5. UPLOAD DES FICHIERS
   - Via FTP ou cPanel
   - Dossier: public_html/

6. CONFIGURATION DOMAINE
   - Domaine: ${DOMAIN} -> Frontend
   - Sous-domaine: api.${DOMAIN} -> Backend

7. DÉMARRAGE
   - cPanel > Configuration Node.js > Exécuter

8. TEST
   - Frontend: https://${DOMAIN}
   - API: https://${DOMAIN}/Back-end/api/health

================================================================
          IDENTIFIANTS DE CONNEXION
================================================================
ADMIN:
Email: admin@expert.fr
Mot de passe: password123

STAFF:
Email: jean.dupont@expert.fr
Mot de passe: password123
================================================================
EOL

echo -e "${GREEN}✅ Guide d'installation créé${NC}"

# Étape 7 : Instructions finales
echo ""
echo -e "${GREEN}🎉 Déploiement préparé avec succès pour o2Switch!${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo "1. Upload des fichiers vers public_html/ via FTP"
echo "2. Import du schéma database_schema.sql via phpMyAdmin"
echo "3. Configuration Node.js dans cPanel"
echo "4. Démarrage de l'application"
echo ""
echo -e "${YELLOW}📖 Consultez le fichier INSTALL-o2Switch.txt pour les instructions détaillées${NC}"
echo ""
echo -e "${GREEN}🔗 URLs de production :${NC}"
echo "Frontend: https://${DOMAIN}"
echo "Backend API: https://${DOMAIN}/Back-end/api/health"
echo ""
echo -e "${YELLOW}⚠️  Important :${NC}"
echo "- PHP 7.4 n'est PAS nécessaire"
echo "- Node.js est configuré via cPanel"
echo "- MySQL est géré via phpMyAdmin"
echo "- Tous les fichiers sont optimisés pour o2Switch"
