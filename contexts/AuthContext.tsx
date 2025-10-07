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
        // On app load, check localStorage for a persisted user session.
        try {
            const user = db.getCurrentUser();
            if (user) {
                // If a session exists, automatically log the user in.
                setCurrentUser(user);
            }
        } catch (error) {
            console.error("Failed to restore session from localStorage:", error);
            // In case of error (e.g., corrupted localStorage), ensure user is logged out
            // and clear the invalid session data to prevent future errors.
            db.logout();
            setCurrentUser(null);
        } finally {
            // Finished checking, so we're no longer in a loading state.
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password?: string): Promise<{ success: boolean, message?: string }> => {
        const user = db.login(email, password);
        if (user) {
            setCurrentUser(user);
            return { success: true };
        }
        return { success: false, message: "Invalid email or password." };
    };
    
    const register = async (name: string, email: string, password?: string): Promise<{ success: boolean, message?: string }> => {
        const result = db.registerUser(name, email, password);
        if (result.success && result.user) {
            setCurrentUser(result.user);
        }
        return { success: result.success, message: result.message };
    };

    const logout = () => {
        db.logout();
        setCurrentUser(null);
    };

    const refreshUser = () => {
        const user = db.getCurrentUser();
        setCurrentUser(user);
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
