import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface SessionFocusContextType {
  isSessionActive: boolean;
  setSessionActive: (isActive: boolean) => void;
}

const SessionFocusContext = createContext<SessionFocusContextType | undefined>(undefined);

export const SessionFocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSessionActive, setSessionActive] = useState(false);

  const value = useMemo(() => ({
    isSessionActive,
    setSessionActive,
  }), [isSessionActive]);

  return (
    <SessionFocusContext.Provider value={value}>
      {children}
    </SessionFocusContext.Provider>
  );
};

export const useSessionFocus = () => {
  const context = useContext(SessionFocusContext);
  if (context === undefined) {
    throw new Error('useSessionFocus must be used within a SessionFocusProvider');
  }
  return context;
};
