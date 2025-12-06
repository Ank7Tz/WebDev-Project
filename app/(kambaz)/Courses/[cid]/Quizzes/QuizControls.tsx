// app/(kambaz)/Courses/[cid]/Quizzes/QuizControls.tsx
// Quiz control buttons with fixed layout
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { BsBan, BsCheckCircleFill, BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import * as quizClient from "./client";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import type { Quiz } from "./types";

interface QuizControlsProps {
  quiz: Quiz;
  quizList: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
}

export default function QuizControlButtons({ 
  quiz, 
  quizList, 
  setQuizzes 
}: QuizControlsProps) {
  const { cid } = useParams();
  const router = useRouter();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [isPublished, setIsPublished] = useState(quiz.published);

  const handlePublish = async () => {
    try {
      const status = await quizClient.publishQuiz(quiz.course, quiz._id);
      if (status === 200) {
        setIsPublished(true);
        setQuizzes(quizList.map(q => 
          q._id === quiz._id ? { ...q, published: true } : q
        ));
      }
    } catch (error) {
      console.error("Failed to publish quiz:", error);
      alert("Failed to publish quiz. Please try again.");
    }
  };

  const handleUnpublish = async () => {
    try {
      const status = await quizClient.unpublishQuiz(quiz.course, quiz._id);
      if (status === 200) {
        setIsPublished(false);
        setQuizzes(quizList.map(q => 
          q._id === quiz._id ? { ...q, published: false } : q
        ));
      }
    } catch (error) {
      console.error("Failed to unpublish quiz:", error);
      alert("Failed to unpublish quiz. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      return;
    }

    try {
      await quizClient.deleteQuiz(quiz.course, quiz._id);
      setQuizzes(quizList.filter(q => q._id !== quiz._id));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    }
  };

  const handleEdit = () => {
    router.push(`/Courses/${cid}/Quizzes/${quiz._id}/edit`);
  };

  return (
    <div className="float-end d-flex align-items-center" style={{ gap: "10px" }}>
      {/* Publish/Unpublish Icon */}
      {isPublished ? (
        <BsCheckCircleFill className="text-success fs-5" />
      ) : (
        <BsBan className="fs-5 text-danger" />
      )}
      
      {/* Three-dot menu for Faculty only */}
      {currentUser?.role === "FACULTY" && (
        <Dropdown drop="down">
          <Dropdown.Toggle 
            as="div" 
            id={`dropdown-${quiz._id}`}
            style={{ cursor: 'pointer' }}
            className="d-inline-block"
          >
            <BsThreeDotsVertical className="fs-5" />
          </Dropdown.Toggle>
          
          <Dropdown.Menu>
            {isPublished ? (
              <Dropdown.Item onClick={handleUnpublish}>
                Unpublish
              </Dropdown.Item>
            ) : (
              <Dropdown.Item onClick={handlePublish}>
                Publish
              </Dropdown.Item>
            )}
            
            <Dropdown.Item onClick={handleEdit}>
              Edit
            </Dropdown.Item>
            
            <Dropdown.Item onClick={handleDelete} className="text-danger">
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}