import React, { useState } from 'react';
import { StudentSubmission } from '../types/exam';
import { MULTIPLE_CHOICE_QUESTIONS, ESSAY_QUESTIONS, EXAM_METADATA } from '../data/examData';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bookmark,
  Award,
  RefreshCw,
} from 'lucide-react';

interface ResultCardProps {
  submission: StudentSubmission;
  onRetakeOrHome?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ submission, onRetakeOrHome }) => {
  const [isViolationsOpen, setIsViolationsOpen] = useState(false);
  const [isMcOpen, setIsMcOpen] = useState(true);
  const [isEssayOpen, setIsEssayOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    // Expand sections before capturing
    setIsViolationsOpen(true);
    setIsMcOpen(true);
    setIsEssayOpen(true);

    const safeName = submission.student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rekap_Asesmen_${safeName}_${submission.student.nis}`;
    
    // Give state 150ms to update DOM before export
    setTimeout(async () => {
      await exportElementToPdf('printable-assessment-result', filename);
      setIsExporting(false);
    }, 200);
  };

  const handlePrint = () => {
    setIsViolationsOpen(true);
    setIsMcOpen(true);
    setIsEssayOpen(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const mcCorrectCount = MULTIPLE_CHOICE_QUESTIONS.filter(
    (q) => submission.mcAnswers[q.id] === q.correctAnswer
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Action Bar (no-print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Hasil Asesmen Berhasil Disimpan
            </h2>
            <p className="text-xs text-slate-500">
              Data otomatis tercatat di Dashboard Rekapitulasi Guru SMP Ar Rohmah IIBS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh File PDF Rekapitulasi'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
          {onRetakeOrHome && (
            <button
              onClick={onRetakeOrHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Halaman Utama</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Container - Styled exactly as image_c9de060c.png */}
      <div id="printable-assessment-result" className="space-y-6 bg-transparent">
        {/* Print Header Watermark for PDF */}
        <div className="hidden print:block text-center border-b border-slate-300 pb-3 mb-4">
          <h1 className="text-lg font-black text-slate-900 tracking-wide uppercase">
            {EXAM_METADATA.schoolName}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Daily Asesmen Mata Pelajaran {EXAM_METADATA.subject} · {EXAM_METADATA.grade} {EXAM_METADATA.chapter}
          </p>
        </div>

        {/* 1. TOP HEADER SUMMARY CARD (Mirroring uploaded image) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Left Zone: Student info */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-sky-600 tracking-wider uppercase">
                HASIL ASESMEN HARIAN SISWA
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {submission.student.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 font-mono">
                <span className="border border-slate-300 rounded-lg px-3 py-1 bg-white font-sans text-xs font-medium text-slate-700">
                  Kelas {submission.student.className}
                  {submission.student.classDetail ? ` (${submission.student.classDetail})` : ''}
                </span>
                <span className="border border-slate-300 rounded-lg px-3 py-1 bg-white font-sans text-xs font-medium text-slate-700">
                  No/NIS: {submission.student.nis}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-sans text-xs font-medium">
                  ⏱ Durasi: {formatDuration(submission.durationSeconds)}
                </span>
              </div>
            </div>

            {/* Right Zone: Score Badge */}
            <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
              <div className="relative border border-emerald-300/80 bg-emerald-50/20 rounded-2xl p-4 sm:p-5 text-center min-w-[130px] sm:min-w-[140px]">
                <div className="absolute top-2.5 right-2.5 text-slate-400">
                  <Bookmark className="w-4 h-4 fill-slate-200 text-slate-400" />
                </div>
                <div className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  NILAI AKHIR
                </div>
                <div className="text-4xl sm:text-5xl font-black text-emerald-600 font-mono tabular-nums">
                  {submission.finalScore}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  KKM: {EXAM_METADATA.kkm}
                </div>
              </div>

              <div className="mt-2.5">
                <span
                  className={`inline-block px-3.5 py-1 text-xs font-bold rounded-full border ${
                    submission.isPassed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {submission.isPassed ? 'TUNTAS / LULUS' : 'REMIDIAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200" />

          {/* 3 Metrics Cards (PG 60%, Essay 40%, Catatan Integritas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Pilihan Ganda */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <div className="text-xs font-medium text-slate-500 mb-1">
                Pilihan Ganda (60%)
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-sky-700 font-mono tabular-nums">
                  {submission.mcScore}
                </span>
                <span className="text-sm font-bold text-sky-700 font-mono">
                  PG
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {mcCorrectCount} dari {MULTIPLE_CHOICE_QUESTIONS.length} Benar
              </div>
            </div>

            {/* Card 2: Uraian / Essay */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <div className="text-xs font-medium text-slate-500 mb-1">
                Uraian / Essay (40%)
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-teal-600 font-mono tabular-nums">
                  {submission.essayScore}
                </span>
                <span className="text-sm font-bold text-teal-600 font-mono">
                  ES
                </span>
              </div>
              <div className="text-xs text-teal-600 font-medium mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dinilai Otomatis</span>
              </div>
            </div>

            {/* Card 3: Catatan Integritas */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <div className="text-xs font-medium text-slate-500 mb-1">
                Catatan Integritas
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                    submission.violations.length === 0
                      ? 'text-emerald-600'
                      : submission.violations.length >= 3
                      ? 'text-rose-700'
                      : 'text-rose-600'
                  }`}
                >
                  {submission.violations.length}
                </span>
                <ShieldAlert
                  className={`w-5 h-5 ${
                    submission.violations.length === 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {submission.violations.length === 0
                  ? '0 Pelanggaran (Sangat Jujur)'
                  : `${submission.violations.length} Pelanggaran Tab/Layar`}
              </div>
            </div>
          </div>
        </div>

        {/* 2. VIOLATION LOG ACCORDION (Pinkish/Red Pill as in image) */}
        <div className="border border-rose-200 bg-rose-50/40 rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsViolationsOpen(!isViolationsOpen)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-rose-50/70 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Rincian Log Pelanggaran Anti-Kecurangan ({submission.violations.length} Kejadian)
              </span>
            </div>
            {isViolationsOpen ? (
              <ChevronUp className="w-4 h-4 text-rose-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-rose-500" />
            )}
          </button>

          {isViolationsOpen && (
            <div className="p-4 pt-1 border-t border-rose-100 bg-white/70 space-y-2 text-xs">
              {submission.violations.length === 0 ? (
                <div className="text-emerald-700 p-2 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tidak ada indikasi perpindahan tab atau pelanggaran integritas. Ujian diselesaikan secara tertib.</span>
                </div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {submission.violations.map((v, idx) => (
                    <div key={idx} className="py-2 flex items-start justify-between gap-3 text-rose-900">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{v.message}</span>
                      </div>
                      <span className="font-mono text-slate-500 shrink-0">{v.timestamp}</span>
                    </div>
                  ))}
                  {submission.isAutoSubmittedDueToViolations && (
                    <div className="pt-2 text-rose-700 font-bold text-xs">
                      ⚠️ Status: Ujian dihentikan dan dikumpulkan otomatis oleh sistem karena telah mencapai batas 3 kali perpindahan tab.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. MULTIPLE CHOICE EVALUATION (10 Questions - matching screenshot) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Rincian Evaluasi Pilihan Ganda (10 Soal)
              </h2>
              <p className="text-xs text-slate-500">
                Kunci jawaban dan pembahasan konsep lembar kerja
              </p>
            </div>
            <div className="text-xs sm:text-sm font-bold text-sky-700 font-mono">
              {mcCorrectCount}/{MULTIPLE_CHOICE_QUESTIONS.length} Benar
            </div>
          </div>

          <div className="space-y-6">
            {MULTIPLE_CHOICE_QUESTIONS.map((q) => {
              const studentChoice = submission.mcAnswers[q.id] || '';
              const isCorrect = studentChoice === q.correctAnswer;
              const studentOpt = q.options.find((o) => o.key === studentChoice);
              const correctOpt = q.options.find((o) => o.key === q.correctAnswer);

              return (
                <div key={q.id} className="pt-2 pb-6 border-b border-slate-100 last:border-b-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {q.id}
                      </div>
                      <div className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                        {q.question}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Benar (+10)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                          <XCircle className="w-4 h-4" />
                          <span>Salah (+0)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional Table for Q3 */}
                  {q.tableData && (
                    <div className="ml-9 overflow-x-auto my-2">
                      <table className="text-xs border border-slate-200 rounded-lg overflow-hidden w-full max-w-md">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <tr>
                            {q.tableData.headers.map((h, i) => (
                              <th key={i} className="px-3 py-1.5 text-left font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          {q.tableData.rows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              {r.map((c, j) => (
                                <td key={j} className="px-3 py-1.5">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Student Answer & Correct Key Boxes side by side */}
                  <div className="ml-9 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/20 text-emerald-900'
                          : 'border-rose-300 bg-rose-50/20 text-rose-900'
                      }`}
                    >
                      <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                        JAWABAN ANDA:
                      </div>
                      <div className="font-semibold text-xs">
                        {studentChoice ? `${studentChoice}. ${studentOpt?.text || ''}` : '(Tidak Dijawab)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-sky-300 bg-sky-50/20 text-sky-950 text-xs">
                      <div className="font-bold text-[11px] uppercase tracking-wider text-sky-700 mb-0.5">
                        KUNCI JAWABAN:
                      </div>
                      <div className="font-semibold text-xs">
                        {q.correctAnswer}. {correctOpt?.text}
                      </div>
                    </div>
                  </div>

                  {/* Explanation Box */}
                  <div className="ml-9 p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block mb-0.5 font-semibold">Pembahasan:</strong>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. ESSAY EVALUATION (5 Questions - Automatic grading & feedback) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Rincian Evaluasi Uraian / Essay (5 Soal)
              </h2>
              <p className="text-xs text-slate-500">
                Penilaian otomatis berbasis rubrik kata kunci & konsep komputasional
              </p>
            </div>
            <div className="text-xs sm:text-sm font-bold text-teal-700 font-mono">
              Total Skor: {submission.essayScore}/100
            </div>
          </div>

          <div className="space-y-6">
            {ESSAY_QUESTIONS.map((eq) => {
              const evalItem = submission.essayEvaluations.find((e) => e.questionId === eq.id);
              const score = evalItem ? evalItem.score : 0;

              return (
                <div key={eq.id} className="pt-2 pb-6 border-b border-slate-100 last:border-b-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md border border-teal-300 bg-teal-50 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {eq.id}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                          {eq.question}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 rounded-lg border border-teal-200 font-mono">
                        {score} / {eq.maxScore} Poin
                      </span>
                    </div>
                  </div>

                  {/* Student Answer */}
                  <div className="ml-9 space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                        JAWABAN ANDA:
                      </div>
                      <div className="font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                        {evalItem?.studentAnswer || '(Tidak dijawab)'}
                      </div>
                    </div>

                    {/* Auto Evaluation Feedback */}
                    <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/30 text-teal-950">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-800 uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Evaluasi Otomatis & Umpan Balik:</span>
                      </div>
                      <p className="leading-relaxed mb-2">
                        {evalItem?.feedback || 'Jawaban telah diverifikasi oleh sistem.'}
                      </p>
                      {evalItem && evalItem.matchedKeywords && evalItem.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span className="text-slate-500">Kata Kunci Ditemukan:</span>
                          {evalItem.matchedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-700 font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ideal Key Concept */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600">
                      <strong className="block text-slate-800 font-semibold mb-1">
                        Konsep Kunci & Jawaban Ideal:
                      </strong>
                      <div className="whitespace-pre-line leading-relaxed text-slate-700">
                        {eq.idealAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Verification for PDF & Print */}
        <div className="text-center pt-4 pb-8 text-xs text-slate-400">
          <p>© 2026 SMP Ar Rohmah IIBS · Sistem CBT & Anti-Cheating Assessment</p>
          <p className="mt-1">
            Waktu Pengesahan: {submission.submittedAt} · ID Dokumen: {submission.id}
          </p>
        </div>
      </div>
    </div>
  );
};
