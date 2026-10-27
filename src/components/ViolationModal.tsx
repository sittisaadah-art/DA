import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowRight } from 'lucide-react';
import { ViolationEvent } from '../types/exam';

interface ViolationModalProps {
  isOpen: boolean;
  violationCount: number;
  maxViolations: number;
  lastViolation: ViolationEvent | null;
  onAcknowledge: () => void;
  isFatal: boolean;
}

export const ViolationModal: React.FC<ViolationModalProps> = ({
  isOpen,
  violationCount,
  maxViolations,
  lastViolation,
  onAcknowledge,
  isFatal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-rose-500 overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center animate-bounce">
          <AlertOctagon className="w-9 h-9" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isFatal ? 'Pelanggaran Maksimal Tercapai' : `Peringatan Integritas (${violationCount}/${maxViolations})`}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isFatal
              ? 'Ujian Dihentikan Secara Otomatis!'
              : 'Terdeteksi Berpindah Tab / Layar!'}
          </h2>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {isFatal ? (
              <span className="text-rose-700 font-medium">
                Anda telah meninggalkan tab ujian sebanyak <strong>{violationCount} kali</strong>. Sesuai regulasi anti-cheating SMP Ar Rohmah IIBS, ujian Anda dihentikan seketika dan seluruh jawaban langsung dikumpulkan ke sistem guru.
              </span>
            ) : (
              <span>
                Sistem mendeteksi bahwa Anda telah berpindah tab, meminimalkan browser, atau keluar dari jendela ujian pada pukul{' '}
                <strong className="text-slate-900 font-mono">{lastViolation?.timestamp || 'saat ini'}</strong>.
              </span>
            )}
          </p>
        </div>

        {!isFatal && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 text-left flex items-start gap-2.5">
            <div className="font-bold text-amber-800 text-sm">⚠️</div>
            <div>
              <strong>Peringatan Serius:</strong> Sisa toleransi berpindah tab:{' '}
              <span className="font-black text-rose-600 underline">
                {maxViolations - violationCount} kali lagi
              </span>. Jika mencapai {maxViolations} kali, ujian akan terkunci dan auto-submit.
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onAcknowledge}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isFatal
                ? 'bg-rose-700 hover:bg-rose-800 shadow-rose-200'
                : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200'
            }`}
          >
            <span>{isFatal ? 'Lihat Lembar Hasil Ujian' : 'Saya Mengerti & Kembali ke Layar Penuh'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
