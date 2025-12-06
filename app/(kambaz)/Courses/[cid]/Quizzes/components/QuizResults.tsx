// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizResults.tsx
// FINAL VERSION - All TypeScript errors fixed
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Card, Button, Alert, Container, Spinner, Badge } from "react-bootstrap";
import * as quizClient from "../client";
import { FaArrowLeft } from "react-icons/fa";
import type { Quiz, Question, QuizAttempt, MultipleChoiceQuestion, FillInBlankQuestion } from "../types";

export default function QuizResults() {
  const { cid, qid, attemptId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!cid || !qid) {
          setError("Missing course or quiz ID");
          setLoading(false);
          return;
        }
        
        const quizDetails = await quizClient.findQuizById(cid as string, qid as string);
        setQuiz(quizDetails);
        
        const quizQuestions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
        setQuestions(quizQuestions);
        
        const attempts = await quizClient.findQuizAttemptById(
          cid as string,
          qid as string,
          currentUser._id
        );
        
        if (attempts && attempts.length > 0) {
          setAttempt(attempts[0]);
        } else {
          setError("No attempts found for this quiz");
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("Error loading results:", error);
        setError(error.message || "Failed to load quiz results");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [cid, qid, currentUser]);
  
  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  const getCorrectAnswerDisplay = (question: Question): string => {
    if (question.type === "multiple-choice") {
      const mcq = question as MultipleChoiceQuestion;
      return mcq.choices[mcq.correctAnswer] || "N/A";
    } else if (question.type === "true-false") {
      return String(question.correctAnswer);
    } else if (question.type === "fill-in-blank") {
      const fibq = question as FillInBlankQuestion;
      if (fibq.possibleAnswers && fibq.possibleAnswers.length > 0) {
        return fibq.possibleAnswers.join(" or ");
      }
      return "Any acceptable answer";
    }
    return "N/A";
  };
  
  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading quiz results...</p>
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
  
  if (!quiz || !attempt || !questions.length) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">No quiz results available</Alert>
        <Link href={`/Courses/${cid}/Quizzes`}>
          <Button variant="secondary">Back to Quizzes</Button>
        </Link>
      </Container>
    );
  }
  
  const percentage = Math.round((attempt.score / attempt.totalPoints) * 100);
  
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
          <div className="text-muted">Attempt #{attempt.attemptNumber}</div>
        </Card.Header>
        
        <Card.Body>
          <Alert variant={percentage >= 70 ? "success" : "danger"}>
            <h4>
              Your Score: {attempt.score}/{attempt.totalPoints} ({percentage}%)
              <Badge bg="secondary" className="ms-2">
                {getLetterGrade(percentage)}
              </Badge>
            </h4>
          </Alert>
          
          {quiz.showCorrectAnswers && quiz.showCorrectAnswers !== "Never" ? (
            <>
              <h5 className="mt-4">Question Results:</h5>
              {questions.map((question, index) => {
                const answerData = attempt.answers.find(
                  (a) => a.questionId === question._id
                );
                
                if (!answerData) {
                  return (
                    <Card key={question._id} className="mb-3">
                      <Card.Header className="bg-secondary text-white">
                        Question {index + 1}: Not Answered
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Question:</strong> {question.question}</p>
                      </Card.Body>
                    </Card>
                  );
                }
                
                // ✅ Simple isCorrect check - backend always returns boolean
                const isCorrect = answerData.isCorrect;
                
                return (
                  <Card key={question._id} className="mb-3">
                    <Card.Header className={isCorrect ? "bg-success text-white" : "bg-danger text-white"}>
                      Question {index + 1}: {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                      {" "}({answerData.pointsEarned}/{question.points} pts)
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Question:</strong> {question.question}</p>
                      <hr />
                      <p><strong>Your answer:</strong> {String(answerData.answer)}</p>
                      <p><strong>Correct answer:</strong> {getCorrectAnswerDisplay(question)}</p>
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
            <Button variant="secondary" className="mt-3">
              Back to Quizzes
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}