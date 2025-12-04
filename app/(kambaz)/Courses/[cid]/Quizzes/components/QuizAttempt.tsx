// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizAttempt.tsx
// Student Quiz Taking Interface - creates attempt on submission

"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Card, Button, Form, Alert, Container, ProgressBar, Spinner } from "react-bootstrap";
import * as quizClient from "../client";
import { FaArrowLeft } from "react-icons/fa";
import type { Quiz, Question, MultipleChoiceQuestion, QuizAttempt } from "../types";

interface UserAnswers {
  [key: string]: string | number | boolean;
}

export default function QuizAttemptComponent() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid, qid, attemptId } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Redirect non-students
  useEffect(() => {
    if (currentUser?.role !== "STUDENT") {
      router.push(`/Courses/${cid}/Quizzes/${qid}/details`);
    }
  }, [currentUser, cid, qid, router]);
  
  // Timer logic
  useEffect(() => {
    if (quiz?.timeLimit && quiz.timeLimit > 0 && !submitted) {
      const timerMinutes = quiz.timeLimit;
      setTimeLeft(timerMinutes * 60);
      
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === null || prevTime <= 0) {
            clearInterval(timer);
            if (!submitted) {
              handleSubmitQuiz();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quiz, submitted]);
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Fetch quiz and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!cid || !qid) {
          setError("Missing course or quiz ID");
          setLoading(false);
          return;
        }
        
        const quizDetails = await quizClient.findQuizById(cid as string, qid as string);
        setQuiz(quizDetails);
        
        if (!quizDetails.published) {
          setError("This quiz is not available.");
          setLoading(false);
          return;
        }
        
        const quizQuestions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
        setQuestions(quizQuestions);
        
        // Initialize answers
        const initialAnswers: UserAnswers = {};
        quizQuestions.forEach((q: Question) => {
          if (q.type === "multiple-choice") {
            initialAnswers[q._id] = -1; // -1 means no selection
          } else if (q.type === "true-false") {
            initialAnswers[q._id] = false;
          } else {
            initialAnswers[q._id] = "";
          }
        });
        setUserAnswers(initialAnswers);
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching quiz data:", err);
        setError(err.message || "An error occurred while loading the quiz.");
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [cid, qid]);
  
  const handleAnswerChange = (questionId: string, answer: string | number | boolean) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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
  
  const handleSubmitQuiz = async () => {
    if (!cid || !qid) return;
    
    try {
      // Format answers for backend
      const formattedAnswers = questions.map((question) => ({
        questionId: question._id,
        answer: userAnswers[question._id]
      }));
      
      // Submit to backend - it will auto-grade and create the attempt
      const attemptResult = await quizClient.createAttempt(
        cid as string,
        qid as string,
        formattedAnswers
      );
      
      setResult(attemptResult);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "An error occurred while submitting the quiz.");
    }
  };
  
  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading quiz...</span>
        </Spinner>
        <p className="mt-3">Please wait while we prepare your quiz...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Link href={`/Courses/${cid}/Quizzes`}>
          <Button variant="secondary">Back to Quizzes</Button>
        </Link>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Quiz not found</Alert>
        <Link href={`/Courses/${cid}/Quizzes`}>
          <Button variant="secondary">Back to Quizzes</Button>
        </Link>
      </Container>
    );
  }
  
  // After submission - show results
  if (submitted && result) {
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
          <Card.Header className="bg-light">
            <h3>{quiz.title} - Results</h3>
            <div className="text-muted">Attempt #{result.attemptNumber}</div>
          </Card.Header>
          
          <Card.Body>
            <Alert variant={result.score >= (result.totalPoints * 0.7) ? "success" : "danger"}>
              <h4>
                Your Score: {result.score}/{result.totalPoints} 
                ({Math.round((result.score / result.totalPoints) * 100)}%)
              </h4>
            </Alert>
            
            {quiz.showCorrectAnswers && quiz.showCorrectAnswers !== "Never" ? (
              <>
                <h5 className="mt-4">Question Results:</h5>
                {questions.map((question, index) => {
                  const answerData = result.answers.find(a => a.questionId === question._id);
                  
                  if (!answerData) {
                    return null;
                  }
                  
                  const isCorrect = answerData.isCorrect;
                  
                  return (
                    <Card key={question._id} className="mb-2">
                      <Card.Header className={isCorrect ? "bg-success text-white" : "bg-danger text-white"}>
                        Question {index + 1}: {isCorrect ? "Correct ✓" : "Incorrect ✗"} 
                        ({answerData.pointsEarned}/{question.points} pts)
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Question:</strong> {question.question}</p>
                        <hr />
                        <p><strong>Your answer:</strong> {String(answerData.answer)}</p>
                        <p><strong>Points earned:</strong> {answerData.pointsEarned}/{question.points}</p>
                      </Card.Body>
                    </Card>
                  );
                })}
              </>
            ) : (
              <Alert variant="info">
                Correct answers are not shown for this quiz.
              </Alert>
            )}
            
            <Link href={`/Courses/${cid}/Quizzes`}>
              <Button variant="secondary" className="mt-3">Back to Quizzes</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // One question at a time mode
  if (quiz.oneQuestionAtATime) {
    const currentQ = questions[currentQuestion];
    
    if (!currentQ) {
      return (
        <Container className="mt-4">
          <Alert variant="danger">No questions found for this quiz</Alert>
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
              <h3>{quiz.title}</h3>
            </div>
            {quiz.timeLimit > 0 && (
              <div className="timer-display">
                <h4 className={timeLeft && timeLeft < 60 ? "text-danger" : ""}>
                  Time Left: {formatTime(timeLeft)}
                </h4>
              </div>
            )}
          </Card.Header>
          
          <Card.Body>
            <div className="mb-3">
              <ProgressBar 
                now={((currentQuestion + 1) / questions.length) * 100} 
                label={`${currentQuestion + 1}/${questions.length}`} 
                variant="primary"
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
                      id="true-answer"
                      label="True"
                      name="tf-answer"
                      checked={userAnswers[currentQ._id] === true}
                      onChange={() => handleAnswerChange(currentQ._id, true)}
                      className="mb-2"
                    />
                    <Form.Check 
                      type="radio"
                      id="false-answer"
                      label="False"
                      name="tf-answer"
                      checked={userAnswers[currentQ._id] === false}
                      onChange={() => handleAnswerChange(currentQ._id, false)}
                    />
                  </Form>
                )}
                
                {currentQ.type === "multiple-choice" && (
                  <Form>
                    {(currentQ as MultipleChoiceQuestion).choices.map((choice, choiceIndex) => (
                      <Form.Check 
                        key={choiceIndex}
                        type="radio"
                        id={`choice-${choiceIndex}`}
                        label={choice}
                        name="mc-answer"
                        checked={userAnswers[currentQ._id] === choiceIndex}
                        onChange={() => handleAnswerChange(currentQ._id, choiceIndex)}
                        className="mb-2"
                      />
                    ))}
                  </Form>
                )}
                
                {currentQ.type === "fill-in-blank" && (
                  <Form.Control
                    type="text"
                    placeholder="Type your answer here"
                    value={userAnswers[currentQ._id] as string || ""}
                    onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
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
                  onClick={handleSubmitQuiz}
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
        <Card.Header className="bg-light">
          <h3>{quiz.title}</h3>
          {quiz.timeLimit > 0 && (
            <div className="text-muted mt-2">
              Time Limit: {quiz.timeLimit} minutes
            </div>
          )}
        </Card.Header>
        
        <Card.Body>
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
              onClick={handleSubmitQuiz}
            >
              Submit Quiz
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}