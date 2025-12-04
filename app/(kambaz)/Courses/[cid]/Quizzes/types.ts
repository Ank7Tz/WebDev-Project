// app/(kambaz)/Courses/[cid]/Quizzes/types.ts
// Unified type definitions for Quiz system - ensures frontend-backend consistency

// ==================== QUIZ TYPES ====================

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: string;
  
  // Quiz Configuration
  quizType: "Graded Quiz" | "Practice Quiz" | "Graded Survey" | "Ungraded Survey";
  assignmentGroup: "Quizzes" | "Exams" | "Assignments" | "Project";
  shuffleAnswers: boolean;
  timeLimit: number;
  multipleAttempts: boolean;
  howManyAttempts: number;
  showCorrectAnswers: string;
  accessCode: string;
  oneQuestionAtATime: boolean;
  webcamRequired: boolean;
  lockQuestionsAfterAnswering: boolean;
  
  // Date fields
  dueDate?: Date | string;
  availableDate?: Date | string;
  untilDate?: Date | string;
  
  // Status
  published: boolean;
  points: number;
}

// ==================== QUESTION TYPES ====================

export interface BaseQuestion {
  _id: string;
  quiz: string;
  course: string;
  title: string;
  type: "multiple-choice" | "true-false" | "fill-in-blank";
  question: string;
  points: number;
  isEditing?: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  choices: string[]; // Array of choice options
  correctAnswer: number; // Index of correct choice (0, 1, 2, ...)
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false";
  correctAnswer: boolean; // true or false
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: "fill-in-blank";
  possibleAnswers: string[]; // Array of possible correct answers (case insensitive)
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion;

// ==================== ATTEMPT TYPES ====================

export interface AttemptAnswer {
  questionId: string;
  answer: string | number | boolean; // Type depends on question type
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizAttempt {
  _id: string;
  quiz: string;
  student: string;
  course: string;
  attemptNumber: number;
  startedAt: Date | string;
  submittedAt?: Date | string;
  answers: AttemptAnswer[];
  score: number;
  totalPoints: number;
  isCompleted: boolean;
}

// ==================== USER TYPES ====================

export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "TA" | "ADMIN";
}

// ==================== HELPER TYPES ====================

export type QuestionType = "multiple-choice" | "true-false" | "fill-in-blank";

export interface QuizFormData {
  title: string;
  description: string;
  quizType: string;
  assignmentGroup: string;
  shuffleAnswers: boolean;
  timeLimit: number;
  multipleAttempts: boolean;
  howManyAttempts: number;
  showCorrectAnswers: string;
  dueDate?: string;
  availableDate?: string;
  untilDate?: string;
}