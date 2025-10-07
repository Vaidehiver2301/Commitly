import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './common/Button';
import { ThemeToggle } from './ThemeToggle';
import { useSessionFocus } from '../contexts/SessionFocusContext';

const NavItem: React.FC<{ to: string; children: React.ReactNode; disabled?: boolean }> = ({ to, children, disabled = false }) => {
  if (disabled) {
      return (
          <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed">
              {children}
          </span>
      )
  }
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.73l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.73l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);


export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isSessionActive } = useSessionFocus();
  
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-50 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Commitly</h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavItem to="/dashboard" disabled={isSessionActive}>Dashboard</NavItem>
              <NavItem to="/session">Session</NavItem>
              <NavItem to="/challenges" disabled={isSessionActive}>Challenges</NavItem>
              <NavItem to="/leaderboard" disabled={isSessionActive}>Leaderboard</NavItem>
              <NavItem to="/friends" disabled={isSessionActive}>Friends</NavItem>
              {currentUser && <NavItem to={`/profile/${currentUser.id}`} disabled={isSessionActive}>Profile</NavItem>}
              <ThemeToggle />
              <Link
                to="/settings"
                className={`p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSessionActive ? 'opacity-50 pointer-events-none' : ''}`}
                aria-label="Settings"
                aria-disabled={isSessionActive}
                onClick={(e) => isSessionActive && e.preventDefault()}
              >
                  <SettingsIcon className="w-5 h-5"/>
              </Link>
              <Button onClick={logout} variant="ghost" className="!py-2 !px-3" disabled={isSessionActive}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
