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
  }, [stage, timeLeft]);

  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setStage("loading");
    try {
      const res = await fetch("https://your-api-url/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: totalQuestions }),
      });
      const data = await res.json();
      setQuestions(data);
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
        correct: isCorrect,
        question: currentQ.question,
        answer: currentQ.answer,
        rationale: currentQ.rationale,
        eco_task: currentQ.eco_task
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

  const handleOptionClick = (opt) => {
    setSelectedOption(opt);
  };

  const handleDownloadExcel = () => {
    const data = Object.entries(selectedAnswers).map(([index, ans]) => ({
      Question: ans.question,
      "Your Answer": ans.selected,
      "Correct Answer": ans.answer,
      "Correct?": ans.correct ? "Yes" : "No",
      "Time Taken (s)": ans.time || 0,
      "Rationale": ans.rationale,
      "ECO Task": ans.eco_task
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "pmp_exam_results.xlsx");
  };

  return (
    <div>
      {stage === "exam" && questions.length > 0 && (
        <div>
          <p>{questions[currentQuestionIndex].question}</p>
          {questions[currentQuestionIndex].options.map((opt, idx) => (
            <div key={idx}>
              <button onClick={() => handleOptionClick(opt)}>{opt}</button>
              {selectedOption === opt && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Why this is correct:</strong> {questions[currentQuestionIndex].rationale}<br />
                  <strong>ECO Task:</strong> {questions[currentQuestionIndex].eco_task}
                </p>
              )}
            </div>
          ))}
          <button onClick={handleNext} disabled={!selectedOption}>
            {currentQuestionIndex + 1 === totalQuestions ? "Finish Exam" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
