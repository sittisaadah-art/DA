import React from 'react';
import { ShieldCheck, Lock, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenTeacherModal: () => void;
  isExamInProgress: boolean;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTeacherModal,
  isExamInProgress,
  onGoHome,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            AR
          </div>
          <div>
            <button
              onClick={onGoHome}
              disabled={isExamInProgress}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors text-left flex items-center gap-2"
            >
              <span>SMP Ar Rohmah IIBS</span>
            </button>
            <div className="text-xs text-slate-500 font-medium">
              Daily Asesmen · Informatika Kelas VIII
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation & Status Indicators */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-700">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Bab 2: Berpikir Komputasional</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Anti-Cheat Real-Time</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">KKM: 78 · Waktu: 60 Menit</span>
        </nav>

        {/* Zone 3: Primary Action - Teacher Portal */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTeacherModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
            title="Masuk ke Dashboard Rekapitulasi Guru"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Dashboard Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
