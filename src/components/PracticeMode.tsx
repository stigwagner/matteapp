import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';

interface PracticeModeProps {
  user: User;
}

interface Question {
  a: number;
  b: number;
  answer: number;
  problem: string;
  operationType?: 'multiplication' | 'division';
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

function PracticeMode({ user }: PracticeModeProps) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [exerciseCount, setExerciseCount] = useState(0);

  useEffect(() => {
    const storedQuestions = localStorage.getItem('questions');
    if (!storedQuestions) {
      navigate('/select');
      return;
    }

    const storedMode = localStorage.getItem('practiceMode') as 'practice' | 'test';
    if (storedMode) {
      setMode(storedMode);
    }

    setQuestions(JSON.parse(storedQuestions));
  }, [navigate]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
    setExerciseCount(exerciseCount + 1);

    // I testmodus: oppdater score
    if (mode === 'test' && isCorrect) {
      setScore(score + 1);
    }

    // Lagre svar til backend
    try {
      const response = await fetch('http://localhost:3002/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          tableNumber: currentQuestion.a,
          problem: currentQuestion.problem,
          answer: currentQuestion.answer,
          userAnswer: parseInt(userAnswer),
          mode: mode,
          operationType: currentQuestion.operationType || 'multiplication',
        }),
      });

      const data = await response.json();

      if (data.newBadges && data.newBadges.length > 0) {
        setNewBadges(data.newBadges);
        setShowBadgeModal(true);
      }
    } catch (err) {
      console.error('Kunne ikke lagre svar:', err);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setShowAnswer(false);
    } else {
      // Ferdig med alle spørsmål
      localStorage.removeItem('questions');
      navigate('/dashboard');
    }
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setNewBadges([]);
  };

  if (!currentQuestion) {
    return <div className="loading">Laster...</div>;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="practice-mode">
      <header className="practice-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Avslutt
        </button>
        <div className="progress-info">
          {mode === 'practice' ? '💪 Øving' : '🏆 Test'} • Spørsmål {currentIndex + 1} av {questions.length}
        </div>
        <div className="score-info">
          {mode === 'test' ? `Score: ${score}/${questions.length}` : `Øvelser: ${exerciseCount}`}
        </div>
      </header>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="practice-content">
        <div className="question-box">
          <div className="question-text">
            {currentQuestion.a} {currentQuestion.operationType === 'division' ? '÷' : '×'} {currentQuestion.b} = ?
          </div>

          {!showAnswer ? (
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Ditt svar"
                className="answer-input"
                autoFocus
              />
              <button type="submit" className="btn-primary btn-large">
                Sjekk svar
              </button>
            </form>
          ) : (
            <div className="answer-feedback">
              <div className={`feedback-message ${feedback}`}>
                {feedback === 'correct' ? (
                  <>
                    <div className="feedback-icon">✓</div>
                    <div className="feedback-text">Riktig!</div>
                  </>
                ) : (
                  <>
                    <div className="feedback-icon">✗</div>
                    <div className="feedback-text">
                      Feil. Riktig svar er {currentQuestion.answer}
                    </div>
                  </>
                )}
              </div>

              <button onClick={nextQuestion} className="btn-primary btn-large">
                {currentIndex < questions.length - 1 ? 'Neste spørsmål' : 'Ferdig'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showBadgeModal && newBadges.length > 0 && (
        <div className="modal-overlay" onClick={closeBadgeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Gratulerer!</h2>
            <p>Du har tjent {newBadges.length === 1 ? 'en ny badge' : 'nye badges'}:</p>
            <div className="new-badges">
              {newBadges.map((badge) => (
                <div key={badge.id} className="new-badge">
                  <div className="badge-icon-large">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                </div>
              ))}
            </div>
            <button onClick={closeBadgeModal} className="btn-primary">
              Fortsett
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticeMode;
