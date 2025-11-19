"use client";
import { useState, useEffect } from "react";
import Room from "./components/Room";

export default function Home() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'create', 'join'
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');

  // Handle URL parameters for direct join links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const joinCode = urlParams.get('join');
      const nameParam = urlParams.get('name');
      
      if (joinCode) {
        setRoomCode(joinCode.toUpperCase());
        setCurrentView('join');
        if (nameParam) {
          setUserName(nameParam);
        }
      }
    }
  }, []);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (userName.trim()) {
      const newRoomCode = generateRoomCode();
      setRoomCode(newRoomCode);
      setCurrentView('room');
    }
  };

  const handleJoinRoom = () => {
    console.log('Join room clicked:', { userName: userName.trim(), roomCode: roomCode.trim() });
    if (userName.trim() && roomCode.trim()) {
      console.log('Conditions met, joining room...');
      setCurrentView('room');
    } else {
      console.log('Join failed - missing data:', { hasName: !!userName.trim(), hasCode: !!roomCode.trim() });
    }
  };

  if (currentView === 'room') {
    return (
      <Room 
        roomCode={roomCode} 
        userName={userName}
        onLeave={() => {
          setCurrentView('home');
          setRoomCode('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-2 drop-shadow-2xl">
            <span className="bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700 bg-clip-text text-transparent tracking-wide">
              SkyPoint
            </span>
          </h1>
          <p className="text-neutral-600 text-lg font-semibold">Agile Estimation for Development Teams</p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 via-orange-400 to-blue-500 mx-auto mt-4 rounded-full shadow-lg"></div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6 border border-slate-200">
          {currentView === 'home' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userName.trim()) {
                      if (currentView === 'home') {
                        setCurrentView('create');
                      } else if (currentView === 'create') {
                        handleCreateRoom();
                      } else if (currentView === 'join') {
                        handleJoinRoom();
                      }
                    }
                  }}
                  className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm text-neutral-900"
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentView('create')}
                  disabled={!userName.trim()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userName.trim()) {
                      e.preventDefault();
                      setCurrentView('create');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-md font-semibold hover:from-orange-400 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  + Create New Session
                </button>
                
                <button
                  onClick={() => setCurrentView('join')}
                  disabled={!userName.trim()}
                  className="w-full border border-neutral-300 text-neutral-700 py-3 px-4 rounded-md font-semibold hover:bg-neutral-50 hover:border-neutral-400 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  Join Existing Session
                </button>
              </div>
            </>
          )}

          {currentView === 'create' && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Create Planning Session</h2>
                <p className="text-neutral-600 mb-6">A unique session code will be generated for your team</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleCreateRoom}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateRoom();
                    }
                  }}
                  autoFocus
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-md font-semibold hover:from-orange-400 hover:to-orange-500 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Create Session (Press Enter)
                </button>
                
                <button
                  onClick={() => setCurrentView('home')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCurrentView('home');
                    }
                  }}
                  className="w-full border border-neutral-300 text-neutral-600 py-3 px-4 rounded-md font-medium hover:bg-neutral-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  ← Back
                </button>
              </div>
            </>
          )}

          {currentView === 'join' && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Join Planning Session</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim() && roomCode.trim()) {
                        e.preventDefault();
                        handleJoinRoom();
                      }
                    }}
                    className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm text-neutral-900"
                    placeholder="Enter your name"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Session Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim() && roomCode.trim() && roomCode.length >= 6) {
                        e.preventDefault();
                        handleJoinRoom();
                      }
                    }}
                    className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-widest font-mono bg-white shadow-sm text-neutral-900"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                </div>
                
                <button
                  onClick={handleJoinRoom}
                  disabled={!userName.trim() || !roomCode.trim() || roomCode.length < 6}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userName.trim() && roomCode.trim()) {
                      e.preventDefault();
                      handleJoinRoom();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-md font-semibold hover:from-orange-400 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Join Session (Press Enter)
                </button>
                
                <button
                  onClick={() => setCurrentView('home')}
                  className="w-full border border-slate-300 text-slate-600 py-3 px-4 rounded-md font-medium hover:bg-slate-50 transition-all duration-200"
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-sm text-neutral-500">
          <p>Professional Planning & Estimation</p>
          <p className="text-xs mt-1 text-neutral-400">Collaborate • Estimate • Deliver</p>
        </div>
      </div>
    </div>
  );
}