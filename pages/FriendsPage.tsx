import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/db';

const FriendCard: React.FC<{ user: User }> = ({ user }) => (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
        <div className="flex-grow">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.level}</p>
        </div>
        <Link to={`/profile/${user.id}`}>
            <Button variant="secondary" className="px-4 py-1.5">View Profile</Button>
        </Link>
    </div>
);

const RequestCard: React.FC<{ user: User; onAccept: () => void; onDecline: () => void; }> = ({ user, onAccept, onDecline }) => (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
        <div className="flex-grow">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Wants to connect</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button onClick={onAccept} className="px-4 py-1.5 !bg-green-500 hover:!bg-green-600 w-full sm:w-auto">Accept</Button>
            <Button onClick={onDecline} variant="ghost" className="px-4 py-1.5 w-full sm:w-auto">Decline</Button>
        </div>
    </div>
);

const SearchResultCard: React.FC<{ user: User; onSendRequest: () => void }> = ({ user, onSendRequest }) => (
     <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
        <div className="flex-grow">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.level}</p>
        </div>
        <Button onClick={onSendRequest} className="px-4 py-1.5">Send Request</Button>
    </div>
);


export const FriendsPage: React.FC = () => {
    const { currentUser, refreshUser } = useAuth();
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    useEffect(() => {
        if (currentUser) {
            setFriends(db.getUsers().filter(u => currentUser.friends.includes(u.id)));
            const followRequests = db.getFollowRequests(currentUser.id);
            setRequests(db.getUsersFromRequests(followRequests));
        }
    }, [currentUser]);

     useEffect(() => {
        if (!searchQuery.trim() || !currentUser) {
            setSearchResults([]);
            return;
        }

        const allUsers = db.getUsers();
        const friendIds = currentUser.friends;
        const incomingRequestIds = requests.map(r => r.id);
        
        const filteredUsers = allUsers.filter(u => {
            const isSelf = u.id === currentUser.id;
            const isFriend = friendIds.includes(u.id);
            const hasIncomingRequest = incomingRequestIds.includes(u.id);
            const nameMatches = u.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return nameMatches && !isSelf && !isFriend && !hasIncomingRequest;
        });

        setSearchResults(filteredUsers);

    }, [searchQuery, currentUser, friends, requests]);


    if (!currentUser) {
        return <div>Loading...</div>;
    }
    
    const handleAction = (fromUserId: string, action: 'accept' | 'decline') => {
        if (action === 'accept') {
            db.acceptFollowRequest(fromUserId, currentUser.id);
        } else {
            db.declineFollowRequest(fromUserId, currentUser.id);
        }
        refreshUser();
        const updatedFollowRequests = db.getFollowRequests(currentUser.id);
        setRequests(db.getUsersFromRequests(updatedFollowRequests));
    };
    
    const handleSendRequest = (toUserId: string) => {
        db.sendFollowRequest(currentUser.id, toUserId);
        // Remove user from search results to give feedback that request was sent
        setSearchResults(prev => prev.filter(u => u.id !== toUserId));
    };


    return (
        <div className="p-4 space-y-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4">Find New Friends</h2>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
                />
                 {searchQuery.trim() && (
                    <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <SearchResultCard 
                                    key={user.id} 
                                    user={user} 
                                    onSendRequest={() => handleSendRequest(user.id)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No users found.</p>
                        )}
                    </div>
                )}
            </Card>

            <Card>
                <h2 className="text-2xl font-bold mb-4">Your Friends ({friends.length})</h2>
                <div className="space-y-3">
                    {friends.length > 0 ? 
                        friends.map(friend => <FriendCard key={friend.id} user={friend} />) :
                        <p className="text-gray-500 dark:text-gray-400">You haven't added any friends yet.</p>
                    }
                </div>
            </Card>

            {requests.length > 0 && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Follow Requests ({requests.length})</h2>
                     <div className="space-y-3">
                        {requests.map(req => 
                            <RequestCard 
                                key={req.id} 
                                user={req} 
                                onAccept={() => handleAction(req.id, 'accept')}
                                onDecline={() => handleAction(req.id, 'decline')}
                            />
                        )}
                     </div>
                 </Card>
            )}
        </div>
    );
};