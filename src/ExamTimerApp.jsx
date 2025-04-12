import React, { useState, useEffect } from "react";

export default function ExamTimerApp() {
  const [totalTime, setTotalTime] = useState(600); // total exam time
  const [timeLeft, setTimeLeft] = useState(600);
  const [questionTime, setQuestionTime] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const sampleQuestion = {
    question: "You are working with a cross-functional Agile team on a product release. Midway through the sprint, a stakeholder approaches you requesting a critical feature update. What should you do?",
    options: {
      A: "Pause the sprint and implement the change immediately.",
      B: "Log the request and defer discussion to the next sprint planning session.",
      C: "Update the sprint backlog and inform the team.",
      D: "Add the change to the current sprint and assign it to the most available developer."
    },
    answer: "B"
  };

  useEffect(() => {
    let timer;
    if (sessionStarted && !examFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setQuestionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionStarted, examFinished]);

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s}s`;
  };

  const handleStart = () => {
    setSessionStarted(true);
    setTimeLeft(totalTime);
    setQuestionTime(0);
  };

  const handleNext = () => {
    setExamFinished(true); // for now just finish
  };

  const handleReset = () => {
    setSessionStarted(false);
    setExamFinished(false);
    setTimeLeft(totalTime);
    setQuestionTime(0);
    setSelectedAnswer("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-6 font-sans border border-gray-300">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">🧠 PMP Exam Timer</h1>

        {!sessionStarted ? (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-green-500 text-white rounded-xl text-xl hover:bg-green-600"
          >
            ▶️ Start Exam
          </button>
        ) : examFinished ? (
          <div className="text-center">
            <h2 className="text-lg font-semibold text-green-700">🎉 Exam Finished</h2>
            <p className="mt-2">Total Time: {formatTime(totalTime - timeLeft)}</p>
            <p>Question Time: {formatTime(questionTime)}</p>
            <p className="mt-2">
              Your answer: <strong>{selectedAnswer || "None"}</strong>
              <br />
              Correct answer: <strong>{sampleQuestion.answer}</strong>
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔁 Back to Start
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">🕒 Question Time: {formatTime(questionTime)}</p>
              <p className="text-sm text-gray-600">⏰ Total Time Left: {formatTime(timeLeft)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border mb-4">
              <h2 className="text-md font-semibold mb-2">{sampleQuestion.question}</h2>
              {Object.entries(sampleQuestion.options).map(([key, val]) => (
                <label key={key} className="block mb-2">
                  <input
                    type="radio"
                    name="option"
                    value={key}
                    checked={selectedAnswer === key}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="mr-2"
                  />
                  <strong>{key}.</strong> {val}
                </label>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-indigo-600 text-white text-xl rounded-xl hover:bg-indigo-700"
            >
              {examFinished ? "Finish" : "Next Question"}
            </button>

            <button
              onClick={handleReset}
              className="mt-3 w-full py-2 text-sm bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
            >
              🔁 Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

