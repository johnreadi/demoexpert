#Requires -Version 5.1

<#
.SYNOPSIS
    Script de déploiement pour Démolition Expert sous Windows

.DESCRIPTION
    Ce script configure l'environnement de production pour l'application Démolition Expert
    sous Windows avec IIS et MySQL.

.PARAMETER InstallPrerequisites
    Installe les prérequis nécessaires (Node.js, MySQL, IIS)

.PARAMETER SetupDatabase
    Configure la base de données MySQL

.PARAMETER DeployBackend
    Déploie l'API backend

.PARAMETER DeployFrontend
    Déploie l'application frontend

.PARAMETER ConfigureIIS
    Configure IIS pour servir l'application

.EXAMPLE
    .\deploy-windows.ps1 -InstallPrerequisites
    .\deploy-windows.ps1 -SetupDatabase -DeployBackend -DeployFrontend -ConfigureIIS
#>

param(
    [switch]$InstallPrerequisites,
    [switch]$SetupDatabase,
    [switch]$DeployBackend,
    [switch]$DeployFrontend,
    [switch]$ConfigureIIS,
    [string]$ProjectPath = "C:\inetpub\wwwroot\demolition-expert"
)

# Configuration
$BACKEND_DIR = Join-Path $ProjectPath "Production\Back-end"
$FRONTEND_DIR = Join-Path $ProjectPath "Production\Front-end"
$DB_SCHEMA = Join-Path $ProjectPath "Production\database_schema.sql"

Write-Host "🚀 Démarrage du déploiement de Démolition Expert sous Windows..." -ForegroundColor Green

if ($InstallPrerequisites) {
    Write-Host "📦 Installation des prérequis..." -ForegroundColor Yellow

    # Vérifier et installer Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js n'est pas installé. Téléchargez-le depuis https://nodejs.org/" -ForegroundColor Red
        exit 1
    }

    # Vérifier et installer MySQL
    if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
        Write-Host "❌ MySQL n'est pas installé. Installez MySQL Server depuis https://dev.mysql.com/downloads/mysql/" -ForegroundColor Red
        exit 1
    }

    # Vérifier et installer IIS
    if (-not (Get-Service W3SVC -ErrorAction SilentlyContinue)) {
        Write-Host "Installation d'IIS..." -ForegroundColor Yellow
        Install-WindowsFeature -Name Web-Server, Web-HTTP-Errors, Web-HTTP-Redirect, Web-HTTP-Logging, Web-Request-Monitor, Web-Http-Tracing, Web-URL-Auth, Web-Basic-Auth, Web-IP-Security, Web-Application-Development, Web-CGI, Web-ISAPI-Extension, Web-ISAPI-Filter -IncludeManagementTools
    }

    # Installer les features IIS supplémentaires
    Install-WindowsFeature -Name Web-Mgmt-Console, Web-Scripting-Tools, Web-Mgmt-Service -IncludeManagementTools

    Write-Host "✅ Prérequis installés" -ForegroundColor Green
}

if ($SetupDatabase) {
    Write-Host "📊 Configuration de la base de données..." -ForegroundColor Yellow

    # Créer la base de données
    $mysqlCommands = @"
CREATE DATABASE IF NOT EXISTS demolition_expert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'demolition_user'@'localhost' IDENTIFIED BY 'SecurePass123!';
GRANT ALL PRIVILEGES ON demolition_expert.* TO 'demolition_user'@'localhost';
FLUSH PRIVILEGES;
USE demolition_expert;
SOURCE $DB_SCHEMA;
"@

    $mysqlCommands | mysql -u root -p

    Write-Host "✅ Base de données configurée" -ForegroundColor Green
}

if ($DeployBackend) {
    Write-Host "🔧 Déploiement du backend..." -ForegroundColor Yellow

    # Créer le répertoire
    New-Item -ItemType Directory -Path $BACKEND_DIR -Force

    # Copier les fichiers backend
    Copy-Item -Path ".\Production\Back-end\*" -Destination $BACKEND_DIR -Recurse -Force

    # Installer les dépendances et build
    Push-Location $BACKEND_DIR
    npm install
    npm run build

    # Créer le service Windows
    $serviceName = "DemolitionExpertBackend"

    if (-not (Get-Service $serviceName -ErrorAction SilentlyContinue)) {
        sc.exe create $serviceName binPath= "node $BACKEND_DIR\dist\server.js" start= auto
        sc.exe description $serviceName "Démolition Expert Backend API Service"
    }

    Pop-Location

    Write-Host "✅ Backend déployé" -ForegroundColor Green
}

if ($DeployFrontend) {
    Write-Host "🎨 Déploiement du frontend..." -ForegroundColor Yellow

    # Créer le répertoire
    New-Item -ItemType Directory -Path $FRONTEND_DIR -Force

    # Copier les fichiers frontend
    Copy-Item -Path ".\Production\Front-end\*" -Destination $FRONTEND_DIR -Recurse -Force

    # Installer les dépendances et build
    Push-Location $FRONTEND_DIR
    npm install
    npm run build
    Pop-Location

    Write-Host "✅ Frontend déployé" -ForegroundColor Green
}

if ($ConfigureIIS) {
    Write-Host "🌐 Configuration d'IIS..." -ForegroundColor Yellow

    # Importer le module WebAdministration
    Import-Module WebAdministration

    # Créer le pool d'applications
    if (-not (Test-Path "IIS:\AppPools\DemolitionExpert")) {
        New-Item "IIS:\AppPools\DemolitionExpert"
        Set-ItemProperty "IIS:\AppPools\DemolitionExpert" -name "processModel.identityType" -value "NetworkService"
        Set-ItemProperty "IIS:\AppPools\DemolitionExpert" -name "recycling.periodicRestart.time" -value "00:00:00"
    }

    # Créer le site web
    if (-not (Test-Path "IIS:\Sites\DemolitionExpert")) {
        New-Website -Name "DemolitionExpert" -PhysicalPath $ProjectPath -Port 80 -ApplicationPool "DemolitionExpert"
    }

    # Configuration URL Rewrite pour React Router
    $rewriteRules = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="React Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
        <httpProtocol>
            <customHeaders>
                <add name="X-Content-Type-Options" value="nosniff" />
                <add name="X-Frame-Options" value="DENY" />
                <add name="X-XSS-Protection" value="1; mode=block" />
            </customHeaders>
        </httpProtocol>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
        </staticContent>
    </system.webServer>
</configuration>
"@

    # Sauvegarder et créer le web.config
    $webConfigPath = Join-Path $FRONTEND_DIR "dist\web.config"
    $rewriteRules | Out-File -FilePath $webConfigPath -Encoding UTF8

    # Configuration des headers de sécurité
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST/DemolitionExpert' -filter "system.webServer/httpProtocol/customHeaders" -name "." -value @{name="X-Content-Type-Options";value="nosniff"}
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST/DemolitionExpert' -filter "system.webServer/httpProtocol/customHeaders" -name "." -value @{name="X-Frame-Options";value="DENY"}
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST/DemolitionExpert' -filter "system.webServer/httpProtocol/customHeaders" -name "." -value @{name="X-XSS-Protection";value="1; mode=block"}

    Write-Host "✅ IIS configuré" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Étapes suivantes:" -ForegroundColor Yellow
Write-Host "1. Configurez les variables d'environnement dans $BACKEND_DIR\.env"
Write-Host "2. Démarrez le service backend: net start DemolitionExpertBackend"
Write-Host "3. Redémarrez IIS: iisreset"
Write-Host "4. Testez l'application: http://localhost"
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost"
Write-Host "Backend API: http://localhost/api/health"
