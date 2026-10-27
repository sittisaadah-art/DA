import React, { useState } from 'react';
import { StudentInfo, ClassCategory } from '../types/exam';
import { EXAM_METADATA } from '../data/examData';
import { ShieldAlert, Clock, FileText, CheckCircle2, Maximize2, AlertTriangle } from 'lucide-react';

interface StudentRegisterProps {
  onStartExam: (student: StudentInfo) => void;
}

export const StudentRegister: React.FC<StudentRegisterProps> = ({ onStartExam }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState<ClassCategory>('VIII Cambridge');
  const [classDetail, setClassDetail] = useState('');
  const [nis, setNis] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Mohon masukkan nama lengkap siswa.');
      return;
    }
    if (!nis.trim()) {
      setError('Mohon masukkan nomor absen atau NIS siswa.');
      return;
    }
    if (!agreement) {
      setError('Anda harus menyetujui pakta integritas dan tata tertib ujian anti-kecurangan.');
      return;
    }

    setError('');
    onStartExam({
      name: name.trim(),
      className,
      classDetail: classDetail.trim() || undefined,
      nis: nis.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
              <span>{EXAM_METADATA.schoolName}</span>
              <span>·</span>
              <span>{EXAM_METADATA.grade}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Daily Asesmen: {EXAM_METADATA.chapter}
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Mata Pelajaran: {EXAM_METADATA.subject} · Alokasi Waktu: {EXAM_METADATA.durationMinutes} Menit · Kriteria Ketuntasan Minimal (KKM): {EXAM_METADATA.kkm}
            </p>
          </div>
          {/* Subtle watermark badge */}
          <div className="absolute right-4 -bottom-6 opacity-10 text-9xl font-black select-none pointer-events-none">
            IIBS
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Form Registration */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Identitas Peserta Ujian
              </h2>
              <p className="text-xs text-slate-500">
                Isi data diri dengan teliti sebelum memulai pengerjaan lembar kerja.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Alena Khanza Anandita"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value as ClassCategory)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white font-medium"
                  >
                    <option value="VIII Akademik">VIII Akademik</option>
                    <option value="VIII Cambridge">VIII Cambridge</option>
                    <option value="VIII Tahfidz Timteng">VIII Tahfidz Timteng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. Absen / NIS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2 atau 202408101"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detail Rombel / Ruang <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 8.1 / Ruang Lab Komputer 2"
                  value={classDetail}
                  onChange={(e) => setClassDetail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* Anti-Cheating Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Pakta Integritas & Kunci Layar
                    </span>
                    Saya berjanji mengerjakan asesmen ini secara jujur tanpa membuka buku/internet, dan menyetujui pengaktifan kunci layar penuh (fullscreen) serta sistem pengawasan tab browser.
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Mulai Asesmen & Kunci Layar</span>
            </button>
          </form>

          {/* Right Column: Rules & Anti-Cheating Notice */}
          <div className="lg:col-span-5 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <ShieldAlert className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Sistem Pengawasan & Anti-Cheat
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-800 block">Deteksi Perpindahan Tab Real-Time</strong>
                  Sistem mencatat waktu dan frekuensi jika Anda beralih tab, meminimalkan browser, atau membuka aplikasi lain.
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-rose-700 block">Batas Maksimal 3 Kali Pindah Tab</strong>
                  Jika terdeteksi 3 kali meninggalkan tab ujian, ujian akan <strong>SEGERA BERAKHIR OTOMATIS</strong> dan lembar kerja langsung dikumpulkan.
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-800 block">Kunci Layar Penuh (Fullscreen)</strong>
                  Ujian wajib dikerjakan dalam mode layar penuh. Dilarang menekan tombol keluar fullscreen, split-screen, atau shortcut copy-paste.
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-800 block">Komposisi Soal & Penilaian Otomatis</strong>
                  • 10 Soal Pilihan Ganda (Bobot 60%)<br />
                  • 5 Soal Uraian / Essay (Bobot 40%)<br />
                  • Hasil rekapitulasi nilai dan PDF terbit otomatis setelah selesai.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">📌 Catatan Teknis:</span>
              Pastikan koneksi internet stabil dan tutup seluruh tab lain sebelum menekan tombol Mulai.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
