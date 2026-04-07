"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Question {
  question: string;
  answer: string;
}

export function QuestionList({ questions: questionsJson, onChange }: { questions: string; onChange: (v: string) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    try { setQuestions(JSON.parse(questionsJson)); } catch { setQuestions([]); }
  }, [questionsJson]);

  const save = (updated: Question[]) => {
    setQuestions(updated);
    onChange(JSON.stringify(updated));
  };

  const addQuestion = () => save([...questions, { question: "", answer: "" }]);

  const updateQuestion = (i: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    save(updated);
  };

  const removeQuestion = (i: number) => save(questions.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Practice Questions</h3>
        <button onClick={addQuestion} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <input
                value={q.question}
                onChange={(e) => updateQuestion(i, "question", e.target.value)}
                className="flex-1 border rounded px-2 py-1.5 text-sm font-medium"
                placeholder="Question..."
              />
              <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 mt-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={q.answer}
              onChange={(e) => updateQuestion(i, "answer", e.target.value)}
              rows={2}
              className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              placeholder="Your answer..."
            />
          </div>
        ))}
        {questions.length === 0 && <p className="text-sm text-gray-400">No questions yet. Add some to prepare!</p>}
      </div>
    </div>
  );
}
