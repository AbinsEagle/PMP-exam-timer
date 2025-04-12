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
        body: JSON.stringify({ count: totalQuestions }),
      });
      const data = await res.json();
      const questionSet = data.slice(0, totalQuestions).map((q, i) => ({
        ...q,
        id: i + 1,
      }));
      setQuestions(questionSet);
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
    const timePerQuestion = (230 / 180) * 60;
    const estimatedTotalTime = Math.ceil(num * timePerQuestion);
    setTotalTime(estimatedTotalTime);
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
        correct: isCorrect,
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

  const handleAutoSubmit = () => setStage("result");

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
        "Time Taken (s)": a.time || 0,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "pmp_exam_results.xlsx");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl p-6 font-sans border border-gray-300">
        <h1 className="text-2xl font-bold text-center mb-1 text-blue-700">📊 PMP Exam Trainer</h1>
        <p className="text-center text-sm text-gray-600 mb-4 italic">
          📘 PMP Insight: You get 230 minutes to answer 180 questions. That’s about 1.28 minutes per question. ⏳
        </p>

        {stage === "loading" && (
          <div className="text-center text-lg font-semibold text-gray-600 p-4 animate-pulse">
            🧞 Loading your questions from the PMP Genie...
          </div>
        )}

        {stage === "ready" && (
          <div className="text-center mt-4 space-y-4 animate-fade-in">
            <p className="text-green-700 font-medium text-lg">🚀 You’re all set, {userName}! Let’s begin your PMP challenge.</p>
            <button
              onClick={handleStartExam}
              className="py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Start Exam
            </button>
            <button
              onClick={() => setStage("input")}
              className="text-sm text-gray-500 hover:underline"
            >
              ⬅️ Back
            </button>
          </div>
        )}

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

        {stage === "exam" && questions.length > 0 && questions[currentQuestionIndex] && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="text-sm text-gray-600">⏱ Time Left: {formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-600">📍 Question {currentQuestionIndex + 1} of {totalQuestions}</div>
              <div className="text-sm text-blue-700">⌛ Time on this question: {formatTime(questionTime)}</div>
            </div>
            <div className="mt-4">
              <p className="font-semibold mb-4 break-words whitespace-pre-wrap">Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}</p>
              {questions[currentQuestionIndex].options.map((opt, idx) => (
                <div key={idx} className="mb-2 break-words whitespace-pre-wrap">
                  <label className="inline-flex items-start gap-2 w-full">
                    <input
                      type="radio"
                      name="option"
                      value={opt}
                      checked={selectedOption === opt}
                      onChange={() => setSelectedOption(opt)}
                      className="mt-1"
                    />
                    <span className="leading-snug">{opt}</span>
                  </label>
                </div>
              ))}
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl disabled:opacity-50"
              >
                {currentQuestionIndex + 1 === totalQuestions ? "Finish Exam" : "Next Question"}
              </button>
            </div>

            {/* ✅ Real-Time Log */}
            {Object.keys(selectedAnswers).length > 0 && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h3 className="font-bold mb-2 text-gray-700">🧾 Real-Time Log</h3>
                <ul className="text-sm space-y-1 text-gray-600 max-h-48 overflow-y-auto">
                  {Object.entries(selectedAnswers).map(([index, ans]) => (
                    <li key={index}>
                      <strong>Q{Number(index) + 1}:</strong> {formatTime(ans.time)} – <em>{ans.selected}</em>{" "}
                      <span className={`ml-2 font-semibold ${ans.correct ? "text-green-600" : "text-red-500"}`}>
                        {ans.correct ? "✔ Correct" : "✘ Wrong"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {stage === "result" && (
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-green-700">🎉 Well done, {userName}!</h2>
            <p className="text-gray-700">You completed the PMP practice with a score of <strong>{score}</strong> out of <strong>{totalQuestions}</strong>.</p>
            <button onClick={handleDownloadExcel} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">⬇️ Download Excel Log</button>
            <button onClick={handleRestart} className="block w-full mt-4 px-4 py-2 border text-sm rounded-md hover:bg-gray-100">🔁 Start Over</button>
          </div>
        )}
      </div>
    </div>
  );
}
