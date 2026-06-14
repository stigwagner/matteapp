import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('./gangetabell.db');

console.log('Oppretter database tabeller...');

// Opprett tabeller
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    birth_year INTEGER,
    grade INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_practice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    table_number INTEGER NOT NULL,
    problem TEXT NOT NULL,
    answer INTEGER NOT NULL,
    user_answer INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_date DATE NOT NULL,
    problems_solved INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    UNIQUE(user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_practice_user ON user_practice(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_practice_timestamp ON user_practice(timestamp);
  CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
`);

console.log('Tabeller opprettet!');

// Opprett brukere
const passwordHash = bcrypt.hashSync('pwpw67', 10);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password_hash, display_name, birth_year, grade)
  VALUES (?, ?, ?, ?, ?)
`);

insertUser.run('hermann', passwordHash, 'Hermann', 2016, 3);
insertUser.run('vilma', passwordHash, 'Vilma', 2018, 1);

console.log('Brukere opprettet: hermann og vilma (passord: pwpw67)');

// Opprett badges
const insertBadge = db.prepare(`
  INSERT OR IGNORE INTO badges (name, description, icon, requirement_type, requirement_value)
  VALUES (?, ?, ?, ?, ?)
`);

const badges = [
  ['Gangetabell-nybegynner', 'Fullført første oppgave!', '🌟', 'total_problems', 1],
  ['Ti på rad', 'Løst 10 oppgaver på rad', '🔥', 'total_problems', 10],
  ['Femti sterk', 'Løst 50 oppgaver totalt', '💪', 'total_problems', 50],
  ['Hundre-klubben', 'Løst 100 oppgaver totalt', '🎯', 'total_problems', 100],
  ['Perfekt dag', 'Svart riktig på alle dagens oppgaver (minst 10)', '✨', 'perfect_day', 10],
  ['Fem på rad riktig', 'Fem riktige svar på rad', '🎪', 'streak_correct', 5],
  ['Ti på rad riktig', 'Ti riktige svar på rad', '🏆', 'streak_correct', 10],
  ['Uke-mester', 'Øvd 7 dager på rad', '📅', 'day_streak', 7],
  ['Gangetabell-ekspert', 'Løst 500 oppgaver totalt', '👑', 'total_problems', 500],
  ['Perfeksjonist', 'Svart riktig på 100 oppgaver på rad', '🌈', 'streak_correct', 100]
];

badges.forEach(badge => {
  insertBadge.run(...badge);
});

console.log('10 badges opprettet!');
console.log('\nDatabase setup ferdig! ✓');
console.log('Database fil: ./gangetabell.db');

db.close();
