import React, { useState } from 'react';
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

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isSessionActive } = useSessionFocus();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const MobileNavItem: React.FC<{ to: string; children: React.ReactNode; disabled?: boolean }> = ({ to, children, disabled = false }) => {
    const handleClick = () => {
      setMobileMenuOpen(false);
    }
    
    if (disabled) {
        return (
            <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed">
                {children}
            </span>
        )
    }

    return (
      <NavLink
        to={to}
        onClick={handleClick}
        className={({ isActive }) =>
          `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
            isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`
        }
      >
        {children}
      </NavLink>
    );
  };
  
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-50 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/"} onClick={() => setMobileMenuOpen(false)}>
                <h1 className="text-2xl font-bold text-indigo-600">Commitly</h1>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavItem to="/dashboard" disabled={isSessionActive}>Dashboard</NavItem>
              <NavItem to="/session">Session</NavItem>
              <NavItem to="/practice" disabled={isSessionActive}>Practice</NavItem>
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
          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-gray-100 dark:bg-gray-700 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
            >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>
       {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavItem to="/dashboard" disabled={isSessionActive}>Dashboard</MobileNavItem>
              <MobileNavItem to="/session">Session</MobileNavItem>
              <MobileNavItem to="/practice" disabled={isSessionActive}>Practice</MobileNavItem>
              <MobileNavItem to="/challenges" disabled={isSessionActive}>Challenges</MobileNavItem>
              <MobileNavItem to="/leaderboard" disabled={isSessionActive}>Leaderboard</MobileNavItem>
              <MobileNavItem to="/friends" disabled={isSessionActive}>Friends</MobileNavItem>
              {currentUser && <MobileNavItem to={`/profile/${currentUser.id}`} disabled={isSessionActive}>Profile</MobileNavItem>}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5">
                   <div className="flex items-center gap-4">
                     <ThemeToggle />
                     <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${isSessionActive ? 'opacity-50 pointer-events-none' : ''}`}
                        aria-label="Settings"
                        aria-disabled={isSessionActive}
                      >
                          <SettingsIcon className="w-6 h-6"/>
                      </Link>
                   </div>
                    <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="ghost" disabled={isSessionActive}>Logout</Button>
                </div>
            </div>
        </div>
      )}
    </header>
  );
};
