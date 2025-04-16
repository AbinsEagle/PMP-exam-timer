import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExamTimerApp() {
  // ----- STATE VARIABLES -----
  const [userName, setUserName] = useState("");               // User's name
  const [totalQuestions, setTotalQuestions] = useState(5);      // Number of exam questions
  const [estimatedTime, setEstimatedTime] = useState(0);        // Calculated total exam time (in seconds)
  const [questions, setQuestions] = useState([]);               // Questions received from the backend API
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question number
  const [selectedAnswers, setSelectedAnswers] = useState({});   // Stores user's answers along with details per question
  const [timeLeft, setTimeLeft] = useState(600);                // Overall exam timer (in seconds)
  const [questionTime, setQuestionTime] = useState(0);          // Time taken on the current question
  const [stage, setStage] = useState("input");                  // Current stage: "input", "loading", "ready", "exam", "result"
  const [selectedOption, setSelectedOption] = useState("");     // Option selected for current question
  const [score, setScore] = useState(0);                        // User's total correct answers
  const [dynamicInsight, setDynamicInsight] = useState("🧠 PMP Insight will appear here.");

  // ----- EFFECT: Exam Timer & Question Timer -----
  useEffect(() => {
    let timer;
    if (stage === "exam" && timeLeft > 0) {
      timer = setInterval(() => {
        // Decrement overall time and increment current question time every second
        setTimeLeft((prev) => Math.max(0, prev - 1));
        setQuestionTime((prev) => prev + 1);
      }, 1000);
    }
    // Clean up the timer when component unmounts or dependencies change
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  // ----- HELPER FUNCTION: Format Seconds into Minutes and Seconds -----
  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  // ----- HANDLER: Submit Exam Settings and Fetch Questions -----
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    // Calculate estimated time based on 230 minutes for 180 questions ~ 1.28 minutes per question
    const perQuestionSec = (230 / 180) * 60; // convert minutes to seconds per question
    const totalTimeCalc = Math.ceil(perQuestionSec * totalQuestions);
    setEstimatedTime(totalTimeCalc);
    setTimeLeft(totalTimeCalc);

    // Change stage to loading while fetching questions
    setStage("loading");

    try {
      // Replace the URL below with your actual backend URL (if not using Codespaces locally)
      const response = await fetch("https://your-backend-name.onrender.com/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: totalQuestions }),
      });

      const data = await response.json();
      // Ensure valid questions format from the backend
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format");
      }

      setQuestions(data.questions);
      // Optionally set insight from response, or default message if not provided
      setDynamicInsight(data.insight || "Stay sharp! PMP standards are evolving constantly.");
      setStage("ready");
    } catch (err) {
      alert("Failed to fetch questions: " + err.message);
      // Back to input if fetch fails
      setStage("input");
    }
  };

  // ----- HANDLER: Begin the Exam -----
  const handleStartExam = () => {
    // Move from ready stage to exam stage and reset current question timer
    setStage("exam");
    setQuestionTime(0);
  };

  // ----- HANDLER: Process Next Question -----
  const handleNext = () => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.answer;

    // Save the answer details in the selectedAnswers state
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        selected: selectedOption,
        time: questionTime,
        correct: isCorrect,
        question: currentQ.question,
        answer: currentQ.answer,
        rationale: currentQ.rationale,
        eco_task: currentQ.eco_task,
      },
    }));

    // Increment score if answer is correct
    if (isCorrect) setScore((prev) => prev + 1);

    // Check if there are more questions
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionTime(0);
      setSelectedOption("");
    } else {
      // End exam if last question reached
      setStage("result");
    }
  };

  // ----- HANDLER: Download Exam Log as Excel File -----
  const handleDownloadExcel = () => {
    const data = Object.entries(selectedAnswers).map(([idx, val]) => ({
      "Q#": Number(idx) + 1,
      Question: val.question,
      "Your Answer": val.selected,
      "Correct Answer": val.answer,
      "Correct?": val.correct ? "✅ Yes" : "❌ No",
      "Time Taken (s)": val.time,
      Rationale: val.rationale,
      "ECO Task": val.eco_task,
    }));

    // Create a new Excel sheet from the data and prompt a file download
    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "PMP Results");
    XLSX.writeFile(book, "pmp_exam_results.xlsx");
  };

  // ----- RENDERING THE COMPONENT BASED ON THE CURRENT STAGE -----
  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      {/* Stage: Input Settings Form */}
      {stage === "input" && (
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <h1 className="text-3xl font-bold text-center text-blue-800">📊 PMP Exam Trainer</h1>
          <p className="text-center text-sm text-gray-600 italic">
            🎯 You get 230 minutes for 180 questions. That’s ~1.28 min per question.
          </p>
          <p className="text-center text-blue-700 italic">💡 {dynamicInsight}</p>
          <input
            type="text"
            required
            placeholder="👤 Enter Your Name"
            className="w-full p-2 border rounded"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="number"
            min={1}
            required
            placeholder="🔢 No. of Questions"
            className="w-full p-2 border rounded"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
          />
          <p className="text-sm text-gray-500">
            ⏱️ Estimated Time: {formatTime(estimatedTime)}
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Generate Questions
          </button>
        </form>
      )}

      {/* Stage: Questions Ready Screen */}
      {stage === "ready" && (
        <div className="text-center">
          <h2 className="text-xl font-semibold">✅ Questions Ready!</h2>
          <p className="text-gray-600 text-sm mb-4">
            Estimated Time: {formatTime(estimatedTime)}
          </p>
          <button
            onClick={handleStartExam}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Start Exam
          </button>
        </div>
      )}

      {/* Stage: Exam In Progress */}
      {stage === "exam" && questions.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>⏰ Time Left: {formatTime(timeLeft)}</span>
            <span>
              📍 Q{currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>⏳ Time on Question: {formatTime(questionTime)}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded shadow">
            <p className="font-semibold">
              Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
            </p>
            {questions[currentQuestionIndex].options.map((opt, idx) => (
              <div key={idx} className="mt-2">
                <label className="block cursor-pointer">
                  <input
                    type="radio"
                    name="option"
                    value={opt}
                    className="mr-2"
                    checked={selectedOption === opt}
                    onChange={() => setSelectedOption(opt)}
                  />
                  {opt}
                </label>
                {selectedOption === opt && (
                  <div className="mt-1 text-sm text-gray-600">
                    <strong>📚 Rationale:</strong> {questions[currentQuestionIndex].rationale}
                    <br />
                    <strong>📌 ECO Task:</strong> {questions[currentQuestionIndex].eco_task}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            disabled={!selectedOption}
            onClick={handleNext}
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            {currentQuestionIndex + 1 === totalQuestions ? "Finish Exam" : "Next Question"}
          </button>

          <div className="mt-4 text-sm">
            <strong>📈 Real-Time Log</strong>
            <ul className="list-disc pl-4 mt-1">
              {Object.entries(selectedAnswers).map(([key, val]) => (
                <li key={key}>
                  Q{Number(key) + 1}: {formatTime(val.time)} – {val.selected}{" "}
                  {val.selected === val.answer ? "✔ Correct" : "❌ Wrong"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stage: Exam Results */}
      {stage === "result" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">🎉 Exam Completed!</h2>
          <p>
            {userName}, you scored {score} out of {totalQuestions}.
          </p>
          <button
            onClick={handleDownloadExcel}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Download Excel Log
          </button>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
