import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurriculumForGrade, getMotivationalMessage } from './grade-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const db = new Database('./gangetabell.db');

// Legg til mode-kolonne hvis den ikke finnes
try {
  db.exec(`ALTER TABLE user_practice ADD COLUMN mode TEXT DEFAULT 'practice'`);
  console.log('Added mode column to user_practice table');
} catch (err) {
  // Column already exists, ignore
}

// Legg til operation_type-kolonne hvis den ikke finnes
try {
  db.exec(`ALTER TABLE user_practice ADD COLUMN operation_type TEXT DEFAULT 'multiplication'`);
  console.log('Added operation_type column to user_practice table');
} catch (err) {
  // Column already exists, ignore
}

app.use(cors());
app.use(bodyParser.json());

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Brukernavn og passord er påkrevd' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord' });
  }

  // Returner brukerdata uten passord
  const { password_hash, ...userData } = user;
  res.json({ user: userData });
});

// GET /api/users/:userId/stats
app.get('/api/users/:userId/stats', (req, res) => {
  const { userId } = req.params;

  // Total statistikk
  const totalStats = db.prepare(`
    SELECT
      COUNT(*) as total_problems,
      SUM(is_correct) as correct_answers,
      ROUND(CAST(SUM(is_correct) AS FLOAT) / COUNT(*) * 100, 1) as accuracy
    FROM user_practice
    WHERE user_id = ?
  `).get(userId);

  // Statistikk per operasjonstype
  const multiplicationStats = db.prepare(`
    SELECT
      COUNT(*) as total_problems,
      SUM(is_correct) as correct_answers,
      ROUND(CAST(SUM(is_correct) AS FLOAT) / COUNT(*) * 100, 1) as accuracy
    FROM user_practice
    WHERE user_id = ? AND operation_type = 'multiplication'
  `).get(userId);

  const divisionStats = db.prepare(`
    SELECT
      COUNT(*) as total_problems,
      SUM(is_correct) as correct_answers,
      ROUND(CAST(SUM(is_correct) AS FLOAT) / COUNT(*) * 100, 1) as accuracy
    FROM user_practice
    WHERE user_id = ? AND operation_type = 'division'
  `).get(userId);

  // Dagens statistikk
  const today = new Date().toISOString().split('T')[0];
  const todayStats = db.prepare(`
    SELECT problems_solved, correct_answers
    FROM daily_activity
    WHERE user_id = ? AND activity_date = ?
  `).get(userId, today) || { problems_solved: 0, correct_answers: 0 };

  // Streak (dager på rad)
  const allDates = db.prepare(`
    SELECT DISTINCT activity_date
    FROM daily_activity
    WHERE user_id = ?
    ORDER BY activity_date DESC
  `).all(userId);

  let streak = 0;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < allDates.length; i++) {
    const expectedDate = new Date(todayDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (allDates[i].activity_date === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  // Badges
  const badges = db.prepare(`
    SELECT b.*, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `).all(userId);

  // Poeng: Delt mellom test og øving
  let points = 0;

  // Test-modus: Resultatbaserte poeng (kun for test-problems)
  const testProblems = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_practice
    WHERE user_id = ? AND mode = 'test'
  `).get(userId).count || 0;

  if (testProblems >= 1) {
    points += Math.min(testProblems, 10) * 10; // 10 poeng for 1-10
  }
  if (testProblems >= 11) {
    points += Math.min(testProblems - 10, 10) * 5; // 5 poeng for 11-20
  }
  if (testProblems >= 21) {
    points += (testProblems - 20) * 2; // 2 poeng for 21+
  }

  // Øvingsmodus: Flat scoring (1 poeng per økt/dag)
  const practiceDays = db.prepare(`
    SELECT COUNT(DISTINCT DATE(timestamp)) as days
    FROM user_practice
    WHERE user_id = ? AND mode = 'practice'
  `).get(userId).days || 0;

  points += practiceDays; // 1 poeng per dag med øving

  // Nåværende streak av riktige svar
  const recentAnswers = db.prepare(`
    SELECT is_correct
    FROM user_practice
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT 100
  `).all(userId);

  let currentCorrectStreak = 0;
  for (const answer of recentAnswers) {
    if (answer.is_correct === 1) {
      currentCorrectStreak++;
    } else {
      break;
    }
  }

  // Hent brukerens klassetrinn for motiverende melding
  const user = db.prepare('SELECT grade FROM users WHERE id = ?').get(userId);
  const accuracy = totalStats.accuracy || 0;
  const motivationalMessage = getMotivationalMessage(user.grade, accuracy, totalStats.total_problems);

  res.json({
    total: totalStats,
    multiplication: multiplicationStats,
    division: divisionStats,
    today: todayStats,
    streak,
    badges,
    points,
    currentCorrectStreak,
    motivationalMessage
  });
});

// POST /api/practice (lagre svar)
app.post('/api/practice', (req, res) => {
  const { userId, tableNumber, problem, answer, userAnswer, mode = 'practice', operationType = 'multiplication' } = req.body;

  if (!userId || !tableNumber || !problem || answer === undefined || userAnswer === undefined) {
    return res.status(400).json({ error: 'Mangler påkrevde felter' });
  }

  const isCorrect = parseInt(answer) === parseInt(userAnswer) ? 1 : 0;

  // Lagre svar
  const insert = db.prepare(`
    INSERT INTO user_practice (user_id, table_number, problem, answer, user_answer, is_correct, mode, operation_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(userId, tableNumber, problem, answer, userAnswer, isCorrect, mode, operationType);

  // Oppdater daily_activity
  const today = new Date().toISOString().split('T')[0];

  const updateDaily = db.prepare(`
    INSERT INTO daily_activity (user_id, activity_date, problems_solved, correct_answers)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(user_id, activity_date)
    DO UPDATE SET
      problems_solved = problems_solved + 1,
      correct_answers = correct_answers + ?
  `);

  updateDaily.run(userId, today, isCorrect, isCorrect);

  // Sjekk for nye badges
  const newBadges = checkBadges(userId);

  res.json({
    isCorrect: isCorrect === 1,
    newBadges
  });
});

// POST /api/practice/start (velg tabeller)
app.post('/api/practice/start', (req, res) => {
  const { userId, selectedTables, operationType = 'multiplication' } = req.body;

  if (!userId || !selectedTables || selectedTables.length === 0) {
    return res.status(400).json({ error: 'Velg minst én tabell' });
  }

  // Hent brukerens klassetrinn
  const user = db.prepare('SELECT grade FROM users WHERE id = ?').get(userId);
  const curriculum = getCurriculumForGrade(user.grade);

  // Bestem antall spørsmål basert på curriculum
  const questionCount = curriculum.recommendedPractice.idealProblems;

  // Generer spørsmål basert på spaced repetition og curriculum
  const questions = generateQuestions(userId, selectedTables, questionCount, operationType);

  res.json({ questions });
});

// GET /api/badges
app.get('/api/badges', (req, res) => {
  const allBadges = db.prepare('SELECT * FROM badges ORDER BY requirement_value').all();
  res.json(allBadges);
});

// GET /api/curriculum/:grade
app.get('/api/curriculum/:grade', (req, res) => {
  const { grade } = req.params;
  const curriculum = getCurriculumForGrade(parseInt(grade));
  res.json(curriculum);
});

// Hjelpefunksjoner

// Hjelpefunksjon: Lag kanonisk form (4×8 og 8×4 blir begge "4x8")
function getCanonicalProblem(a, b) {
  const [min, max] = a <= b ? [a, b] : [b, a];
  return `${min}x${max}`;
}

function generateQuestions(userId, selectedTables, count = 10, operationType = 'multiplication') {
  const questions = [];
  const usedProblems = new Set(); // Holde oversikt over brukte oppgaver (kanonisk form + type)

  // Hent feil svar fra tidligere (for spaced repetition)
  let wrongAnswers = [];

  if (operationType === 'mixed') {
    wrongAnswers = db.prepare(`
      SELECT table_number, problem, answer, operation_type, COUNT(*) as error_count
      FROM user_practice
      WHERE user_id = ?
        AND is_correct = 0
        AND table_number IN (${selectedTables.join(',')})
      GROUP BY problem, operation_type
      ORDER BY error_count DESC, timestamp DESC
      LIMIT ?
    `).all(userId, Math.floor(count / 2));
  } else {
    wrongAnswers = db.prepare(`
      SELECT table_number, problem, answer, operation_type, COUNT(*) as error_count
      FROM user_practice
      WHERE user_id = ?
        AND is_correct = 0
        AND operation_type = ?
        AND table_number IN (${selectedTables.join(',')})
      GROUP BY problem
      ORDER BY error_count DESC, timestamp DESC
      LIMIT ?
    `).all(userId, operationType, Math.floor(count / 2));
  }

  // Legg til feil svar først (spaced repetition) - unike
  wrongAnswers.forEach(wa => {
    const opType = wa.operation_type || 'multiplication';
    const uniqueKey = `${wa.problem}-${opType}`;

    if (!usedProblems.has(uniqueKey)) {
      const parts = wa.problem.includes('÷')
        ? wa.problem.split('÷').map(Number)
        : wa.problem.split('x').map(Number);

      questions.push({
        a: parts[0],
        b: parts[1],
        answer: wa.answer,
        problem: wa.problem,
        operationType: opType
      });
      usedProblems.add(uniqueKey);
    }
  });

  // Generer alle mulige unike oppgaver fra valgte tabeller
  const allPossibleProblems = [];
  selectedTables.forEach(tableNumber => {
    for (let b = 1; b <= 10; b++) {
      const product = tableNumber * b;

      // For ganging eller blandet: Legg til gangeoppgave
      if (operationType === 'multiplication' || operationType === 'mixed') {
        const problem = `${tableNumber}x${b}`;
        const uniqueKey = `${problem}-multiplication`;

        if (!usedProblems.has(uniqueKey)) {
          allPossibleProblems.push({
            a: tableNumber,
            b,
            answer: product,
            problem,
            operationType: 'multiplication'
          });
          usedProblems.add(uniqueKey);
        }
      }

      // For deling eller blandet: Legg til delingsoppgaver
      if (operationType === 'division' || operationType === 'mixed') {
        // 32 ÷ 4 = 8
        const divProblem1 = `${product}÷${tableNumber}`;
        const uniqueKey1 = `${divProblem1}-division`;

        if (!usedProblems.has(uniqueKey1)) {
          allPossibleProblems.push({
            a: product,
            b: tableNumber,
            answer: b,
            problem: divProblem1,
            operationType: 'division'
          });
          usedProblems.add(uniqueKey1);
        }

        // 32 ÷ 8 = 4 (unngå 32 ÷ 32 = 1)
        if (tableNumber !== b) {
          const divProblem2 = `${product}÷${b}`;
          const uniqueKey2 = `${divProblem2}-division`;

          if (!usedProblems.has(uniqueKey2)) {
            allPossibleProblems.push({
              a: product,
              b: b,
              answer: tableNumber,
              problem: divProblem2,
              operationType: 'division'
            });
            usedProblems.add(uniqueKey2);
          }
        }
      }
    }
  });

  // Stokk om de mulige oppgavene
  allPossibleProblems.sort(() => Math.random() - 0.5);

  // Fyll opp med tilfeldige spørsmål (allerede merket som brukt)
  const remaining = count - questions.length;
  for (let i = 0; i < remaining && i < allPossibleProblems.length; i++) {
    questions.push(allPossibleProblems[i]);
  }

  // Bland alle spørsmålene
  return questions.sort(() => Math.random() - 0.5);
}

function checkBadges(userId) {
  const newBadges = [];

  // Hent brukerens statistikk
  const totalProblems = db.prepare(`
    SELECT COUNT(*) as count FROM user_practice WHERE user_id = ?
  `).get(userId).count;

  const totalCorrect = db.prepare(`
    SELECT COUNT(*) as count FROM user_practice WHERE user_id = ? AND is_correct = 1
  `).get(userId).count;

  // Sjekk perfekt dag
  const today = new Date().toISOString().split('T')[0];
  const todayStats = db.prepare(`
    SELECT problems_solved, correct_answers
    FROM daily_activity
    WHERE user_id = ? AND activity_date = ?
  `).get(userId, today);

  // Current correct streak
  const recentAnswers = db.prepare(`
    SELECT is_correct
    FROM user_practice
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT 100
  `).all(userId);

  let currentCorrectStreak = 0;
  for (const answer of recentAnswers) {
    if (answer.is_correct === 1) {
      currentCorrectStreak++;
    } else {
      break;
    }
  }

  // Day streak
  const allDates = db.prepare(`
    SELECT DISTINCT activity_date
    FROM daily_activity
    WHERE user_id = ?
    ORDER BY activity_date DESC
  `).all(userId);

  let dayStreak = 0;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < allDates.length; i++) {
    const expectedDate = new Date(todayDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (allDates[i].activity_date === expectedDateStr) {
      dayStreak++;
    } else {
      break;
    }
  }

  // Hent alle badges
  const allBadges = db.prepare('SELECT * FROM badges').all();

  // Sjekk hver badge
  for (const badge of allBadges) {
    // Sjekk om brukeren allerede har denne badgen
    const hasBadge = db.prepare(`
      SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?
    `).get(userId, badge.id);

    if (hasBadge) continue;

    let earned = false;

    switch (badge.requirement_type) {
      case 'total_problems':
        earned = totalProblems >= badge.requirement_value;
        break;
      case 'streak_correct':
        earned = currentCorrectStreak >= badge.requirement_value;
        break;
      case 'day_streak':
        earned = dayStreak >= badge.requirement_value;
        break;
      case 'perfect_day':
        earned = todayStats &&
                 todayStats.problems_solved >= badge.requirement_value &&
                 todayStats.problems_solved === todayStats.correct_answers;
        break;
    }

    if (earned) {
      db.prepare(`
        INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)
      `).run(userId, badge.id);

      newBadges.push(badge);
    }
  }

  return newBadges;
}

// ============= SERVE FRONTEND (PRODUCTION) =============

// Serve static files from dist/ folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`Backend kjører på http://localhost:${PORT}`);
});
