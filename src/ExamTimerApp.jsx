import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ExamTimerApp() {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [totalTime, setTotalTime] = useState(600); // default 10 minutes
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [questionTimes, setQuestionTimes] = useState(Array(totalQuestions).fill(0));
  const [sessionStarted, setSessionStarted] = useState(false);
  const [settingsSubmitted, setSettingsSubmitted] = useState(false);
  const [playAlert, setPlayAlert] = useState(false);

  useEffect(() => {
    setTimeLeft(totalTime);
    setQuestionTimes(Array(totalQuestions).fill(0));
  }, [totalQuestions, totalTime]);

  useEffect(() => {
    let timer;
    if (sessionStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime === 10) setPlayAlert(true);
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
      const audio = new Audio("/alert.mp3");
      audio.play();
      setPlayAlert(false);
    }
  }, [playAlert]);

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleStart = () => {
    setSessionStarted(true);
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSubmitted(true);
  };

  const renderReport = () => (
    <div className="mt-4 text-center">
      <h2 className="text-lg font-bold mb-2">Session Report</h2>
      <ul className="list-inside">
        {questionTimes.map((time, idx) => (
          <li key={idx} className="text-sm">Question {idx + 1}: {time} seconds</li>
        ))}
      </ul>
      <div className="mt-4">
        <h3 className="text-md font-semibold">Detailed Log</h3>
        <textarea
          readOnly
          value={questionTimes.map((time, idx) => `Question ${idx + 1}: ${time} seconds`).join("\n")}
          rows={totalQuestions + 1}
          className="w-full mt-2 p-2 border rounded text-sm"
        />
      </div>
    </div>
  );

  const progressValue = (currentQuestion - 1) / totalQuestions * 100;
  const timeProgress = (totalTime - timeLeft) / totalTime * 100;

  return (
    <div className="p-4 max-w-sm mx-auto min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
      <h1 className="text-xl font-bold mb-4">📘 Exam Timer</h1>
      {!settingsSubmitted ? (
        <form className="w-full space-y-4" onSubmit={handleSettingsSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Total Exam Time (in minutes)</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded"
              value={totalTime / 60}
              onChange={(e) => setTotalTime(Number(e.target.value) * 60)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Number of Questions</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full py-2">Next</Button>
        </form>
      ) : !sessionStarted ? (
        <Button className="w-full py-2" onClick={handleStart}>Start Exam</Button>
      ) : timeLeft <= 0 || currentQuestion > totalQuestions ? (
        renderReport()
      ) : (
        <div className="w-full">
          <Progress value={progressValue} className="mb-2 h-3 rounded-full" />
          <Progress value={timeProgress} className="mb-4 h-2 bg-red-100 rounded-full" />
          <div className="text-md font-semibold mb-2">⏰ Time Left: {timeLeft}s</div>
          <div className="text-md mb-4">📝 Question: {currentQuestion} / {totalQuestions}</div>
          <Button className="w-full py-2" onClick={handleNextQuestion}>Next Question</Button>
        </div>
      )}
    </div>
  );
}

