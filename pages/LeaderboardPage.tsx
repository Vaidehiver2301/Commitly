import React from 'react';
import { User } from '../types';
import { LevelBadge } from '../components/common/LevelBadge';
import * as db from '../services/db';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardItem: React.FC<{ user: User; rank: number; isCurrentUser: boolean }> = ({ user, rank, isCurrentUser }) => {
    return (
        <div className={`flex items-center p-4 rounded-xl transition-transform transform hover:scale-105 ${isCurrentUser ? 'bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-400 dark:border-indigo-500' : 'bg-white dark:bg-gray-800 shadow-md'}`}>
            <span className="text-xl font-bold text-gray-500 dark:text-gray-400 w-12">{rank}</span>
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4" />
            <div className="flex-grow">
                <p className="font-bold text-gray-800 dark:text-gray-100">{user.name} {isCurrentUser && '(You)'}</p>
                <LevelBadge levelName={user.level} size="sm" />
            </div>
            <p className="text-xl font-bold text-yellow-500">{user.xp.toLocaleString()} XP</p>
        </div>
    );
};


export const LeaderboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const sortedUsers = [...db.getUsers()].sort((a, b) => b.xp - a.xp);

    return (
        <div className="p-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">Leaderboard</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2">See who's at the top of their game!</p>
            </header>

            <div className="max-w-3xl mx-auto space-y-3 animate-slideInUp">
                {sortedUsers.map((user, index) => (
                    <LeaderboardItem 
                        key={user.id} 
                        user={user} 
                        rank={index + 1}
                        isCurrentUser={user.id === currentUser?.id}
                    />
                ))}
            </div>
        </div>
    );
};