// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizPreview.tsx
// Faculty Quiz Preview - Faculty can take quiz and see results
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Card, Button, Form, Alert, Container, ProgressBar, Badge } from "react-bootstrap";
import * as quizClient from "../client";
import { FaArrowLeft } from "react-icons/fa";
import type { Quiz, Question, MultipleChoiceQuestion } from "../types";

interface UserAnswers {
  [key: string]: string | number | boolean;
}

export default function QuizPreview() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid, qid } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{[key: string]: boolean}>({});
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Redirect non-faculty
  useEffect(() => {
    if (currentUser?.role !== "FACULTY") {
      router.push(`/Courses/${cid}/Quizzes`);
    }
  }, [currentUser, cid, router]);
  
  // Fetch quiz and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        if (cid && qid) {
          const quizDetails = await quizClient.findQuizById(cid as string, qid as string);
          setQuiz(quizDetails);
          
          const quizQuestions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
          setQuestions(quizQuestions);
          
          // Initialize answers
          const initialAnswers: UserAnswers = {};
          quizQuestions.forEach((q: Question) => {
            if (q.type === "multiple-choice") {
              initialAnswers[q._id] = -1;
            } else if (q.type === "true-false") {
              initialAnswers[q._id] = false;
            } else {
              initialAnswers[q._id] = "";
            }
          });
          setUserAnswers(initialAnswers);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [cid, qid]);
  
  const handleAnswerChange = (questionId: string, answer: string | number | boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const submitQuiz = () => {
    let correctCount = 0;
    let totalPoints = 0;
    const questionResults: {[key: string]: boolean} = {};
    
    questions.forEach(question => {
      const userAnswer = userAnswers[question._id];
      let isCorrect = false;
      
      // Check correctness based on question type
      if (question.type === "multiple-choice") {
        isCorrect = userAnswer === (question as MultipleChoiceQuestion).correctAnswer;
      } else if (question.type === "true-false") {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === "fill-in-blank") {
        const normalizedAnswer = String(userAnswer).toLowerCase().trim();
        isCorrect = question.possibleAnswers?.some(
          ans => ans.toLowerCase().trim() === normalizedAnswer
        ) || false;
      }
      
      if (isCorrect) {
        correctCount += question.points;
      }
      totalPoints += question.points;
      
      questionResults[question._id] = isCorrect;
    });
    
    const percentage = totalPoints > 0 ? Math.round((correctCount / totalPoints) * 100) : 0;
    
    setScore({
      correct: correctCount,
      total: totalPoints,
      percentage
    });
    
    setResults(questionResults);
    setSubmitted(true);
  };
  
  const resetQuiz = () => {
    const initialAnswers: UserAnswers = {};
    questions.forEach(q => {
      if (q.type === "multiple-choice") {
        initialAnswers[q._id] = -1;
      } else if (q.type === "true-false") {
        initialAnswers[q._id] = false;
      } else {
        initialAnswers[q._id] = "";
      }
    });
    
    setUserAnswers(initialAnswers);
    setSubmitted(false);
    setResults({});
    setScore({ correct: 0, total: 0, percentage: 0 });
    setCurrentQuestion(0);
  };
  
  const goToEditQuiz = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/edit`);
  };
  
  if (loading) {
    return <div className="text-center p-5">Loading quiz preview...</div>;
  }
  
  if (!quiz) {
    return <Alert variant="danger">Quiz not found</Alert>;
  }
  
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  // After submission - show results
  if (submitted) {
    return (
      <Container className="mt-4">
        <div className="mb-3">
          <Link href={`/Courses/${cid}/Quizzes`}>
            <Button variant="outline-secondary" size="sm">
              <FaArrowLeft className="me-1" /> Back to Quizzes
            </Button>
          </Link>
        </div>
        
        <Card>
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <div>
              <h3>{quiz.title} - Preview Results</h3>
              <div className="text-muted">Faculty Preview Mode</div>
            </div>
            <Button variant="primary" onClick={goToEditQuiz}>
              Edit Quiz
            </Button>
          </Card.Header>
          
          <Card.Body>
            <Alert variant={score.percentage >= 70 ? "success" : "danger"}>
              <h4>
                Your Score: {score.correct}/{score.total} ({score.percentage}%)
                <Badge bg="secondary" className="ms-2">
                  {getLetterGrade(score.percentage)}
                </Badge>
              </h4>
            </Alert>
            
            <div className="mb-4">
              <h5>Question Results:</h5>
              {questions.map((question, index) => {
                const userAnswer = userAnswers[question._id];
                let correctAnswerDisplay = "";
                
                if (question.type === "multiple-choice") {
                  const mcq = question as MultipleChoiceQuestion;
                  correctAnswerDisplay = mcq.choices[mcq.correctAnswer];
                } else if (question.type === "true-false") {
                  correctAnswerDisplay = String(question.correctAnswer);
                } else {
                  correctAnswerDisplay = question.possibleAnswers?.[0] || "";
                }
                
                return (
                  <Card key={question._id} className="mb-2">
                    <Card.Header className={results[question._id] ? "bg-success text-white" : "bg-danger text-white"}>
                      Question {index + 1}: {results[question._id] ? "Correct ✓" : "Incorrect ✗"}
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Question:</strong> {question.question}</p>
                      <hr />
                      <p><strong>Your answer:</strong> {String(userAnswer)}</p>
                      <p><strong>Correct answer:</strong> {correctAnswerDisplay}</p>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={resetQuiz}>
                Try Again
              </Button>
              <Button variant="primary" onClick={goToEditQuiz}>
                Edit Quiz
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Quiz taking interface (one question at a time)
  if (quiz.oneQuestionAtATime) {
    const currentQ = questions[currentQuestion];
    
    if (!currentQ) {
      return (
        <Container className="mt-4">
          <Alert variant="warning">No questions available for this quiz.</Alert>
          <Link href={`/Courses/${cid}/Quizzes`}>
            <Button variant="secondary">Back to Quizzes</Button>
          </Link>
        </Container>
      );
    }
    
    return (
      <Container className="mt-4">
        <div className="mb-3">
          <Link href={`/Courses/${cid}/Quizzes`}>
            <Button variant="outline-secondary" size="sm">
              <FaArrowLeft className="me-1" /> Back to Quizzes
            </Button>
          </Link>
        </div>
        
        <Card>
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <div>
              <h3>{quiz.title} - Preview</h3>
              <div className="text-muted">Faculty Preview Mode</div>
            </div>
            <Button variant="primary" onClick={goToEditQuiz}>
              Edit Quiz
            </Button>
          </Card.Header>
          
          <Card.Body>
            <Alert variant="info">
              This is a preview of the published version of the quiz
            </Alert>
            
            <div className="mb-3">
              <ProgressBar 
                now={((currentQuestion + 1) / questions.length) * 100} 
                label={`${currentQuestion + 1}/${questions.length}`} 
              />
            </div>
            
            <Card className="mb-4">
              <Card.Header>
                Question {currentQuestion + 1} <span className="float-end">{currentQ.points} pt</span>
              </Card.Header>
              <Card.Body>
                <p><strong>{currentQ.question}</strong></p>
                
                {currentQ.type === "true-false" && (
                  <Form>
                    <Form.Check 
                      type="radio"
                      id="preview-true"
                      label="True"
                      name="preview-tf"
                      checked={userAnswers[currentQ._id] === true}
                      onChange={() => handleAnswerChange(currentQ._id, true)}
                      className="mb-2"
                    />
                    <Form.Check 
                      type="radio"
                      id="preview-false"
                      label="False"
                      name="preview-tf"
                      checked={userAnswers[currentQ._id] === false}
                      onChange={() => handleAnswerChange(currentQ._id, false)}
                    />
                  </Form>
                )}
                
                {currentQ.type === "multiple-choice" && (
                  <Form>
                    {(currentQ as MultipleChoiceQuestion).choices.map((choice, optIndex) => (
                      <Form.Check 
                        key={optIndex}
                        type="radio"
                        id={`preview-option-${optIndex}`}
                        label={choice}
                        name="preview-mc"
                        checked={userAnswers[currentQ._id] === optIndex}
                        onChange={() => handleAnswerChange(currentQ._id, optIndex)}
                        className="mb-2"
                      />
                    ))}
                  </Form>
                )}
                
                {currentQ.type === "fill-in-blank" && (
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={userAnswers[currentQ._id] as string || ""} 
                    onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)} 
                    placeholder="Type your answer here..."
                  />
                )}
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={goToPrevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button 
                  variant="outline-primary" 
                  onClick={goToNextQuestion}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  variant="danger" 
                  onClick={submitQuiz}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // All questions at once mode
  return (
    <Container className="mt-4">
      <div className="mb-3">
        <Link href={`/Courses/${cid}/Quizzes`}>
          <Button variant="outline-secondary" size="sm">
            <FaArrowLeft className="me-1" /> Back to Quizzes
          </Button>
        </Link>
      </div>
      
      <Card>
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div>
            <h3>{quiz.title} - Preview</h3>
            <div className="text-muted">Faculty Preview Mode</div>
          </div>
          <Button variant="primary" onClick={goToEditQuiz}>
            Edit Quiz
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Alert variant="info">
            This is a preview of the published version of the quiz
          </Alert>
          
          {questions.map((question, index) => (
            <Card key={question._id} className="mb-3">
              <Card.Header>
                Question {index + 1} ({question.points} pts)
              </Card.Header>
              <Card.Body>
                <p><strong>{question.question}</strong></p>
                
                {question.type === "true-false" && (
                  <Form>
                    <Form.Check 
                      type="radio"
                      id={`q${index}-true`}
                      label="True"
                      name={`question-${question._id}`}
                      checked={userAnswers[question._id] === true}
                      onChange={() => handleAnswerChange(question._id, true)}
                      className="mb-2"
                    />
                    <Form.Check 
                      type="radio"
                      id={`q${index}-false`}
                      label="False"
                      name={`question-${question._id}`}
                      checked={userAnswers[question._id] === false}
                      onChange={() => handleAnswerChange(question._id, false)}
                    />
                  </Form>
                )}
                
                {question.type === "multiple-choice" && (
                  <Form>
                    {(question as MultipleChoiceQuestion).choices.map((choice, choiceIndex) => (
                      <Form.Check 
                        key={choiceIndex}
                        type="radio"
                        id={`q${index}-choice-${choiceIndex}`}
                        label={choice}
                        name={`question-${question._id}`}
                        checked={userAnswers[question._id] === choiceIndex}
                        onChange={() => handleAnswerChange(question._id, choiceIndex)}
                        className="mb-2"
                      />
                    ))}
                  </Form>
                )}
                
                {question.type === "fill-in-blank" && (
                  <Form.Control
                    type="text"
                    placeholder="Type your answer here"
                    value={userAnswers[question._id] as string || ""}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  />
                )}
              </Card.Body>
            </Card>
          ))}
          
          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="danger" 
              size="lg"
              onClick={submitQuiz}
            >
              Submit Quiz
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}