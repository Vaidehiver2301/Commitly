import React from 'react';

const TrophySvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a3.375 3.375 0 01-3.375-3.375V9.375A3.375 3.375 0 017.5 6h9A3.375 3.375 0 0119.5 9.375v6A3.375 3.375 0 0116.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 4.5V6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V21.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21.75h6" />
        <path d="M12 10.5l1.06 2.165 2.385.347-1.725 1.68.407 2.378L12 15.75l-2.127 1.118.407-2.378-1.725-1.68 2.385-.347L12 10.5z" fill="currentColor" stroke="none" />
    </svg>
)

const HeartSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
)

export const LandingIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-[450px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-indigo-100/60 dark:bg-indigo-900/30 rounded-full"></div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px]">
          <div className="absolute bottom-[25px] left-1/2 -translate-x-1/2 w-[220px] h-[150px] bg-white dark:bg-gray-700 rounded-md shadow-md transform -rotate-3 border-2 border-indigo-200 dark:border-indigo-800 p-2">
            <div className="h-full w-full bg-indigo-50 dark:bg-gray-800 border-2 border-dashed border-indigo-200 dark:border-indigo-700 rounded-sm"></div>
          </div>
          <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded-t-lg"></div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <svg width="250" height="300" viewBox="0 0 250 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hair */}
          <path d="M100 120 C 50 100, 50 180, 100 200" className="fill-gray-700 dark:fill-gray-300" />
          {/* Face */}
          <circle cx="125" cy="140" r="40" fill="#fcecdf" />
          {/* Body */}
          <path d="M85 180 H 165 V 270 A 10 10 0 0 1 155 280 H 95 A 10 10 0 0 1 85 270 Z" className="fill-white dark:fill-gray-200" />
          {/* Neck */}
          <rect x="115" y="175" width="20" height="15" fill="#fcecdf" />
          {/* Pen tip */}
           <path d="M185 260 L195 250 L200 265 Z" className="fill-gray-700 dark:fill-gray-300" />
           {/* Pen body */}
           <path d="M195 250 L220 230" className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      
      <div className="absolute top-16 right-0 bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-2xl shadow-lg transform rotate-6">
        <TrophySvg />
      </div>

      <div className="absolute top-32 left-0 bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-lg transform -rotate-6 flex gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#306998]">
          <path fill="currentColor" d="M16.5 24.847h-6.23c-2.31 0-3.32-1.217-3.32-3.32v-5.26c0-1.99 1.15-3.32 3.32-3.32h9.55c2.31 0 3.32 1.22 3.32 3.32v.5h-6.23c-2.31 0-3.32 1.22-3.32 3.32v1.44z" />
          <path fill="#ffd43b" d="M12.95 15.357a.97.97 0 100-1.94.97.97 0 000 1.94z" />
          <path fill="currentColor" d="M15.5 7.153h6.23c2.31 0 3.32 1.217 3.32 3.32v5.26c0 1.99-1.15 3.32-3.32 3.32h-9.55c-2.31 0-3.32-1.22-3.32-3.32v-.5h6.23c2.31 0 3.32-1.22 3.32-3.32v-1.44z" />
          <path fill="#ffd43b" d="M19.05 19.963a.97.97 0 100-1.94.97.97 0 000 1.94z" />
        </svg>
        <svg width="32" height="32" viewBox="0 0 24 24" className="text-[#e76f00]" fill="currentColor">
            <path d="M18.2,12.2c0-2.4-2.1-3.9-4.7-3.9s-4.8,1.6-4.8,3.9c0,1.8,1.1,3,3.4,3.7l0.1,0.1v-2.5c-0.8-0.3-1.3-0.9-1.3-1.6c0-0.7,0.7-1.3,1.7-1.3s1.7,0.6,1.7,1.3c0,0.7-0.5,1.3-1.3,1.6v2.5l0.1-0.1C17,15.3,18.2,14,18.2,12.2z M19.7,18.1h-1.7c-0.6,1.6-1.8,2.5-3.3,2.5s-2.6-0.9-3.2-2.5H9.8l0.1-1.1c0.8,0.4,1.7,0.6,2.8,0.6s2.1-0.2,2.9-0.6L19.7,18.1z"/>
        </svg>
      </div>
      
      <div className="absolute top-10 left-16 transform -translate-x-1/2">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M10 20 Q10 10 20 10 H80 Q90 10 90 20 V60 Q90 70 80 70 H40 L20 90 V70 H20 Q10 70 10 60Z" className="fill-indigo-500" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <HeartSvg />
          </div>
        </div>
      </div>
    </div>
  )
};