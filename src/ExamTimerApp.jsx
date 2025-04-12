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
    const timePerQuestion = (230 / 180) * 60; // 1.28 minutes = 76.666 seconds
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
        <h1 className="text-2xl font-bold text-center mb-1 text-blue-700">📊 PMP Exam Trainer</h1>
        <p className="text-center text-sm text-gray-600 mb-4 italic">
          📘 PMP Insight: You get 230 minutes to answer 180 questions. That’s about 1.28 minutes per question. ⏳
        </p>

        {stage === "loading" && (
          <div className="text-center text-lg font-semibold text-gray-600 p-4">
            🧞 Loading your questions from the PMP Genie...
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
      </div>
    </div>
  );
}
