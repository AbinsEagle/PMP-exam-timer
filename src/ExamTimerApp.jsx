import React, { useState, useEffect } from "react";

export default function ExamTimerApp() {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [totalTime, setTotalTime] = useState(600);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [questionTimes, setQuestionTimes] = useState(Array(totalQuestions).fill(0));
  const [sessionStarted, setSessionStarted] = useState(false);
  const [settingsSubmitted, setSettingsSubmitted] = useState(false);
  const [playAlert, setPlayAlert] = useState(false);
  const [questionLogs, setQuestionLogs] = useState([]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + 'm ' : ''}${secs}s`;
  };

  const handleNextQuestion = () => {
    if (currentQuestion <= totalQuestions) {
      setQuestionLogs((prev) => [...prev, `Q${currentQuestion} - ${formatTime(questionTimes[currentQuestion - 1])}`]);
    }
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
          <li key={idx} className="text-sm">Question {idx + 1}: {formatTime(time)}</li>
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
    <div className="p-4 max-w-4xl mx-auto min-h-screen flex flex-col justify-center items-start bg-gray-50 text-left">
      <h1 className="text-xl font-bold mb-4 w-full text-center">📘 Exam Timer</h1>
      <div className="w-full flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          {!settingsSubmitted ? (
            <form className="space-y-4" onSubmit={handleSettingsSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Total Exam Time (in minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-4 border rounded-xl text-lg shadow"
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
                  className="w-full p-4 border rounded-xl text-lg shadow"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  required
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition">Next</button>
            </form>
          ) : !sessionStarted ? (
            <button className="w-full py-4 bg-green-600 text-white text-lg rounded-xl shadow-md hover:bg-green-700 transition" onClick={handleStart}>Start Exam</button>
          ) : timeLeft <= 0 || currentQuestion > totalQuestions ? (
            renderReport()
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold">✅ Answering Completion: {progressValue.toFixed(1)}%</div>
                  <progress value={progressValue} max="100" className="w-full h-2" />
                </div>
                <div>
                  <div className="text-sm font-semibold">⏱️ Time Efficiency: {timeProgress.toFixed(1)}%</div>
                  <progress value={timeProgress} max="100" className="w-full h-2 bg-red-100" />
                </div>
              </div>
              <div className="text-md font-semibold mb-2">⏰ Time Left: {timeLeft}s</div>
              <div className="text-md mb-4">📝 Question: {currentQuestion} / {totalQuestions}</div>
              <button className="w-full py-4 bg-indigo-600 text-white text-lg rounded-xl shadow-md hover:bg-indigo-700 transition" onClick={handleNextQuestion}>Next Question</button>
            </div>
          )}
        </div>
        <div className="w-full sm:w-1/3">
          <h3 className="text-md font-bold mb-2">⏱ Question Log</h3>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-sm">Question</th>
                <th className="p-2 text-sm">Time</th>
              </tr>
            </thead>
            <tbody>
              {questionLogs.map((log, index) => {
                const [label, time] = log.split(" - ");
                return (
                  <tr key={index}>
                    <td className="p-2 text-sm">{label}</td>
                    <td className="p-2 text-sm">{time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
