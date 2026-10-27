import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentInfo, ViolationEvent } from '../types/exam';
import {
  MULTIPLE_CHOICE_QUESTIONS,
  ESSAY_QUESTIONS,
  EXAM_METADATA,
} from '../data/examData';
import { ViolationModal } from './ViolationModal';
import {
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Maximize2,
  Lock,
} from 'lucide-react';

interface ExamScreenProps {
  student: StudentInfo;
  onSubmitExam: (
    mcAnswers: Record<number, 'A' | 'B' | 'C' | 'D' | ''>,
    essayAnswers: Record<number, string>,
    violations: ViolationEvent[],
    elapsedSeconds: number,
    isAutoSubmittedDueToViolations: boolean
  ) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  student,
  onSubmitExam,
}) => {
  // Timer state: 60 minutes = 3600 seconds
  const totalDuration = EXAM_METADATA.durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalDuration);
  const [startTime] = useState<number>(Date.now());

  // Question navigation state
  const [activeTab, setActiveTab] = useState<'mc' | 'essay'>('mc');
  const [currentMcIndex, setCurrentMcIndex] = useState(0);
  const [currentEssayIndex, setCurrentEssayIndex] = useState(0);

  // Student answers
  const [mcAnswers, setMcAnswers] = useState<
    Record<number, 'A' | 'B' | 'C' | 'D' | ''>
  >(() => {
    const initial: Record<number, 'A' | 'B' | 'C' | 'D' | ''> = {};
    MULTIPLE_CHOICE_QUESTIONS.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });

  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    ESSAY_QUESTIONS.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });

  // Anti-cheating & Violations
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [lastViolation, setLastViolation] = useState<ViolationEvent | null>(null);
  const [isFatalViolation, setIsFatalViolation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submit confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isSubmittingRef = useRef(false);

  // Format timestamp e.g. 10:14:02
  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  // Helper to trigger submit
  const triggerSubmit = useCallback(
    (dueToViolations: boolean = false) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      onSubmitExam(
        mcAnswers,
        essayAnswers,
        violations,
        elapsed,
        dueToViolations
      );
    },
    [essayAnswers, mcAnswers, onSubmitExam, startTime, violations]
  );

  // Record a violation event
  const registerViolation = useCallback(
    (type: ViolationEvent['type'], message: string) => {
      if (isSubmittingRef.current) return;

      const newViolation: ViolationEvent = {
        timestamp: getCurrentTimestamp(),
        type,
        message,
      };

      setViolations((prev) => {
        const nextList = [...prev, newViolation];
        setLastViolation(newViolation);

        if (nextList.length >= EXAM_METADATA.maxViolationsAllowed) {
          setIsFatalViolation(true);
          setShowViolationModal(true);
          // Auto submit after notification
          setTimeout(() => {
            triggerSubmit(true);
          }, 3500);
        } else {
          setShowViolationModal(true);
        }

        return nextList;
      });
    },
    [triggerSubmit]
  );

  // Attempt to enter fullscreen
  const enterFullscreen = () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {
            // Ignore browsers that block programmatic fullscreen
          });
        }
      }
    } catch {
      // Ignored
    }
  };

  // 1. Fullscreen watcher
  useEffect(() => {
    enterFullscreen();

    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && !isSubmittingRef.current) {
        registerViolation(
          'fullscreen_exit',
          'Keluar dari mode layar penuh (fullscreen) saat ujian'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [registerViolation]);

  // 2. Real-time Visibility & Blur Detection (Tab Switch)
  useEffect(() => {
    let blurTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        registerViolation(
          'tab_switch',
          'Terdeteksi berpindah tab browser ke aplikasi atau situs lain'
        );
      }
    };

    const handleWindowBlur = () => {
      // Avoid double trigger if visibilityChange already handled it
      blurTimeout = setTimeout(() => {
        if (!document.hasFocus() && !isSubmittingRef.current) {
          registerViolation(
            'window_blur',
            'Fokus jendela ujian hilang (beralih ke jendela lain atau meminimalkan browser)'
          );
        }
      }, 300);
    };

    const handleWindowFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, [registerViolation]);

  // 3. Prevent keyboard shortcuts & right-click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+U, Ctrl+Shift+I, Alt+Tab hints
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        registerViolation(
          'window_blur',
          `Mencoba membuka inspect element / shortcut kunci (${e.key})`
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [registerViolation]);

  // 4. Timer interval (Countdown from 60 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [triggerSubmit]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qid: number, optKey: 'A' | 'B' | 'C' | 'D') => {
    setMcAnswers((prev) => ({
      ...prev,
      [qid]: optKey,
    }));
  };

  const handleEssayChange = (qid: number, text: string) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [qid]: text,
    }));
  };

  // Counts
  const answeredMcCount = Object.values(mcAnswers).filter((v) => v !== '').length;
  const answeredEssayCount = Object.values(essayAnswers).filter(
    (v) => v.trim().length > 0
  ).length;

  const currentMcQuestion = MULTIPLE_CHOICE_QUESTIONS[currentMcIndex];
  const currentEssayQuestion = ESSAY_QUESTIONS[currentEssayIndex];

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col relative select-none pb-12"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      {/* Background Subtle Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] select-none text-center">
        <div className="text-4xl sm:text-6xl font-black text-slate-900 rotate-[-25deg]">
          {student.name} · {student.nis} · {student.className}
        </div>
      </div>

      {/* Sticky Exam Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Student identity & Fullscreen reminder */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>{student.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                  {student.className}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                No/NIS: {student.nis} · Informatika Kelas VIII
              </div>
            </div>
          </div>

          {/* Center: Live Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
              secondsLeft < 300
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className={`w-4 h-4 ${secondsLeft < 300 ? 'text-rose-600' : 'text-emerald-700'}`} />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          {/* Right: Anti-Cheat Violation Pill & Finish Button */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                violations.length === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-300 text-rose-700'
              }`}
              title="Pelanggaran Tab/Layar Terdeteksi"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {violations.length}/{EXAM_METADATA.maxViolationsAllowed} Tab
              </span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan Ujian</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Exam Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Question Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section Mode Toggle (Pilihan Ganda vs Essay) */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 flex items-center gap-2 shadow-xs">
            <button
              onClick={() => setActiveTab('mc')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'mc'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>A. Pilihan Ganda (10 Soal)</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'mc' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {answeredMcCount}/10
              </span>
            </button>

            <button
              onClick={() => setActiveTab('essay')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'essay'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>B. Uraian / Essay (5 Soal)</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'essay' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {answeredEssayCount}/5
              </span>
            </button>
          </div>

          {/* Active Question Box */}
          {activeTab === 'mc' ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  Soal Pilihan Ganda #{currentMcIndex + 1} dari 10
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot: 10 Poin</span>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentMcQuestion.question}
              </div>

              {/* Question Table Data (Q3) */}
              {currentMcQuestion.tableData && (
                <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        {currentMcQuestion.tableData.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentMcQuestion.tableData.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          {r.map((c, j) => (
                            <td key={j} className="px-4 py-2">
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentMcQuestion.options.map((opt) => {
                  const isSelected = mcAnswers[currentMcQuestion.id] === opt.key;
                  return (
                    <label
                      key={opt.key}
                      onClick={() => handleSelectOption(currentMcQuestion.id, opt.key)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt.key}
                      </div>
                      <span className="text-sm font-medium pt-0.5 leading-relaxed">
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Navigation Arrows for MC */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentMcIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentMcIndex === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  {currentMcIndex + 1} / 10
                </div>

                <button
                  onClick={() =>
                    setCurrentMcIndex((prev) =>
                      Math.min(MULTIPLE_CHOICE_QUESTIONS.length - 1, prev + 1)
                    )
                  }
                  disabled={currentMcIndex === MULTIPLE_CHOICE_QUESTIONS.length - 1}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Essay Active Question */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
                  Soal Uraian / Essay #{currentEssayIndex + 1} dari 5
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot: 20 Poin</span>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentEssayQuestion.question}
              </div>

              {/* Table Template for Essay Q1 */}
              {currentEssayQuestion.tableTemplate && (
                <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
                  <div className="bg-slate-50 p-2 text-xs font-bold text-slate-600 border-b border-slate-200">
                    Tabel Acuan Konversi Bilangan:
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        {currentEssayQuestion.tableTemplate.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {currentEssayQuestion.tableTemplate.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          {r.map((c, j) => (
                            <td key={j} className="px-4 py-2 font-mono">
                              {c === '?' ? (
                                <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-sm">
                                  [ ? ]
                                </span>
                              ) : (
                                c
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Essay Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <label htmlFor="essay-answer" className="font-semibold text-slate-700">
                    Tuliskan Jawaban & Penjelasan Anda di sini:
                  </label>
                  <span>
                    {(essayAnswers[currentEssayQuestion.id] || '').length} Karakter
                  </span>
                </div>
                <textarea
                  id="essay-answer"
                  rows={8}
                  placeholder="Ketik uraian jawaban secara runut, jelaskan langkah perhitungan atau konsep pemikiran komputasional Anda..."
                  value={essayAnswers[currentEssayQuestion.id] || ''}
                  onChange={(e) =>
                    handleEssayChange(currentEssayQuestion.id, e.target.value)
                  }
                  className="w-full p-4 text-sm rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white leading-relaxed resize-y"
                />
              </div>

              {/* Navigation Arrows for Essay */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentEssayIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentEssayIndex === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  {currentEssayIndex + 1} / 5
                </div>

                <button
                  onClick={() =>
                    setCurrentEssayIndex((prev) =>
                      Math.min(ESSAY_QUESTIONS.length - 1, prev + 1)
                    )
                  }
                  disabled={currentEssayIndex === ESSAY_QUESTIONS.length - 1}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Question Navigator Palette & Integrity Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Question Grid Navigator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Navigasi Nomor Soal
            </h3>

            {/* MC Grid */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 flex justify-between">
                <span>Pilihan Ganda (10 Soal)</span>
                <span className="font-mono text-emerald-700">
                  {answeredMcCount}/10
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MULTIPLE_CHOICE_QUESTIONS.map((q, idx) => {
                  const isAnswered = mcAnswers[q.id] !== '';
                  const isCurrent = activeTab === 'mc' && currentMcIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveTab('mc');
                        setCurrentMcIndex(idx);
                      }}
                      className={`h-10 rounded-xl font-bold text-xs font-mono transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-emerald-600 ring-offset-1 bg-emerald-700 text-white'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>{q.id}</span>
                      {isAnswered && (
                        <span className="text-[9px] uppercase font-sans">
                          {mcAnswers[q.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Essay Grid */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 flex justify-between">
                <span>Uraian / Essay (5 Soal)</span>
                <span className="font-mono text-teal-700">
                  {answeredEssayCount}/5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ESSAY_QUESTIONS.map((eq, idx) => {
                  const isAnswered = (essayAnswers[eq.id] || '').trim().length > 0;
                  const isCurrent = activeTab === 'essay' && currentEssayIndex === idx;

                  return (
                    <button
                      key={eq.id}
                      onClick={() => {
                        setActiveTab('essay');
                        setCurrentEssayIndex(idx);
                      }}
                      className={`h-10 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-teal-600 ring-offset-1 bg-teal-700 text-white'
                          : isAnswered
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      ES {eq.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span>Terisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                <span>Belum</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-700" />
                <span>Aktif</span>
              </div>
            </div>
          </div>

          {/* Anti-Cheating Status Card */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldAlert className="w-4 h-4 text-indigo-700" />
              <span>Integritas & Kunci Layar</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
              <div className="flex justify-between items-center">
                <span>Pelanggaran Tab:</span>
                <span className="font-bold text-rose-600 font-mono">
                  {violations.length} / {EXAM_METADATA.maxViolationsAllowed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status Layar Penuh:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aktif</span>
                </span>
              </div>
            </div>

            <button
              onClick={enterFullscreen}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Perbarui Layar Penuh</span>
            </button>
          </div>
        </div>
      </main>

      {/* Violation Warning Modal */}
      <ViolationModal
        isOpen={showViolationModal}
        violationCount={violations.length}
        maxViolations={EXAM_METADATA.maxViolationsAllowed}
        lastViolation={lastViolation}
        isFatal={isFatalViolation}
        onAcknowledge={() => {
          setShowViolationModal(false);
          enterFullscreen();
        }}
      />

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Kumpulkan Asesmen Harian?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pastikan Anda telah memeriksa kembali seluruh jawaban pilihan ganda dan uraian.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Pilihan Ganda Terjawab:</span>
                <strong className="font-mono text-emerald-700">
                  {answeredMcCount} / 10 Soal
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Uraian / Essay Terjawab:</span>
                <strong className="font-mono text-teal-700">
                  {answeredEssayCount} / 5 Soal
                </strong>
              </div>
              {(answeredMcCount < 10 || answeredEssayCount < 5) && (
                <div className="pt-2 text-amber-700 text-[11px] flex items-center gap-1.5 border-t border-slate-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Masih ada soal yang belum Anda jawab. Anda yakin ingin mengumpulkan?
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  triggerSubmit(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
