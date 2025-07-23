import { useState, useEffect, useRef } from "react";
import "./App.css";

const BREAK_MODES = {
  short: 5 * 60,
  long: 30 * 60,
};

function App() {
  const [mode, setMode] = useState("pomodoro");
  const [workTime, setWorkTime] = useState(25); // Work time in minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Get current mode duration
  const getCurrentModeDuration = () => {
    if (mode === "pomodoro") {
      return workTime * 60;
    }
    return BREAK_MODES[mode];
  };

  useEffect(() => {
    const newDuration = getCurrentModeDuration();
    setSecondsLeft(newDuration);
    setIsRunning(false);
    clearInterval(timerRef.current);
    // Stop audio when changing modes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [mode, workTime]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            
            // Play alarm sound
            if (audioRef.current) {
              audioRef.current.play();
            }
            
            // Auto-progression: Switch modes and start next timer
            if (mode === "pomodoro") {
              // After Pomodoro, go to Short Break
              setTimeout(() => {
                setMode("short");
                setIsRunning(true);
              }, 2000); // 2 second delay to let alarm play
            } else if (mode === "short") {
              // After Short Break, go back to Pomodoro
              setTimeout(() => {
                setMode("pomodoro");
                setIsRunning(true);
              }, 2000);
            } else if (mode === "long") {
              // After Long Break, go back to Pomodoro
              setTimeout(() => {
                setMode("pomodoro");
                setIsRunning(true);
              }, 2000);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Update document title with remaining time when timer is running
  useEffect(() => {
    if (isRunning) {
      const timeString = formatTime(secondsLeft);
      const modeTitle = mode === "pomodoro" ? "Work" : mode === "short" ? "Short Break" : "Long Break";
      document.title = `${timeString} - ${modeTitle} | ZenTick`;
    } else {
      document.title = "ZenTick - Pomodoro Timer";
    }
  }, [secondsLeft, isRunning, mode]);

  return (
    <div className="container">
      <h1>Pomodora Timer</h1>
      
      {/* Work Time Settings - Only show when in Pomodoro mode */}
      {mode === "pomodoro" && (
        <div className="time-settings">
          <label htmlFor="work-time">Work Time: {workTime} minutes</label>
          <input
            id="work-time"
            type="range"
            min="25"
            max="60"
            step="5"
            value={workTime}
            onChange={(e) => setWorkTime(parseInt(e.target.value))}
            disabled={isRunning}
          />
          <div className="time-markers">
            <span>25 min</span>
            <span>60 min</span>
          </div>
        </div>
      )}

      <div className="mode-buttons">
        <button
          className={mode === "pomodoro" ? "active" : ""}
          onClick={() => setMode("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          className={mode === "short" ? "active" : ""}
          onClick={() => setMode("short")}
        >
          Short Break
        </button>
        <button
          className={mode === "long" ? "active" : ""}
          onClick={() => setMode("long")}
        >
          Long Break
        </button>
      </div>

      <div className="timer">{formatTime(secondsLeft)}</div>

      <div className="controls">
        {!isRunning ? (
          <button onClick={() => setIsRunning(true)}>Start</button>
        ) : (
          <button onClick={() => setIsRunning(false)}>Pause</button>
        )}
        <button
          onClick={() => {
            setSecondsLeft(getCurrentModeDuration());
            setIsRunning(false);
            // Stop and reset audio when reset button is clicked
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }}
        >
          Reset
        </button>
      </div>

      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
    </div>
  );
}

export default App;
