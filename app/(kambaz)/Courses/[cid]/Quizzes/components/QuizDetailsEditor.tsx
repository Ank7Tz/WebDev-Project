// app/(kambaz)/Courses/[cid]/Quizzes/components/QuizDetailsEditor.tsx
// Quiz Details Editor - Faculty can edit quiz settings
// FIXED: Proper field names matching backend schema

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Button, Form, Nav, Tab, Row, Col } from "react-bootstrap";
import * as quizClient from "../client";
import type { Quiz } from "../types";

export default function QuizDetailsEditor() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    _id: "",
    title: "New Quiz",
    description: "",
    course: cid as string,
    quizType: "Graded Quiz",
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    howManyAttempts: 1,  // ✅ Correct field name
    showCorrectAnswers: "Immediately",
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    published: false,
    points: 0
  });

  const [questions, setQuestions] = useState<any[]>([]);

  const getQuiz = async () => {
    if (qid && cid) {
      try {
        const fetchedQuiz = await quizClient.findQuizById(cid as string, qid as string);
        const fetchedQuizQuestions = await quizClient.getQuestionsForQuiz(cid as string, qid as string);
        
        setQuiz(fetchedQuiz);
        setQuestions(fetchedQuizQuestions);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    }
  };

  useEffect(() => {
    getQuiz();
  }, [qid, cid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setQuiz({
      ...quiz,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuiz({
      ...quiz,
      [name]: parseInt(value) || 0
    });
  };

  const handleSave = async () => {
    try {
      if (!cid || !qid) {
        throw new Error("Course ID or Quiz ID is missing");
      }
      
      await quizClient.updateQuiz(cid as string, qid as string, quiz);
      router.push(`/Courses/${cid}/Quizzes/${qid}/details`);
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    }
  };

  const publishQuiz = async () => {
    try {
      const status = await quizClient.publishQuiz(quiz.course!, quiz._id!);
      if (status === 200) {
        setQuiz({ ...quiz, published: true });
      }
    } catch (error) {
      console.error("Failed to publish quiz:", error);
    }
  };

  const handleSaveAndPublish = async () => {
    try {
      await handleSave();
      await publishQuiz();
    } catch (error) {
      console.error("Error saving and publishing:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/details`);
  };

  const calculateTotalPoints = () => {
    return questions.reduce((total, question) => total + (question.points || 0), 0);
  };

  return (
    <div className="wd-quiz-editor ms-3 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Form.Check
            type="switch"
            id="published-switch"
            label="Published"
            checked={quiz.published || false}
            disabled={true}
            className="d-inline-block ms-2"
          />
        </div>
        <div>
          <span>Points {calculateTotalPoints()} </span>
        </div>
      </div>

      <Tab.Container id="quiz-editor-tabs" defaultActiveKey="details">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="details">Details</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href={`/Courses/${cid}/Quizzes/${qid}/questions`}>
              Questions
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Unnamed Quiz"
                  name="title"
                  value={quiz.title || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quiz Instructions:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={quiz.description || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row className="mb-3">
                <Form.Group as={Col} md={4}>
                  <Form.Label>Quiz Type</Form.Label>
                  <Form.Select name="quizType" value={quiz.quizType || "Graded Quiz"} onChange={handleChange}>
                    <option value="Graded Quiz">Graded Quiz</option>
                    <option value="Practice Quiz">Practice Quiz</option>
                    <option value="Graded Survey">Graded Survey</option>
                    <option value="Ungraded Survey">Ungraded Survey</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={8}>
                  <Form.Label>Assignment Group</Form.Label>
                  <Form.Select name="assignmentGroup" value={quiz.assignmentGroup || "Quizzes"} onChange={handleChange}>
                    <option value="Quizzes">Quizzes</option>
                    <option value="Exams">Exams</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Project">Project</option>
                  </Form.Select>
                </Form.Group>
              </Row>

              <div className="border rounded p-3 mb-3">
                <h5>Options</h5>
                
                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="shuffle-answers"
                    label="Shuffle Answers"
                    name="shuffleAnswers"
                    checked={quiz.shuffleAnswers || false}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2 d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id="time-limit-enabled"
                    label="Time Limit"
                    checked={(quiz.timeLimit || 0) > 0}
                    onChange={(e) => setQuiz({ ...quiz, timeLimit: e.target.checked ? 20 : 0 })}
                    className="me-2"
                  />
                  {(quiz.timeLimit || 0) > 0 && (
                    <>
                      <Form.Control
                        type="number"
                        size="sm"
                        style={{ width: "80px" }}
                        value={quiz.timeLimit || 20}
                        name="timeLimit"
                        onChange={handleNumberChange}
                        min="1"
                      />
                      <span className="ms-2">Minutes</span>
                    </>
                  )}
                </Form.Group>

                {/* ✅ FIXED: Multiple Attempts Section */}
                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="multiple-attempts"
                    label="Allow Multiple Attempts"
                    name="multipleAttempts"
                    checked={quiz.multipleAttempts || false}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* ✅ CRITICAL: Show howManyAttempts input when multipleAttempts is checked */}
                {quiz.multipleAttempts && (
                  <Form.Group className="mb-2 ms-4">
                    <Form.Label>How Many Attempts:</Form.Label>
                    <Form.Control
                      type="number"
                      name="howManyAttempts" 
                      value={quiz.howManyAttempts || 1}
                      onChange={handleNumberChange}
                      min="1"
                      max="10"
                      style={{ width: "100px" }}
                    />
                    <Form.Text className="text-muted">
                      Students can attempt this quiz {quiz.howManyAttempts || 1} time(s)
                    </Form.Text>
                  </Form.Group>
                )}

                <Form.Group className="mb-2">
                  <Form.Label>Show Correct Answers:</Form.Label>
                  <Form.Select
                    name="showCorrectAnswers"
                    value={quiz.showCorrectAnswers || "Immediately"}
                    onChange={handleChange}
                  >
                    <option value="Immediately">Immediately</option>
                    <option value="After Due Date">After Due Date</option>
                    <option value="Never">Never</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="one-question-at-a-time"
                    label="One Question at a Time"
                    name="oneQuestionAtATime"
                    checked={quiz.oneQuestionAtATime || false}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="webcam-required"
                    label="Require Respondus LockDown Browser"
                    name="webcamRequired"
                    checked={quiz.webcamRequired || false}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="lock-questions"
                    label="Lock Questions After Answering"
                    name="lockQuestionsAfterAnswering"
                    checked={quiz.lockQuestionsAfterAnswering || false}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h5>Assign</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Available from</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="availableDate"
                      value={quiz.availableDate ? new Date(quiz.availableDate).toISOString().slice(0, 16) : ""}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Until</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="untilDate"
                      value={quiz.untilDate ? new Date(quiz.untilDate).toISOString().slice(0, 16) : ""}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <div className="mb-3">
                  <Form.Label>Due</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="dueDate"
                    value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end border-top pt-3">
                <Button variant="outline-secondary" className="me-2" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="danger" className="ms-2" onClick={handleSaveAndPublish}>
                  Save and Publish
                </Button>
              </div>
            </Form>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}