import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timestamp = Date.now();
console.log('🕒 Injection du timestamp:', timestamp);

// Chemin vers index.html dans le dossier dist
const indexPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html non trouvé dans dist/');
  process.exit(1);
}

// Lire le fichier
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Remplacer le timestamp dans les meta tags
html = html.replace(
  /content="<!-- DEPLOY_TIMESTAMP -->"/g,
  `content="${timestamp}"`
);

// 2. Remplacer le timestamp dans le script principal
html = html.replace(
  /src="\/index\.tsx\?nocache=<!-- DEPLOY_TIMESTAMP -->"/g,
  `src="/index.tsx?nocache=${timestamp}"`
);

// 3. Ajouter des paramètres de cache busting à tous les assets
html = html.replace(
  /(href|src)=["']([^"']*\.(js|css|tsx))["']/g,
  function(match, attr, file) {
    // Ne pas toucher aux CDN externes
    if (file.startsWith('http')) return match;
    
    const separator = file.includes('?') ? '&' : '?';
    return `${attr}="${file}${separator}v=${timestamp}"`;
  }
);

// 4. Écrire le fichier modifié
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html modifié avec succès');

// 5. Créer un fichier de version
const versionInfo = {
  timestamp: timestamp,
  buildDate: new Date().toISOString(),
  cacheStrategy: 'no-store',
  serviceWorker: 'disabled'
};

fs.writeFileSync(
  path.join(__dirname, 'dist', 'build-info.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log('📋 Fichier build-info.json créé');
