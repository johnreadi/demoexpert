#!/bin/sh
set -e

echo "🚀 Frontend DemoExpert - Anti-cache activé"

# Injecter un timestamp unique
TIMESTAMP=$(date +%s)
echo "🕒 Timestamp: $TIMESTAMP"

# Modifier index.html pour forcer le rechargement
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "🔧 Modification de index.html..."
    
    # Créer une copie de backup
    cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.bak
    
    # Injecter meta tags anti-cache
    sed -i '/<head>/a\
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\
    <meta http-equiv="Pragma" content="no-cache">\
    <meta http-equiv="Expires" content="0">\
    <meta name="deploy-timestamp" content="'"$TIMESTAMP"'">' /usr/share/nginx/html/index.html
    
    # Ajouter paramètre de version aux JS/CSS
    sed -i \
        -e 's/\.js"/.js?v='"$TIMESTAMP"'"/g' \
        -e 's/\.css"/.css?v='"$TIMESTAMP"'"/g' \
        /usr/share/nginx/html/index.html
        
    echo "✅ index.html modifié avec timestamp $TIMESTAMP"
else
    echo "⚠️  index.html non trouvé"
fi

# Démarrer Nginx
echo "🌐 Démarrage de Nginx avec headers anti-cache..."
exec nginx -g "daemon off;"
