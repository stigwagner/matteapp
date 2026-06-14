# 🚀 Deploy Gangetabell-app til Railway + Cloudflare Pages

**Optimalt oppsett:** Backend på Railway (ingen søvnmodus!) + Frontend på Cloudflare Pages (lynrask global CDN)

## 📦 Hva du trenger

- GitHub konto
- Railway.app konto (gratis)
- Cloudflare konto (gratis)

---

## STEG 1: Push til GitHub

```bash
cd /home/swagn/gangetabell-app

# Initialiser git (hvis ikke gjort)
git init
git add .
git commit -m "Klar for Railway + Cloudflare deployment"

# Push til GitHub (erstatt 'ditt-brukernavn')
git remote add origin https://github.com/ditt-brukernavn/gangetabell-app.git
git branch -M main
git push -u origin main
```

---

## STEG 2: Deploy Backend til Railway.app 🚂

### 2.1 Opprett Railway konto
1. Gå til https://railway.app
2. Klikk "Login with GitHub"
3. Autoriser Railway

### 2.2 Deploy backend
1. Klikk "New Project"
2. Velg "Deploy from GitHub repo"
3. Velg `gangetabell-app`
4. Railway oppdager automatisk Node.js

### 2.3 Legg til Environment Variables
Klikk på din service → **Variables** tab:

```
NODE_ENV=production
```

**OBS:** Gangetabell-app trenger IKKE API-nøkkel (ingen AI-funksjoner).

### 2.4 Konfigurer Custom Domain (valgfritt)
Under **Settings** → **Networking**:
- Railway gir deg gratis URL: `xxx.up.railway.app`
- KOPIER denne URL-en! Du trenger den i neste steg.

**Eksempel:** `https://gangetabell-backend-production.up.railway.app`

---

## STEG 3: Deploy Frontend til Cloudflare Pages ☁️

### 3.1 Opprett Cloudflare konto
1. Gå til https://dash.cloudflare.com
2. Registrer deg (gratis)

### 3.2 Opprett Pages project
1. Gå til **Workers & Pages**
2. Klikk "Create application" → "Pages"
3. Klikk "Connect to Git"
4. Velg ditt GitHub repo: `gangetabell-app`

### 3.3 Konfigurer build settings
```
Framework preset: None
Build command: npm run build:pwa
Build output directory: dist
Root directory: (leave empty)
```

### 3.4 Oppdater _redirects fil
**VIKTIG:** Før du deployer, oppdater `public/_redirects`:

```bash
# Erstatt med DIN Railway URL
/api/*  https://DIN-RAILWAY-URL.up.railway.app/api/:splat  200
/*  /index.html  200
```

Commit og push endringen:
```bash
git add public/_redirects
git commit -m "Oppdater Railway backend URL"
git push
```

### 3.5 Deploy!
Klikk "Save and Deploy"

Din app vil være live om 1-2 minutter på:
```
https://gangetabell-app.pages.dev
```

---

## ✅ FERDIG! Appen er live!

### Hva du har nå:
✅ Backend på Railway (ingen søvnmodus!)
✅ Frontend på Cloudflare CDN (lynrask!)
✅ Gratis hosting for begge
✅ Auto-deploy fra GitHub
✅ PWA-støtte

### Testing:
1. Gå til din Cloudflare Pages URL
2. Logg inn med hermann / pwpw67
3. Start gangetabelltrening!

### Oppdateringer:
Bare push til GitHub:
```bash
git add .
git commit -m "Min endring"
git push
```

Både Railway og Cloudflare deployer automatisk! 🎉

---

## 📊 Gratis tier limits

### Railway.app:
- $5 credit/måned (fornybar)
- Dekker ~500 timer kjøretid
- **Ingen søvnmodus!**

### Cloudflare Pages:
- 500 builds/måned
- Ubegrenset bandwidth
- **Alltid lynrask!**

---

## 🆘 Feilsøking

### Problem: "Cannot connect to backend"
**Løsning:** Sjekk at Railway URL i `public/_redirects` er riktig.

### Problem: Database tom
**Løsning:** Railway oppretter ny database første gang. Brukere må registreres på nytt.

### Problem: "Login failed"
**Løsning:** Standardbruker er hermann / pwpw67. Sjekk at database er initialisert.

---

## 🔄 Konvertere til full Cloudflare senere

Hvis appen vokser, kan du senere:
1. Konvertere backend til Cloudflare Workers
2. Bruke D1 database
3. 100% på Cloudflare infrastruktur

Men for nå fungerer Railway + Cloudflare perfekt! 🎯
