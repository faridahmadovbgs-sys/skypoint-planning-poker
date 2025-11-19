"use client";
import { useState, useEffect } from "react";

const Room = ({ roomCode, userName, onLeave }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
          <h1>Interactant - Test Mode</h1>
          <p>Room: {roomCode}</p>
          <p>User: {userName}</p>
          <button onClick={onLeave}>Leave Session</button>
        </div>
      </div>
    </div>
  );
};

export default Room;