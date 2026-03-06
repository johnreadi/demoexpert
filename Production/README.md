# Démolition Expert - Guide de déploiement en production

## Vue d'ensemble

Cette application est une plateforme complète de gestion de casse automobile avec les fonctionnalités suivantes :
- Catalogue de pièces détachées
- Système d'enchères
- Gestion des utilisateurs et authentification
- Panel d'administration
- Chat IA intégré
- Services de rachat de véhicules et enlèvement d'épaves

## Architecture

```
Production/
├── Back-end/           # API Node.js/Express + TypeScript
│   ├── src/           # Code source
│   ├── dist/          # Code compilé
│   ├── package.json   # Dépendances
│   └── .env          # Variables d'environnement
├── Front-end/         # Application React + TypeScript + Vite
│   ├── src/           # Code source
│   ├── dist/          # Build de production
│   ├── package.json   # Dépendances
│   └── index.html     # Point d'entrée
└── database_schema.sql # Schéma MySQL
```

## Prérequis

- Node.js 18+ et npm
- MySQL 8.0+
- Git

## Installation et configuration

### 1. Cloner le repository
```bash
git clone <votre-repo>
cd demolition-expert/Production
```

### 2. Configuration de la base de données

#### a. Créer la base de données
```sql
CREATE DATABASE demolition_expert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### b. Importer le schéma
```bash
mysql -u root -p demolition_expert < database_schema.sql
```

#### c. Créer un utilisateur MySQL dédié
```sql
CREATE USER 'demolition_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON demolition_expert.* TO 'demolition_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuration du backend

#### a. Installer les dépendances
```bash
cd Back-end
npm install
```

#### b. Configuration des variables d'environnement
Modifier le fichier `Back-end/.env` :
```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=demolition_expert
DB_USER=demolition_user
DB_PASSWORD=votre_mot_de_passe_securise

JWT_SECRET=votre_jwt_secret_aleatoire
JWT_EXPIRES_IN=24h

FRONTEND_URL=https://votre-domaine.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

GOOGLE_AI_API_KEY=votre_cle_api_google
```

#### c. Build et démarrage
```bash
npm run build
npm start
```

### 4. Configuration du frontend

#### a. Installer les dépendances
```bash
cd ../Front-end
npm install
```

#### b. Configuration des variables d'environnement
Créer le fichier `Front-end/.env` :
```env
VITE_API_BASE_URL=https://api.votre-domaine.com
```

#### c. Build de production
```bash
npm run build
```

### 5. Configuration du serveur web

#### Nginx (recommandé)
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend - React App
    location / {
        root /path/to/Production/Front-end/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /path/to/Production/Back-end/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    Redirect permanent / https://votre-domaine.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName votre-domaine.com

    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.pem
    SSLCertificateKeyFile /path/to/your/private.key

    # Frontend
    DocumentRoot /path/to/Production/Front-end/dist
    <Directory /path/to/Production/Front-end/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Support pour React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API Backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api

    # Uploads
    Alias /uploads /path/to/Production/Back-end/uploads
    <Directory /path/to/Production/Back-end/uploads>
        Require all granted
        ExpiresActive on
        ExpiresDefault "access plus 1 year"
    </Directory>
</VirtualHost>
```

### 6. Configuration SSL (Let's Encrypt)

```bash
# Installation de certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# ou
sudo yum install certbot python3-certbot-nginx   # CentOS/RHEL

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com
```

### 7. Services système (optionnel)

#### Créer un service systemd pour le backend
```ini
[Unit]
Description=Démolition Expert Backend API
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/Production/Back-end
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/path/to/Production/Back-end/.env

[Install]
WantedBy=multi-user.target
```

## Démarrage

1. **Démarrer le backend :**
   ```bash
   cd Production/Back-end
   npm start
   ```

2. **Démarrer le frontend :**
   Servir le dossier `Front-end/dist` avec votre serveur web

3. **Vérifier le déploiement :**
   - Frontend: https://votre-domaine.com
   - API Health: https://votre-domaine.com/api/health

## Sécurité

### Recommandations importantes

1. **Variables d'environnement :**
   - Utilisez des mots de passe forts
   - Changez le JWT_SECRET en production
   - Ne commitez jamais les fichiers .env

2. **Base de données :**
   - Créez un utilisateur MySQL dédié
   - Limitez les permissions au minimum nécessaire
   - Activez les logs d'audit

3. **Serveur :**
   - Configurez un firewall (ufw, firewalld)
   - Activez fail2ban
   - Configurez les logs de sécurité

4. **Application :**
   - Activez HTTPS uniquement
   - Configurez les headers de sécurité
   - Limitez la taille des uploads

## Monitoring et maintenance

### Logs
- Backend: `/path/to/Production/Back-end/logs/`
- Web server: `/var/log/nginx/` ou `/var/log/apache2/`
- MySQL: `/var/log/mysql/`

### Backup
```bash
# Backup de la base de données
mysqldump -u root -p demolition_expert > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup des uploads
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/Production/Back-end/uploads/
```

### Mise à jour
```bash
cd /path/to/Production
git pull origin main

# Backend
cd Back-end
npm install
npm run build
pm2 restart demolition-expert-backend

# Frontend
cd ../Front-end
npm install
npm run build
# Redémarrer le serveur web
```

## Support

En cas de problème :
1. Vérifiez les logs du backend et du serveur web
2. Testez la connexion à la base de données
3. Vérifiez les variables d'environnement
4. Consultez les erreurs dans le navigateur (console développeur)

## API Endpoints

- `GET /api/health` - Vérification de santé
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/products` - Liste des produits
- `GET /api/auctions` - Liste des enchères
- `GET /api/settings` - Paramètres du site (admin)

## Variables d'environnement importantes

| Variable | Description | Exemple |
|----------|-------------|---------|
| DB_HOST | Hôte MySQL | localhost |
| DB_USER | Utilisateur MySQL | demolition_user |
| DB_PASSWORD | Mot de passe MySQL | secure_password |
| JWT_SECRET | Secret JWT | random_string_32_chars |
| GOOGLE_AI_API_KEY | Clé API Google AI | AIzaSy... |
| SMTP_* | Configuration email | Pour notifications |

---

**Note :** Ce guide est pour un déploiement en production. Adaptez les chemins et configurations selon votre environnement.
