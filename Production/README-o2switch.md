# Guide de Déploiement Spécifique o2Switch - Démolition Expert

## 🚀 Déploiement sur o2Switch

o2Switch est un hébergeur mutualisé français qui supporte Node.js via cPanel. Ce guide est spécialement adapté pour votre environnement.

## 📋 Prérequis o2Switch

### 1. Vérification de votre environnement
- **PHP** : Non requis (votre app est 100% Node.js)
- **Node.js** : o2Switch supporte Node.js 16+ et 18+
- **MySQL** : Disponible via cPanel
- **Accès** : cPanel avec permissions d'hébergement

## 🔧 Installation et Configuration

### Étape 1 : Connexion à cPanel
1. Allez sur `https://votre-domaine.com:2083` ou `https://votre-domaine.com/cpanel`
2. Connectez-vous avec vos identifiants o2Switch

### Étape 2 : Configuration de Node.js
1. Dans cPanel, allez dans **"Configuration Node.js"**
2. Sélectionnez votre domaine
3. Choisissez **Node.js version 18** (recommandé)
4. Cliquez sur **"Sauvegarder"**

### Étape 3 : Configuration de la base de données MySQL
1. Dans cPanel, allez dans **"Bases de données MySQL"**
2. Créez une nouvelle base de données : `demolition_expert`
3. Créez un utilisateur MySQL : `demolition_user`
4. Attribuez tous les privilèges à l'utilisateur sur la base
5. Notez les informations de connexion :
   - **Hôte** : `localhost`
   - **Base** : `demolition_expert`
   - **Utilisateur** : `demolition_user`
   - **Mot de passe** : [votre mot de passe]

### Étape 4 : Upload des fichiers
1. **Via FTP** (recommandé pour les gros fichiers) :
   - Utilisez FileZilla ou votre client FTP
   - Hôte : `ftp.votre-domaine.com`
   - Identifiants : ceux de votre hébergement o2Switch

2. **Via cPanel** (pour les petits fichiers) :
   - Allez dans **"Gestionnaire de fichiers"**
   - Naviguez vers `public_html/`
   - Upload des fichiers de `Production/`

### Étape 5 : Structure des fichiers sur o2Switch
```
public_html/
├── Back-end/              # API Node.js
│   ├── src/              # Code source
│   ├── dist/             # Code compilé (généré)
│   ├── package.json
│   ├── .env              # Variables d'environnement
│   └── uploads/          # Dossier uploads (créer)
├── Front-end/            # Application React
│   ├── dist/             # Build de production
│   └── ...               # Autres fichiers
├── database_schema.sql   # Schéma MySQL
└── migrate-data.js       # Script de migration
```

### Étape 6 : Installation des dépendances backend
1. Connectez-vous en SSH à votre serveur o2Switch :
   ```bash
   ssh votre-utilisateur@votre-domaine.com
   ```

2. Naviguez vers le backend :
   ```bash
   cd public_html/Back-end
   ```

3. Installez les dépendances :
   ```bash
   npm install --production
   ```

4. Build l'application :
   ```bash
   npm run build
   ```

### Étape 7 : Configuration des variables d'environnement
Créez le fichier `Back-end/.env` :
```env
NODE_ENV=production
PORT=3001

# Base de données o2Switch
DB_HOST=localhost
DB_PORT=3306
DB_NAME=demolition_expert
DB_USER=demolition_user
DB_PASSWORD=votre_mot_de_passe_mysql

# JWT
JWT_SECRET=votre_jwt_secret_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# CORS - Adaptez selon votre domaine
FRONTEND_URL=https://votre-domaine.com

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# IA Google
GOOGLE_AI_API_KEY=votre_cle_api_google

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Étape 8 : Migration des données
1. Importez le schéma MySQL :
   - Dans cPanel, allez dans **"phpMyAdmin"**
   - Sélectionnez votre base `demolition_expert`
   - Allez dans **"Importer"**
   - Choisissez `database_schema.sql`
   - Cliquez sur **"Exécuter"**

2. Exécutez la migration des données :
   ```bash
   cd public_html
   node migrate-data.js
   ```

### Étape 9 : Build du frontend
1. Installez les dépendances frontend :
   ```bash
   cd public_html/Front-end
   npm install --production
   ```

2. Build l'application :
   ```bash
   npm run build
   ```

3. Créez le fichier `.env` pour le frontend :
   ```env
   VITE_API_BASE_URL=https://votre-domaine.com/Back-end
   ```

### Étape 10 : Configuration du domaine et sous-domaine
1. **Domaine principal** : `https://votre-domaine.com` → Frontend
2. **Sous-domaine API** : Créez un sous-domaine `api.votre-domaine.com` pointant vers le même dossier

### Étape 11 : Démarrage de l'application
1. Dans cPanel, allez dans **"Configuration Node.js"**
2. Dans **"Scripts d'application"**, entrez :
   - **Script de démarrage** : `Back-end/dist/server.js`
   - **Port** : `3001` (ou le port de votre choix)
3. Cliquez sur **"Exécuter le script"**

## 🌐 Configuration DNS et Domaine

### 1. Configuration du domaine principal
- **Type** : A
- **Nom** : @
- **Valeur** : [IP de votre serveur o2Switch]

### 2. Sous-domaine API (optionnel)
- **Type** : A
- **Nom** : api
- **Valeur** : [IP de votre serveur o2Switch]

## 🔒 Sécurité o2Switch

### 1. Protection des dossiers sensibles
Dans cPanel, **"Gestionnaire de fichiers"** :
- Clic droit sur `Back-end/` → **"Modifier les permissions"**
- Permissions : `755` (rwxr-xr-x)

### 2. Protection du fichier .env
- Clic droit sur `.env` → **"Modifier les permissions"**
- Permissions : `600` (rw-------)

### 3. Headers de sécurité
o2Switch configure automatiquement les headers de sécurité de base.

## 📊 Monitoring et Logs

### 1. Logs d'erreur
- **Backend** : `Back-end/logs/error.log`
- **Accès** : Via SSH ou cPanel → "Gestionnaire de fichiers"

### 2. Logs Node.js
- Dans cPanel → "Configuration Node.js" → "Logs"

### 3. Monitoring MySQL
- Via phpMyAdmin → "Statut"

## 🚀 Démarrage et Test

### 1. Vérification de l'API
```bash
curl https://api.votre-domaine.com/api/health
# ou
curl https://votre-domaine.com/Back-end/api/health
```

### 2. Test du frontend
Ouvrez `https://votre-domaine.com` dans votre navigateur

### 3. Connexion admin
- **Email** : admin@expert.fr
- **Mot de passe** : password123

## ⚠️ Limitations o2Switch

### 1. Mémoire et CPU
- **Limite mémoire** : Généralement 512MB par processus Node.js
- **CPU** : Partagé avec d'autres utilisateurs

### 2. Stockage
- **Espace disque** : Selon votre plan d'hébergement
- **Uploads** : Surveillez la taille des fichiers uploadés

### 3. Connexions simultanées
- Limitées selon votre plan (généralement 50-100 connexions)

## 🔧 Maintenance

### 1. Redémarrage de l'application
- Dans cPanel → "Configuration Node.js" → "Redémarrer"

### 2. Mise à jour
```bash
cd public_html/Back-end
git pull  # si vous utilisez Git
npm install
npm run build
# Redémarrer via cPanel
```

### 3. Backup
- **Base de données** : Via phpMyAdmin → "Exporter"
- **Fichiers** : Via cPanel → "Sauvegardes"

## 📞 Support o2Switch

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans cPanel
2. Testez la connexion MySQL
3. Vérifiez les permissions des fichiers
4. Contactez le support o2Switch pour Node.js

## 🎯 Optimisations pour o2Switch

### 1. Variables d'environnement optimisées
```env
# Réduire la charge mémoire
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=600000

# Optimiser pour l'environnement mutualisé
NODE_OPTIONS=--max-old-space-size=256
```

### 2. Monitoring de la mémoire
Ajoutez dans votre code :
```javascript
// Log de l'utilisation mémoire
console.log('Memory Usage:', process.memoryUsage());
```

---

## ✅ Résumé pour o2Switch

**PHP 7.4** : ✅ **Non requis** - Votre application est 100% Node.js

**Node.js** : ✅ **Supporté** via cPanel avec versions 16+ et 18+

**MySQL** : ✅ **Disponible** via cPanel/phpMyAdmin

**Configuration** : Via interface cPanel graphique

**Déploiement** : Upload FTP + configuration cPanel

**Avantages o2Switch** :
- Interface française simple
- Support technique réactif
- Configuration graphique complète
- Sauvegardes automatiques

Votre application **Démolition Expert** est parfaitement compatible avec o2Switch ! 🚀
