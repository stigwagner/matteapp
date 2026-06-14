import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';

interface TableSelectorProps {
  user: User;
}

interface GradeCurriculum {
  name: string;
  description: string;
  recommendedTables: number[];
}

function TableSelector({ user }: TableSelectorProps) {
  const navigate = useNavigate();
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [curriculum, setCurriculum] = useState<GradeCurriculum | null>(null);
  const [operationType, setOperationType] = useState<'multiplication' | 'division' | 'mixed'>('multiplication');

  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Last inn curriculum for brukerens klassetrinn
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/curriculum/${user.grade}`);
        const data = await response.json();
        setCurriculum(data);
      } catch (err) {
        console.error('Kunne ikke laste curriculum:', err);
      }
    };
    loadCurriculum();
  }, [user.grade]);

  const toggleTable = (tableNum: number) => {
    if (selectedTables.includes(tableNum)) {
      setSelectedTables(selectedTables.filter((t) => t !== tableNum));
    } else {
      setSelectedTables([...selectedTables, tableNum]);
    }
  };

  const selectAll = () => {
    setSelectedTables(tables);
  };

  const deselectAll = () => {
    setSelectedTables([]);
  };

  const selectRecommended = () => {
    if (curriculum) {
      setSelectedTables(curriculum.recommendedTables);
    }
  };

  const startPractice = async () => {
    if (selectedTables.length === 0) {
      setError('Velg minst én tabell');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/practice/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          selectedTables: selectedTables.sort((a, b) => a - b),
          operationType: operationType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kunne ikke starte øving');
        setLoading(false);
        return;
      }

      // Lagre spørsmål og valgte tabeller i localStorage
      localStorage.setItem('selectedTables', JSON.stringify(selectedTables));
      localStorage.setItem('questions', JSON.stringify(data.questions));

      navigate('/practice');
    } catch (err) {
      setError('Kunne ikke koble til server');
      setLoading(false);
    }
  };

  return (
    <div className="table-selector">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Tilbake
        </button>
        <h1>Velg tabeller</h1>
      </header>

      <div className="selector-content">
        <div className="operation-selector">
          <h3>Velg øvelsestype:</h3>
          <div className="operation-buttons">
            <button
              className={`operation-btn ${operationType === 'multiplication' ? 'selected' : ''}`}
              onClick={() => setOperationType('multiplication')}
            >
              ✖️ Ganging
            </button>
            <button
              className={`operation-btn ${operationType === 'division' ? 'selected' : ''}`}
              onClick={() => setOperationType('division')}
            >
              ➗ Deling
            </button>
            <button
              className={`operation-btn ${operationType === 'mixed' ? 'selected' : ''}`}
              onClick={() => setOperationType('mixed')}
            >
              🔀 Blandet
            </button>
          </div>
        </div>

        {curriculum && (
          <div className="curriculum-info">
            <h3>{curriculum.name} - {curriculum.description}</h3>
            <p className="recommended-tables">
              Anbefalte tabeller: {curriculum.recommendedTables.join(', ')}
            </p>
          </div>
        )}

        <p className="instruction">Velg hvilke gangetabeller du vil øve på:</p>

        <div className="selector-actions">
          <button onClick={selectAll} className="btn-secondary">
            Velg alle
          </button>
          <button onClick={deselectAll} className="btn-secondary">
            Fjern alle
          </button>
          {curriculum && (
            <button onClick={selectRecommended} className="btn-recommended">
              Velg anbefalte
            </button>
          )}
        </div>

        <div className="tables-grid">
          {tables.map((tableNum) => {
            const isRecommended = curriculum && curriculum.recommendedTables.includes(tableNum);
            return (
              <div
                key={tableNum}
                className={`table-checkbox ${
                  selectedTables.includes(tableNum) ? 'selected' : ''
                } ${isRecommended ? 'recommended' : ''}`}
                onClick={() => toggleTable(tableNum)}
              >
                <div className="table-number">
                  {tableNum}x
                  {isRecommended && <span className="recommended-badge">⭐</span>}
                </div>
                <div className="check-indicator">
                  {selectedTables.includes(tableNum) ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {selectedTables.length > 0 && (
          <div className="selected-info">
            Valgt: {selectedTables.sort((a, b) => a - b).join(', ')}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={startPractice}
          disabled={loading || selectedTables.length === 0}
          className="btn-primary btn-large"
        >
          {loading ? 'Starter...' : `Start øving (${selectedTables.length} ${selectedTables.length === 1 ? 'tabell' : 'tabeller'})`}
        </button>
      </div>
    </div>
  );
}

export default TableSelector;
