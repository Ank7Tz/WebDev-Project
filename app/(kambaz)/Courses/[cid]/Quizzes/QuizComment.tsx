// app/(kambaz)/Courses/[cid]/Quizzes/QuizComment.tsx
// Displays quiz metadata: availability, due date, points, questions count, and student score

"use client";
import { useEffect, useState } from "react";
import * as quizClient from "./client";
import { useSelector } from "react-redux";
import type { Quiz, Question, QuizAttempt } from "./types";

interface QuizCommentProps {
  quiz: Quiz;
}

export default function QuizComment({ quiz }: QuizCommentProps) {
  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch total number of questions
  const fetchQuestions = async () => {
    try {
      const fetchedQuestions = await quizClient.getQuestionsForQuiz(quiz.course, quiz._id);
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
  };

  // Fetch student's latest attempt
  const fetchLatestAttempt = async () => {
    try {
      const attempts = await quizClient.findQuizAttemptById(
        quiz.course, 
        quiz._id, 
        currentUser._id
      );
      
      if (attempts && attempts.length > 0) {
        // Get the most recent attempt
        setLatestAttempt(attempts[0]);
      } else {
        setLatestAttempt(null);
      }
    } catch (error) {
      console.error("Error fetching attempt:", error);
      setLatestAttempt(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (quiz && quiz._id) {
        await fetchQuestions();
        
        if (currentUser && currentUser.role === "STUDENT") {
          await fetchLatestAttempt();
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [quiz._id, currentUser]);

  // Calculate availability status
  const getAvailabilityStatus = () => {
    if (!quiz.availableDate || !quiz.dueDate) {
      return <span className="text-muted">Always available</span>;
    }

    const currentDate = new Date();
    const availableDate = new Date(quiz.availableDate);
    const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;
    const dueDate = new Date(quiz.dueDate);

    if (currentDate < availableDate) {
      return (
        <span className="text-warning">
          Not available until {new Date(quiz.availableDate).toLocaleDateString()}
        </span>
      );
    } else if (untilDate && currentDate > untilDate) {
      return <span className="text-danger">Closed</span>;
    } else if (currentDate > dueDate) {
      return <span className="text-danger">Closed</span>;
    } else {
      return <span className="text-success">Available</span>;
    }
  };

  // Format due date
  const formatDueDate = () => {
    if (!quiz.dueDate) {
      return "No due date";
    }
    return new Date(quiz.dueDate).toLocaleDateString();
  };

  // Get student's score
  const getStudentScore = () => {
    if (!latestAttempt) {
      return "-";
    }
    return latestAttempt.score;
  };

  if (loading) {
    return (
      <div className="wd-assignment-info d-block mt-1 ps-5">
        <span className="text-muted">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <span className="wd-assignment-info d-block mt-1 ps-5">
        {getAvailabilityStatus()} | Due {formatDueDate()} | {quiz.points || 0} pts | {questions.length} Questions
        {currentUser?.role === "STUDENT" && (
          <> | Score {getStudentScore()} / {quiz.points || 0} pts</>
        )}
      </span>
    </div>
  );
}