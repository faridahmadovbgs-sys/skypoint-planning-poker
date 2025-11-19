"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set, push, remove } from 'firebase/database';
import { database } from '../lib/firebase';
import EstimationCard from "./PokerCard";
import VotingSession from "./VotingSession";

const Room = ({ roomCode, userName, onLeave }) => {
  // Story point values for estimation
  const cardValues = ['1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'coffee'];
  
  // Room state
  const [users, setUsers] = useState([]);
  const [currentUserId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [selectedCard, setSelectedCard] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentStory, setCurrentStory] = useState('');
  const [votingResults, setVotingResults] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Firebase references
  const roomRef = ref(database, `rooms/${roomCode}`);
  const usersRef = ref(database, `rooms/${roomCode}/users`);
  const sessionRef = ref(database, `rooms/${roomCode}/session`);

  // Firebase real-time synchronization with fallback
  useEffect(() => {
    const currentUser = {
      id: currentUserId,
      name: userName,
      hasVoted: false,
      selectedCard: null,
      isObserver: false,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    };

    if (!database) {
      console.log('Firebase not available, using demo mode');
      // Fallback to local state
      setUsers([currentUser]);
      
      // Add demo users to show functionality
      setTimeout(() => {
        const demoUsers = [
          { id: 'demo1', name: 'Alice (Demo)', hasVoted: false, selectedCard: null, isObserver: false },
          { id: 'demo2', name: 'Bob (Demo)', hasVoted: false, selectedCard: null, isObserver: false },
        ];
        setUsers(prev => [...prev, ...demoUsers]);
      }, 2000);
      
      return;
    }

    // Firebase integration
    try {
      const userRef = ref(database, `rooms/${roomCode}/users/${currentUserId}`);
      set(userRef, currentUser).catch(error => {
        console.warn('Firebase set failed, using demo mode:', error);
        setUsers([currentUser]);
      });
    
      // Listen for users changes with real-time sync
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        console.log('Firebase users update received');
        setConnectionStatus('connected');
        setLastUpdate(Date.now());
        const usersData = snapshot.val();
        if (usersData) {
          const usersArray = Object.keys(usersData).map(key => ({
            ...usersData[key],
            id: key
          }));
          console.log('Updated users:', usersArray);
          setUsers(usersArray);
        } else {
          setUsers([currentUser]);
        }
      }, (error) => {
        console.warn('Firebase users listener failed:', error);
        setConnectionStatus('error');
        setUsers([currentUser]);
      });
    
      // Listen for session changes with immediate updates
      const unsubscribeSession = onValue(sessionRef, (snapshot) => {
        console.log('Firebase session update received');
        const sessionData = snapshot.val();
        if (sessionData) {
          console.log('Session data:', sessionData);
          setCurrentStory(sessionData.currentStory || '');
          setIsRevealed(sessionData.isRevealed || false);
        }
      }, (error) => {
        console.warn('Firebase session listener failed:', error);
      });
    
      // Update user's last seen timestamp and force refresh periodically
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeatRef = ref(database, `rooms/${roomCode}/users/${currentUserId}/lastSeen`);
          set(heartbeatRef, Date.now());
          
          // Force a refresh of room data every 10 seconds to ensure sync
          console.log('Periodic sync check...');
        } catch (error) {
          console.warn('Heartbeat failed:', error);
        }
      }, 10000); // More frequent updates for real-time feel
      
      // Cleanup on unmount
      return () => {
        unsubscribeUsers();
        unsubscribeSession();
        clearInterval(heartbeatInterval);
        // Remove user from Firebase when leaving
        try {
          remove(ref(database, `rooms/${roomCode}/users/${currentUserId}`));
        } catch (error) {
          console.warn('User cleanup failed:', error);
        }
      };
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      setUsers([currentUser]);
    }
  }, [currentUserId, userName, roomCode]);

  // Calculate if all votes are in
  const allVotesIn = users.filter(u => !u.isObserver).every(user => user.hasVoted);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Calculate allVotesIn inside the handler to avoid dependency issues
      const currentAllVotesIn = users.filter(u => !u.isObserver).every(user => user.hasVoted);
      
      // Number keys 0-9 for quick card selection
      if (e.key >= '0' && e.key <= '9' && !isRevealed) {
        const cardIndex = parseInt(e.key);
        if (cardIndex < cardValues.length) {
          handleCardSelect(cardValues[cardIndex]);
        }
      }
      // 'R' key for reveal (when all votes are in)
      if (e.key.toLowerCase() === 'r' && !isRevealed && currentAllVotesIn) {
        e.preventDefault();
        handleReveal();
      }
      // 'N' key for new round (when revealed)
      if (e.key.toLowerCase() === 'n' && isRevealed) {
        e.preventDefault();
        handleReset();
      }
      // 'C' key to clear vote
      if (e.key.toLowerCase() === 'c' && selectedCard && !isRevealed) {
        e.preventDefault();
        setSelectedCard(null);
        setUsers(prev => prev.map(user => 
          user.id === currentUserId 
            ? { ...user, hasVoted: false, selectedCard: null }
            : user
        ));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, selectedCard, currentUserId, cardValues, users]);

  const handleCardSelect = (value) => {
    setSelectedCard(value);
    
    // Immediately update local state for instant feedback
    setUsers(prev => prev.map(user => 
      user.id === currentUserId 
        ? { ...user, hasVoted: true, selectedCard: value }
        : user
    ));

    if (database) {
      // Update user's vote in Firebase
      try {
        console.log('Updating Firebase with vote:', value);
        const userRef = ref(database, `rooms/${roomCode}/users/${currentUserId}`);
        set(userRef, {
          id: currentUserId,
          name: userName,
          hasVoted: true,
          selectedCard: value,
          isObserver: false,
          joinedAt: Date.now(),
          lastSeen: Date.now()
        }).then(() => {
          console.log('Firebase vote update successful');
        });
      } catch (error) {
        console.warn('Firebase card select failed:', error);
      }
    } else {
      // Demo mode - update local state
      setUsers(prev => prev.map(user => 
        user.id === currentUserId 
          ? { ...user, hasVoted: true, selectedCard: value }
          : user
      ));
      
      // Simulate other demo users voting
      setTimeout(() => {
        setUsers(prev => prev.map(user => {
          if (user.name && user.name.includes('Demo') && !user.hasVoted) {
            const randomCard = cardValues[Math.floor(Math.random() * (cardValues.length - 2))];
            return { ...user, hasVoted: true, selectedCard: randomCard };
          }
          return user;
        }));
      }, 1000 + Math.random() * 2000);
    }
  };



  const handleReveal = () => {
    // Immediately update local state
    setIsRevealed(true);
    
    if (database) {
      try {
        console.log('Updating Firebase reveal state');
        // Update reveal state in Firebase
        set(ref(database, `rooms/${roomCode}/session/isRevealed`), true).then(() => {
          console.log('Firebase reveal update successful');
        });
      } catch (error) {
        console.warn('Firebase reveal failed:', error);
      }
    }
    
    const results = users
      .filter(user => !user.isObserver && user.hasVoted)
      .map(user => ({
        userName: user.name,
        value: user.selectedCard
      }));
    setVotingResults(results);
  };

  const handleReset = () => {
    // Immediately update local state
    setSelectedCard(null);
    setVotingResults([]);
    setIsRevealed(false);
    setUsers(prev => prev.map(user => ({
      ...user,
      hasVoted: false,
      selectedCard: null
    })));
    
    if (database) {
      try {
        // Reset session state in Firebase
        set(ref(database, `rooms/${roomCode}/session`), {
          isRevealed: false,
          currentStory: currentStory
        });
        
        // Reset all users' votes in Firebase
        users.forEach(user => {
          if (user.id) {
            set(ref(database, `rooms/${roomCode}/users/${user.id}`), {
              ...user,
              hasVoted: false,
              selectedCard: null,
              lastSeen: Date.now()
            });
          }
        });
      } catch (error) {
        console.warn('Firebase reset failed:', error);
      }
    } else {
      // Demo mode - reset local state
      setUsers(prev => prev.map(user => ({
        ...user,
        hasVoted: false,
        selectedCard: null
      })));
    }
  };

  const handleStoryChange = (newStory) => {
    setCurrentStory(newStory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="auth-org-logo">
                <span className="text-5xl font-black bg-gradient-to-r from-slate-800 via-orange-600 to-slate-700 bg-clip-text text-transparent tracking-wide drop-shadow-md" aria-label="SkyPoint logo">SkyPoint</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-700">Planning Session</h1>
                <div className="flex items-center gap-3">
                  <p className="text-neutral-600">Session: <span className="font-mono text-sm bg-slate-100 text-neutral-700 px-2 py-1 rounded border border-slate-300">{roomCode}</span></p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-neutral-500">
                      {connectionStatus === 'connected' ? 'Live' :
                       connectionStatus === 'connecting' ? 'Connecting...' :
                       'Demo Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}?join=${roomCode}&name=`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('Share link copied! Others can paste this link to join directly.');
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm text-sm font-medium"
              >
                Copy Share Link
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(roomCode)}
                className="px-4 py-2 border border-orange-300 text-orange-600 rounded-md hover:bg-orange-50 transition-colors shadow-sm text-sm font-medium"
                title="Copy session code to share with team members"
              >
                Copy Code
              </button>
              <button 
                onClick={onLeave}
                className="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md hover:bg-neutral-50 transition-colors shadow-sm text-sm font-medium"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center - Estimation Area and Cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Estimation Dashboard */}
            <div className="bg-white rounded-lg shadow-md border border-orange-200 p-4">
              <h2 className="text-lg font-medium text-neutral-800 mb-4 text-center">Team Estimation</h2>
              
              {/* Participants Grid */}
              {users.length === 1 && (
                <div className="text-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📋 Share the session code <span className="font-mono font-semibold">{roomCode}</span> with your team members to start estimating together!
                  </p>
                </div>
              )}
              <div className="flex justify-center gap-4 mb-6 flex-wrap">
                {users.map((user) => (
                  <div key={user.id} className="text-center">
                    <div className="text-sm font-medium text-neutral-700 mb-2">{user.name}</div>
                    <div className="flex justify-center">
                      {user.hasVoted && !isRevealed && (
                        <div className="w-16 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transform rotate-12">
                          <div className="text-white text-lg font-bold">✓</div>
                        </div>
                      )}
                      {user.hasVoted && isRevealed && (
                        <div className={`w-16 h-24 rounded-lg border-2 shadow-lg flex items-center justify-center ${
                          user.selectedCard === 'coffee' ? 'bg-neutral-600 border-neutral-700 text-white' :
                          ['1/2', '1', '2', '3'].includes(user.selectedCard) ? 'bg-blue-500 border-blue-600 text-white' :
                          ['5', '8', '13'].includes(user.selectedCard) ? 'bg-green-500 border-green-600 text-white' :
                          ['20', '40', '100'].includes(user.selectedCard) ? 'bg-orange-500 border-orange-600 text-white' :
                          user.selectedCard === '?' ? 'bg-purple-500 border-purple-600 text-white' :
                          'bg-white border-neutral-300 text-neutral-800'
                        }`}>
                          <span className="text-base font-bold">
                            {user.selectedCard === 'coffee' ? 'Pass' : 
                             user.selectedCard === '1/2' ? '½' : user.selectedCard}
                          </span>
                        </div>
                      )}
                      {!user.hasVoted && (
                        <div className="w-16 h-24 bg-gradient-to-b from-neutral-200 to-neutral-300 rounded-lg border-2 border-neutral-400 flex items-center justify-center">
                          <span className="text-neutral-500 text-lg font-bold">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Estimation Status & Controls */}
              <div className="text-center border-t border-orange-200 pt-6">
                {!isRevealed && allVotesIn && (
                  <button
                    onClick={handleReveal}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium shadow-sm"
                    title="Press 'R' key or click to reveal"
                  >
                    Reveal Estimates <span className="text-xs opacity-75">(R)</span>
                  </button>
                )}
                
                {isRevealed && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      Consensus Estimate: <span className="font-semibold text-lg text-orange-600">{votingResults.length > 0 ? (() => {
                        const numericVotes = votingResults
                          .filter(r => r.value !== '?' && r.value !== 'coffee')
                          .map(r => r.value === '1/2' ? 0.5 : parseFloat(r.value))
                          .filter(r => !isNaN(r));
                        if (numericVotes.length === 0) return 0;
                        const average = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
                        const fibSequence = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
                        return fibSequence.reduce((prev, curr) => 
                          Math.abs(curr - average) < Math.abs(prev - average) ? curr : prev
                        );
                      })() : '0'}</span>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors font-medium shadow-sm"
                      title="Press 'N' key or click to start new round"
                    >
                      Start New Round <span className="text-xs opacity-75">(N)</span>
                    </button>
                  </div>
                )}

                {!allVotesIn && !isRevealed && (
                  <div className="text-neutral-600 text-sm">
                    Waiting for all participants ({users.filter(u => u.hasVoted && !u.isObserver).length} of {users.filter(u => !u.isObserver).length} estimated)
                  </div>
                )}
              </div>
            </div>

            {/* Estimation Values */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-slate-200 mt-4">
              <div className="flex justify-center items-center gap-1 flex-wrap">
                {cardValues.map((value) => (
                  <EstimationCard
                    key={value}
                    value={value}
                    isSelected={selectedCard === value}
                    onSelect={handleCardSelect}
                    isRevealed={isRevealed}
                    disabled={isRevealed}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-400 text-center mt-2">Number keys 0-9 • C to clear • R to reveal • N for new round</p>
              
              {selectedCard && !isRevealed && (
                <div className="mt-4 p-3 bg-orange-50 rounded-md text-center border border-orange-200">
                  <span className="text-orange-800 font-medium">
                    Selected: {selectedCard === 'coffee' ? 'Skip this item' : 
                              selectedCard === '1/2' ? 'Half story point' : 
                              selectedCard === '?' ? 'Unknown complexity' :
                              selectedCard + ' story points'}
                  </span>
                  <div className="text-xs text-orange-600 mt-1">Press 'C' to clear selection</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Story Management */}
          <div>
            <VotingSession
              currentStory={currentStory}
                      onStoryChange={(story) => {
                        // Immediately update local state
                        setCurrentStory(story);
                        if (database) {
                          try {
                            console.log('Updating Firebase story:', story);
                            set(ref(database, `rooms/${roomCode}/session/currentStory`), story).then(() => {
                              console.log('Firebase story update successful');
                            });
                          } catch (error) {
                            console.warn('Firebase story update failed:', error);
                          }
                        }
                      }}
              onReveal={handleReveal}
              onReset={handleReset}
              isRevealed={isRevealed}
              allVotesIn={allVotesIn}
              votingResults={votingResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;