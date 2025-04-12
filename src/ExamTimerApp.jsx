import React, { useState, useEffect } from “react”;
import * as XLSX from “xlsx”;

export default function ExamTimerApp() {
const [userName, setUserName] = useState(””);
const [totalQuestions, setTotalQuestions] = useState(5);
const [estimatedTime, setEstimatedTime] = useState(0);
const [totalTime, setTotalTime] = useState(600);
const [questions, setQuestions] = useState([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [selectedAnswers, setSelectedAnswers] = useState({});
const [timeLeft, setTimeLeft] = useState(600);
const [questionTime, setQuestionTime] = useState(0);
const [stage, setStage] = useState(“input”);
const [selectedOption, setSelectedOption] = useState(””);
const [score, setScore] = useState(0);
const [dynamicInsight, setDynamicInsight] = useState(“Interesting PMP fact will appear here.”);

useEffect(() => {
let timer;
if (stage === “exam” && timeLeft > 0) {
timer = setInterval(() => {
setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
setQuestionTime((prev) => prev + 1);
}, 1000);
}
return () => clearInterval(timer);
}, [stage, timeLeft]);

const formatTime = (sec) => ${Math.floor(sec / 60)}m ${sec % 60}s;

const handleSettingsSubmit = async (e) => {
e.preventDefault();
const calculatedTime = Math.ceil((230 / 180) * totalQuestions * 60);
setEstimatedTime(calculatedTime);
setTotalTime(calculatedTime);
setStage(“loading”);
try {
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const res = await fetch(${backendUrl}/generate-questions, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ count: totalQuestions })
});
const data = await res.json();
setQuestions(data.questions || []);
setDynamicInsight(data.insight || “Always update your PMP knowledge with current events!”);
setTimeLeft(calculatedTime);
setStage(“ready”);
} catch (err) {
alert(“Failed to fetch questions: “ + err.message);
setStage(“input”);
}
};

const handleStartExam = () => {
setStage(“exam”);
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
    question: currentQ.question,
    answer: currentQ.answer,
    rationale: currentQ.rationale,
    eco_task: currentQ.eco_task
  }
}));

if (currentQuestionIndex + 1 < totalQuestions) {
  setCurrentQuestionIndex(currentQuestionIndex + 1);
  setQuestionTime(0);
  setSelectedOption("");
} else {
  setStage("result");
}

};

const handleDownloadExcel = () => {
const data = Object.entries(selectedAnswers).map(([index, ans]) => ({
Question: ans.question,
“Your Answer”: ans.selected,
“Correct Answer”: ans.answer,
“Correct?”: ans.correct ? “Yes” : “No”,
“Time Taken (s)”: ans.time || 0,
Rationale: ans.rationale,
“ECO Task”: ans.eco_task
}));
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, “Results”);
XLSX.writeFile(workbook, “pmp_exam_results.xlsx”);
};

return (

{stage === “input” && (

📊 PMP Exam Trainer

📘 PMP Insight: You get 230 minutes for 180 questions. That’s about 1.28 minutes per question.

💡 {dynamicInsight}

      <div>
        <label htmlFor="username" className="block font-semibold">🙋 Your Name</label>
        <input
          id="username"
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="questionCount" className="block font-semibold">📝 How many questions do you want to practice?</label>
        <input
          id="questionCount"
          type="number"
          placeholder="Number of questions"
          value={totalQuestions}
          onChange={(e) => setTotalQuestions(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <p className="text-sm text-gray-500">⏱️ Estimated Time: {formatTime(estimatedTime)}</p>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Generate Questions
      </button>
    </form>
  )}

  {stage === "ready" && (
    <div className="text-center">
      <p className="text-lg font-semibold">✅ Questions are ready!</p>
      <p className="text-sm text-gray-500">Estimated Time: {formatTime(estimatedTime)}</p>
      <button
        onClick={handleStartExam}
        className="mt-4 bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
      >
        Start Exam
      </button>
    </div>
  )}

  {stage === "exam" && questions.length > 0 && (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>⏰ Time Left: {formatTime(timeLeft)}</span>
        <span>📍 Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <span>⏳ Time on this question: {formatTime(questionTime)}</span>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <p className="font-semibold">
          Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
        </p>
        {questions[currentQuestionIndex].options.map((opt, idx) => (
          <div key={idx} className="mt-2">
            <label className="block" htmlFor={`option-${idx}`}>
              <input
                id={`option-${idx}`}
                type="radio"
                name="option"
                value={opt}
                checked={selectedOption === opt}
                onChange={() => setSelectedOption(opt)}
                className="mr-2"
              />
              {opt}
            </label>
            {selectedOption === opt && (
              <div className="text-sm text-gray-600 mt-1">
                <strong>Rationale:</strong> {questions[currentQuestionIndex].rationale}<br />
                <strong>ECO Task:</strong> {questions[currentQuestionIndex].eco_task}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedOption}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        {currentQuestionIndex + 1 === totalQuestions ? "Finish Exam" : "Next Question"}
      </button>

      <div className="text-sm mt-4">
        <strong>🧾 Real-Time Log</strong>
        <ul className="list-disc pl-4">
          {Object.entries(selectedAnswers).map(([key, val]) => (
            <li key={key}>
              Q{Number(key) + 1}: {formatTime(val.time)} – {val.selected} {val.selected === val.answer ? "✔ Correct" : "❌ Wrong"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )}

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