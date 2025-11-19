"use client";
import { useState, useEffect } from "react";

const Room = ({ roomCode, userName, onLeave }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="auth-org-logo">
                <span className="text-4xl font-bold text-slate-800" aria-label="Interactant logo">Interactant</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-700">Planning Session</h1>
                <p className="text-slate-600">Session: <span className="font-mono text-lg bg-slate-50 text-slate-800 px-3 py-1 rounded border border-slate-200">{roomCode}</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(roomCode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                Copy Code
              </button>
              <button 
                onClick={onLeave}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <h2 className="text-xl font-medium text-slate-800 mb-6 text-center">Team Estimation - Test Mode</h2>
          
          <div className="text-center text-slate-600">
            <p>Welcome, {userName}!</p>
            <p>Session Room: {roomCode}</p>
            <p className="mt-4 text-sm">This is a simplified version for testing. Full functionality will be restored once debugging is complete.</p>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={onLeave}
              className="px-6 py-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors font-medium"
            >
              Leave Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;