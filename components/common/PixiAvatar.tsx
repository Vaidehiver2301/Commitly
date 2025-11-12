import React from 'react';

interface PixiAvatarProps {
    className?: string; // For the outer div
    svgClassName?: string; // For the inner SVG
}

export const PixiAvatar: React.FC<PixiAvatarProps> = ({ className = '', svgClassName = '' }) => (
    <div className={`w-8 h-8 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${svgClassName}`}>
            <path d="M12 2a10 10 0 0 0-9.8 12.3c.3 1.2 1 2.3 2 3.2L3 21l3.5-.7c.9.6 1.9 1 3 1.2A10 10 0 0 0 12 2z"/>
            <path d="M12 2a10 10 0 0 1 0 20v-8a5 5 0 0 0-4-4v-8a10 10 0 0 1 4-4z"/>
            <path d="M16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
        </svg>
    </div>
);