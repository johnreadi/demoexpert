#!/usr/bin/env node

/**
 * Script de test pour l'envoi d'email PHP native
 * Compatible o2Switch - Démolition Expert
 */

import PhpNativeEmailService from './src/services/PhpNativeEmailService.js';

async function testEmailService() {
  console.log('🚀 Test du service d\'email PHP native...\n');

  const emailService = new PhpNativeEmailService();

  // Test 1: Email de bienvenue
  console.log('📧 Test 1: Email de bienvenue');
  const welcomeResult = await emailService.sendEmail({
    to: 'test@example.com',
    subject: 'Bienvenue chez Démolition Expert',
    html: emailService.getWelcomeTemplate('Jean Dupont', 'jean.dupont@example.com')
  });

  console.log('✅ Résultat:', welcomeResult.success ? 'SUCCÈS' : 'ÉCHEC');
  if (welcomeResult.messageId) {
    console.log('📨 Message-ID:', welcomeResult.messageId);
  }
  if (welcomeResult.error) {
    console.log('❌ Erreur:', welcomeResult.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Notification de contact
  console.log('📧 Test 2: Notification de contact');
  const contactData = {
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    phone: '01 23 45 67 89',
    subject: 'Demande de devis',
    message: 'Bonjour, je souhaite un devis pour une pièce automobile.'
  };

  const contactResult = await emailService.sendEmail({
    to: 'admin@demolition-expert.com',
    subject: 'Nouveau message de contact',
    html: emailService.getContactNotificationTemplate(contactData)
  });

  console.log('✅ Résultat:', contactResult.success ? 'SUCCÈS' : 'ÉCHEC');
  if (contactResult.messageId) {
    console.log('📨 Message-ID:', contactResult.messageId);
  }
  if (contactResult.error) {
    console.log('❌ Erreur:', contactResult.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Email simple
  console.log('📧 Test 3: Email simple');
  const simpleResult = await emailService.sendEmail({
    to: 'client@example.com',
    subject: 'Test simple',
    text: 'Ceci est un test d\'envoi d\'email via PHP native.'
  });

  console.log('✅ Résultat:', simpleResult.success ? 'SUCCÈS' : 'ÉCHEC');
  if (simpleResult.messageId) {
    console.log('📨 Message-ID:', simpleResult.messageId);
  }
  if (simpleResult.error) {
    console.log('❌ Erreur:', simpleResult.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Résumé
  console.log('📊 RÉSUMÉ DU TEST:');
  console.log('✅ Email bienvenue:', welcomeResult.success ? 'OK' : 'ÉCHEC');
  console.log('✅ Email contact:', contactResult.success ? 'OK' : 'ÉCHEC');
  console.log('✅ Email simple:', simpleResult.success ? 'OK' : 'ÉCHEC');

  const allSuccess = welcomeResult.success && contactResult.success && simpleResult.success;
  console.log('\n🎯 RÉSULTAT GLOBAL:', allSuccess ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ QUELQUES ÉCHECS');

  if (allSuccess) {
    console.log('\n🎉 Le service d\'email PHP native fonctionne parfaitement !');
    console.log('📝 Prêt pour la production sur o2Switch.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
    console.log('🔧 Consultez les logs pour plus de détails.');
  }
}

// Gestion des erreurs
testEmailService().catch((error) => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
