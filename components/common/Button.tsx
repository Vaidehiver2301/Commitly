import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-2.5 font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500',
    secondary: 'text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-500 dark:bg-gray-700 dark:text-indigo-300 dark:border-indigo-900 dark:hover:bg-gray-600',
    ghost: 'text-gray-600 hover:bg-gray-200 shadow-none dark:text-gray-300 dark:hover:bg-gray-700',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};