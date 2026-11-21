# WWGD – Netlify + Google Sheets

## Dateien
- `public/`: öffentliche Website und `/admin`
- `netlify/functions/api.mjs`: sichere Vermittlung zwischen Website und Google Apps Script
- `netlify.toml`: Netlify-Konfiguration

## Vor dem Deploy
In Netlify unter Site configuration → Environment variables diese drei Variablen anlegen:

1. `GOOGLE_SCRIPT_URL` = deine veröffentlichte Google Apps Script URL (endet auf `/exec`)
2. `GOOGLE_API_SECRET` = exakt derselbe Wert wie `API_SECRET` in den Google Apps Script Projekteinstellungen
3. `ADMIN_PASSWORD` = dein selbst gewähltes Admin-Passwort

Danach neu deployen.

## Deployment-Hinweis
Dieses Projekt enthält eine Netlify Function. Ein reiner Drag-and-drop-Upload der statischen `public`-Dateien reicht dafür nicht aus. Am einfachsten ist ein Git-verbundener Netlify-Deploy (GitHub) oder ein Deploy mit Netlify CLI. In Netlify muss das Publish-Verzeichnis `public` sein; `netlify.toml` setzt die Function directory.

Die Google Apps Script Web-App muss als „Ausführen als: Ich“ und mit Zugriff „Jeder“ veröffentlicht sein. Das `API_SECRET` bleibt in Script Properties und wird niemals in Browser-Dateien eingetragen.
