
import React, { useState, useEffect } from "react";

const TOTAL_QUESTIONS = 10;
const TOTAL_TIME = 10 * 60; // 10 minutes in seconds

export default function ExamTimerApp() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [questionTimes, setQuestionTimes] = useState(Array(TOTAL_QUESTIONS).fill(0));
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [playAlert, setPlayAlert] = useState(false);

  useEffect(() => {
    let timer;
    if (sessionStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime === 10) {
            setPlayAlert(true); // play alert at 10 seconds left
          }
          return newTime;
        });
        setQuestionTimes((prev) => {
          const updated = [...prev];
          updated[currentQuestion - 1] += 1;
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionStarted, currentQuestion, timeLeft]);

  useEffect(() => {
    if (playAlert) {
      const audio = new Audio("/alert.mp3"); // Make sure you have an alert.mp3 in your public folder
      audio.play();
      setPlayAlert(false);
    }
  }, [playAlert]);

  const handleNextQuestion = () => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleStart = () => {
    setSessionStarted(true);
    setQuestionStartTime(Date.now());
  };

  const renderReport = () => (
    <div className="mt-4 text-center">
      <h2 className="text-lg font-bold mb-2">Session Report</h2>
      <ul className="list-inside">
        {questionTimes.map((time, idx) => (
          <li key={idx} className="text-sm">Question {idx + 1}: {time} seconds</li>
        ))}
      </ul>
    </div>
  );

  const progressValue = (currentQuestion - 1) / TOTAL_QUESTIONS * 100;
  const timeProgress = (TOTAL_TIME - timeLeft) / TOTAL_TIME * 100;

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📘 Exam Timer</h1>
      {!sessionStarted ? (
        <button style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '0.5rem' }} onClick={handleStart}>Start Exam</button>
      ) : timeLeft <= 0 || currentQuestion > TOTAL_QUESTIONS ? (
        renderReport()
      ) : (
        <div style={{ width: '100%' }}>
          <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '9999px', marginBottom: '8px' }}>
            <div style={{ width: `${progressValue}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '9999px' }}></div>
          </div>
          <div style={{ height: '8px', backgroundColor: '#fee2e2', borderRadius: '9999px', marginBottom: '16px' }}>
            <div style={{ width: `${timeProgress}%`, backgroundColor: '#ef4444', height: '100%', borderRadius: '9999px' }}></div>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>⏰ Time Left: {timeLeft}s</div>
          <div style={{ fontSize: '1rem', marginBottom: '16px' }}>📝 Question: {currentQuestion} / {TOTAL_QUESTIONS}</div>
          <button style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '0.5rem' }} onClick={handleNextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}
