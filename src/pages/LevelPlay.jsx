import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/quizApi";
import "../styles/LevelPlay.css";

const LevelPlay = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const currentLevelNumber = state?.levelNumber;

  // --- STATE ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // New Error State

  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [solvedIds, setSolvedIds] = useState([]);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/levels/${levelId}/questions`);
        
        // CHECK IF DATA IS EMPTY
        if (!res.data || res.data.length === 0) {
           setQuestions([]); // Ensure it is empty array
           setLoading(false);
           return;
        }

        setQuestions(res.data);

        // Load Progress
        const savedData = JSON.parse(localStorage.getItem(`level_progress_${levelId}`));
        if (savedData) {
          setIndex(savedData.index || 0);
          setMaxIndex(savedData.maxIndex || 0);
          setScore(savedData.score || 0);
          setSolvedIds(savedData.solvedIds || []);
        }
        setLoading(false);

      } catch (err) {
        console.error("Error loading level", err);
        setError("Failed to load questions. Please check your connection.");
        setLoading(false);
      }
    };

    fetchGameData();
  }, [levelId]);

  // --- 2. SAVE DATA ---
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const gameState = { index, maxIndex, score, solvedIds };
      localStorage.setItem(`level_progress_${levelId}`, JSON.stringify(gameState));
    }
  }, [index, maxIndex, score, solvedIds, levelId, loading, questions.length]);

  // --- HANDLERS ---
  const goToPrevious = () => {
    if (index > 0) setIndex(index - 1);
  };

  const goToNext = () => {
    if (index < maxIndex) setIndex(index + 1);
  };

  const handleVideoContinue = () => {
    const currentQ = questions[index];
    const isAlreadySolved = solvedIds.includes(currentQ._id);
    if (!isAlreadySolved) {
      setSolvedIds((prev) => [...prev, currentQ._id]);
      if (index === maxIndex) setMaxIndex((prev) => prev + 1);
    }
    handleNavigation(isAlreadySolved);
  };

  const handleAnswer = (selectedOption) => {
    const currentQ = questions[index];
    const isCorrect = currentQ.correctAnswer === selectedOption;

    if (!isCorrect) {
      alert("❌ Wrong answer! Try Again");
      return; 
    }

    const isAlreadySolved = solvedIds.includes(currentQ._id);

    if (!isAlreadySolved) {
      setScore((prev) => prev + 10);
      setSolvedIds((prev) => [...prev, currentQ._id]);
      if (index === maxIndex) setMaxIndex((prev) => prev + 1);
    }

    handleNavigation(isAlreadySolved);
  };

  const handleNavigation = (wasAlreadySolved) => {
    if (index + 1 === questions.length) {
      const currentSolvedCount = wasAlreadySolved ? solvedIds.length : solvedIds.length + 1;
      
      if (currentSolvedCount === questions.length) {
        navigate("/result", {
          state: { 
            score: wasAlreadySolved ? score : score + (questions[index].type === 'video' ? 0 : 10), 
            levelNumber: currentLevelNumber,
            levelId: levelId,
            cleared: true 
          },
        });
      } else {
        alert("You must complete all questions to finish!");
      }
    } else {
      setIndex(index + 1);
    }
  };

  // --- RENDER STATES ---

  // 1. Loading
  if (loading) return <div className="loading-screen"><h3>🔄 Loading Level...</h3></div>;

  // 2. Error (Network fail)
  if (error) return (
    <div className="error-screen">
      <h3>⚠️ Oops!</h3>
      <p>{error}</p>
      <button onClick={() => navigate("/")}>Back to Dashboard</button>
    </div>
  );

  // 3. No Questions Found (The fix for your question)
  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <h2>🚧 Under Construction</h2>
        <p>This level has no questions yet. Please come back later!</p>
        <button className="back-btn-dashboard" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // 4. Normal Game Render
  const currentQuestion = questions[index];
  const isVideo = currentQuestion.videoUrl || currentQuestion.type === 'video';

  return (
    <div className="level-play">
      <div className="navigation-header">
        <button className="back-btn" onClick={goToPrevious} disabled={index === 0}>
          ⬅ Back
        </button>
        {index < maxIndex && (
           <button className="next-btn-nav" onClick={goToNext}>Next ➡</button>
        )}
      </div>

      <h2 className="level-title">Question {index + 1}/{questions.length}</h2>
      <div className="score-box">Score: {score}</div>

      <div className="question-card">
        <p className="question-text">{currentQuestion.questionText}</p>
      </div>

      {isVideo ? (
        <div className="video-section">
          <div className="video-container">
            <iframe
              width="100%"
              height="315"
              src={currentQuestion.videoUrl}
              title="Video Question"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button className="continue-btn" onClick={handleVideoContinue}>
            Continue ➡
          </button>
        </div>
      ) : (
        <div className="options-container">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt}
              className="option-btn"
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LevelPlay;