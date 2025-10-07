import React from 'react';
import { Card } from '../components/common/Card';
import { Challenge } from '../types';
import * as db from '../services/db';

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const CircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/></svg>
);


const ChallengeItem: React.FC<{ challenge: Challenge }> = ({ challenge }) => (
    <div className={`p-5 rounded-xl flex items-center space-x-4 transition-all ${challenge.isCompleted ? 'bg-green-100 dark:bg-green-500/10 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-800 shadow-md'}`}>
        <div>
            {challenge.isCompleted ? 
                <CheckCircleIcon className="w-8 h-8 text-green-500" /> :
                <CircleIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            }
        </div>
        <div className="flex-grow">
            <h3 className={`font-bold text-lg ${challenge.isCompleted ? 'line-through' : 'text-gray-800 dark:text-gray-100'}`}>{challenge.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
        </div>
        <div className="text-right">
            <p className={`font-bold text-lg ${challenge.isCompleted ? 'text-green-500' : 'text-yellow-500'}`}>+{challenge.xp} XP</p>
        </div>
    </div>
);

export const ChallengesPage: React.FC = () => {
    const challenges = db.getChallenges();

    return (
        <div className="p-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">Daily Challenges</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Complete these tasks to earn extra XP and build your skills!</p>
            </header>
            
            <div className="max-w-3xl mx-auto space-y-4 animate-slideInUp">
                {challenges.map(challenge => (
                    <ChallengeItem key={challenge.id} challenge={challenge} />
                ))}
            </div>
        </div>
    );
};