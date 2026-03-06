# 🚀 Guide de Déploiement o2Switch - Démolition Expert

## 📋 Réponse à vos questions

### ❓ PHP 7.4 requis ?
**NON !** Votre application **Démolition Expert** est **100% Node.js** et **n'a pas besoin de PHP**.

### ❓ Installation de Node.js sur o2Switch ?
**OUI !** o2Switch supporte Node.js via cPanel avec les versions 16+ et 18+.

---

## 🎯 Déploiement Spécifique o2Switch

### Prérequis o2Switch
- ✅ **Node.js** : Supporté via cPanel (versions 16+ et 18+)
- ✅ **MySQL** : Disponible via phpMyAdmin
- ✅ **PHP** : **Non requis** pour cette application
- ✅ **cPanel** : Interface de gestion complète

### Étape 1 : Configuration cPanel
1. **Connexion** : `https://votre-domaine.com:2083`
2. **Node.js** : cPanel → "Configuration Node.js" → Version 18
3. **MySQL** : cPanel → "Bases de données MySQL" → Créer base + utilisateur

### Étape 2 : Upload des fichiers
```
public_html/
├── Back-end/           # API Node.js (port 3001)
├── Front-end/dist/     # Application React
├── database_schema.sql # Schéma MySQL
└── .htaccess          # Configuration Apache
```

### Étape 3 : Variables d'environnement
```env
# .env (Back-end)
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=demolition_user
DB_PASSWORD=votre_password_mysql
JWT_SECRET=votre_secret_32_chars
FRONTEND_URL=https://votre-domaine.com
```

### Étape 4 : Démarrage
1. cPanel → "Configuration Node.js" → Script : `Back-end/dist/server.js`
2. Cliquer sur "Exécuter le script"

### Étape 5 : Test
- **Frontend** : `https://votre-domaine.com`
- **API** : `https://votre-domaine.com/Back-end/api/health`

---

## 🔧 Configuration Optimisée o2Switch

### Fichiers créés spécifiquement :
- ✅ `README-o2switch.md` - Guide complet o2Switch
- ✅ `deploy-o2switch.sh` - Script de déploiement automatique
- ✅ `Back-end/package-o2switch.json` - Dépendances optimisées
- ✅ `Front-end/.htaccess` - Configuration Apache
- ✅ `Back-end/src/config/o2switch.ts` - Config spécifique

### Optimisations pour l'environnement mutualisé :
- 🔧 **Mémoire** : 256MB max (au lieu de 512MB)
- 🔧 **Connexions DB** : Pool réduit à 5 connexions
- 🔧 **Rate limiting** : 50 requêtes/minute
- 🔧 **Bcrypt** : 10 rounds (au lieu de 12)

---

## 📞 Support et Maintenance

### Logs o2Switch
- **Backend** : cPanel → "Configuration Node.js" → "Logs"
- **MySQL** : phpMyAdmin → "Statut"
- **Accès** : cPanel → "Métriques"

### Monitoring
- **Health check** : `/api/health`
- **Memory usage** : Logs automatiques
- **DB connections** : Monitoring intégré

---

## 🎉 Avantages o2Switch

✅ **Interface française** simple et intuitive
✅ **Support technique** réactif
✅ **Configuration graphique** complète
✅ **Sauvegardes automatiques** quotidiennes
✅ **Certificats SSL** gratuits (Let's Encrypt)
✅ **Pas de limite de temps** d'exécution
✅ **Environnement optimisé** pour Node.js

---

## ⚠️ Points d'attention o2Switch

### Limitations de l'environnement mutualisé :
- **Mémoire** : 256MB par processus Node.js
- **CPU** : Partagé avec d'autres utilisateurs
- **Connexions** : 50-100 simultanées selon votre plan
- **Stockage** : Selon votre quota d'hébergement

### Optimisations appliquées :
- 🔧 Pool de connexions MySQL réduit
- 🔧 Rate limiting adapté
- 🔧 Cache optimisé
- 🔧 Headers de sécurité configurés

---

## 🚀 Démarrage Rapide

1. **Upload** : Tous les fichiers dans `public_html/`
2. **Base de données** : Import `database_schema.sql` via phpMyAdmin
3. **Node.js** : Configuration via cPanel → Node.js 18
4. **Démarrage** : Script `Back-end/dist/server.js` sur port 3001
5. **Test** : Vérifiez `https://votre-domaine.com`

---

**🎯 Votre application Démolition Expert est parfaitement optimisée pour o2Switch !**

- ✅ **PHP non requis**
- ✅ **Node.js supporté**
- ✅ **Configuration simple via cPanel**
- ✅ **Performance optimisée**
- ✅ **Sécurité renforcée**
