// app/(kambaz)/Courses/[cid]/Quizzes/page.tsx
// Main Quizzes List Page - displays all quizzes for a course

"use client";
import { Alert, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import QuizControls from "./QuizControls";
import { IoRocketOutline } from "react-icons/io5";
import * as quizClient from "./client";
import { useEffect, useState } from "react";
import QuizComment from "./QuizComment";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import type { Quiz } from "./types";

export default function Quizzes() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid } = useParams();
  const [quizList, setQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  const fetchQuizzes = async () => {
    try {
      const quizzes = await quizClient.getQuizzesForCourse(cid as string);
      setQuizzes(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    }
  };

  useEffect(() => {
    if (cid) {
      fetchQuizzes();
    }
  }, [cid]);

  const handleCreateQuiz = async () => {
    try {
      const newQuizId = uuidv4();
      const newQuiz: Partial<Quiz> = {
        _id: newQuizId,
        title: "New Quiz",
        description: "",
        course: cid as string,
        published: false,
        quizType: "Graded Quiz",
        assignmentGroup: "Quizzes",
        shuffleAnswers: true,
        timeLimit: 20,
        multipleAttempts: false,
        howManyAttempts: 1,
        showCorrectAnswers: "Immediately",
        accessCode: "",
        oneQuestionAtATime: true,
        webcamRequired: false,
        lockQuestionsAfterAnswering: false,
        points: 0
      };
      
      // Create quiz on backend
      const createdQuiz = await quizClient.createQuiz(
        cid as string, 
        newQuizId, 
        newQuiz
      );
      
      // Add to local state
      setQuizzes([...quizList, createdQuiz]);
      
      // Navigate to edit page
      router.push(`/Courses/${cid}/Quizzes/${newQuizId}/edit`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz. Please try again.");
    }
  };

  const isQuizAvailable = (quiz: Quiz) => {
    const currentDate = new Date();
    const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
    const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;
    const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null;

    if (!availableDate || !dueDate) {
      return true; // Always available if no dates set
    }

    if (currentDate < availableDate) {
      return false;
    }
    
    if (untilDate && currentDate > untilDate) {
      return false;
    }
    
    if (currentDate > dueDate) {
      return false;
    }

    return true;
  };

  return (
    <div className="wd-quizzes p-4">
      <div id="input-group" className="d-flex justify-content-end mb-3">
        <input 
          className="rounded-3 me-2 fs-5 form-control w-25" 
          placeholder="🔍 Search for Quiz" 
          id="wd-search-quiz" 
        />
        
        {currentUser?.role === "FACULTY" && (
          <Button 
            className="btn btn-danger btn-lg" 
            id="wd-add-quiz" 
            onClick={handleCreateQuiz}
          >
            <FaPlus className="position-relative me-2" />
            Quiz
          </Button>
        )}
      </div>

      <h3 className="bg-secondary ps-2 mt-2 rounded-1 fw-bold dropdown-toggle w-100">
        Quizzes
      </h3>

      {currentUser?.role === "FACULTY" && quizList.length === 0 && (
        <Alert variant="info">
          <Alert.Heading className="text-center">No Quizzes Created</Alert.Heading>
          <p className="text-center">Click on the + Quiz button to create a new quiz.</p>
        </Alert>
      )}

      {currentUser?.role === "STUDENT" && quizList.length === 0 && (
        <Alert variant="info">
          <Alert.Heading className="text-center">No Quizzes Available</Alert.Heading>
        </Alert>
      )}

      {/* Faculty View - See all quizzes */}
      {currentUser?.role === "FACULTY" && (
        <div className="wd-quiz-list">
          <ListGroup className="list-group">
            {quizList.map((quiz) => (
              <ListGroupItem key={quiz._id} className="list-group-item">
                <IoRocketOutline className="text-success me-2 fs-5" />
                <Link 
                  href={`/Courses/${cid}/Quizzes/${quiz._id}/details`} 
                  className="wd-quiz-link text-decoration-none fw-bold"
                >
                  {quiz.title}
                </Link>
                <QuizControls 
                  quiz={quiz} 
                  setQuizzes={setQuizzes} 
                  quizList={quizList}
                /> 
                <QuizComment quiz={quiz} />
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      )}

      {/* Student View - Only see published quizzes */}
      {currentUser?.role === "STUDENT" && (
        <div className="wd-quiz-list">
          <ListGroup className="list-group">
            {quizList
              .filter(quiz => quiz.published)
              .map((quiz) => (
                <ListGroupItem key={quiz._id} className="list-group-item">
                  <IoRocketOutline className="text-success me-2 fs-5" />
                  <Button 
                    disabled={!isQuizAvailable(quiz)} 
                    onClick={() => router.push(`/Courses/${cid}/Quizzes/${quiz._id}/details`)}
                    className="link bg-white text-decoration-underline text-dark border-0 fw-bold fs-5 p-1"
                  >
                    {quiz.title}
                  </Button>
                  <QuizComment quiz={quiz} />
                </ListGroupItem>
              ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
}