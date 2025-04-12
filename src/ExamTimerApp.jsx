import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExamTimerApp() {
  const [userName, setUserName] = useState("");
  const [totalTime, setTotalTime] = useState(600);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [questionTime, setQuestionTime] = useState(0);
  const [stage, setStage] = useState("input");
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timer;
    if (stage === "exam" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setQuestionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setStage("loading");
    try {
      const res = await fetch("https://pmp-exam-trainer.onrender.com/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: totalQuestions })
      });
      const data = await res.json();
      setQuestions(data.slice(0, totalQuestions));
      setTimeLeft(totalTime);
      setStage("ready");
    } catch (err) {
      alert("Failed to fetch questions");
      setStage("input");
    }
  };

  const handleQuestionChange = (e) => {
    const num = Number(e.target.value);
    setTotalQuestions(num);
    const timePerQuestion = 230 / 180;
    const estimatedTime = Math.ceil(num * timePerQuestion);
    setTotalTime(estimatedTime * 60);
  };

  const handleStartExam = () => {
    setStage("exam");
    setQuestionTime(0);
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        selected: selectedOption,
        time: questionTime,
        correct: isCorrect
      },
    }));

    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionTime(0);
      setSelectedOption("");
    } else {
      setStage("result");
    }
  };

  const handleAutoSubmit = () => {
    setStage("result");
  };

  const handleRestart = () => {
    setUserName("");
    setTotalTime(600);
    setTotalQuestions(5);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(600);
    setQuestionTime(0);
    setStage("input");
    setSelectedOption("");
    setScore(0);
  };

  const handleDownloadExcel = () => {
    const data = questions.map((q, idx) => {
      const a = selectedAnswers[idx] || {};
      return {
        Question: q.question,
        "Your Answer": a.selected,
        "Correct Answer": q.answer,
        "Correct?": a.correct ? "Yes" : "No",
        "Time Taken (s)": a.time || 0
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "pmp_exam_results.xlsx");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-6 font-sans border border-gray-300">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">🧠 PMP Exam Trainer</h1>

        {stage === "input" && (
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">👤 Your Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📝 How many questions do you want to practice?</label>
              <input
                type="number"
                placeholder="Number of questions"
                value={totalQuestions}
                onChange={handleQuestionChange}
                required
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">⏱ Estimated Time: {formatTime(totalTime)}</p>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl">
              Generate Questions
            </button>
          </form>
        )}

        {stage === "loading" && <p className="text-center">Loading questions from ChatGPT...</p>}

        {stage === "ready" && (
          <button onClick={handleStartExam} className="w-full py-3 bg-green-600 text-white text-xl rounded-xl">
            ▶️ Start Exam
          </button>
        )}

        {stage === "exam" && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>✅ {Math.round((currentQuestionIndex / totalQuestions) * 100)}% Complete</span>
              <span>⏱ {Math.round(((totalTime - timeLeft) / totalTime) * 100)}% Used</span>
            </div>
            <div className="flex justify-between mb-2">
              <progress value={currentQuestionIndex} max={totalQuestions} className="w-1/2 mr-1" />
              <progress value={totalTime - timeLeft} max={totalTime} className="w-1/2 ml-1" />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border mb-4">
              <p className="font-semibold mb-2">Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}</p>
              {Object.entries(questions[currentQuestionIndex]?.options).map(([key, val]) => (
                <label key={key} className="block mb-2">
                  <input
                    type="radio"
                    name="option"
                    value={key}
                    checked={selectedOption === key}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mr-2"
                  />
                  <strong>{key}</strong>. {val}
                </label>
              ))}
            </div>
            <p className="text-center text-gray-600 text-sm mb-2">⏲️ Time on this question: {formatTime(questionTime)}</p>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-indigo-600 text-white text-xl rounded-xl hover:bg-indigo-700"
              disabled={!selectedOption}
            >
              {currentQuestionIndex + 1 === totalQuestions ? "Finish" : "Next Question"}
            </button>
          </div>
        )}

        {stage === "result" && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-700">✅ Exam Complete</h2>
            <p className="text-lg my-2">Score: {score}/{totalQuestions} — {score / totalQuestions >= 0.6 ? "Pass" : "Fail"}</p>
            <ul className="text-left mt-4 text-sm">
              {questions.map((q, idx) => {
                const user = selectedAnswers[idx] || {};
                const isCorrect = user.correct;
                return (
                  <li
                    key={idx}
                    className={`mb-1 p-2 rounded ${isCorrect ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <strong>Q{idx + 1}:</strong> {q.question}<br />
                    <span>Your Answer: {user.selected || "None"}</span><br />
                    <span>Correct Answer: {q.answer}</span><br />
                    <span>Time: {formatTime(user.time || 0)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <button
                onClick={handleDownloadExcel}
                className="mr-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📥 Download Excel Log
              </button>
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                🔁 Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
