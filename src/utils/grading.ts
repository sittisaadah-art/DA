import { ESSAY_QUESTIONS, MULTIPLE_CHOICE_QUESTIONS } from '../data/examData';
import { EssayEvaluation } from '../types/exam';

export function calculateMcScore(answers: Record<number, 'A' | 'B' | 'C' | 'D' | ''>): {
  score: number;
  correctCount: number;
  totalQuestions: number;
} {
  let correctCount = 0;
  MULTIPLE_CHOICE_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = MULTIPLE_CHOICE_QUESTIONS.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  return { score, correctCount, totalQuestions };
}

export function evaluateEssayAnswers(answers: Record<number, string>): {
  totalScore: number;
  evaluations: EssayEvaluation[];
} {
  const evaluations: EssayEvaluation[] = [];
  let sumScore = 0;

  ESSAY_QUESTIONS.forEach((q) => {
    const rawAnswer = (answers[q.id] || '').trim();
    const cleanAnswer = rawAnswer.toLowerCase();

    if (!cleanAnswer || cleanAnswer.length < 3) {
      evaluations.push({
        questionId: q.id,
        studentAnswer: rawAnswer || '(Tidak dijawab)',
        score: 0,
        maxScore: q.maxScore,
        feedback: 'Soal tidak dijawab atau jawaban terlalu singkat untuk dievaluasi.',
        matchedKeywords: [],
      });
      return;
    }

    let score = 0;
    const matchedKeywords: string[] = [];
    let feedback = '';

    if (q.id === 1) {
      // Q1: Konversi tabel
      // 15 -> 1111, F
      // 35 -> 100011
      // 4D -> 77, 1001101
      // 11010 -> 26, 1a
      let partsCorrect = 0;
      if (cleanAnswer.includes('1111')) { partsCorrect++; matchedKeywords.push('1111 (Biner 15)'); }
      if (cleanAnswer.includes('f') || cleanAnswer.includes('0xf')) { partsCorrect++; matchedKeywords.push('F (Heksa 15)'); }
      if (cleanAnswer.includes('100011')) { partsCorrect++; matchedKeywords.push('100011 (Biner 35)'); }
      if (cleanAnswer.includes('77')) { partsCorrect++; matchedKeywords.push('77 (Desimal 4D)'); }
      if (cleanAnswer.includes('1001101')) { partsCorrect++; matchedKeywords.push('1001101 (Biner 4D)'); }
      if (cleanAnswer.includes('26')) { partsCorrect++; matchedKeywords.push('26 (Desimal 11010)'); }
      if (cleanAnswer.includes('1a')) { partsCorrect++; matchedKeywords.push('1A (Heksa 11010)'); }

      if (partsCorrect >= 6) {
        score = 20;
        feedback = 'Sempurna! Semua konversi bilangan desimal, biner, dan heksadesimal terjawab dengan tepat.';
      } else if (partsCorrect >= 4) {
        score = 16;
        feedback = 'Sangat baik. Sebagian besar nilai konversi telah terisi dengan benar.';
      } else if (partsCorrect >= 2) {
        score = 10;
        feedback = 'Cukup. Beberapa konversi sudah tepat, periksa kembali perhitungan konversi heksadesimal dan biner.';
      } else {
        score = 5;
        feedback = 'Perlu ditingkatkan. Pastikan memahami konversi antar basis 10, 2, dan 16.';
      }
    } else if (q.id === 2) {
      // Q2: Langkah konversi 100 ke biner dengan modulo
      const hasFinalAnswer = cleanAnswer.includes('1100100');
      const mentionsModulo = cleanAnswer.includes('modulo') || cleanAnswer.includes('sisa') || cleanAnswer.includes('mod');
      const mentionsDiv2 = cleanAnswer.includes('bagi 2') || cleanAnswer.includes('/ 2') || cleanAnswer.includes(': 2') || cleanAnswer.includes('dibagi 2');
      const mentionsReverse = cleanAnswer.includes('bawah ke atas') || cleanAnswer.includes('terbalik') || cleanAnswer.includes('urutan akhir') || cleanAnswer.includes('bawah');

      if (hasFinalAnswer) matchedKeywords.push('1100100');
      if (mentionsModulo) matchedKeywords.push('Sisa bagi (Modulo)');
      if (mentionsDiv2) matchedKeywords.push('Pembagian berulang dengan 2');
      if (mentionsReverse) matchedKeywords.push('Membaca sisa dari bawah ke atas');

      let pts = 4; // base effort
      if (hasFinalAnswer) pts += 7;
      if (mentionsModulo) pts += 3;
      if (mentionsDiv2) pts += 3;
      if (mentionsReverse) pts += 3;
      score = Math.min(20, pts);

      if (score >= 18) {
        feedback = 'Luar biasa! Langkah pembagian modulo 2 dan pembacaan sisa secara terbalik dijabarkan dengan benar.';
      } else if (score >= 12) {
        feedback = 'Bagus. Konsep dasar pembagian berulang sudah dipahami, namun tuliskan runtutan perhitungan secara lengkap.';
      } else {
        feedback = 'Jawaban masih kurang lengkap mengenai proses pembagian modulo berulang 100 dengan 2.';
      }
    } else if (q.id === 3) {
      // Q3: Alasan komputer memakai biner bukan desimal
      const hasPhysical = cleanAnswer.includes('transistor') || cleanAnswer.includes('sirkuit') || cleanAnswer.includes('komponen') || cleanAnswer.includes('saklar');
      const hasStates = cleanAnswer.includes('on') || cleanAnswer.includes('off') || cleanAnswer.includes('hidup') || cleanAnswer.includes('mati') || cleanAnswer.includes('tegangan') || cleanAnswer.includes('arus');
      const hasBinaryDigits = cleanAnswer.includes('0 dan 1') || cleanAnswer.includes('0') || cleanAnswer.includes('1') || cleanAnswer.includes('dua keadaan');
      const hasReliability = cleanAnswer.includes('stabil') || cleanAnswer.includes('mudah') || cleanAnswer.includes('noise') || cleanAnswer.includes('error') || cleanAnswer.includes('andal') || cleanAnswer.includes('sederhana');

      if (hasPhysical) matchedKeywords.push('Komponen transistor / sirkuit digital');
      if (hasStates) matchedKeywords.push('Keadaan ON / OFF (Tegangan)');
      if (hasBinaryDigits) matchedKeywords.push('Representasi 0 dan 1');
      if (hasReliability) matchedKeywords.push('Keandalan & pencegahan noise');

      let pts = 4;
      if (hasStates) pts += 5;
      if (hasBinaryDigits) pts += 4;
      if (hasPhysical) pts += 4;
      if (hasReliability) pts += 3;
      score = Math.min(20, pts);

      if (score >= 18) {
        feedback = 'Penjelasan sangat komprehensif mengenai kondisi fisik komponen elektronika ON/OFF dan stabilitas tegangan digital.';
      } else if (score >= 12) {
        feedback = 'Jawaban sudah menyentuh kondisi ON/OFF arus listrik, pertajam dengan konsep keterbatasan komponen sirkuit komputer.';
      } else {
        feedback = 'Kemukakan alasan utama yaitu sirkuit transistor hanya memiliki dua kondisi stabil (ON/OFF).';
      }
    } else if (q.id === 4) {
      // Q4: Alasan POP hanya di elemen paling atas
      const hasLifo = cleanAnswer.includes('lifo') || cleanAnswer.includes('last in first out') || cleanAnswer.includes('terakhir masuk');
      const hasTop = cleanAnswer.includes('top') || cleanAnswer.includes('atas') || cleanAnswer.includes('paling atas');
      const hasStackAnalogy = cleanAnswer.includes('tumpukan') || cleanAnswer.includes('piring') || cleanAnswer.includes('buku') || cleanAnswer.includes('satu ujung') || cleanAnswer.includes('pintu');

      if (hasLifo) matchedKeywords.push('Prinsip LIFO (Last In First Out)');
      if (hasTop) matchedKeywords.push('Akses elemen Top / Paling Atas');
      if (hasStackAnalogy) matchedKeywords.push('Konsep tumpukan satu pintu akses');

      let pts = 5;
      if (hasLifo) pts += 7;
      if (hasTop) pts += 4;
      if (hasStackAnalogy) pts += 4;
      score = Math.min(20, pts);

      if (score >= 18) {
        feedback = 'Pemahaman struktur data Stack sangat matang. Menjelaskan prinsip LIFO dan akses satu pintu teratas secara jelas.';
      } else if (score >= 12) {
        feedback = 'Sudah memahami bahwa tumpukan hanya bisa diambil dari atas. Pastikan menyertakan istilah LIFO.';
      } else {
        feedback = 'Perlu menyertakan prinsip kerja tumpukan (LIFO: Last In First Out).';
      }
    } else if (q.id === 5) {
      // Q5: Elemen stack tersisa: 14, 6, 10
      const has14 = cleanAnswer.includes('14');
      const has6 = cleanAnswer.includes('6');
      const has10 = cleanAnswer.includes('10');
      const mentionsPop3 = cleanAnswer.includes('3') && (cleanAnswer.includes('pop') || cleanAnswer.includes('keluar') || cleanAnswer.includes('hapus'));
      const mentionsPop8 = cleanAnswer.includes('8') && (cleanAnswer.includes('pop') || cleanAnswer.includes('keluar') || cleanAnswer.includes('hapus'));
      const allThreePresent = has14 && has6 && has10;

      if (has14) matchedKeywords.push('Elemen 14');
      if (has6) matchedKeywords.push('Elemen 6');
      if (has10) matchedKeywords.push('Elemen 10 (Top)');
      if (mentionsPop3) matchedKeywords.push('Pop(3)');
      if (mentionsPop8) matchedKeywords.push('Pop(8)');

      let pts = 4;
      if (allThreePresent) pts += 10;
      else if (has14 || has6 || has10) pts += 4;

      if (mentionsPop3 || mentionsPop8) pts += 4;
      if (cleanAnswer.includes('push') || cleanAnswer.includes('langkah') || cleanAnswer.includes('urutan')) pts += 2;
      score = Math.min(20, pts);

      if (score >= 18) {
        feedback = 'Sangat tepat! Elemen yang tersisa berhasil diidentifikasi yaitu 14, 6, dan 10 lengkap dengan penelusuran pop.';
      } else if (score >= 12) {
        feedback = 'Hasil elemen akhir tepat, namun sertakan penjelasan proses push dan pop secara bertahap.';
      } else {
        feedback = 'Periksa kembali urutan penambahan (push) dan pengeluaran (pop) elemen pada stack.';
      }
    }

    evaluations.push({
      questionId: q.id,
      studentAnswer: rawAnswer,
      score,
      maxScore: q.maxScore,
      feedback,
      matchedKeywords,
    });
    sumScore += score;
  });

  return { totalScore: sumScore, evaluations };
}
