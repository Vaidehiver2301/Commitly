
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as db from '../services/db';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<{ success: boolean, message?: string }>;
    logout: () => void;
    register: (name: string, email: string, password?: string) => Promise<{ success: boolean, message?: string }>;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("[AuthContext] Initializing AuthProvider...");
        // On app load, check localStorage for a persisted user session.
        try {
            const user = db.getCurrentUser();
            if (user) {
                // If a session exists, automatically log the user in.
                setCurrentUser(user);
                console.log("[AuthContext] Session restored for user:", user.name);
            } else {
                console.log("[AuthContext] No active session found.");
            }
        } catch (error) {
            console.error("[AuthContext] Failed to restore session from localStorage:", error);
            // In case of error (e.g., corrupted localStorage), ensure user is logged out
            // and clear the invalid session data to prevent future errors.
            db.logout();
            setCurrentUser(null);
        } finally {
            // Finished checking, so we're no longer in a loading state.
            setIsLoading(false);
            console.log("[AuthContext] AuthProvider initialization complete.");
        }
    }, []);

    const login = async (email: string, password?: string): Promise<{ success: boolean, message?: string }> => {
        console.log("[AuthContext] Attempting login via AuthProvider for email:", email);
        const user = db.login(email, password);
        if (user) {
            setCurrentUser(user);
            console.log("[AuthContext] Login successful. Current user set:", user.name);
            return { success: true };
        }
        console.log("[AuthContext] Login failed.");
        return { success: false, message: "Invalid email or password." };
    };
    
    const register = async (name: string, email: string, password?: string): Promise<{ success: boolean, message?: string }> => {
        console.log("[AuthContext] Attempting registration via AuthProvider for email:", email);
        const result = db.registerUser(name, email, password);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            console.log("[AuthContext] Registration successful. Current user set:", result.user.name);
        } else {
            console.log("[AuthContext] Registration failed:", result.message);
        }
        return { success: result.success, message: result.message };
    };

    const logout = () => {
        console.log("[AuthContext] Logging out current user.");
        db.logout();
        setCurrentUser(null);
        console.log("[AuthContext] Current user set to null.");
    };

    const refreshUser = () => {
        console.log("[AuthContext] Refreshing user data...");
        const user = db.getCurrentUser(); // This calls readDB() internally, which reads from localStorage
        if (user) {
            setCurrentUser(user);
            console.log("[AuthContext] User data refreshed. Current user:", user.name);
        } else {
            setCurrentUser(null);
            console.warn("[AuthContext] Failed to refresh user data (user not found after refresh).");
        }
    }

    return (
        <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
