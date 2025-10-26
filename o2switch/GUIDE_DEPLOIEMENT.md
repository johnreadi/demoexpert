# Guide de Déploiement sur o2switch

Ce guide vous explique comment déployer votre application React + Node.js sur votre hébergement o2switch.

## Structure du projet

Le dossier `o2switch` contient deux sous-dossiers principaux :

-   **`Production/`**: Contient le code source complet de votre application.
    -   `Front-end/`: L'application React (client).
    -   `Back-end/`: Le serveur Node.js (serveur).
-   **`transfert/`**: Contient les fichiers prêts à être téléversés sur votre hébergement.

## Prérequis

-   Avoir Node.js et npm installés sur votre ordinateur.
-   Avoir un accès FTP ou au gestionnaire de fichiers de votre cPanel o2switch.
-   Avoir créé une application Node.js depuis votre interface cPanel.

---

### Étape 1 : Construction de l'application Front-end (local)

Avant de pouvoir téléverser les fichiers, vous devez "compiler" votre application React. Cette étape va optimiser et regrouper tous vos fichiers (code, CSS, images) dans un format performant pour le web.

1.  Ouvrez un terminal sur votre ordinateur.
2.  Naviguez jusqu'au dossier du front-end :
    ```bash
    cd o2switch/Production/Front-end
    ```
3.  Installez les dépendances nécessaires :
    ```bash
    npm install
    ```
4.  Lancez la compilation de production :
    ```bash
    npm run build
    ```
Cette commande va créer un nouveau dossier `dist` à l'intérieur de `o2switch/Production/Front-end`. C'est ce dossier qui contient votre site web prêt à être mis en ligne.

---

### Étape 2 : Préparation des fichiers pour le transfert

Maintenant, nous allons regrouper tous les fichiers nécessaires dans le dossier `transfert`.

1.  **Copiez les fichiers du serveur** : Copiez **tout le contenu** du dossier `o2switch/Production/Back-end/` et collez-le à la racine du dossier `o2switch/transfert/`.
2.  **Copiez les fichiers du site web** : Copiez **tout le contenu** du dossier `dist` que vous venez de générer (`o2switch/Production/Front-end/dist/`) et collez-le dans le dossier `o2switch/transfert/public/`.

À la fin de cette étape, votre dossier `transfert` devrait ressembler à ceci :

```
transfert/
├── public/
│   ├── assets/
│   └── index.html
│   └── ... (autres fichiers générés)
├── api.js
├── db.js
├── geminiService.js
├── mock_data.js
├── package.json
└── server.js
```

---

### Étape 3 : Téléversement sur o2switch

1.  Connectez-vous à votre cPanel et ouvrez le "Gestionnaire de fichiers" ou utilisez un client FTP (comme FileZilla).
2.  Naviguez jusqu'au dossier que vous avez défini comme **"Application root"** lors de la création de votre application Node.js sur o2switch.
3.  Supprimez les fichiers par défaut qui pourraient s'y trouver.
4.  Téléversez **tout le contenu** de votre dossier local `transfert/` dans ce dossier sur votre hébergement.

---

### Étape 4 : Installation des dépendances sur le serveur

1.  Dans votre cPanel, trouvez l'outil "Terminal".
2.  Une fois dans le terminal, naviguez jusqu'à votre dossier d'application :
    ```bash
    cd chemin/vers/votre/application_root
    ```
3.  Lancez l'installation des dépendances du serveur :
    ```bash
    npm install
    ```
    Cela va installer Express et les autres paquets nécessaires à partir du fichier `package.json`.

---

### Étape 5 : Configuration de l'application Node.js

Retournez dans la section "Setup Node.js App" de votre cPanel et configurez votre application comme suit :

-   **Node.js version** : Choisissez une version LTS récente, comme `18.x` ou `20.x`. La version `10.x` est très ancienne et déconseillée.
-   **Application mode** : **`production`** (très important pour les performances).
-   **Application root** : Le chemin où vous avez téléversé vos fichiers (ex: `/home/votrenom/votresite.com/app`).
-   **Application URL** : L'URL publique de votre site.
-   **Application startup file** : **`server.js`**

### Étape 6 : Variables d'environnement

C'est ici que vous devez ajouter votre clé API pour Gemini.

1.  Dans l'interface de configuration de l'application Node.js, cliquez sur "Add Variable".
2.  Entrez les informations suivantes :
    -   **Name** : `API_KEY`
    -   **Value** : `VOTRE_CLE_API_GEMINI_SECRETE` (remplacez par votre vraie clé)
3.  Cliquez sur "Add".

### Étape 7 : Démarrage

1.  En haut de la page de configuration, cliquez sur le bouton **"Restart"** pour appliquer tous les changements.
2.  Votre application devrait maintenant être en ligne ! Vous pouvez visiter votre "Application URL" pour voir le résultat.

En cas de problème, la section "Logs" de l'interface o2switch peut vous donner des indices sur les erreurs éventuelles.
