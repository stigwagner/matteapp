/**
 * Nivåtilpassede opplegg for gangetabellen
 * Basert på norsk læreplan og pedagogisk progresjon
 */

export const GRADE_CURRICULUM = {
  // 1. KLASSE (6-7 år) - Grunnleggende tallforståelse
  grade1: {
    name: '1. klasse',
    ageRange: '6-7 år',
    description: 'Grunnleggende ganging med 2x, 5x og 10x',

    // Anbefalte tabeller for dette nivået
    recommendedTables: [2, 5, 10],

    // Progressjon: Hvilke tabeller i hvilken rekkefølge?
    progression: [
      { week: 1, tables: [2], description: '2-gangen: Doble tall (lett å forstå)' },
      { week: 2, tables: [2], description: '2-gangen: Mer øving' },
      { week: 3, tables: [10], description: '10-gangen: Legge til 0' },
      { week: 4, tables: [10], description: '10-gangen: Mer øving' },
      { week: 5, tables: [2, 10], description: 'Blanding: 2x og 10x' },
      { week: 6, tables: [5], description: '5-gangen: Telle på fingrene' },
      { week: 7, tables: [5], description: '5-gangen: Mer øving' },
      { week: 8, tables: [2, 5, 10], description: 'Alle tre tabeller' }
    ],

    // Hvor mange oppgaver per økt?
    recommendedPractice: {
      minProblems: 5,
      idealProblems: 10,
      maxProblems: 15
    },

    // Forventede resultater
    expectations: {
      accuracy: {
        week4: 70,  // 70% riktig etter 4 uker
        week8: 85,  // 85% riktig etter 8 uker
        endOfYear: 90
      },
      speed: {
        targetSecondsPerProblem: 8  // 8 sekunder per oppgave
      }
    },

    // Badges tilpasset nivå
    badges: [
      { name: 'Doblings-helt 🎯', requirement: '10 riktige på 2-gangen', points: 50 },
      { name: 'Ti-teller 🔟', requirement: '10 riktige på 10-gangen', points: 50 },
      { name: 'Finger-mester ✋', requirement: '10 riktige på 5-gangen', points: 50 }
    ]
  },

  // 2. KLASSE (7-8 år) - Utvide til flere tabeller
  grade2: {
    name: '2. klasse',
    ageRange: '7-8 år',
    description: 'Utvide med 3x, 4x og befeste de lette tabellene',

    recommendedTables: [2, 3, 4, 5, 10],

    progression: [
      { week: 1, tables: [2, 5, 10], description: 'Repetisjon fra 1. klasse' },
      { week: 2, tables: [3], description: '3-gangen: Telle med 3' },
      { week: 3, tables: [3], description: '3-gangen: Mer øving' },
      { week: 4, tables: [2, 3, 5], description: 'Blanding: 2x, 3x, 5x' },
      { week: 5, tables: [4], description: '4-gangen: Dobbel-dobling' },
      { week: 6, tables: [4], description: '4-gangen: Mer øving' },
      { week: 7, tables: [2, 3, 4, 5], description: 'Alle fire tabeller' },
      { week: 8, tables: [2, 3, 4, 5, 10], description: 'Alle fem tabeller' }
    ],

    recommendedPractice: {
      minProblems: 10,
      idealProblems: 15,
      maxProblems: 20
    },

    expectations: {
      accuracy: {
        week4: 75,
        week8: 85,
        endOfYear: 90
      },
      speed: {
        targetSecondsPerProblem: 6
      }
    },

    badges: [
      { name: 'Tre-teller 3️⃣', requirement: '15 riktige på 3-gangen', points: 75 },
      { name: 'Fire-fant 4️⃣', requirement: '15 riktige på 4-gangen', points: 75 },
      { name: 'Fem-tabell mester 🌟', requirement: 'Mestre 2x, 3x, 4x, 5x, 10x', points: 200 }
    ]
  },

  // 3. KLASSE (8-9 år) - Hele lille gangetabellen
  grade3: {
    name: '3. klasse',
    ageRange: '8-9 år',
    description: 'Hele lille gangetabellen (1x-10x)',

    recommendedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

    progression: [
      { week: 1, tables: [2, 3, 4, 5, 10], description: 'Repetisjon fra 2. klasse' },
      { week: 2, tables: [6], description: '6-gangen: Dobbel 3-gang' },
      { week: 3, tables: [6], description: '6-gangen: Mer øving' },
      { week: 4, tables: [7], description: '7-gangen: Vanskeligste!' },
      { week: 5, tables: [7], description: '7-gangen: Ekstra øving' },
      { week: 6, tables: [8], description: '8-gangen: Dobbel 4-gang' },
      { week: 7, tables: [9], description: '9-gangen: Finn mønster' },
      { week: 8, tables: [1], description: '1-gangen: Lett avslutning' },
      { week: 9, tables: [6, 7, 8, 9], description: 'De vanskelige tabellene' },
      { week: 10, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], description: 'ALLE tabellene!' }
    ],

    recommendedPractice: {
      minProblems: 15,
      idealProblems: 20,
      maxProblems: 30
    },

    expectations: {
      accuracy: {
        week5: 75,
        week10: 85,
        endOfYear: 95
      },
      speed: {
        targetSecondsPerProblem: 4  // Skal bli raskt!
      }
    },

    badges: [
      { name: 'Seks-stjerne ⭐', requirement: '20 riktige på 6-gangen', points: 100 },
      { name: 'Syv-sjef 🎖️', requirement: '20 riktige på 7-gangen', points: 150 },
      { name: 'Åtte-as 🏆', requirement: '20 riktige på 8-gangen', points: 100 },
      { name: 'Ni-ninja 🥋', requirement: '20 riktige på 9-gangen', points: 100 },
      { name: 'Gangetabell-MESTER 👑', requirement: 'Mestre ALLE tabellene', points: 500 }
    ]
  },

  // 4. KLASSE og oppover - Store gangetabellen (valgfritt)
  grade4plus: {
    name: '4. klasse+',
    ageRange: '9+ år',
    description: 'Utvidet: Store gangetabellen (11x-20x) og utfordringer',

    recommendedTables: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],

    progression: [
      { week: 1, tables: [11], description: '11-gangen: Samme tall to ganger' },
      { week: 2, tables: [12], description: '12-gangen: Dusin' },
      { week: 3, tables: [15], description: '15-gangen: Kvarter' },
      { week: 4, tables: [20], description: '20-gangen: Legge til 0' },
      { week: 5, tables: [11, 12, 15, 20], description: 'De enkleste store' }
    ],

    recommendedPractice: {
      minProblems: 20,
      idealProblems: 30,
      maxProblems: 50
    },

    expectations: {
      accuracy: {
        week5: 70,
        week10: 85,
        endOfYear: 90
      },
      speed: {
        targetSecondsPerProblem: 5
      }
    },

    badges: [
      { name: 'Stor-tabell nybegynner 📚', requirement: '20 riktige på 11x eller 12x', points: 150 },
      { name: 'Stor-tabell ekspert 🎓', requirement: 'Mestre 4+ store tabeller', points: 300 }
    ]
  }
};

/**
 * Hjelpe-funksjoner
 */

// Hent curriculum for en spesifikk klasse
export function getCurriculumForGrade(grade) {
  const key = `grade${grade}`;
  if (GRADE_CURRICULUM[key]) {
    return GRADE_CURRICULUM[key];
  }
  // 4. klasse og oppover
  if (grade >= 4) {
    return GRADE_CURRICULUM.grade4plus;
  }
  // Default til 2. klasse
  return GRADE_CURRICULUM.grade2;
}

// Hent anbefalte tabeller basert på uke i skoleåret
export function getRecommendedTablesForWeek(grade, weekNumber) {
  const curriculum = getCurriculumForGrade(grade);
  const weekPlan = curriculum.progression.find(p => p.week === weekNumber);

  if (weekPlan) {
    return {
      tables: weekPlan.tables,
      description: weekPlan.description
    };
  }

  // Hvis vi er utover planlagte uker, bruk alle anbefalte tabeller
  return {
    tables: curriculum.recommendedTables,
    description: 'Repetering av alle tabeller'
  };
}

// Beregn forventet nøyaktighet for en gitt uke
export function getExpectedAccuracy(grade, weekNumber) {
  const curriculum = getCurriculumForGrade(grade);
  const expectations = curriculum.expectations.accuracy;

  if (weekNumber <= 4) return expectations.week4 || 70;
  if (weekNumber <= 8) return expectations.week8 || 80;
  return expectations.endOfYear || 85;
}

// Sjekk om en tabell er anbefalt for dette nivået
export function isTableRecommended(grade, tableNumber) {
  const curriculum = getCurriculumForGrade(grade);
  return curriculum.recommendedTables.includes(tableNumber);
}

// Få motiverende melding basert på fremgang
export function getMotivationalMessage(grade, accuracy, problemsSolved) {
  const expected = getExpectedAccuracy(grade, 8); // Midtpunkt

  if (accuracy >= 95) {
    return '🌟 Perfekt! Du er en gangetabell-stjerne!';
  } else if (accuracy >= expected + 10) {
    return '🎉 Fantastisk! Du ligger godt foran målet!';
  } else if (accuracy >= expected) {
    return '👍 Flott jobba! Du er på rett spor!';
  } else if (accuracy >= expected - 10) {
    return '💪 Bra! Fortsett å øve så blir du bedre!';
  } else {
    return '🌱 Godt forsøk! Hver øving gjør deg litt bedre!';
  }
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GRADE_CURRICULUM,
    getCurriculumForGrade,
    getRecommendedTablesForWeek,
    getExpectedAccuracy,
    isTableRecommended,
    getMotivationalMessage
  };
}
