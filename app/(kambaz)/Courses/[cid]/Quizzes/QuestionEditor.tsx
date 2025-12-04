// app/(kambaz)/Courses/[cid]/Quizzes/QuestionEditor.tsx
// Question Editor Wrapper - routes to specific question type editors

"use client";
import { useState, useEffect } from "react";
import MultipleChoiceEditor from "./QuestionTypes/MultipleChoiceEditor";
import TrueFalseEditor from "./QuestionTypes/TrueFalseEditor";
import FillInBlankEditor from "./QuestionTypes/FillInBlankEditor";
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillInBlankQuestion } from "./types";

interface QuestionEditorProps {
  question: Question;
  onEdit: () => void;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function QuestionEditor({
  question,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleSave = () => {
    onSave(editedQuestion);
  };

  const renderQuestionEditor = () => {
    switch (editedQuestion.type) {
      case "multiple-choice":
        return (
          <MultipleChoiceEditor 
            question={editedQuestion as MultipleChoiceQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
          />
        );
      
      case "true-false":
        return (
          <TrueFalseEditor 
            question={editedQuestion as TrueFalseQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
          />
        );
      
      case "fill-in-blank":
        return (
          <FillInBlankEditor 
            question={editedQuestion as FillInBlankQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
            onDelete={onDelete}
          />
        );
      
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="question-editor mb-4">
      {renderQuestionEditor()}
    </div>
  );
}