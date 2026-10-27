export type ClassCategory = 'VIII Akademik' | 'VIII Cambridge' | 'VIII Tahfidz Timteng';

export interface StudentInfo {
  name: string;
  className: ClassCategory;
  classDetail?: string; // e.g. "7.3" or "8.1"
  nis: string;
}

export interface MultipleChoiceQuestion {
  id: number;
  question: string;
  tableData?: { headers: string[]; rows: string[][] };
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface EssayQuestion {
  id: number;
  question: string;
  tableTemplate?: { headers: string[]; rows: (string | null)[][] };
  keyConcept: string;
  idealAnswer: string;
  keywords: string[];
  maxScore: number;
}

export interface ViolationEvent {
  timestamp: string;
  type: 'tab_switch' | 'window_blur' | 'fullscreen_exit';
  message: string;
}

export interface EssayEvaluation {
  questionId: number;
  studentAnswer: string;
  score: number; // 0 - 20
  maxScore: number;
  feedback: string;
  matchedKeywords: string[];
}

export interface StudentSubmission {
  id: string;
  student: StudentInfo;
  submittedAt: string;
  durationSeconds: number; // elapsed time
  mcAnswers: Record<number, 'A' | 'B' | 'C' | 'D' | ''>;
  essayAnswers: Record<number, string>;
  mcScore: number; // 0 - 100
  essayScore: number; // 0 - 100
  finalScore: number; // rounded (mcScore * 0.6 + essayScore * 0.4)
  isPassed: boolean; // >= 78 KKM
  violations: ViolationEvent[];
  isAutoSubmittedDueToViolations: boolean;
  essayEvaluations: EssayEvaluation[];
}
