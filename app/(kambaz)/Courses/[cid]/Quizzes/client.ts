// app/(kambaz)/Courses/[cid]/Quizzes/client.ts
// API client for Quiz operations - all HTTP requests to backend
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import type { Quiz, Question, QuizAttempt } from "./types";

const REMOTE_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER || "http://localhost:4000";
const API_BASE = `${REMOTE_SERVER}/api`;

const axiosWithCredentials = axios.create({
  withCredentials: true,
});

// ==================== QUIZ OPERATIONS ====================

/**
 * Get all quizzes for a specific course
 * Students only see published quizzes
 */
export const getQuizzesForCourse = async (courseId: string): Promise<Quiz[]> => {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/courses/${courseId}/quizzes`
  );
  return response.data;
};

/**
 * Get quiz details by ID
 */
export const findQuizById = async (courseId: string, quizId: string): Promise<Quiz> => {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}`
  );
  return response.data;
};

/**
 * Create a new quiz (Faculty only)
 */
export const createQuiz = async (
  courseId: string, 
  quizId: string, 
  quizData: Partial<Quiz>
): Promise<Quiz> => {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}`,
    quizData
  );
  return response.data;
};

/**
 * Update an existing quiz (Faculty only)
 */
export const updateQuiz = async (
  courseId: string,
  quizId: string,
  quizData: Partial<Quiz>
): Promise<any> => {
  const response = await axiosWithCredentials.put(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}`,
    quizData
  );
  return response.data;
};

/**
 * Delete a quiz (Faculty only)
 */
export const deleteQuiz = async (courseId: string, quizId: string): Promise<any> => {
  const response = await axiosWithCredentials.delete(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}`
  );
  return response.data;
};

/**
 * Publish a quiz (Faculty only)
 */
export const publishQuiz = async (
  courseId: string,
  quizId: string
): Promise<number> => {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/publish`
  );
  return response.status;
};

/**
 * Unpublish a quiz (Faculty only)
 */
export const unpublishQuiz = async (
  courseId: string,
  quizId: string
): Promise<number> => {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/unpublish`
  );
  return response.status;
};

// ==================== QUESTION OPERATIONS ====================

/**
 * Get all questions for a quiz
 */
export const getQuestionsForQuiz = async (
  courseId: string,
  quizId: string
): Promise<Question[]> => {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/questions`
  );
  return response.data;
};

/**
 * Create a new question (Faculty only)
 */
export const createQuestion = async (
  courseId: string,
  quizId: string,
  questionData: Partial<Question>
): Promise<Question> => {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/questions`,
    questionData
  );
  return response.data;
};

/**
 * Update a question (Faculty only)
 */
export const updateQuestion = async (
  courseId: string,
  quizId: string,
  questionId: string,
  questionData: Partial<Question>
): Promise<any> => {
  const response = await axiosWithCredentials.put(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
    questionData
  );
  return response.data;
};

/**
 * Delete a question (Faculty only)
 */
export const deleteQuestion = async (
  courseId: string,
  quizId: string,
  questionId: string
): Promise<any> => {
  const response = await axiosWithCredentials.delete(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`
  );
  return response.data;
};

// ==================== ATTEMPT OPERATIONS ====================

/**
 * Submit a quiz attempt (Students)
 * Backend auto-grades the submission
 */
export const createAttempt = async (
  courseId: string,
  quizId: string,
  answers: { questionId: string; answer: any }[]
): Promise<QuizAttempt> => {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/attempts`,
    { answers }
  );
  return response.data;
};

/**
 * Get all attempts for a student on a quiz
 */
export const findQuizAttemptById = async (
  courseId: string,
  quizId: string,
  userId: string
): Promise<QuizAttempt[]> => {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/attempts/${userId}`
  );
  return response.data;
};

/**
 * Get the latest attempt for a student
 */
export const getLatestAttempt = async (
  courseId: string,
  quizId: string,
  userId: string
): Promise<QuizAttempt | null> => {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/attempts/${userId}/latest`
  );
  return response.data;
};

/**
 * Update an attempt (for incomplete attempts)
 */
export const updateAttempt = async (
  courseId: string,
  quizId: string,
  attemptId: string,
  attemptData: Partial<QuizAttempt>
): Promise<any> => {
  const response = await axiosWithCredentials.put(
    `${API_BASE}/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}`,
    attemptData
  );
  return response.data;
};