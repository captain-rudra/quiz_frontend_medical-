import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Result.css";

const Result = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    // If the level was actually CLEARED (all correct)
    if (state?.cleared) {
      // 1. Get current global progress
      const globalProgress = JSON.parse(localStorage.getItem("quizProgress")) || { 
        unlockedLevel: 1, 
        completedLevels: [] 
      };

      // 2. Logic to unlock the NEXT level
      // If we just finished level 1, and unlockedLevel is 1, set it to 2.
      if (state.levelNumber >= globalProgress.unlockedLevel) {
        const newUnlocked = state.levelNumber + 1;
        
        const updatedProgress = {
          unlockedLevel: newUnlocked,
          completedLevels: [...globalProgress.completedLevels, state.levelNumber]
        };

        localStorage.setItem("quizProgress", JSON.stringify(updatedProgress));
      }
      
      // Optional: Clear the specific progress for this level so they can replay it fresh later?
      // localStorage.removeItem(`level_progress_${state.levelId}`);
    }
  }, [state]);

  return (
    <div className="result">
      <h2>🎉 Level Cleared!</h2>
      <p>Your Score: {state?.score}</p>
      <p style={{color: 'green', marginTop: '10px'}}>Next Level Unlocked!</p>

      <button onClick={() => navigate("/")}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default Result;