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
    <div className="text-center w-full">
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white border-2 border-gray-300 rounded-3xl shadow-2xl p-4 flex flex-col items-center font-sans">
        <h1 className="text-4xl text-blue-600 font-bold mb-4">📘</h1>
        {!settingsSubmitted ? (
          <form className="space-y-3 w-full" onSubmit={handleSettingsSubmit}>
            <input
              type="number"
              min="1"
              className="w-full p-3 border rounded-lg text-center text-base"
              value={totalTime / 60}
              onChange={(e) => setTotalTime(Number(e.target.value) * 60)}
              placeholder="Total Time (mins)"
              required
            />
            <input
              type="number"
              min="1"
              className="w-full p-3 border rounded-lg text-center text-base"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              placeholder="Total Questions"
              required
            />
            <button type="submit" className="w-full py-3 bg-blue-500 text-white text-xl rounded-xl hover:bg-blue-600 transition">Next</button>
          </form>
        ) : !sessionStarted ? (
          <button className="w-full py-4 bg-green-500 text-white text-2xl font-semibold rounded-xl shadow hover:bg-green-600 transition mb-4" onClick={handleStart}>Start Exam</button>
        ) : timeLeft <= 0 || currentQuestion > totalQuestions ? (
          renderReport()
        ) : (
          <div className="w-full text-center">
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div>
                <div className="mb-1 font-semibold">✅ {progressValue.toFixed(0)}% Complete</div>
                <progress value={progressValue} max="100" className="w-full h-2" />
              </div>
              <div>
                <div className="mb-1 font-semibold">⏱ {timeProgress.toFixed(0)}% Used</div>
                <progress value={timeProgress} max="100" className="w-full h-2" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-800 mb-2">⏰ {timeLeft}s</div>
            <div className="text-sm text-gray-600 mb-4">📝 Q{currentQuestion} of {totalQuestions}</div>
            <button className="w-full py-4 bg-indigo-600 text-white text-2xl font-bold rounded-xl hover:bg-indigo-700 transition" onClick={handleNextQuestion}>Next Question</button>
          </div>
        )}
        <div className="mt-4 w-full">
          <h3 className="text-sm font-bold text-gray-700 mb-1">⏱ Log</h3>
          <div className="bg-gray-50 rounded-lg p-2 shadow-inner max-h-32 overflow-y-auto border border-gray-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="p-1">Q</th>
                  <th className="p-1">Time</th>
                </tr>
              </thead>
              <tbody>
                {questionLogs.map((log, index) => {
                  const [label, time] = log.split(" - ");
                  return (
                    <tr key={index}>
                      <td className="p-1">{label}</td>
                      <td className="p-1">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
