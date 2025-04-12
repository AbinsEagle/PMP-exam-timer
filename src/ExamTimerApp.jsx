import React, { useState, useEffect } from "react";

export default function ExamTimerApp() {
  const [userName, setUserName] = useState("");
  const [totalTime, setTotalTime] = useState(600);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [questionTime, setQuestionTime] = useState(0);
  const [stage, setStage] = useState("input"); // input, ready, exam, result
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
      const res = await fetch("https://your-render-api.onrender.com/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-6 font-sans border border-gray-300">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">🧠 PMP Exam Timer</h1>

        {stage === "input" && (
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Total time in minutes"
              value={totalTime / 60}
              onChange={(e) => setTotalTime(Number(e.target.value) * 60)}
              required
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Number of questions"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              required
              className="w-full p-3 border rounded-lg"
            />
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
            <p className="text-right text-sm text-gray-500">⏱ {formatTime(timeLeft)}</p>
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
            <button
              onClick={handleRestart}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔁 Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
