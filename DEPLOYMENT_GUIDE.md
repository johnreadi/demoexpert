# 🚀 Guide de Déploiement - Demoexpert avec Backend PostgreSQL

## 📋 **Architecture**

- **Frontend** : React + Vite + TypeScript (Nginx)
- **Backend** : Node.js + Express + Prisma
- **Base de données** : PostgreSQL 15
- **Déploiement** : Docker + Dokploy

---

## 1️⃣ **Prérequis**

- Serveur avec Dokploy installé
- Domaine configuré : `app.demoexpert.fr`
- Variables d'environnement à définir

---

## 2️⃣ **Déploiement sur Dokploy**

### **Option A : Via Dokploy UI**

1. Créez un nouveau projet "demoexpert"
2. Ajoutez le repository GitHub
3. Configurez les variables d'environnement :
   ```
   DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
   SESSION_SECRET=VOTRE_SECRET_SESSION
   CORS_ORIGIN=https://app.demoexpert.fr
   ```
4. Sélectionnez `docker-compose.prod.yml`
5. Déployez !

### **Option B : Commandes manuelles**

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE_USERNAME/demoexpert.git
cd demoexpert

# 2. Créer fichier .env
cat > .env <<EOF
DB_PASSWORD=CHANGEME_SECURE_PASSWORD
SESSION_SECRET=CHANGEME_RANDOM_STRING
CORS_ORIGIN=https://app.demoexpert.fr
EOF

# 3. Build et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f backend

# 5. Vérifier la santé
curl http://localhost:8085/api/healthz
curl http://localhost:8085/api/db/health
```

---

## 3️⃣ **Configuration Nginx (Reverse Proxy)**

Ajoutez cette configuration pour router `/api` vers le backend :

```nginx
server {
    listen 80;
    server_name app.demoexpert.fr;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4️⃣ **Base de données PostgreSQL**

### **Migrations initiales**

Les migrations Prisma s'exécutent automatiquement au démarrage du backend :

```bash
# Vérifier les migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Appliquer manuellement si nécessaire
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### **Seed data (optionnel)**

```bash
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

### **Accès direct à la base**

```bash
docker-compose -f docker-compose.prod.yml exec db psql -U demoexpert -d demoexpert
```

---

## 5️⃣ **Vérifications post-déploiement**

```bash
# 1. Backend health
curl https://app.demoexpert.fr/api/healthz
# Résultat attendu : {"status":"ok","env":"production"}

# 2. Database health
curl https://app.demoexpert.fr/api/db/health
# Résultat attendu : {"ok":true}

# 3. Settings API
curl https://app.demoexpert.fr/api/settings
# Résultat attendu : JSON avec DEFAULT_SETTINGS

# 4. Frontend
curl https://app.demoexpert.fr/
# Résultat attendu : HTML de React
```

---

## 6️⃣ **Créer un admin initial**

```bash
# Connexion au conteneur backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Créer un admin via Prisma
npx prisma studio
# OU via psql :
docker-compose -f docker-compose.prod.yml exec db psql -U demoexpert -d demoexpert

# Dans psql:
INSERT INTO "User" (id, name, email, role, status, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Admin',
  'admin@demoexpert.fr',
  'Admin',
  'approved',
  '$2a$10$HASHED_PASSWORD_HERE',
  NOW(),
  NOW()
);
```

**Générer un hash bcrypt** :
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('votre_mot_de_passe', 10));"
```

---

## 7️⃣ **Maintenance**

### **Backups PostgreSQL**

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U demoexpert demoexpert > backup_$(date +%Y%m%d).sql

# Restauration
docker-compose -f docker-compose.prod.yml exec -T db psql -U demoexpert demoexpert < backup.sql
```

### **Logs**

```bash
# Backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Database
docker-compose -f docker-compose.prod.yml logs -f db

# Frontend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### **Redémarrage**

```bash
# Tout redémarrer
docker-compose -f docker-compose.prod.yml restart

# Juste le backend
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 8️⃣ **Mise à jour (Pull & Rebuild)**

```bash
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 **Sécurité**

### **Variables d'environnement sécurisées**

- `DB_PASSWORD` : Mot de passe fort (20+ caractères, alphanumériques + symboles)
- `SESSION_SECRET` : Chaîne aléatoire (32+ caractères)
- Ne jamais commiter `.env` sur Git

### **HTTPS obligatoire**

- Utilisez Let's Encrypt via Dokploy
- `COOKIE_SECURE=true` force HTTPS pour les cookies
- `TRUST_PROXY=1` pour X-Forwarded headers

---

## 🐛 **Troubleshooting**

### **Backend ne démarre pas**

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs backend

# Vérifier DATABASE_URL
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

### **Frontend affiche "Erreur lors de l'envoi"**

```bash
# Vérifier que VITE_USE_LOCAL_API=false
docker-compose -f docker-compose.prod.yml exec frontend env | grep VITE

# Vérifier routing Nginx
curl -I https://app.demoexpert.fr/api/healthz
```

### **Base de données inaccessible**

```bash
# Vérifier que le conteneur tourne
docker-compose -f docker-compose.prod.yml ps db

# Tester connexion
docker-compose -f docker-compose.prod.yml exec db pg_isready -U demoexpert
```

---

## 📊 **Monitoring**

### **Santé des services**

```bash
# Script de monitoring
curl -f https://app.demoexpert.fr/api/healthz && echo "✅ Backend OK" || echo "❌ Backend DOWN"
curl -f https://app.demoexpert.fr/api/db/health && echo "✅ Database OK" || echo "❌ Database DOWN"
curl -f https://app.demoexpert.fr/ && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"
```

---

## ✅ **Checklist déploiement**

- [ ] Variables d'environnement configurées
- [ ] DNS pointant vers le serveur
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Backend déployé et accessible (`/api/healthz`)
- [ ] Base de données initialisée (`/api/db/health`)
- [ ] Frontend déployé et accessible (`/`)
- [ ] Admin créé dans la base
- [ ] Formulaires testés (envoi fonctionne)
- [ ] Backups configurés

---

**🎉 Votre application demoexpert est maintenant en production avec un vrai backend PostgreSQL !**
