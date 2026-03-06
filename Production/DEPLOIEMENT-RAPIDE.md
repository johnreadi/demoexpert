# 🚀 DÉMARRAGE RAPIDE - DÉMOLITION EXPERT o2SWITCH

## ⚡ **DÉPLOIEMENT EN 5 MINUTES**

---

## 📋 **PRÉ-REQUIS**

### ✅ **Compte o2Switch**
- Hébergement actif
- Accès cPanel
- Domaine configuré

### ✅ **Fichiers prêts**
- Tous les fichiers de `Production/` uploadés
- Structure respectée

---

## 🎯 **ÉTAPES DE DÉPLOIEMENT**

### **MINUTE 1 : Connexion cPanel**
```bash
# 1. Allez sur https://votre-domaine.com:2083
# 2. Connectez-vous avec vos identifiants o2Switch
```

### **MINUTE 2 : Base de données**
```bash
# 1. cPanel → "Bases de données MySQL"
# 2. Créer base : demolition_expert
# 3. Créer utilisateur : demolition_user
# 4. Attribuer tous les privilèges
# 5. Noter le mot de passe créé
```

### **MINUTE 3 : Import schéma**
```bash
# 1. cPanel → "phpMyAdmin"
# 2. Sélectionner demolition_expert
# 3. "Importer" → Choisir database_schema.sql
# 4. "Exécuter"
```

### **MINUTE 4 : Configuration Node.js**
```bash
# 1. cPanel → "Configuration Node.js"
# 2. Domaine : votre-domaine.com
# 3. Version : Node.js 18
# 4. Script d'application : Back-end/dist/server.js
# 5. Port d'application : 3001
# 6. Variables d'environnement :
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=demolition_expert
DB_USER=demolition_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL
JWT_SECRET=VOTRE_SECRET_32_CHARS
FRONTEND_URL=https://votre-domaine.com
EMAIL_METHOD=php_native
EMAIL_FROM=noreply@votre-domaine.com
# 7. "Sauvegarder"
```

### **MINUTE 5 : Démarrage**
```bash
# 1. cPanel → "Configuration Node.js"
# 2. Cliquer sur "Exécuter le script"
# 3. Attendre le démarrage
```

---

## ✅ **VÉRIFICATION RAPIDE**

### **Test API :**
```bash
curl https://votre-domaine.com/Back-end/api/health
# Résultat attendu : {"success": true, "message": "API opérationnelle"}
```

### **Test Frontend :**
```bash
# Navigateur : https://votre-domaine.com
# Doit afficher la page d'accueil
```

### **Test Email PHP native :**
```bash
# Via SSH o2Switch
ssh votre-utilisateur@votre-domaine.com
php -r "mail('test@example.com', 'Test Démolition Expert', 'Email de test'); echo 'Email envoyé';"
```

---

## 🌐 **URLS DE PRODUCTION**

| Service | URL | État |
|---------|-----|-------|
| **Frontend** | `https://votre-domaine.com` | ✅ Prêt |
| **API Backend** | `https://votre-domaine.com/Back-end/api/*` | ✅ Prêt |
| **Admin** | `https://votre-domaine.com/admin` | ✅ Prêt |

---

## 👤 **CONNEXION**

### **Compte Admin :**
- **Email** : `admin@expert.fr`
- **Mot de passe** : `password123`

### **Compte Staff :**
- **Email** : `jean.dupont@expert.fr`
- **Mot de passe** : `password123`

---

## 📧 **EMAIL PHP NATIVE**

### ✅ **Configuration :**
- **Méthode** : PHP native (pas de SMTP)
- **Expéditeur** : `noreply@votre-domaine.com`
- **Templates** : Automatiques

### ✅ **Test :**
```bash
# Inscription utilisateur
# Vérifier réception email bienvenue

# Formulaire contact
# Vérifier notification admin
```

---

## ⚠️ **EN CAS DE PROBLÈME**

### **Logs à vérifier :**
```bash
# cPanel → "Configuration Node.js" → "Logs"
# /var/log/exim_mainlog (emails)
# /var/log/php/error_log (PHP)
```

### **Support :**
- ✅ Guide complet : `README-o2switch.md`
- ✅ Email PHP : `EMAIL-PHP-NATIVE-README.md`
- ✅ Vérification : `verification-finale.sh`

---

## 🎉 **DÉPLOIEMENT RÉUSSI !**

### ✅ **Application fonctionnelle :**
- 🚀 **Node.js/React** opérationnel
- 📧 **Email PHP native** configuré
- ⚙️ **Optimisé** pour o2Switch
- 🔒 **Sécurisé** et monitoré

### ✅ **Prochaines étapes :**
1. **Test complet** des fonctionnalités
2. **Configuration SPF/DKIM** (optionnel)
3. **Personnalisation** des templates
4. **Mise en production** 🎉

---

## 📞 **SUPPORT ET MAINTENANCE**

### **Monitoring quotidien :**
- Vérifier logs d'erreur
- Tester envoi d'email
- Contrôler statut MySQL

### **Maintenance :**
- Backup automatique o2Switch
- Mise à jour via upload
- Monitoring via cPanel

---

**🎯 Votre plateforme Démolition Expert est maintenant en production !**

**🚀 Succès total du déploiement o2Switch !**
