import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

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
  const [userName, setUserName] = useState("");
  const [examFinished, setExamFinished] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);

  useEffect(() => {
    setTimeLeft(totalTime);
    setQuestionTimes(Array(totalQuestions).fill(0));
  }, [totalQuestions, totalTime]);

  useEffect(() => {
    let timer;
    if (sessionStarted && timeLeft > 0 && !examFinished) {
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
        setQuestionTimeLeft((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionStarted, currentQuestion, timeLeft, examFinished]);

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
      const log = `Q${currentQuestion} - ${formatTime(questionTimes[currentQuestion - 1])}`;
      setQuestionLogs((prev) => [...prev, log]);
    }
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionTimeLeft(0);
    } else {
      setExamFinished(true);
    }
  };

  const handleStart = () => {
    setSessionStarted(true);
    setQuestionTimeLeft(0);
  };

  const handleReset = () => {
    setTotalQuestions(10);
    setTotalTime(600);
    setCurrentQuestion(1);
    setTimeLeft(600);
    setQuestionTimes(Array(10).fill(0));
    setSessionStarted(false);
    setSettingsSubmitted(false);
    setPlayAlert(false);
    setQuestionLogs([]);
    setUserName("");
    setExamFinished(false);
    setQuestionTimeLeft(0);
  };

  const handleBackToSettings = () => {
    setSettingsSubmitted(false);
    setSessionStarted(false);
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSubmitted(true);
  };

  const handleDownload = () => {
    const data = questionLogs.map((log) => {
      const [question, time] = log.split(" - ");
      return { Question: question, Time: time };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log");
    XLSX.writeFile(workbook, `${userName || "Exam"}_Timing_Log.xlsx`);
  };

  const renderLiveLog = () => (
    <div className="mt-4 w-full">
      <h3 className="text-md font-semibold">Live Question Log</h3>
      <textarea
        readOnly
        value={questionLogs.join("\n")}
        rows={questionLogs.length + 1}
        className="w-full mt-2 p-2 border rounded text-sm"
      />
    </div>
  );

  const progressValue = (currentQuestion - 1) / totalQuestions * 100;
  const timeProgress = (totalTime - timeLeft) / totalTime * 100;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white border-2 border-gray-300 rounded-3xl shadow-2xl p-4 flex flex-col items-center font-sans">
        <h1 className="text-xl text-gray-800 font-semibold mb-1">PMP Exam Timing Buddy</h1>
        <h1 className="text-4xl text-blue-600 font-bold mb-4">📘</h1>

        {!settingsSubmitted ? (
          <form className="space-y-3 w-full" onSubmit={handleSettingsSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🙋‍♂️ Your Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg text-center text-base"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">⏳ Total Time (mins)</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border rounded-lg text-center text-base"
                value={totalTime / 60}
                onChange={(e) => setTotalTime(Number(e.target.value) * 60)}
                placeholder="Total Time (mins)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">❓ Total Questions</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border rounded-lg text-center text-base"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                placeholder="Total Questions"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-500 text-white text-xl rounded-xl hover:bg-blue-600 transition">Next</button>
          </form>
        ) : !sessionStarted ? (
          <>
            <button className="w-full py-4 bg-green-500 text-white text-2xl font-semibold rounded-xl shadow hover:bg-green-600 transition mb-4" onClick={handleStart}>Start Exam</button>
            <button className="w-full py-2 bg-gray-300 text-gray-800 text-sm rounded-xl hover:bg-gray-400 transition" onClick={handleBackToSettings}>🔙 Back</button>
          </>
        ) : timeLeft <= 0 || examFinished ? (
          <div className="text-center w-full">
            <div className="mt-4">
              <textarea
                readOnly
                value={questionLogs.join("\n")}
                rows={questionLogs.length + 1}
                className="w-full mt-2 p-2 border rounded text-sm"
              />
              <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">📥 Download Excel Log</button>
              <button onClick={handleReset} className="mt-4 px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">🔙 Back to Home</button>
            </div>
          </div>
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
            <div className="text-3xl font-bold text-red-600 mb-1">🕒 Q-Time: {formatTime(questionTimeLeft)}</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">⏰ Total: {timeLeft}s</div>
            <div className="text-sm text-gray-600 mb-4">📝 Q{currentQuestion} of {totalQuestions}</div>
            <button className="w-full py-4 bg-indigo-600 text-white text-2xl font-bold rounded-xl hover:bg-indigo-700 transition" onClick={handleNextQuestion}>{currentQuestion === totalQuestions ? "Finish" : "Next Question"}</button>
            <button className="mt-2 px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400 transition" onClick={handleReset}>🔄 Reset</button>
            {renderLiveLog()}
          </div>
        )}
      </div>
    </div>
  );
}
