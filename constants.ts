import { Level, User, LevelName, Language, Challenge, Session, FollowRequest } from './types';

export const LEVELS: Level[] = [
  { name: LevelName.BabyCoder, xpThreshold: 0, badgeColor: 'bg-gray-400' },
  { name: LevelName.ScriptKiddie, xpThreshold: 100, badgeColor: 'bg-green-400' },
  { name: LevelName.BugHunter, xpThreshold: 300, badgeColor: 'bg-blue-400' },
  { name: LevelName.Developer, xpThreshold: 700, badgeColor: 'bg-indigo-400' },
  { name: LevelName.Guru, xpThreshold: 1500, badgeColor: 'bg-purple-500' },
  { name: LevelName.Pioneer, xpThreshold: 3000, badgeColor: 'bg-pink-500' },
];

export const MOTIVATIONAL_QUOTES: string[] = [
  "Consistency is self-care in action.",
  "You're doing better than you think.",
  "Tiny steps lead to giant leaps.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "Your only limit is your mind.",
  "Strive for progress, not perfection."
];

export const PRACTICE_SHEET_QUOTES: string[] = [
    "Every bug you fix teaches you something new.",
    "Tiny progress is still progress.",
    "Code with consistency, not comparison.",
];

export const FOCUS_REMINDERS: string[] = [
  "You're doing great. Keep the focus!",
  "Just a little longer. You've got this.",
  "Deep breath. Stay in the zone.",
  "Every minute you study is an investment in yourself.",
  "Distractions can wait. Your future can't.",
  "Remember why you started. Keep pushing.",
];

export const PIXI_WELCOME_MESSAGE = "Hey there, I'm Pixi! Your friendly AI coding assistant. Tiny helper. Big progress. I'm here to help you understand your code, explain errors, and guide you through your learning journey. What can I help you with?";

const MOCK_SESSIONS: Session[] = [
    { id: 's1', date: new Date(Date.now() - 86400000).toISOString(), duration: 60, topic: 'Java Collections', language: Language.Java, xpGained: 50 },
    { id: 's2', date: new Date(Date.now() - 2 * 86400000).toISOString(), duration: 45, topic: 'Python Dictionaries', language: Language.Python, xpGained: 40 },
    { id: 's3', date: new Date(Date.now() - 3 * 86400000).toISOString(), duration: 75, topic: 'Java Streams', language: Language.Java, xpGained: 65 },
];

export const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: 'Alice',
    email: 'alice@example.com',
    avatarUrl: 'https://picsum.photos/seed/alice/100',
    xp: 850,
    streak: 12,
    learningLanguage: Language.Java,
    sessions: MOCK_SESSIONS,
    friends: ['user2', 'user3'],
    level: LevelName.Developer,
  },
  {
    id: 'user2',
    name: 'Bob',
    email: 'bob@example.com',
    avatarUrl: 'https://picsum.photos/seed/bob/100',
    xp: 1600,
    streak: 25,
    learningLanguage: Language.Python,
    sessions: MOCK_SESSIONS.slice(1),
    friends: ['user1'],
    level: LevelName.Guru,
  },
  {
    id: 'user3',
    name: 'Charlie',
    email: 'charlie@example.com',
    avatarUrl: 'https://picsum.photos/seed/charlie/100',
    xp: 450,
    streak: 5,
    learningLanguage: Language.Java,
    sessions: [MOCK_SESSIONS[0]],
    friends: ['user1'],
    level: LevelName.BugHunter,
  },
  {
    id: 'user4',
    name: 'Diana',
    email: 'diana@example.com',
    avatarUrl: 'https://picsum.photos/seed/diana/100',
    xp: 200,
    streak: 2,
    learningLanguage: Language.Python,
    sessions: [],
    friends: [],
    level: LevelName.ScriptKiddie,
  }
];

export const MOCK_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Code for 30 minutes', description: 'Complete a focused study session of at least 30 minutes.', xp: 25, isCompleted: true },
  { id: 'c2', title: 'Complete a quiz', description: 'Finish a post-session quiz on a new topic.', xp: 15, isCompleted: false },
  { id: 'c3', title: 'Start a 3-day streak', description: 'Log in and complete a session for three consecutive days.', xp: 50, isCompleted: false },
];

export const MOCK_FOLLOW_REQUESTS: FollowRequest[] = [
  { fromUserId: 'user4', toUserId: 'user1' }, // Diana wants to be friends with Alice
];