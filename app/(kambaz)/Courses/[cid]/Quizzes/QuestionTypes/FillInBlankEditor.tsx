// app/(kambaz)/Courses/[cid]/Quizzes/QuestionTypes/FillInBlankEditor.tsx
// Fill in Blank Question Editor - uses possibleAnswers array (case insensitive matching)

import React from "react";
import { Form, Button } from "react-bootstrap";
import type { FillInBlankQuestion } from "../types";
import { FaTrash } from "react-icons/fa";

interface FillInBlankEditorProps {
  question: FillInBlankQuestion;
  onChange: (question: FillInBlankQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function FillInBlankEditor({ 
  question, 
  onChange, 
  onCancel, 
  onSave, 
  onDelete 
}: FillInBlankEditorProps) {
  
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...question,
      question: e.target.value
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      title: e.target.value
    });
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value, 10) || 0;
    onChange({
      ...question,
      points: points
    });
  };

  const handlePossibleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...question.possibleAnswers];
    updatedAnswers[index] = value;
    onChange({
      ...question,
      possibleAnswers: updatedAnswers
    });
  };

  const addPossibleAnswer = () => {
    onChange({
      ...question,
      possibleAnswers: [...question.possibleAnswers, ""]
    });
  };

  const removePossibleAnswer = (index: number) => {
    if (question.possibleAnswers.length <= 1) return; // Keep at least 1 answer
    
    const updatedAnswers = question.possibleAnswers.filter((_, i) => i !== index);
    onChange({
      ...question,
      possibleAnswers: updatedAnswers
    });
  };

  return (
    <div className="p-3 border rounded">
      <div className="mb-3">
        <p className="instruction-text">
          <strong>Enter your question text, then define all possible correct answers for the blank.</strong>
          <br />
          <small className="text-muted">Answers will be matched case-insensitively.</small>
        </p>
      </div>
      
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Question Title:</Form.Label>
          <FaTrash 
            className="text-danger float-end" 
            style={{cursor: 'pointer'}} 
            onClick={onDelete}
          />
          <Form.Control
            type="text"
            value={question.title}
            onChange={handleTitleChange}
            placeholder="Question title"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Question Text:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={question.question}
            onChange={handleQuestionTextChange}
            placeholder="How much is 2 + 2 = _____?"
          />
        </Form.Group>

        <div className="d-flex justify-content-end mb-3">
          <Form.Group className="d-flex align-items-center">
            <Form.Label className="me-2 mb-0">Points:</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={question.points}
              onChange={handlePointsChange}
              style={{ width: "80px" }}
            />
          </Form.Group>
        </div>

        <Form.Group className="mb-3">
          <Form.Label><strong>Possible Correct Answers:</strong></Form.Label>
          <small className="text-muted d-block mb-2">
            Add all variations that should be accepted as correct (e.g., "4", "four", "Four")
          </small>
          <div className="p-3 border rounded mb-2">
            {question.possibleAnswers.map((answer, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={answer}
                  onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                  className="me-2"
                />
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => removePossibleAnswer(index)}
                  disabled={question.possibleAnswers.length <= 1}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="mt-2"
            onClick={addPossibleAnswer}
          >
            + Add Another Answer
          </Button>
        </Form.Group>

        <div className="p-3 border rounded mb-3 bg-light">
          <Form.Label><strong>Accepted Answers:</strong></Form.Label>
          <div>
            {question.possibleAnswers.filter(a => a.trim()).length > 0 ? (
              question.possibleAnswers
                .filter(a => a.trim())
                .map((answer, index) => (
                  <span key={index} className="badge bg-success me-2 p-2">
                    {answer}
                  </span>
                ))
            ) : (
              <div className="text-danger">No answers provided</div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-start mt-4">
          <Button variant="outline-secondary" className="me-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onSave}
            disabled={question.possibleAnswers.filter(a => a.trim()).length === 0}
          >
            Update Question
          </Button>
        </div>
      </Form>
    </div>
  );
}