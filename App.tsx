import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SessionPage } from './pages/SessionPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { FriendsPage } from './pages/FriendsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { PracticeSheetsPage } from './pages/PracticeSheetsPage';
import { PublicLayout } from './components/PublicLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SessionFocusProvider } from './contexts/SessionFocusContext';

const AppContent: React.FC = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading Commitly...</div>;
    }

    if (!currentUser) {
        return (
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }

    return (
        <Layout>
            <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/session" element={<SessionPage />} />
                <Route path="/practice" element={<PracticeSheetsPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Layout>
    );
}

const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <AuthProvider>
                    <SettingsProvider>
                        <SessionFocusProvider>
                            <AppContent />
                        </SessionFocusProvider>
                    </SettingsProvider>
                </AuthProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;