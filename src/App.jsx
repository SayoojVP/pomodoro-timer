import { useState, useEffect, useRef } from "react";
import "./App.css";

const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 30 * 60,
};

function App() {
  const [mode, setMode] = useState("pomodoro");
  const [secondsLeft, setSecondsLeft] = useState(MODES[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(MODES[mode]);
    setIsRunning(false);
    clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (audioRef.current) {
              audioRef.current.play();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="container">
      <h1>Pomodoro Timer</h1>
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
            setSecondsLeft(MODES[mode]);
            setIsRunning(false);
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
