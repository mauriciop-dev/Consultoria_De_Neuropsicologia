
export interface Patient {
  id: string;
  documentId: string;
  name: string;
  age: number;
  date: string;
  eps: string;
  schooling: string;
  motherName: string;
  motherOccupation: string;
  fatherName: string;
  fatherOccupation: string;
  siblings: string;
  laterality: 'Left' | 'Right' | 'Ambidextrous';
  address: string;
  livesWith: string;
  previousTests: string;
  
  // Clinical History
  consultationReason: string;
  forgottenMemories: string;
  personalHistory: string;
  familyHistorySimilar: string;
  occupationalTherapy: boolean;
  otSessions?: number;
  pharmacologicalTreatment: string;
  complementaryExams: string;
  familyHistory: string;
  bondingRelations: string;
  prenatalHistory: string;
  plannedPregnancy: boolean;
  pregnancyRisks: string;
  pregnancyFactorRisks: string; // SPA consumption etc
  pregnancyNumber: number;
  birthPosition: string;
  apgarScore: string;
  jaundice: boolean;
  frequentFlu: boolean;
  perinatalPeriod: string;
  weight: string;
  motherAgeAtBirth: number;
  psychomotorDevelopment: string;
  occupationalSkills: string;
  breastfeedingPeriod: string;
  sleepPatterns: string;
  headControlAge: string;
  crawlingAge: string;
  sittingAge: string;
  walkingAge: string;
  eyeContact: string;
  attachment: string;
  restless: boolean;
  attentionMemory: string;
  languageDevelopment: string;
  firstWords: string;
  negativeReinforcements: string;
  sleepsAlone: boolean;
  swallowing: string;
  bottle: boolean;
  breast: boolean;
  parentingPatterns: string;
  punishment: string;
  reward: string;
  followsInstructions: boolean;
  grossMotorWalk: boolean;
  grossMotorRun: boolean;
  grossMotorSkip: boolean;
  
  observations: string[];
  diagnosisInitial: string;
  selectedBatteries: string[];
  testResults: Record<string, BatteryResult>;
  finalDiagnosis: string;
  suggestedTreatment: string;
  files: PatientFile[];
}

export interface BatteryResult {
  scores: Record<string, number>; // questionId -> score (0-5)
  responses: Record<string, string>; // questionId -> text response
  aiSummary?: string;
}

export interface PatientFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: string;
}

export interface TestBattery {
  id: string;
  name: string;
  description: string;
  tasks: TestTask[];
}

export interface TestTask {
  id: string;
  title: string;
  description: string;
  type: 'drawing' | 'text' | 'choice' | 'count';
  options?: string[];
}
