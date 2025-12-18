import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Démarrage du post-build processing...');

const timestamp = Date.now();
const buildDate = new Date().toISOString();
console.log('🕒 Timestamp:', timestamp);
console.log('📅 Date:', buildDate);

try {
  // Chemin vers index.html dans le dossier dist
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ ERREUR: index.html non trouvé dans dist/');
    console.log('📁 Recherche dans:', path.dirname(indexPath));
    console.log('📁 Fichiers trouvés:', fs.readdirSync(path.dirname(indexPath)));
    process.exit(1);
  }
  
  console.log('📄 Lecture de index.html...');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // 1. Remplacer le timestamp dans les meta tags
  console.log('🔧 Remplacement des timestamps...');
  html = html.replace(
    /content="<!-- DEPLOY_TIMESTAMP -->"/g,
    `content="${timestamp}"`
  );
  
  // 2. Remplacer le timestamp dans le script principal
  html = html.replace(
    /src="\/index\.tsx\?nocache=<!-- DEPLOY_TIMESTAMP -->"/g,
    `src="/index.tsx?nocache=${timestamp}"`
  );
  
  // 3. Ajouter des paramètres de cache busting à tous les assets locaux
  let modificationCount = 0;
  html = html.replace(
    /(href|src)=["']([^"']*\.(js|css|tsx|mjs))["']/g,
    function(match, attr, file) {
      // Ne pas toucher aux CDN externes
      if (file.startsWith('http') || file.startsWith('//') || file.startsWith('https://')) {
        return match;
      }
      
      modificationCount++;
      const separator = file.includes('?') ? '&' : '?';
      return `${attr}="${file}${separator}v=${timestamp}"`;
    }
  );
  
  console.log(`✅ ${modificationCount} fichiers modifiés avec cache busting`);
  
  // 4. Écrire le fichier modifié
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('💾 index.html sauvegardé');
  
  // 5. Créer un fichier de build info
  const buildInfo = {
    version: "1.0.0",
    buildTimestamp: timestamp,
    buildDate: buildDate,
    environment: "production",
    cache: {
      strategy: "no-store",
      serviceWorker: "disabled",
      headers: ["Cache-Control: no-cache, no-store, must-revalidate", "Pragma: no-cache", "Expires: 0"]
    },
    deployment: {
      platform: "dokploy",
      timestamp: timestamp
    }
  };
  
  const buildInfoPath = path.join(__dirname, 'dist', 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2), 'utf8');
  console.log('📋 build-info.json créé');
  
  // 6. Créer un fichier version simple pour health check
  const versionTxt = `DemoExpert Frontend\nVersion: 1.0.0\nBuild: ${timestamp}\nDate: ${buildDate}\nCache: disabled`;
  fs.writeFileSync(path.join(__dirname, 'dist', 'version.txt'), versionTxt, 'utf8');
  
  // 7. Vérifier le contenu final
  const files = fs.readdirSync(path.join(__dirname, 'dist'));
  console.log('\n📊 Contenu du dossier dist/:');
  files.forEach(file => {
    const stats = fs.statSync(path.join(__dirname, 'dist', file));
    console.log(`  ${file} (${stats.size} bytes)`);
  });
  
  console.log('\n🎉 Post-build terminé avec succès!');
  console.log(`🔗 Timestamp injecté: ${timestamp}`);
  
} catch (error) {
  console.error('❌ ERREUR pendant le post-build:', error.message);
  console.error(error.stack);
  process.exit(1);
}
