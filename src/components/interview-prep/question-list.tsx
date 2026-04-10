"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Question {
  question: string;
  answer: string;
  category?: "technical" | "behavioral" | "situational" | "company";
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  technical: { label: "Technical", color: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10" },
  behavioral: { label: "Behavioral", color: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10" },
  situational: { label: "Situational", color: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10" },
  company: { label: "Company", color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10" },
};

const STAR_PROMPT = `Use the STAR method:
• Situation: Set the scene
• Task: What was your responsibility?
• Action: What did you do?
• Result: What was the outcome?`;

export function QuestionList({ questions: questionsJson, onChange }: { questions: string; onChange: (v: string) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    try { setQuestions(JSON.parse(questionsJson)); } catch { setQuestions([]); }
  }, [questionsJson]);

  const save = (updated: Question[]) => {
    setQuestions(updated);
    onChange(JSON.stringify(updated));
  };

  const addQuestion = () => {
    const updated = [...questions, { question: "", answer: "", category: "technical" as const }];
    save(updated);
    setExpandedIdx(updated.length - 1);
  };

  const updateQuestion = (i: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    save(updated);
  };

  const removeQuestion = (i: number) => {
    save(questions.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
  };

  // Group by category
  const categories = ["technical", "behavioral", "situational", "company"];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = questions.map((q, i) => ({ ...q, originalIndex: i })).filter((q) => (q.category || "technical") === cat);
    return acc;
  }, {} as Record<string, (Question & { originalIndex: number })[]>);

  // Count answered
  const answered = questions.filter((q) => q.answer.trim()).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[14px] text-slate-900">Practice Questions</h3>
          {questions.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{answered}/{questions.length} answered</p>
          )}
        </div>
        <button
          onClick={addQuestion}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No questions yet. Generate them from the job description or add manually.</p>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            const style = CATEGORY_STYLES[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${style.color}`}>{style.label}</span>
                  <span className="text-[11px] text-slate-400">{items.length} questions</span>
                </div>
                <div className="space-y-2">
                  {items.map(({ originalIndex: i, ...q }) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50 transition-all"
                      >
                        {expandedIdx === i ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-slate-700 flex-1">
                          {q.question || <span className="text-slate-400 italic">Empty question</span>}
                        </span>
                        {q.answer.trim() && (
                          <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" title="Answered" />
                        )}
                      </button>

                      {expandedIdx === i && (
                        <div className="px-3 pb-3 space-y-2 border-t border-slate-100 animate-scale-in">
                          <input
                            value={q.question}
                            onChange={(e) => updateQuestion(i, "question", e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium mt-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            placeholder="Question..."
                          />
                          <textarea
                            value={q.answer}
                            onChange={(e) => updateQuestion(i, "answer", e.target.value)}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            placeholder={cat === "behavioral" || cat === "situational" ? STAR_PROMPT : "Your answer..."}
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeQuestion(i)}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
