# Gangetabell App

En komplett øvingsapp for gangetabellen med badges, statistikk og spaced repetition.

## Funksjoner

- **Autentisering**: Login for hermann og vilma
- **Dashboard**: Oversikt over poeng, statistikk, streak og badges
- **Tabell-velger**: Velg hvilke gangetabeller du vil øve på (1x-10x)
- **Øvingsmodus**: Interaktiv øving med umiddelbar tilbakemelding
- **Badge-system**: 10 forskjellige badges å tjene
- **Spaced repetition**: Feil svar dukker opp oftere
- **Diminishing returns**: Poengberegning (10p for 1-10, 5p for 11-20, 2p for 21+)
- **Streak tracking**: Dager på rad

## Installasjon

Dependencies er allerede installert. Database er satt opp med brukere og badges.

## Start appen

Du trenger to terminaler:

### Terminal 1: Backend (port 3002)
```bash
npm run server
```

### Terminal 2: Frontend (port 5174)
```bash
npm run dev
```

Åpne deretter nettleseren på: http://localhost:5174

## Innlogging

**Brukere:**
- Brukernavn: `hermann` | Passord: `pwpw67`
- Brukernavn: `vilma` | Passord: `pwpw67`

## Database

Database-filen: `gangetabell.db`

### Tabeller:
- **users**: Brukerinformasjon
- **user_practice**: Alle øvinger og svar
- **daily_activity**: Daglig aktivitet for streak-tracking
- **badges**: 10 forskjellige badges
- **user_badges**: Opptjente badges per bruker

## Badges

1. Gangetabell-nybegynner (1 oppgave)
2. Ti på rad (10 oppgaver)
3. Femti sterk (50 oppgaver)
4. Hundre-klubben (100 oppgaver)
5. Perfekt dag (alle dagens oppgaver riktig, min 10)
6. Fem på rad riktig (5 riktige svar på rad)
7. Ti på rad riktig (10 riktige svar på rad)
8. Uke-mester (øvd 7 dager på rad)
9. Gangetabell-ekspert (500 oppgaver)
10. Perfeksjonist (100 riktige svar på rad)

## API Endepunkter

- `POST /api/auth/login` - Logg inn
- `GET /api/users/:userId/stats` - Hent brukerstatistikk
- `POST /api/practice` - Lagre svar
- `POST /api/practice/start` - Start øving med valgte tabeller
- `GET /api/badges` - Hent alle badges

## Teknologi

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Express.js, better-sqlite3
- **Database**: SQLite
- **Styling**: Custom CSS

## Prosjektstruktur

```
gangetabell-app/
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TableSelector.tsx
│   │   └── PracticeMode.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.js
├── init-db.js
├── gangetabell.db
├── package.json
├── vite.config.js
├── tsconfig.json
└── index.html
```

## Nullstill database

Hvis du vil starte på nytt:

```bash
rm gangetabell.db
npm run init-db
```

Dette vil opprette en ny database med brukere hermann og vilma.
