

import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LEVELS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LevelBadge } from '../components/common/LevelBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import * as db from '../services/db';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import User type from types.ts
import { Language, User } from '../types';

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4.5A5 5 0 0 0 9.5 0 5 5 0 0 0 4.5 4.5c0 2.924 2.16 5.343 5 5.343A5.002 5.002 0 0 0 14.5 4.5zM9.5 9.843c-2.84 0-5 2.419-5 5.343A5 5 0 0 0 9.5 20a5 5 0 0 0 5-4.814c0-2.924-2.16-5.343-5-5.343z"/></svg>
);
const XPIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15.5 7.5 2.3 2.3c.2.2.2.5 0 .7l-5.2 5.2c-.1.1-.3.2-.4.2l-2.8.3c-.2 0-.4-.2-.4-.4l.3-2.8c0-.2.1-.3.2-.4l5.2-5.2c.2-.2.5-.2.7 0Z"/><path d="m21.5 2.5-1.9 1.9c-.2.2-.5.2-.7 0l-1.4-1.4c-.2-.2-.2-.5 0-.7l1.9-1.9c.2-.2.5-.2.7 0l1.4 1.4c.2.2.2.5 0 .7Z"/></svg>
);
const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);


// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


export const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const { currentUser, refreshUser } = useAuth();
    const [motivationSent, setMotivationSent] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const user = db.getUser(userId!);
    const isCurrentUser = userId === currentUser?.id;

    // Initialize newName and newAvatarPreview when user or editing status changes
    React.useEffect(() => {
        if (user) {
            setNewName(user.name);
            setNewAvatarPreview(user.avatarUrl); // Start preview with current avatar
        }
    }, [user, isEditing]);


    if (!user) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">User not found</h1>
                <Link to="/dashboard"><Button className="mt-4">Go to Dashboard</Button></Link>
            </div>
        );
    }
    
    const handleLanguageSwitch = () => {
        if (!isCurrentUser || !user) return;
        const newLanguage = user.learningLanguage === Language.Java ? Language.Python : Language.Java;
        db.updateLearningLanguage(user.id, newLanguage);
        refreshUser();
    };

    const handleSendMotivation = () => {
        if (isCurrentUser || !currentUser) return;
        db.sendMotivation(currentUser.id, user.id);
        setMotivationSent(true);
        setTimeout(() => setMotivationSent(false), 3000);
    };

    const handleEditToggle = () => {
        setIsEditing(prev => !prev);
        // Reset temporary states if cancelling edit
        if (isEditing) {
            setNewName(user.name);
            setNewAvatarFile(null);
            setNewAvatarPreview(user.avatarUrl); // Revert preview to original avatar
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewAvatarFile(file);
            const previewUrl = await fileToBase64(file);
            setNewAvatarPreview(previewUrl);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !isCurrentUser) {
            return;
        }

        const updates: Partial<User> = {};
        if (newName.trim() !== user.name) {
            updates.name = newName.trim();
        }

        // Only update avatar if a new file was selected and it's different from current
        if (newAvatarFile && newAvatarPreview && newAvatarPreview !== user.avatarUrl) {
            updates.avatarUrl = newAvatarPreview; // This is already the Base64 string
        }
        
        if (Object.keys(updates).length > 0) {
            db.updateUserProfile(user.id, updates);
            refreshUser(); // Update the currentUser state in AuthContext
        } else {
            console.log("No changes detected, skipping DB update.");
        }
        setIsEditing(false); // Exit editing mode
    };

    const currentLevel = LEVELS.find(l => l.name === user.level) || LEVELS[0];
    const nextLevelIndex = LEVELS.findIndex(l => l.xpThreshold > user.xp);
    const nextLevel = nextLevelIndex !== -1 ? LEVELS[nextLevelIndex] : null;

    const xpForNextLevel = nextLevel ? nextLevel.xpThreshold - currentLevel.xpThreshold : 0;
    const xpProgress = user.xp - currentLevel.xpThreshold;

    return (
        <div className="p-4 space-y-6">
            <Card className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative">
                {isCurrentUser && (
                    <div className="absolute top-4 right-4">
                        {!isEditing ? (
                            <Button variant="secondary" onClick={handleEditToggle} className="!px-4 !py-2">
                                <EditIcon className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button variant="primary" onClick={handleSaveProfile} className="!px-4 !py-2">Save Changes</Button>
                                <Button variant="ghost" onClick={handleEditToggle} className="!px-4 !py-2">Cancel</Button>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="relative group">
                    <img 
                        src={newAvatarPreview || user.avatarUrl} 
                        alt={user.name} 
                        className="w-32 h-32 rounded-full shadow-lg object-cover" 
                    />
                    {isEditing && (
                        <>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={avatarInputRef} 
                                className="hidden" 
                                onChange={handleAvatarChange} 
                            />
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors transform translate-x-1 translate-y-1 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-label="Change profile picture"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex-grow text-center md:text-left">
                    {isEditing ? (
                        <input
                            type="text"
                            value={newName}
                            onChange={handleNameChange}
                            className="text-3xl sm:text-4xl font-bold w-full bg-transparent border-b-2 border-indigo-500 focus:outline-none dark:text-gray-100"
                        />
                    ) : (
                        <h1 className="text-3xl sm:text-4xl font-bold">{user.name}</h1>
                    )}
                    <LevelBadge levelName={user.level} size="lg" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Learning {user.learningLanguage}</p>
                </div>
                {!isCurrentUser && (
                    <div className="flex flex-col space-y-2">
                        <Button onClick={handleSendMotivation} disabled={motivationSent}>
                            {motivationSent ? 'Sent! ✨' : 'Send Motivation'}
                        </Button>
                        <p className="text-center text-sm text-gray-400 dark:text-gray-500 italic">Cheer them on!</p>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Stats</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FireIcon className="w-6 h-6 text-orange-500" />
                            <p><span className="font-bold text-lg">{user.streak}</span> Day Streak</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <XPIcon className="w-6 h-6 text-yellow-500" />
                            <p><span className="font-bold text-lg">{user.xp.toLocaleString()}</span> Total XP</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4">Level Progress</h2>
                     <ProgressBar value={xpProgress} max={xpForNextLevel} />
                     <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>{currentLevel.xpThreshold.toLocaleString()} XP</span>
                        {nextLevel && <span>{nextLevel.xpThreshold.toLocaleString()} XP</span>}
                     </div>
                     <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
                        {nextLevel ? `${(nextLevel.xpThreshold - user.xp).toLocaleString()} XP until ${nextLevel.name}` : "Max level achieved!"}
                     </p>
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold mb-4">Learning Focus</h2>
                    <div className="flex items-center justify-between">
                       <div>
                            <p className="text-gray-600 dark:text-gray-400">Current Language</p>
                            <p className="text-2xl font-semibold text-indigo-600 flex items-center gap-2">
                                <CodeIcon className="w-6 h-6" /> {user.learningLanguage}
                            </p>
                        </div>
                        {isCurrentUser && !isEditing && ( // Only allow language switch outside of general editing mode
                            <Button variant="secondary" onClick={handleLanguageSwitch}>
                                Switch
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
            
            <Card>
                 <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                    {user.sessions.slice(0, 5).map(s => (
                        <div key={s.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                            Completed a <span className="font-semibold">{s.duration} minute</span> session on <span className="font-semibold">{s.topic}</span>.
                        </div>
                    ))}
                    {user.sessions.length === 0 && <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>}
                 </div>
            </Card>
        </div>
    );
};