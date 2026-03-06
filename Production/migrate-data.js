#!/usr/bin/env node

/**
 * Script de migration des données mockées vers MySQL
 * Démolition Expert - Production
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BCRYPT_ROUNDS = 12;

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demolition_expert'
};

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    return connection;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function migrateUsers(connection) {
  console.log('👥 Migration des utilisateurs...');

  const users = [
    {
      id: uuidv4(),
      name: 'Admin Expert',
      email: 'admin@expert.fr',
      password: await hashPassword('password123'),
      role: 'Admin',
      status: 'approved'
    },
    {
      id: uuidv4(),
      name: 'Jean Dupont',
      email: 'jean.dupont@expert.fr',
      password: await hashPassword('password123'),
      role: 'Staff',
      status: 'approved'
    },
    {
      id: uuidv4(),
      name: 'Marie Curie',
      email: 'marie.curie@expert.fr',
      password: await hashPassword('password123'),
      role: 'Staff',
      status: 'pending'
    }
  ];

  for (const user of users) {
    await connection.execute(
      'INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.password, user.role, user.status]
    );
  }

  console.log(`✅ ${users.length} utilisateurs migrés`);
  return users;
}

async function migrateCategories(connection) {
  console.log('📂 Migration des catégories...');

  const categories = [
    { id: uuidv4(), name: 'Mécanique' },
    { id: uuidv4(), name: 'Électricité' },
    { id: uuidv4(), name: 'Carrosserie' },
    { id: uuidv4(), name: 'Autre' }
  ];

  for (const category of categories) {
    await connection.execute(
      'INSERT INTO part_categories (id, name) VALUES (?, ?)',
      [category.id, category.name]
    );
  }

  console.log(`✅ ${categories.length} catégories migrées`);
  return categories;
}

async function migrateProducts(connection, categories, users) {
  console.log('🔧 Migration des produits...');

  const products = [];
  const brands = ['Renault', 'Peugeot', 'Citroën'];
  const models = ['Clio', '208', 'C3'];
  const categoryNames = ['Mécanique', 'Électricité', 'Carrosserie'];

  for (let i = 0; i < 50; i++) {
    const category = categories[i % categories.length];
    const product = {
      id: uuidv4(),
      name: `Alternateur ${brands[i % 3]} ${models[i % 3]}`,
      oem_ref: `REF${8200660035 + i}`,
      brand: brands[i % 3],
      model: models[i % 3],
      year: 2015 + (i % 8),
      category_id: category.id,
      price: 50 + (i * 5) % 150,
      condition: i % 3 === 0 ? 'Bon état' : 'Occasion',
      warranty: '3 mois',
      compatibility: `Modèle Phase ${i % 2 + 1}`,
      description: `Pièce d'occasion en excellent état. Compatible avec ${brands[i % 3]} ${models[i % 3]} ${2015 + (i % 8)}.`,
      stock_quantity: Math.floor(Math.random() * 10) + 1,
      is_active: true
    };

    await connection.execute(
      `INSERT INTO products (id, name, oem_ref, brand, model, year, category_id, price, condition, warranty, compatibility, description, stock_quantity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id, product.name, product.oem_ref, product.brand, product.model,
        product.year, product.category_id, product.price, product.condition,
        product.warranty, product.compatibility, product.description,
        product.stock_quantity, product.is_active
      ]
    );

    // Ajouter une image par défaut
    await connection.execute(
      'INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
      [uuidv4(), product.id, `https://picsum.photos/seed/prod${i + 1}/400/300`, true]
    );

    products.push(product);
  }

  console.log(`✅ ${products.length} produits migrés`);
  return products;
}

async function migrateAuctions(connection, users) {
  console.log('🏆 Migration des enchères...');

  const auctions = [
    {
      id: uuidv4(),
      vehicle_name: 'Peugeot 208 GT Line',
      vehicle_brand: 'Peugeot',
      vehicle_model: '208',
      vehicle_year: 2019,
      vehicle_mileage: 55000,
      vehicle_description: 'Superbe Peugeot 208 GT Line en excellent état. Équipée de toutes les options modernes.',
      starting_price: 8000,
      current_bid: 8300,
      bid_count: 6,
      end_date: new Date(Date.now() + 49 * 60 * 60 * 1000), // 49h dans le futur
      is_active: true
    },
    {
      id: uuidv4(),
      vehicle_name: 'Volkswagen Golf VII',
      vehicle_brand: 'Volkswagen',
      vehicle_model: 'Golf',
      vehicle_year: 2017,
      vehicle_mileage: 89000,
      vehicle_description: 'Volkswagen Golf 7 en excellent état mécanique. Entretien suivi chez Volkswagen.',
      starting_price: 10000,
      current_bid: 10500,
      bid_count: 8,
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 jours dans le futur
      is_active: true
    }
  ];

  for (const auction of auctions) {
    await connection.execute(
      `INSERT INTO auctions (id, vehicle_name, vehicle_brand, vehicle_model, vehicle_year, vehicle_mileage, vehicle_description, starting_price, current_bid, bid_count, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auction.id, auction.vehicle_name, auction.vehicle_brand, auction.vehicle_model,
        auction.vehicle_year, auction.vehicle_mileage, auction.vehicle_description,
        auction.starting_price, auction.current_bid, auction.bid_count,
        auction.end_date, auction.is_active
      ]
    );

    // Ajouter une image par défaut
    await connection.execute(
      'INSERT INTO auction_images (id, auction_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
      [uuidv4(), auction.id, `https://picsum.photos/seed/auc${auction.id.slice(0, 8)}/800/600`, true]
    );

    // Ajouter des offres
    const bids = [
      {
        auction_id: auction.id,
        user_id: users[1].id, // Jean Dupont
        bidder_name: users[1].name,
        amount: auction.current_bid,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1h dans le passé
      }
    ];

    for (const bid of bids) {
      await connection.execute(
        'INSERT INTO bids (id, auction_id, user_id, bidder_name, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), bid.auction_id, bid.user_id, bid.bidder_name, bid.amount, bid.timestamp]
      );
    }
  }

  console.log(`✅ ${auctions.length} enchères migrées`);
  return auctions;
}

async function migrateSettings(connection) {
  console.log('⚙️ Migration des paramètres...');

  const settings = [
    {
      setting_key: 'business_info',
      setting_value: JSON.stringify({
        name: 'Démolition Expert',
        logoUrl: '',
        address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France',
        phone: '02 35 08 18 55',
        email: 'contact@casseautopro.fr',
        openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00'
      })
    },
    {
      setting_key: 'hero',
      setting_value: JSON.stringify({
        title: "Pièces d'occasion de qualité",
        subtitle: "Économisez jusqu'à 80% et recyclez !",
        background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' }
      })
    },
    {
      setting_key: 'services',
      setting_value: JSON.stringify([
        {
          id: 'serv-1',
          icon: "fas fa-cogs",
          title: "Vente de Pièces",
          description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.",
          link: "/pieces"
        },
        {
          id: 'serv-2',
          icon: "fas fa-car",
          title: "Rachat de Véhicules",
          description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.",
          link: "/rachat-vehicule"
        },
        {
          id: 'serv-3',
          icon: "fas fa-truck-pickup",
          title: "Enlèvement d'Épave",
          description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.",
          link: "/enlevement-epave"
        }
      ])
    },
    {
      setting_key: 'testimonials',
      setting_value: JSON.stringify([
        {
          id: 'test-1',
          text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!",
          author: "Julien D., Rouen"
        },
        {
          id: 'test-2',
          text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.",
          author: "Sylvie M., Le Havre"
        }
      ])
    }
  ];

  for (const setting of settings) {
    await connection.execute(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
      [setting.setting_key, setting.setting_value]
    );
  }

  console.log(`✅ ${settings.length} paramètres migrés`);
}

async function migrateContacts(connection) {
  console.log('📞 Migration des contacts...');

  const contacts = [
    {
      id: uuidv4(),
      name: 'Paul Martin',
      email: 'paul.martin@email.com',
      source: 'Formulaire de Contact'
    },
    {
      id: uuidv4(),
      name: 'Marie Curie',
      email: 'marie.curie@expert.fr',
      source: 'Utilisateur'
    }
  ];

  for (const contact of contacts) {
    await connection.execute(
      'INSERT INTO contacts (id, name, email, source) VALUES (?, ?, ?, ?)',
      [contact.id, contact.name, contact.email, contact.source]
    );
  }

  console.log(`✅ ${contacts.length} contacts migrés`);
}

async function migrateAdminMessages(connection, users) {
  console.log('💬 Migration des messages administratifs...');

  const messages = [
    {
      id: uuidv4(),
      from_source: 'Formulaire d\'enlèvement',
      sender_name: 'Paul Martin',
      sender_email: 'paul.martin@email.com',
      subject: 'Demande enlèvement Clio 2',
      content: 'Bonjour, je souhaiterais faire enlever ma Renault Clio 2.',
      is_read: false,
      is_archived: false,
      status: 'pending'
    },
    {
      id: uuidv4(),
      from_source: 'Formulaire de Contact',
      sender_name: 'Marie Curie',
      sender_email: 'marie.curie@expert.fr',
      user_id: users[1].id,
      subject: 'Question sur une pièce',
      content: 'Bonjour, avez-vous un alternateur pour une Peugeot 308 ?',
      is_read: true,
      is_archived: false,
      status: 'replied'
    }
  ];

  for (const message of messages) {
    await connection.execute(
      'INSERT INTO admin_messages (id, from_source, sender_name, sender_email, user_id, subject, content, is_read, is_archived, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        message.id, message.from_source, message.sender_name, message.sender_email,
        message.user_id, message.subject, message.content, message.is_read,
        message.is_archived, message.status
      ]
    );
  }

  console.log(`✅ ${messages.length} messages administratifs migrés`);
}

async function main() {
  console.log('🚀 Démarrage de la migration des données mockées...');

  const connection = await connectToDatabase();

  try {
    // Migrer les données dans l'ordre des dépendances
    const users = await migrateUsers(connection);
    const categories = await migrateCategories(connection);
    const products = await migrateProducts(connection, categories, users);
    const auctions = await migrateAuctions(connection, users);

    await migrateSettings(connection);
    await migrateContacts(connection);
    await migrateAdminMessages(connection, users);

    console.log('');
    console.log('🎉 Migration terminée avec succès!');
    console.log('');
    console.log('📊 Résumé de la migration:');
    console.log(`👥 Utilisateurs: ${users.length}`);
    console.log(`📂 Catégories: ${categories.length}`);
    console.log(`🔧 Produits: ${products.length}`);
    console.log(`🏆 Enchères: ${auctions.length}`);
    console.log('');
    console.log('🔗 Connexion à l\'application:');
    console.log('Admin: admin@expert.fr / password123');
    console.log('Staff: jean.dupont@expert.fr / password123');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Migration des données mockées vers MySQL - Démolition Expert

USAGE:
  node migrate-data.js [OPTIONS]

OPTIONS:
  --help, -h    Afficher cette aide
  --dry-run     Afficher les opérations sans les exécuter

ENVIRONMENT VARIABLES:
  DB_HOST       Hôte MySQL (défaut: localhost)
  DB_PORT       Port MySQL (défaut: 3306)
  DB_USER       Utilisateur MySQL (défaut: root)
  DB_PASSWORD   Mot de passe MySQL
  DB_NAME       Nom de la base de données (défaut: demolition_expert)

EXAMPLES:
  node migrate-data.js
  DB_PASSWORD=mypassword node migrate-data.js
  node migrate-data.js --dry-run
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 Mode simulation - aucune donnée ne sera migrée');
  console.log('Les opérations suivantes seraient effectuées:');
  console.log('- Migration des utilisateurs (3)');
  console.log('- Migration des catégories (4)');
  console.log('- Migration des produits (50)');
  console.log('- Migration des enchères (2)');
  console.log('- Migration des paramètres du site');
  console.log('- Migration des contacts');
  console.log('- Migration des messages administratifs');
  process.exit(0);
}

main().catch(console.error);
