# Guide de Déploiement Dokploy - Démolition Expert

Ce guide détaille les étapes pour déployer votre application complète (React + Node.js) sur Dokploy.

## 1. Prérequis

*   Votre code doit être hébergé sur un dépôt Git (GitHub, GitLab, Bitbucket, etc.).
*   Vous devez avoir votre clé API Gemini (`API_KEY`) prête.

## 2. Configuration sur Dokploy

1.  **Créer le projet** :
    *   Allez dans votre dashboard Dokploy.
    *   Cliquez sur le `+` pour créer un nouveau projet (ex: "Demolition Expert").

2.  **Ajouter une Application (Service)** :
    *   Dans le projet, cliquez sur **"Create Service"** > **"Application"**.
    *   Donnez-lui un nom (ex: `web-app`) et une description.

3.  **Lier le Code Source** :
    *   Allez dans l'onglet **"General"**.
    *   **Repository** : Sélectionnez votre dépôt Git.
    *   **Branch** : Sélectionnez `main` (ou votre branche de production).
    *   **Build Type** : Choisissez **"Docker Compose"**.
    *   **Docker Compose Path** : Laissez `./docker-compose.yml`.

4.  **Variables d'Environnement (CRUCIAL)** :
    *   Allez dans l'onglet **"Environment"**.
    *   Ajoutez la variable suivante :
        *   Key : `API_KEY`
        *   Value : `Votre_Clé_API_Gemini_Commencant_Par_AIza...`
    *   Cliquez sur **Save**.

5.  **Domaine** :
    *   Allez dans l'onglet **"Domains"**.
    *   Ajoutez votre nom de domaine (ex: `app.mondomaine.com`).
    *   **Container Port** : Assurez-vous de mettre **3001**.
    *   Activez "HTTPS" (Let's Encrypt) si vous avez configuré vos DNS.

## 3. Déploiement

1.  Allez dans l'onglet **"Deployments"**.
2.  Cliquez sur **"Deploy"**.

## 4. Ce qui va se passer (Automatique)

Dokploy va lire le fichier `Dockerfile` à la racine :
1.  Il va compiler le Frontend React (Vite) pour créer les fichiers HTML/CSS/JS optimisés.
2.  Il va installer le Backend Node.js.
3.  Il va déplacer les fichiers du Frontend dans le dossier public du Backend.
4.  Il va démarrer le serveur Node.js.

Votre application sera alors accessible via l'URL configurée, et le backend servira à la fois l'API (`/api/...`) et l'interface utilisateur.
