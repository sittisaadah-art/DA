import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StudentInfo, StudentSubmission, ViolationEvent } from './types/exam';
import { INITIAL_SUBMISSIONS, EXAM_METADATA } from './data/examData';
import { calculateMcScore, evaluateEssayAnswers } from './utils/grading';
import { Navbar } from './components/Navbar';
import { StudentRegister } from './components/StudentRegister';
import { ExamScreen } from './components/ExamScreen';
import { ResultCard } from './components/ResultCard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherLoginModal } from './components/TeacherLoginModal';

const STORAGE_KEY = 'arrohmah_cbt_submissions_v3';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'register' | 'exam' | 'result' | 'teacher_dashboard'
  >('register');
  const [currentStudent, setCurrentStudent] = useState<StudentInfo | null>(null);
  const [activeSubmission, setActiveSubmission] =
    useState<StudentSubmission | null>(null);

  // Submissions list with persistent localStorage
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load submissions from localStorage:', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  // Save submissions to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [submissions]);

  // Teacher authentication
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);

  // Handler: Start Exam
  const handleStartExam = (student: StudentInfo) => {
    setCurrentStudent(student);
    setCurrentView('exam');
  };

  // Handler: Submit Exam
  const handleSubmitExam = (
    mcAnswers: Record<number, 'A' | 'B' | 'C' | 'D' | ''>,
    essayAnswers: Record<number, string>,
    violations: ViolationEvent[],
    elapsedSeconds: number,
    isAutoSubmittedDueToViolations: boolean
  ) => {
    if (!currentStudent) return;

    // 1. Calculate MC Score (60% weight)
    const { score: mcScore } = calculateMcScore(mcAnswers);

    // 2. Evaluate Essay with rubric & keyword analysis (40% weight)
    const { totalScore: essayScore, evaluations } =
      evaluateEssayAnswers(essayAnswers);

    // 3. Final Composite Score
    const finalScore = Math.round(
      mcScore * EXAM_METADATA.mcWeight + essayScore * EXAM_METADATA.essayWeight
    );
    const isPassed = finalScore >= EXAM_METADATA.kkm;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const newSubmission: StudentSubmission = {
      id: `sub-${Date.now()}`,
      student: currentStudent,
      submittedAt: formattedDate,
      durationSeconds: elapsedSeconds,
      mcAnswers,
      essayAnswers,
      mcScore,
      essayScore,
      finalScore,
      isPassed,
      violations,
      isAutoSubmittedDueToViolations,
      essayEvaluations: evaluations,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    setActiveSubmission(newSubmission);
    setCurrentView('result');

    // Celebration confetti if passed KKM!
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }
    }
  };

  // Handler: Open Teacher Portal
  const handleOpenTeacherModal = () => {
    if (isTeacherLoggedIn) {
      setCurrentView('teacher_dashboard');
    } else {
      setIsTeacherModalOpen(true);
    }
  };

  // Handler: Success Teacher Login
  const handleSuccessTeacherLogin = () => {
    setIsTeacherLoggedIn(true);
    setIsTeacherModalOpen(false);
    setCurrentView('teacher_dashboard');
  };

  // Handler: Update submission from teacher
  const handleUpdateSubmission = (updated: StudentSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    if (activeSubmission && activeSubmission.id === updated.id) {
      setActiveSubmission(updated);
    }
  };

  // Handler: Delete submission
  const handleDeleteSubmission = (subId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== subId));
    if (activeSubmission && activeSubmission.id === subId) {
      setActiveSubmission(null);
      setCurrentView('teacher_dashboard');
    }
  };

  // Handler: Reset submissions
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh bawaan?')) {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenTeacherModal={handleOpenTeacherModal}
        isExamInProgress={currentView === 'exam'}
        onGoHome={() => {
          if (currentView !== 'exam') {
            setCurrentView('register');
          }
        }}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'register' && (
          <StudentRegister onStartExam={handleStartExam} />
        )}

        {currentView === 'exam' && currentStudent && (
          <ExamScreen
            student={currentStudent}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {currentView === 'result' && activeSubmission && (
          <ResultCard
            submission={activeSubmission}
            onRetakeOrHome={() => setCurrentView('register')}
          />
        )}

        {currentView === 'teacher_dashboard' && (
          <TeacherDashboard
            submissions={submissions}
            onSelectSubmissionToView={(sub) => {
              setActiveSubmission(sub);
              setCurrentView('result');
            }}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onResetData={handleResetData}
            onLogout={() => {
              setIsTeacherLoggedIn(false);
              setCurrentView('register');
            }}
          />
        )}
      </div>

      {/* Teacher Secret Login Modal (PIN: guru123) */}
      <TeacherLoginModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSuccessLogin={handleSuccessTeacherLogin}
      />
    </div>
  );
}
