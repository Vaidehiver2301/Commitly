
import { MOCK_USERS, MOCK_CHALLENGES, MOCK_FOLLOW_REQUESTS, LEVELS, MOTIVATIONAL_QUOTES } from '../constants';
import { User, Challenge, FollowRequest, Session, LevelName, Language, Motivation } from '../types';

const DB_KEY = 'commitlyDB';

interface Database {
  users: User[];
  challenges: Challenge[];
  followRequests: FollowRequest[];
  motivations: Motivation[];
  currentUserId: string | null;
}

// Initialize the database from localStorage or with mock data
export const initDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    console.log("Initializing database with mock data...");
    const db: Database = {
      users: MOCK_USERS,
      challenges: MOCK_CHALLENGES,
      followRequests: MOCK_FOLLOW_REQUESTS,
      motivations: [],
      currentUserId: null,
    };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    console.log("Database initialized.");
  }
};

// Read the entire database
const readDB = (): Database => {
  const dbString = localStorage.getItem(DB_KEY);
  if (!dbString) {
    console.warn("Database not found in localStorage, initializing...");
    initDB();
    // Re-read after initializing
    const newDbString = localStorage.getItem(DB_KEY);
    return JSON.parse(newDbString!);
  }
  const db = JSON.parse(dbString);
  return db;
};

// Write the entire database
const writeDB = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- User Functions ---
export const getUsers = (): User[] => readDB().users;
export const getUser = (userId: string): User | undefined => getUsers().find(u => u.id === userId);

// Helper function to get level for XP, defined here to be used internally
const getLevelForXp = (xp: number): LevelName => {
    // Iterate backwards to find the highest level achieved
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpThreshold) {
            return LEVELS[i].name;
        }
    }
    return LEVELS[0].name;
}

export const updateUserProfile = (userId: string, updates: Partial<User>) => {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
      console.warn(`[db] User with id ${userId} not found for update.`);
      return;
  }

  const existingUser = db.users[userIndex];
  // Create a new user object by spreading the existing user and then applying updates
  const updatedUser = { ...existingUser, ...updates };

  // Recalculate level if XP changed (or ensure it's up-to-date)
  updatedUser.level = getLevelForXp(updatedUser.xp);

  // Create a new array of users with the updated user at the correct index
  const updatedUsersArray = [...db.users];
  updatedUsersArray[userIndex] = updatedUser;

  writeDB({ ...db, users: updatedUsersArray });
};

export const updateUser = (updatedUser: User) => {
  const db = readDB();
  const users = db.users.map(user => user.id === updatedUser.id ? updatedUser : user);
  writeDB({ ...db, users });
};

export const updateLearningLanguage = (userId: string, newLanguage: Language) => {
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
      console.warn(`[db] User with id ${userId} not found for language update.`);
      return;
  }

  user.learningLanguage = newLanguage;

  const updatedUsers = db.users.map(u => u.id === userId ? user : u);
  writeDB({ ...db, users: updatedUsers });
};

// --- Auth Functions ---
export const getCurrentUserId = (): string | null => readDB().currentUserId;

export const getCurrentUser = (): User | null => {
    const db = readDB();
    if (!db.currentUserId) {
        return null;
    }
    const user = db.users.find(u => u.id === db.currentUserId);
    if (!user) {
        console.warn(`[db] Current user with ID ${db.currentUserId} not found in users array.`);
        return null;
    }
    return user;
}

export const login = (email: string, password?: string): User | null => {
    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    // NOTE: In a real app, you would validate the password here.
    if (user) {
        writeDB({ ...db, currentUserId: user.id });
        return user;
    }
    return null;
}

export const registerUser = (name: string, email: string, password?: string): { success: boolean, message?: string, user?: User } => {
    const db = readDB();
    const emailExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        return { success: false, message: "An account with this email already exists." };
    }

    const newUser: User = {
        id: `user${Date.now()}`,
        name,
        email,
        avatarUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/100`,
        xp: 0,
        streak: 0,
        learningLanguage: Language.Python, // Default language
        sessions: [],
        friends: [],
        level: LevelName.BabyCoder,
    };

    db.users.push(newUser);
    db.currentUserId = newUser.id;
    writeDB(db);

    return { success: true, user: newUser };
};

export const logout = () => {
    const db = readDB();
    writeDB({ ...db, currentUserId: null });
}

// --- Challenge Functions ---
export const getChallenges = (): Challenge[] => readDB().challenges;

// --- Friends/Follow Functions ---
export const getFollowRequests = (userId: string): FollowRequest[] => {
    return readDB().followRequests.filter(req => req.toUserId === userId);
}

export const sendFollowRequest = (fromUserId: string, toUserId: string) => {
    const db = readDB();

    // 1. Check if they are already friends
    const fromUser = db.users.find(u => u.id === fromUserId);
    if (fromUser?.friends.includes(toUserId)) {
        console.warn(`[db] Request not sent: ${fromUserId} and ${toUserId} are already friends.`);
        return;
    }
    
    // 2. Check for existing request (in either direction) to prevent duplicates
    const existingRequest = db.followRequests.find(req => 
        (req.fromUserId === fromUserId && req.toUserId === toUserId) ||
        (req.fromUserId === toUserId && req.toUserId === fromUserId)
    );
    if (existingRequest) {
        console.warn(`[db] Request not sent: Existing request found between ${fromUserId} and ${toUserId}.`);
        return;
    }

    const newRequest: FollowRequest = { fromUserId, toUserId };
    db.followRequests.push(newRequest);
    writeDB({ ...db, followRequests: db.followRequests });
};


export const getUsersFromRequests = (requests: FollowRequest[]): User[] => {
    const users = getUsers();
    const fromUserIds = requests.map(r => r.fromUserId);
    return users.filter(u => fromUserIds.includes(u.id));
}

export const acceptFollowRequest = (fromUserId: string, toUserId: string) => {
    const db = readDB();
    const fromUser = db.users.find(u => u.id === fromUserId);
    const toUser = db.users.find(u => u.id === toUserId);
    if (!fromUser || !toUser) {
        console.error(`[db] Accept request failed: One or both users not found (${fromUserId}, ${toUserId}).`);
        return;
    }

    fromUser.friends = [...new Set([...fromUser.friends, toUser.id])];
    toUser.friends = [...new Set([...toUser.friends, fromUser.id])];

    const updatedRequests = db.followRequests.filter(req => !(req.fromUserId === fromUserId && req.toUserId === toUserId));
    
    const updatedUsers = db.users.map(u => {
        if (u.id === fromUserId) return fromUser;
        if (u.id === toUserId) return toUser;
        return u;
    });

    writeDB({ ...db, users: updatedUsers, followRequests: updatedRequests });
}

export const declineFollowRequest = (fromUserId: string, toUserId: string) => {
    const db = readDB();
    const updatedRequests = db.followRequests.filter(req => !(req.fromUserId === fromUserId && req.toUserId === toUserId));
    writeDB({ ...db, followRequests: updatedRequests });
}

// --- Session Functions ---
export const addSession = (userId: string, sessionData: { topic: string, duration: number, xpGained: number }) => {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        console.error(`[db] Session not added: User with id ${userId} not found.`);
        return;
    }

    const newSession: Session = {
        id: `s${Date.now()}`,
        date: new Date().toISOString(),
        language: user.learningLanguage,
        ...sessionData
    };

    user.sessions.unshift(newSession);
    user.xp += sessionData.xpGained;
    user.level = getLevelForXp(user.xp);
    // TODO: Streak logic would be implemented here

    const updatedUsers = db.users.map(u => u.id === userId ? user : u);
    writeDB({ ...db, users: updatedUsers });
}

// --- Motivation Functions ---
export const sendMotivation = (fromUserId: string, toUserId: string) => {
    const db = readDB();
    const message = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    const newMotivation: Motivation = {
        id: `m${Date.now()}`,
        fromUserId,
        toUserId,
        message,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    db.motivations.push(newMotivation);
    writeDB(db);
};

export const getUnreadMotivationsForUser = (userId: string): Motivation[] => {
    return readDB().motivations.filter(m => m.toUserId === userId && !m.isRead);
};

export const markMotivationAsRead = (motivationId: string) => {
    const db = readDB();
    const motivation = db.motivations.find(m => m.id === motivationId);
    if (motivation) {
        motivation.isRead = true;
        writeDB(db); // Only write if a change was made
    }
};


// Call init on load to ensure DB exists
initDB();
