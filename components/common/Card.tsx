import React from 'react';

// FIX: Extend HTMLAttributes to allow passing standard div props like `style`.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-gray-700 p-6 transition-all hover:shadow-xl dark:hover:border-gray-600 ${className}`} {...props}>
      {children}
    </div>
  );
};
