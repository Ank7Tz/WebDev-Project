// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizQuestionEditor.tsx
// Quiz Questions Editor - Faculty can add/edit/delete questions
// This is the main component with all business logic

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Button, Nav, Tab, Container, Alert, Form } from "react-bootstrap";
import * as quizClient from "../client";
import QuestionEditor from "../QuestionEditor";
import { v4 as uuidv4 } from "uuid";
import { FaTrash } from "react-icons/fa6";
import type { Question, Quiz } from "../types";

export default function QuizQuestionsEditor() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [saveStatus, setSaveStatus] = useState<{ type: string; message: string } | null>(null);
  const [newQuestionType, setNewQuestionType] = useState<string>("multiple-choice");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Redirect non-faculty users
  useEffect(() => {
    if (currentUser && currentUser.role !== "FACULTY") {
      router.push(`/Courses/${cid}/Quizzes`);
    }
  }, [currentUser, cid, router]);

  const getQuiz = async () => {
    if (qid && cid) {
      try {
        const fetchedQuiz = await quizClient.findQuizById(cid as string, qid as string);
        const fetchedQuizQuestions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
        
        // Mark all questions as not editing initially
        const formattedQuestions = fetchedQuizQuestions.map((q: Question) => ({
          ...q,
          isEditing: false
        }));

        setQuiz(fetchedQuiz);
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setSaveStatus({
          type: "danger",
          message: "Error loading quiz questions."
        });
      }
    }
  };

  useEffect(() => {
    getQuiz();
  }, [qid, cid]);

  const handleAddQuestion = async () => {
    let newQuestion: Question;
    
    const baseQuestion = {
      _id: uuidv4(),
      quiz: qid as string,
      course: cid as string,
      title: "New Question",
      question: "Enter your question here",
      points: 1,
      isEditing: true
    };
    
    if (newQuestionType === "multiple-choice") {
      newQuestion = {
        ...baseQuestion,
        type: "multiple-choice",
        choices: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: 0 // Index of correct choice
      };
    } else if (newQuestionType === "true-false") {
      newQuestion = {
        ...baseQuestion,
        type: "true-false",
        correctAnswer: false // Boolean
      };
    } else {
      newQuestion = {
        ...baseQuestion,
        type: "fill-in-blank",
        possibleAnswers: [""] // Array of possible correct answers
      };
    }
    
    try {
      const created = await quizClient.createQuestion(cid as string, qid as string, newQuestion);
      setQuestions([...questions, { ...created, isEditing: true }]);
    } catch (error) {
      console.error("Error creating question:", error);
      setSaveStatus({
        type: "danger",
        message: "Error creating question."
      });
    }
  };

  const handleSaveQuestion = async (questionId: string, updatedQuestion: Question) => {
    try {
      updatedQuestion.isEditing = false;
      await quizClient.updateQuestion(
        cid as string, 
        qid as string, 
        questionId, 
        updatedQuestion
      );
      
      setQuestions(questions.map((q) => 
        q._id === questionId ? updatedQuestion : q
      ));
      
      setSaveStatus({
        type: "success",
        message: "Question updated successfully!"
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving question:", error);
      setSaveStatus({
        type: "danger",
        message: "Error saving question."
      });
    }
  };

  const handleEditQuestion = (questionId: string) => {
    setQuestions(questions.map((q) => ({
      ...q,
      isEditing: q._id === questionId
    })));
  };

  const handleCancelEdit = (questionId: string) => {
    setQuestions(questions.map((q) => ({
      ...q,
      isEditing: false
    })));
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await quizClient.deleteQuestion(cid as string, qid as string, questionId);
      setQuestions(questions.filter((q) => q._id !== questionId));
      
      setSaveStatus({
        type: "warning",
        message: "Question deleted."
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error deleting question:", error);
      setSaveStatus({
        type: "danger",
        message: "Error deleting question."
      });
    }
  };

  const calculateTotalPoints = () => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  const handleSave = async () => {
    try {
      if (!cid || !qid || !quiz) {
        throw new Error("Course ID or Quiz ID is missing");
      }
      
      // Quiz points are automatically updated by backend when questions change
      // Just navigate back
      setSaveStatus({
        type: "success",
        message: "Quiz questions saved successfully!"
      });
      
      setTimeout(() => {
        router.push(`/Courses/${cid}/Quizzes/${qid}/details`);
      }, 1000);
    } catch (error) {
      console.error("Error saving quiz:", error);
      setSaveStatus({
        type: "danger",
        message: "Error saving quiz questions."
      });
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/details`);
  };

  return (
    <Container className="wd-quiz-questions-editor py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Edit Quiz Questions</h4>
        <div>
          <span className="fw-bold me-2">Total Points: {calculateTotalPoints()}</span>
        </div>
      </div>

      {saveStatus && (
        <Alert variant={saveStatus.type} className="my-3">
          {saveStatus.message}
        </Alert>
      )}

      <Tab.Container id="quiz-editor-tabs" defaultActiveKey="questions">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link as={Link} href={`/Courses/${cid}/Quizzes/${qid}/edit`}>
              Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="questions">Questions</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="questions">
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center align-items-center">
                <Form.Select 
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  className="me-3"
                  style={{ width: "200px" }}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-in-blank">Fill in the Blank</option>
                </Form.Select>
                <Button 
                  variant="outline-secondary" 
                  className="px-4 py-2"
                  onClick={handleAddQuestion}
                >
                  + New Question
                </Button>
              </div>
            </div>

            {questions.length === 0 ? (
              <Alert variant="info">
                No questions yet. Click "+ New Question" to add one.
              </Alert>
            ) : (
              <div className="wd-questions-list">
                {questions.map((question, index) => (
                  <div key={question._id} className="mb-4">
                    {question.isEditing ? (
                      <QuestionEditor
                        question={question}
                        onEdit={() => {}}
                        onSave={(updatedQuestion) => handleSaveQuestion(question._id, updatedQuestion)}
                        onCancel={() => handleCancelEdit(question._id)}
                        onDelete={() => handleDeleteQuestion(question._id)}
                      />
                    ) : (
                      <div className="question-preview border p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="badge bg-primary me-2">Question {index + 1}</span>
                            <span className="badge bg-secondary">{question.points} pts</span>
                            <span className="ms-2 fw-bold">{question.question}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleEditQuestion(question._id)}
                            >
                              Edit
                            </Button>
                            <FaTrash 
                              className="text-danger ms-2" 
                              style={{cursor: 'pointer'}}
                              onClick={() => handleDeleteQuestion(question._id)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-start mt-4">
              <Button variant="outline-secondary" className="me-2" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSave} disabled={questions.length === 0}>
                Save
              </Button>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}