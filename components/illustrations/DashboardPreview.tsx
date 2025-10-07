import React from 'react';
import { ProgressBar } from '../common/ProgressBar';
import { LevelBadge } from '../common/LevelBadge';
import { LevelName } from '../../types';

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4.5A5 5 0 0 0 9.5 0 5 5 0 0 0 4.5 4.5c0 2.924 2.16 5.343 5 5.343A5.002 5.002 0 0 0 14.5 4.5zM9.5 9.843c-2.84 0-5 2.419-5 5.343A5 5 0 0 0 9.5 20a5 5 0 0 0 5-4.814c0-2.924-2.16-5.343-5-5.343z"/></svg>
);
const XPIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15.5 7.5 2.3 2.3c.2.2.2.5 0 .7l-5.2 5.2c-.1.1-.3.2-.4.2l-2.8.3c-.2 0-.4-.2-.4-.4l.3-2.8c0-.2.1-.3.2-.4l5.2-5.2c.2-.2.5-.2.7 0Z"/><path d="m21.5 2.5-1.9 1.9c-.2.2-.5.2-.7 0l-1.4-1.4c-.2-.2-.2-.5 0-.7l1.9-1.9c.2-.2.5-.2.7 0l1.4 1.4c.2.2.2.5 0 .7Z"/></svg>
);
const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);

const FloatingIcon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`absolute bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl flex items-center justify-center ${className}`}>
        {children}
    </div>
);

export const DashboardPreview: React.FC = () => {
    return (
        <div className="relative p-8">
            {/* Main browser window */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform rotate-3 transition-transform hover:rotate-0 hover:scale-105 w-full max-w-lg mx-auto">
                {/* Browser header */}
                <div className="h-10 bg-gray-100 dark:bg-gray-700 flex items-center px-4 space-x-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="p-6 bg-light-bg dark:bg-gray-900 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                         <h2 className="text-xl font-bold text-dark-text dark:text-gray-100">Welcome, Alice!</h2>
                         <img src="https://picsum.photos/seed/alice/40" alt="Alice's avatar" className="w-10 h-10 rounded-full" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center space-x-2">
                            <FireIcon className="w-6 h-6 text-orange-500" />
                            <div>
                                <p className="font-bold text-lg">12</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center space-x-2">
                            <XPIcon className="w-6 h-6 text-yellow-500" />
                            <div>
                                <p className="font-bold text-lg">850</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
                            </div>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold">Your Level</h3>
                            <LevelBadge levelName={LevelName.Developer} size="sm" />
                        </div>
                        <ProgressBar value={150} max={400} />
                    </div>
                </div>
            </div>

            {/* Floating decorative elements */}
            <FloatingIcon className="bottom-0 -left-4 transform -rotate-12">
                <CodeIcon className="w-8 h-8 text-indigo-500" />
            </FloatingIcon>
            <FloatingIcon className="top-0 -right-4 transform rotate-12">
                <div className="text-3xl">🏆</div>
            </FloatingIcon>
        </div>
    );
};
