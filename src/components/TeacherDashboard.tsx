import React, { useState } from 'react';
import { StudentSubmission, ClassCategory } from '../types/exam';
import { EXAM_METADATA, ESSAY_QUESTIONS } from '../data/examData';
import {
  Users,
  Award,
  ShieldAlert,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  onSelectSubmissionToView: (sub: StudentSubmission) => void;
  onUpdateSubmission: (updated: StudentSubmission) => void;
  onDeleteSubmission: (subId: string) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  submissions,
  onSelectSubmissionToView,
  onUpdateSubmission,
  onDeleteSubmission,
  onResetData,
  onLogout,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing essay modal state
  const [editingSub, setEditingSub] = useState<StudentSubmission | null>(null);
  const [editedScores, setEditedScores] = useState<Record<number, number>>({});
  const [editedFeedbacks, setEditedFeedbacks] = useState<Record<number, string>>({});

  // Filtered list
  const filteredSubmissions = submissions.filter((s) => {
    const matchClass =
      selectedClass === 'all' || s.student.className === selectedClass;
    const matchQuery =
      s.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.nis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchQuery;
  });

  // Analytics
  const totalStudents = submissions.length;
  const avgFinalScore =
    totalStudents > 0
      ? (
          submissions.reduce((acc, curr) => acc + curr.finalScore, 0) /
          totalStudents
        ).toFixed(1)
      : '0';

  const passedCount = submissions.filter((s) => s.isPassed).length;
  const passingRate =
    totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

  const totalViolations = submissions.reduce(
    (acc, curr) => acc + curr.violations.length,
    0
  );

  // Export to CSV
  const handleExportCsv = () => {
    if (submissions.length === 0) return;

    const headers = [
      'No',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Waktu Selesai',
      'Durasi (Detik)',
      'Skor PG (60%)',
      'Skor Essay (40%)',
      'Nilai Akhir',
      'Status Kelulusan (KKM 78)',
      'Jumlah Pelanggaran Tab',
    ];

    const rows = submissions.map((s, idx) => [
      idx + 1,
      `"${s.student.nis}"`,
      `"${s.student.name}"`,
      `"${s.student.className} ${s.student.classDetail || ''}"`,
      `"${s.submittedAt}"`,
      s.durationSeconds,
      s.mcScore,
      s.essayScore,
      s.finalScore,
      s.isPassed ? 'TUNTAS / LULUS' : 'REMIDIAL',
      s.violations.length,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Nilai_Informatika_SMP_Ar_Rohmah_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditModal = (sub: StudentSubmission) => {
    setEditingSub(sub);
    const scoreMap: Record<number, number> = {};
    const fbMap: Record<number, string> = {};
    sub.essayEvaluations.forEach((e) => {
      scoreMap[e.questionId] = e.score;
      fbMap[e.questionId] = e.feedback;
    });
    setEditedScores(scoreMap);
    setEditedFeedbacks(fbMap);
  };

  const handleSaveEditEssay = () => {
    if (!editingSub) return;

    const updatedEvaluations = editingSub.essayEvaluations.map((item) => ({
      ...item,
      score: editedScores[item.questionId] ?? item.score,
      feedback: editedFeedbacks[item.questionId] ?? item.feedback,
    }));

    const newEssayTotal = updatedEvaluations.reduce((sum, e) => sum + e.score, 0);
    const newFinalScore = Math.round(
      editingSub.mcScore * EXAM_METADATA.mcWeight +
        newEssayTotal * EXAM_METADATA.essayWeight
    );

    const updatedSubmission: StudentSubmission = {
      ...editingSub,
      essayEvaluations: updatedEvaluations,
      essayScore: newEssayTotal,
      finalScore: newFinalScore,
      isPassed: newFinalScore >= EXAM_METADATA.kkm,
    };

    onUpdateSubmission(updatedSubmission);
    setEditingSub(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>{EXAM_METADATA.schoolName}</span>
            <span>·</span>
            <span>Portal Pendidik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Rekapitulasi Asesmen Harian
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mata Pelajaran: {EXAM_METADATA.subject} · {EXAM_METADATA.chapter} ({EXAM_METADATA.grade})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV Rekap</span>
          </button>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Reset ke data awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Siswa Ikut</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-400 mt-1">Siswa telah submit ujian</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Rata-rata Nilai</span>
            <Award className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-sky-700 font-mono tabular-nums">
            {avgFinalScore}
          </div>
          <div className="text-xs text-slate-400 mt-1">KKM Batas Lulus: {EXAM_METADATA.kkm}</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Tingkat Kelulusan</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-600 font-mono tabular-nums">
            {passingRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {passedCount} dari {totalStudents} Siswa Tuntas
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Pelanggaran Integritas</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono tabular-nums">
            {totalViolations}
          </div>
          <div className="text-xs text-slate-400 mt-1">Insiden pindah tab terdeteksi</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kelas
            </button>
            <button
              onClick={() => setSelectedClass('VIII Akademik')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === 'VIII Akademik'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VIII Akademik
            </button>
            <button
              onClick={() => setSelectedClass('VIII Cambridge')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === 'VIII Cambridge'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VIII Cambridge
            </button>
            <button
              onClick={() => setSelectedClass('VIII Tahfidz Timteng')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === 'VIII Tahfidz Timteng'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VIII Tahfidz Timteng
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-5 py-3.5">NIS</th>
                <th className="px-5 py-3.5">Nama Siswa</th>
                <th className="px-5 py-3.5">Kelas</th>
                <th className="px-5 py-3.5">Waktu Selesai</th>
                <th className="px-4 py-3.5 text-center">PG (60%)</th>
                <th className="px-4 py-3.5 text-center">Essay (40%)</th>
                <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Pelanggaran</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-400">
                    Belum ada data hasil asesmen yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {sub.student.nis}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{sub.student.name}</div>
                      {sub.isAutoSubmittedDueToViolations && (
                        <span className="text-[10px] text-rose-600 font-semibold block">
                          ⚠️ Terkunci Otomatis (Anti-Cheat)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800">
                        {sub.student.className}
                      </span>
                      {sub.student.classDetail && (
                        <span className="text-slate-400 block text-[11px]">
                          ({sub.student.classDetail})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {sub.submittedAt.slice(11, 16) || sub.submittedAt}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-semibold text-sky-700">
                      {sub.mcScore}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-semibold text-teal-700">
                      {sub.essayScore}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono text-sm font-black text-emerald-700">
                        {sub.finalScore}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {sub.isPassed ? 'TUNTAS' : 'REMIDIAL'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md ${
                          sub.violations.length === 0
                            ? 'text-emerald-700 bg-emerald-50'
                            : sub.violations.length >= 3
                            ? 'text-rose-700 bg-rose-100'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{sub.violations.length}x</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectSubmissionToView(sub)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Lihat Lembar Jawaban & PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Koreksi / Sesuaikan Nilai Essay"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data asesmen ${sub.student.name}?`)) {
                              onDeleteSubmission(sub.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Nilai"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Teacher to Override / Review Essay Scores */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Koreksi & Verifikasi Nilai Essay Guru
                </h3>
                <p className="text-xs text-slate-500">
                  {editingSub.student.name} · {editingSub.student.className} (NIS: {editingSub.student.nis})
                </p>
              </div>
              <button
                onClick={() => setEditingSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Questions list */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {ESSAY_QUESTIONS.map((eq) => {
                const evalItem = editingSub.essayEvaluations.find(
                  (e) => e.questionId === eq.id
                );
                const currentScore = editedScores[eq.id] ?? (evalItem?.score || 0);

                return (
                  <div key={eq.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-slate-800">
                        Soal #{eq.id}: {eq.keyConcept}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Nilai:</span>
                        <input
                          type="number"
                          min={0}
                          max={eq.maxScore}
                          value={currentScore}
                          onChange={(e) => {
                            const val = Math.max(
                              0,
                              Math.min(eq.maxScore, parseInt(e.target.value) || 0)
                            );
                            setEditedScores((prev) => ({
                              ...prev,
                              [eq.id]: val,
                            }));
                          }}
                          className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 bg-white"
                        />
                        <span className="text-slate-400 font-mono">/ {eq.maxScore}</span>
                      </div>
                    </div>

                    {/* Student Answer */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">
                        JAWABAN SISWA:
                      </span>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                        {evalItem?.studentAnswer || '(Tidak dijawab)'}
                      </p>
                    </div>

                    {/* Teacher Feedback override */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Catatan & Umpan Balik Guru:
                      </label>
                      <input
                        type="text"
                        value={editedFeedbacks[eq.id] || ''}
                        onChange={(e) =>
                          setEditedFeedbacks((prev) => ({
                            ...prev,
                            [eq.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        placeholder="Tambahkan catatan untuk siswa..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Nilai akhir siswa akan dihitung ulang secara otomatis (60% PG + 40% Essay).
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEditEssay}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
