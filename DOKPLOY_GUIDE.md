# Guide de Déploiement sur Dokploy pour Démolition Expert

Ce guide explique comment déployer l'application "Démolition Expert" sur la plateforme Dokploy en utilisant Docker.

## Structure du Projet

L'application est structurée pour la production :

-   **`frontend/`**: Contient l'application cliente React (Vite).
-   **`backend/`**: Contient le serveur Node.js (Express) qui sert l'API et les fichiers du front-end.
-   **`Dockerfile`**: Fichier de configuration pour unifier ces deux parties en une seule image Docker.
-   **`docker-compose.yml`**: Fichier utilisé par Dokploy pour orchestrer le déploiement.

## Prérequis

-   Un compte Dokploy fonctionnel.
-   Le code source de ce projet hébergé sur un dépôt Git (GitHub, GitLab, etc.) accessible par Dokploy.
-   Votre clé d'API Google Gemini.

---

## Étape 1 : Création de l'Application sur Dokploy

1.  Connectez-vous à votre tableau de bord Dokploy.
2.  Cliquez sur "Create" > "Application".
3.  Choisissez votre source Git (par exemple, "GitHub") et sélectionnez le dépôt de votre projet.
4.  Dokploy va automatiquement détecter le fichier `docker-compose.yml` à la racine. Il devrait pré-remplir les informations du service `app`.
5.  Assurez-vous que le **Build Method** est bien "Docker Compose".
6.  Dans la section "Domains", configurez le nom de domaine souhaité pour votre application. Dokploy s'occupera du certificat SSL.

---

## Étape 2 : Configuration des Variables d'Environnement

C'est l'étape la plus importante pour que l'application puisse communiquer avec l'API Gemini.

1.  Dans les paramètres de votre application sur Dokploy, naviguez vers l'onglet **"Environment Variables"**.
2.  Cliquez sur **"Add variable"**.
3.  Créez la variable suivante :
    -   **Key** : `API_KEY`
    -   **Value** : Collez ici votre clé d'API Google Gemini.
4.  Cliquez sur **"Save"**.

La variable `PORT` est déjà gérée par le fichier `docker-compose.yml` et ne nécessite pas d'action de votre part.

---

## Étape 3 : Déploiement

1.  Une fois la variable d'environnement sauvegardée, naviguez vers l'onglet **"Deployments"**.
2.  Cliquez sur le bouton **"Deploy"**.
3.  Dokploy va maintenant lancer le processus de build :
    -   Il va cloner votre dépôt Git.
    -   Il utilisera le `Dockerfile` pour construire l'image de votre application. Ce processus compile le front-end React et l'intègre au serveur Node.js.
    -   Une fois l'image construite, il démarrera le conteneur en injectant la variable `API_KEY`.
4.  Vous pouvez suivre la progression du build et du déploiement en direct dans les **logs**. En cas d'erreur, les logs sont le premier endroit où chercher des indices.

Une fois le déploiement terminé avec succès, votre application sera accessible via le domaine que vous avez configuré.
