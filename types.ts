export enum Language {
  Java = "Java",
  Python = "Python",
}

export enum LevelName {
  BabyCoder = "Baby Coder",
  ScriptKiddie = "Script Kiddie",
  BugHunter = "Bug Hunter",
  Developer = "Developer",
  Guru = "Guru",
  Pioneer = "Pioneer",
}

export interface Level {
  name: LevelName;
  xpThreshold: number;
  badgeColor: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in minutes
  topic: string;
  language: Language;
  xpGained: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  learningLanguage: Language;
  sessions: Session[];
  friends: string[]; // array of user IDs
  level: LevelName;
}

export interface Challenge {
  id:string;
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface FollowRequest {
  fromUserId: string;
  toUserId: string;
}

export interface Motivation {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationSettings {
  friendActivity: boolean;
  motivations: boolean;
  dailyChallenges: boolean;
  sessionReminders: boolean;
}

export interface PracticeSheetLevel {
  questions: string[];
  motivation: string;
}

export interface PracticeSheet {
  easy: PracticeSheetLevel;
  medium: PracticeSheetLevel;
  hard: PracticeSheetLevel;
}

export interface CodeExecutionResult {
  output?: string;
  error?: string;
}

export interface ChatMessage {
  sender: 'user' | 'commi';
  message: string;
}