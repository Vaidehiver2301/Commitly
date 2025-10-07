import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const isSignupPage = location.pathname === '/signup';

    const showSignUp = !isSignupPage;
    const showSignIn = isSignupPage;


    return (
        <div className="bg-light-bg dark:bg-gray-900 min-h-screen text-dark-text dark:text-gray-200 font-sans transition-colors duration-300">
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-20">
                    <Link to="/" aria-label="Commitly Home">
                        <h1 className="text-3xl font-bold text-indigo-600">Commitly</h1>
                    </Link>
                    <div>
                        {showSignUp && (
                            <Link to="/signup">
                                <button className="font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/60">
                                    Sign Up
                                </button>
                            </Link>
                        )}
                        {showSignIn && (
                            <Link to="/login">
                                <button className="font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/60">
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};