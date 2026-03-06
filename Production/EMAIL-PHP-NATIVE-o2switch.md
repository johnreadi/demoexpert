# Configuration Email PHP Native - o2Switch

## 📧 Configuration des emails avec les ressources PHP du système

o2Switch fournit une fonction `mail()` PHP native qui peut être utilisée sans configuration SMTP externe.

### ✅ Avantages de la solution PHP native :

- **Aucune dépendance externe** (SMTP tiers)
- **Configuration automatique** par o2Switch
- **Pas de limite d'envoi** (selon votre quota)
- **Intégration parfaite** avec cPanel
- **Headers personnalisables**
- **Support SPF/DKIM** automatique

### ⚙️ Configuration requise sur o2Switch :

#### 1. **Vérification de la fonction mail()**
```bash
# Test rapide via SSH
ssh votre-utilisateur@votre-domaine.com
php -r "mail('test@example.com', 'Test', 'Message de test'); echo 'Email envoyé';"
```

#### 2. **Configuration DNS (optionnel)**
Dans cPanel → Zone Editor :
```
Type: TXT
Nom: @
Valeur: "v=spf1 include:_spf.o2switch.net ~all"
```

#### 3. **Variables d'environnement**
```env
# .env (Back-end)
EMAIL_METHOD=php_native
EMAIL_FROM=noreply@votre-domaine.com
EMAIL_FROM_NAME=Démolition Expert
EMAIL_REPLY_TO=contact@votre-domaine.com
```

### 🚀 Utilisation dans l'application :

#### Envoi d'email simple :
```javascript
const emailService = new PhpNativeEmailService();

await emailService.sendEmail({
  to: 'client@example.com',
  subject: 'Bienvenue !',
  html: '<h1>Bonjour !</h1><p>Votre compte a été créé.</p>'
});
```

#### Templates prédéfinis :
```javascript
// Email de bienvenue
const welcomeHtml = emailService.getWelcomeTemplate(userName, userEmail);

// Notification de contact
const contactHtml = emailService.getContactNotificationTemplate(contactData);
```

### 📊 Monitoring et logs :

#### 1. **Logs PHP**
```bash
# Via SSH
tail -f /var/log/php/error_log
tail -f /var/log/exim_mainlog  # Logs emails
```

#### 2. **cPanel - Email Deliverability**
- cPanel → "Email Deliverability"
- Vérification SPF/DKIM
- Test d'envoi d'email

#### 3. **Logs applicatifs**
```javascript
// Dans votre code
console.log('📧 Email envoyé via PHP native');
console.log('📨 Destinataire:', to);
console.log('📝 Sujet:', subject);
```

### 🔧 Configuration avancée :

#### 1. **Headers personnalisés**
```javascript
const headers = [
  'From: Démolition Expert <noreply@votre-domaine.com>',
  'Reply-To: contact@votre-domaine.com',
  'X-Mailer: DemolitionExpert/1.0',
  'X-Priority: 3'
];
```

#### 2. **Gestion des erreurs**
```javascript
const result = await emailService.sendEmail(options);

if (result.success) {
  console.log('✅ Email envoyé:', result.messageId);
} else {
  console.error('❌ Erreur:', result.error);
  // Fallback ou notification admin
}
```

#### 3. **Queue d'emails (optionnel)**
Pour les gros volumes, vous pouvez implémenter une queue :
```javascript
// Simulation de queue
const emailQueue = [];
const BATCH_SIZE = 10;

setInterval(() => {
  if (emailQueue.length > 0) {
    const batch = emailQueue.splice(0, BATCH_SIZE);
    processBatch(batch);
  }
}, 1000);
```

### ⚠️ Limitations et précautions :

#### 1. **Quota o2Switch**
- Vérifiez votre quota d'envoi quotidien
- Évitez les spams et les abus

#### 2. **Délivrabilité**
- Configurez SPF/DKIM dans cPanel
- Utilisez des adresses d'expéditeur cohérentes
- Évitez les sujets spammy

#### 3. **Monitoring**
- Surveillez les logs d'erreur
- Testez régulièrement l'envoi
- Configurez des alertes en cas d'échec

### 📞 Support o2Switch :

Si vous rencontrez des problèmes :
1. **Test de base** : `php -r "mail('test@example.com', 'Test', 'OK');"`
2. **Logs** : `/var/log/exim_mainlog`
3. **Support** : Contactez o2Switch avec les logs

### 🎯 Recommandations finales :

✅ **Utilisez PHP native** pour la simplicité
✅ **Configurez SPF/DKIM** pour la délivrabilité
✅ **Testez régulièrement** l'envoi d'emails
✅ **Surveillez les logs** pour détecter les problèmes
✅ **Évitez les envois massifs** sans queue

---

**🎉 Votre système d'email PHP native est maintenant configuré pour o2Switch !**

- ✅ **Aucune dépendance SMTP externe**
- ✅ **Configuration automatique**
- ✅ **Intégration cPanel complète**
- ✅ **Délivrabilité optimisée**
