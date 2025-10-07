import React, { useState, useEffect } from 'react';
import { MOTIVATIONAL_QUOTES, LEVELS } from '../constants';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { LevelBadge } from '../components/common/LevelBadge';
import { Session, LevelName, Motivation, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/db';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4.5A5 5 0 0 0 9.5 0 5 5 0 0 0 4.5 4.5c0 2.924 2.16 5.343 5 5.343A5.002 5.002 0 0 0 14.5 4.5zM9.5 9.843c-2.84 0-5 2.419-5 5.343A5 5 0 0 0 9.5 20a5 5 0 0 0 5-4.814c0-2.924-2.16-5.343-5-5.343z"/></svg>
);

const XPIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15.5 7.5 2.3 2.3c.2.2.2.5 0 .7l-5.2 5.2c-.1.1-.3.2-.4.2l-2.8.3c-.2 0-.4-.2-.4-.4l.3-2.8c0-.2.1-.3.2-.4l5.2-5.2c.2-.2.5-.2.7 0Z"/><path d="m21.5 2.5-1.9 1.9c-.2.2-.5.2-.7 0l-1.4-1.4c-.2-.2-.2-.5 0-.7l1.9-1.9c.2-.2.5-.2.7 0l1.4 1.4c.2.2.2.5 0 .7Z"/></svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const MotivationCard: React.FC<{ motivation: Motivation, sender?: User, onDismiss: () => void }> = ({ motivation, sender, onDismiss }) => (
    <div className="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 p-4 rounded-r-lg" role="alert">
        <p className="font-bold">From {sender?.name || 'a friend'}</p>
        <p>"{motivation.message}"</p>
        <Button variant="ghost" className="text-sm !text-yellow-800 dark:!text-yellow-200 font-semibold mt-2" onClick={onDismiss}>Got it!</Button>
    </div>
);


const SessionItem: React.FC<{ session: Session }> = ({ session }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-fadeIn">
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{session.topic} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({session.language})</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
             <p className="font-semibold text-green-500">+{session.xpGained} XP</p>
             <p className="text-sm text-gray-500 dark:text-gray-400">{session.duration} min</p>
        </div>
    </div>
);

// --- Friend Activity Components ---
interface Activity {
    user: User;
    session: Session;
}

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return "Just now";
}

const FriendActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const { user, session } = activity;
    return (
        <div className="flex items-center space-x-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg">
            <Link to={`/profile/${user.id}`}>
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            </Link>
            <div className="text-sm flex-grow">
                <p className="text-gray-800 dark:text-gray-300">
                    <Link to={`/profile/${user.id}`} className="font-bold hover:underline">{user.name}</Link>
                    {' '}completed a {session.duration} min session on "{session.topic}".
                </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{formatTimeAgo(session.date)}</p>
        </div>
    );
};


export const DashboardPage: React.FC = () => {
    const { currentUser: user } = useAuth();
    const { settings } = useSettings();
    const [motivations, setMotivations] = useState<Motivation[]>([]);
    const [friendActivities, setFriendActivities] = useState<Activity[]>([]);
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    useEffect(() => {
        if (user) {
            setMotivations(db.getUnreadMotivationsForUser(user.id));
            
            // Fetch and process friend activities
            const friends = user.friends.map(friendId => db.getUser(friendId)).filter((u): u is User => !!u);
            const activities = friends.flatMap(friend => 
                friend.sessions.map(session => ({ user: friend, session }))
            );
            activities.sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime());
            setFriendActivities(activities.slice(0, 5)); // Get latest 5 activities
        }
    }, [user]);


    if (!user) {
        return <div>Loading user data...</div>;
    }

    const handleDismissMotivation = (motivationId: string) => {
        db.markMotivationAsRead(motivationId);
        setMotivations(prev => prev.filter(m => m.id !== motivationId));
    };

    const currentLevel = LEVELS.find(l => l.name === user.level) || LEVELS[0];
    const nextLevelIndex = LEVELS.findIndex(l => l.xpThreshold > user.xp);
    const nextLevel = nextLevelIndex !== -1 ? LEVELS[nextLevelIndex] : null;

    const xpForNextLevel = nextLevel ? nextLevel.xpThreshold - currentLevel.xpThreshold : 0;
    const xpProgress = user.xp - currentLevel.xpThreshold;

    return (
        <div className="space-y-8 p-4">
            <header className="animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome back, {user.name}!</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 italic mt-2">"{quote}"</p>
            </header>

            {settings.motivations && motivations.length > 0 && (
                <Card className="!p-0 animate-fadeIn">
                    <div className="p-4 border-b dark:border-gray-700">
                         <h3 className="text-xl font-bold">Motivations For You</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {motivations.map(m => (
                            <MotivationCard
                                key={m.id}
                                motivation={m}
                                sender={db.getUser(m.fromUserId)}
                                onDismiss={() => handleDismissMotivation(m.id)}
                            />
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideInUp" style={{ animationDelay: '100ms' }}>
                <Card className="flex items-center space-x-4">
                    <FireIcon className="w-10 h-10 text-orange-500"/>
                    <div>
                        <p className="text-3xl font-bold">{user.streak}</p>
                        <p className="text-gray-500 dark:text-gray-400">Day Streak</p>
                    </div>
                </Card>
                 <Card className="flex items-center space-x-4">
                    <XPIcon className="w-10 h-10 text-yellow-500"/>
                    <div>
                        <p className="text-3xl font-bold">{user.xp.toLocaleString()}</p>
                        <p className="text-gray-500 dark:text-gray-400">Total XP</p>
                    </div>
                </Card>
                 <Card className="flex items-center space-x-4">
                    <ClockIcon className="w-10 h-10 text-blue-500"/>
                    <div>
                        <p className="text-3xl font-bold">{user.sessions.reduce((acc, s) => acc + s.duration, 0)}</p>
                        <p className="text-gray-500 dark:text-gray-400">Minutes Studied</p>
                    </div>
                </Card>
            </div>
            
            <Card className="animate-slideInUp" style={{ animationDelay: '200ms' }}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">Your Level</h3>
                    <LevelBadge levelName={user.level as LevelName} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {nextLevel ? `Reach ${nextLevel.xpThreshold.toLocaleString()} XP to become a ${nextLevel.name}!` : "You've reached the highest level!"}
                </p>
                <ProgressBar value={xpProgress} max={xpForNextLevel} />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{currentLevel.xpThreshold.toLocaleString()} XP</span>
                    {nextLevel && <span>{nextLevel.xpThreshold.toLocaleString()} XP</span>}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-slideInUp" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-xl font-bold mb-4">Recent Sessions</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {user.sessions.length > 0 ? (
                            user.sessions.map(session => <SessionItem key={session.id} session={session} />)
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No sessions logged yet. Time to start learning!</p>
                        )}
                    </div>
                </Card>

                <Card className="animate-slideInUp" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-xl font-bold mb-4">Friend Activity</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {friendActivities.length > 0 ? (
                            friendActivities.map(activity => <FriendActivityItem key={activity.session.id} activity={activity} />)
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                {user.friends.length > 0 ? (
                                    <p>Your friends haven't been active recently.</p>
                                ) : (
                                    <div className="flex flex-col items-center space-y-3">
                                        <p>Add friends to see their activity!</p>
                                        <Link to="/friends">
                                            <Button variant="secondary" className="!px-4 !py-2">Find Friends</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
