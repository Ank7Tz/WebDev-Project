// app/(kambaz)/Courses/[cid]/Quizzes/QuestionTypes/MultipleChoiceEditor.tsx
// Multiple Choice Question Editor - correctAnswer is index (0, 1, 2...)

import React from "react";
import { Form, Button, FormCheck } from "react-bootstrap";
import type { MultipleChoiceQuestion } from "../types";

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion;
  onChange: (question: MultipleChoiceQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function MultipleChoiceEditor({
  question,
  onChange,
  onCancel,
  onSave
}: MultipleChoiceEditorProps) {
  
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

  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...question.choices];
    updatedChoices[index] = value;
    
    onChange({
      ...question,
      choices: updatedChoices
    });
  };

  // correctAnswer is the INDEX of the correct choice (0, 1, 2, ...)
  const handleCorrectAnswerChange = (index: number) => {
    onChange({
      ...question,
      correctAnswer: index
    });
  };

  const addChoice = () => {
    onChange({
      ...question,
      choices: [...question.choices, ""]
    });
  };

  const removeChoice = (index: number) => {
    if (question.choices.length <= 2) return; // Keep at least 2 choices
    
    const updatedChoices = question.choices.filter((_, i) => i !== index);
    
    // If we removed the correct answer, reset it
    let newCorrectAnswer = question.correctAnswer;
    if (question.correctAnswer === index) {
      newCorrectAnswer = 0;
    } else if (question.correctAnswer > index) {
      newCorrectAnswer = question.correctAnswer - 1;
    }
    
    onChange({
      ...question,
      choices: updatedChoices,
      correctAnswer: newCorrectAnswer
    });
  };

  return (
    <div className="p-3 border rounded">
      <div className="mb-3">
        <p className="instruction-text">
          <strong>Enter your question and multiple answers, then select the correct answer.</strong>
        </p>
      </div>
      
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Question Title:</Form.Label>
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
            placeholder="Enter your question"
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
          <Form.Label><strong>Answer Choices:</strong></Form.Label>
          <div className="p-3 border rounded mb-2">
            {question.choices.map((choice, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <FormCheck
                  type="radio"
                  id={`mcq-choice-${index}`}
                  name="correctAnswer"
                  className="me-2"
                  checked={question.correctAnswer === index}
                  onChange={() => handleCorrectAnswerChange(index)}
                />
                <Form.Control
                  type="text"
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className="me-2"
                />
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => removeChoice(index)}
                  disabled={question.choices.length <= 2}
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
            onClick={addChoice}
          >
            + Add Choice
          </Button>
        </Form.Group>

        <div className="p-3 border rounded mb-3 bg-light">
          <Form.Label><strong>Correct Answer:</strong></Form.Label>
          <div>
            {question.choices[question.correctAnswer] ? (
              <div className="badge bg-success p-2">
                {question.choices[question.correctAnswer]}
              </div>
            ) : (
              <div className="text-danger">No correct answer selected</div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-start mt-3">
          <Button variant="outline-secondary" className="me-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onSave}
            disabled={!question.choices[question.correctAnswer]}
          >
            Update Question
          </Button>
        </div>
      </Form>
    </div>
  );
}