import { useEffect, useState } from "react";
import { api } from "../api/quizApi";
import { LEVEL_CONFIG } from "../constants/levelConfig"; // Make sure you have this file
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();

  // Load progress or default to Level 1 unlocked
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {
    unlockedLevel: 1,
    completedLevels: [],
  };

  useEffect(() => {
    api.get("/levels")
      .then((res) => setLevels(res.data))
      .catch((err) => console.error("Failed to fetch levels", err));
  }, []);

  // --- THE FIX IS HERE ---
  const resetGame = () => {
    // 1. CLEAR EVERYTHING (Global progress + Level specific progress)
    localStorage.clear(); 
    
    // 2. Reload the page to reset all React states to default
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <h1>🎮 Quiz Levels</h1>

      {levels.map((level) => {
        // Check if this level is unlocked based on levelNumber
        const unlocked = level.levelNumber <= progress.unlockedLevel;

        return (
          <div
            key={level._id}
            className={`level-card ${unlocked ? "open" : "locked"}`}
            onClick={() =>
              unlocked &&
              navigate(`/level/${level._id}`, {
                state: { levelNumber: level.levelNumber },
              })
            }
          >
            <h3>{LEVEL_CONFIG[level.levelNumber]?.title || `Level ${level.levelNumber}`}</h3>
            <p>{LEVEL_CONFIG[level.levelNumber]?.subtitle || ""}</p>
            
            {/* Show status icon */}
            {unlocked ? (
                <span className="status-open">🔓 Open</span>
            ) : (
                <span className="status-locked">🔒 Locked</span>
            )}
          </div>
        );
      })}

      <div style={{marginTop: '40px'}}>
        <button className="reset-btn" onClick={resetGame}>
          🔄 Reset Entire Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;