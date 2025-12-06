// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizDetails.tsx
// Quiz Details Page - Shows quiz information and action buttons
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Button, Spinner, Alert } from "react-bootstrap";
import * as quizClient from "../client";
import type { Quiz, QuizAttempt } from "../types";

export default function QuizDetails() {
  const router = useRouter();
  const { cid, qid } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [canTakeQuiz, setCanTakeQuiz] = useState(true);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizData = await quizClient.findQuizById(cid as string, qid as string);
      setQuiz(quizData);
      
      // Fetch questions count
      const questions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
      setQuestionsCount(questions.length);
      
      // Fetch student attempts (if student)
      if (currentUser?.role === "STUDENT") {
        try {
          const studentAttempts = await quizClient.findQuizAttemptById(
            cid as string,
            qid as string,
            currentUser._id
          );
          setAttempts(studentAttempts);
          
          // Check if student can still take quiz
          if (quizData.multipleAttempts) {
            setCanTakeQuiz(studentAttempts.length < quizData.howManyAttempts);
          } else {
            setCanTakeQuiz(studentAttempts.length === 0);
          }
        } catch (error) {
          // No attempts yet - can take quiz
          setAttempts([]);
          setCanTakeQuiz(true);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cid && qid) {
      fetchQuizData();
    }
  }, [cid, qid]);

  const handleAttemptQuiz = () => {
    // Simply navigate to attempt page - no need to pre-create attempt
    router.push(`/Courses/${cid}/Quizzes/${qid}/attempt/new`);
  };

  const handleViewResults = () => {
    if (attempts.length > 0) {
      const latestAttempt = attempts[0];
      router.push(`/Courses/${cid}/Quizzes/${qid}/results/${latestAttempt._id}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading quiz details...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Alert variant="danger">Quiz not found</Alert>
    );
  }

  return (
    <div className="wd-quiz-details p-4">
      <h2 className="text-danger">Quiz Details</h2>
      
      {/* Student Action Buttons */}
      {currentUser?.role === "STUDENT" && (
        <div className="wd-quiz-details-actions d-flex justify-content-center mb-4 gap-2">
          {canTakeQuiz && quiz.published && (
            <Button 
              variant="primary" 
              onClick={handleAttemptQuiz}
            >
              Attempt Quiz
            </Button>
          )}
          
          {attempts.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={handleViewResults}
            >
              View Results
            </Button>
          )}
          
          {!canTakeQuiz && (
            <Alert variant="warning" className="mt-3">
              You have exhausted all attempts for this quiz.
            </Alert>
          )}
          
          {!quiz.published && (
            <Alert variant="info" className="mt-3">
              This quiz is not yet available.
            </Alert>
          )}
        </div>
      )}

      {/* Faculty Action Buttons */}
      {currentUser?.role === "FACULTY" && (
        <div className="wd-quiz-details-actions d-flex justify-content-center flex-row mb-4 gap-2"> 
          <Link href={`/Courses/${cid}/Quizzes/${qid}/preview`}>
            <Button variant="secondary">
              Preview Quiz
            </Button>
          </Link>
          <Link href={`/Courses/${cid}/Quizzes/${qid}/edit`}>
            <Button variant="secondary">
              Edit Quiz
              <CiEdit className="ms-2" />
            </Button>
          </Link>
        </div>
      )}

      <hr />
      
      {/* Quiz Details */}
      <div>
        <h1 className="mb-5">{quiz.title}</h1>
        <div id="wd-details" className="ms-5 mt-3 mb-5 w-50">
          <div className="row mt-2">
            <div className="col-9"><b>Quiz Type</b></div>
            <div className="col-3">{quiz.quizType}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Points</b></div>
            <div className="col-3">{quiz.points}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Number of Questions</b></div>
            <div className="col-3">{questionsCount}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Assignment Group</b></div>
            <div className="col-3">{quiz.assignmentGroup}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Shuffle Answers</b></div>
            <div className="col-3">{quiz.shuffleAnswers ? "Yes" : "No"}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Time Limit</b></div>
            <div className="col-3">
              {quiz.timeLimit ? `${quiz.timeLimit} minutes` : "No limit"}
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Multiple Attempts</b></div>
            <div className="col-3">{quiz.multipleAttempts ? "Yes" : "No"}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Max Attempts</b></div>
            <div className="col-3">{quiz.howManyAttempts}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>Show Correct Answers</b></div>
            <div className="col-3">{quiz.showCorrectAnswers}</div>
          </div>

          <div className="row mt-2">
            <div className="col-9"><b>One Question at a Time</b></div>
            <div className="col-3">{quiz.oneQuestionAtATime ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="wd-footer-details">
          <hr/>
          <div className="row">
            <div className="col-3"><b>Due</b></div>
            <div className="col-3"><b>For</b></div>
            <div className="col-3"><b>Available from</b></div>
            <div className="col-3"><b>Until</b></div>
          </div>
          <div className="row">
            <div className="col-3">
              {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "No due date"}
            </div>
            <div className="col-3">Everyone</div>
            <div className="col-3">
              {quiz.availableDate ? new Date(quiz.availableDate).toLocaleDateString() : "Always"}
            </div>
            <div className="col-3">
              {quiz.untilDate ? new Date(quiz.untilDate).toLocaleDateString() : "No end date"}
            </div>
          </div>
          <hr/>
        </div>
      </div>
    </div>
  );
}