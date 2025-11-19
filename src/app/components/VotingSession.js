"use client";
import { useState, useEffect } from "react";

const VotingSession = ({ 
  currentStory, 
  onStoryChange, 
  onReveal, 
  onReset, 
  isRevealed, 
  allVotesIn,
  votingResults 
}) => {
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [editingStory, setEditingStory] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyInput, setStoryInput] = useState('');
  const [newStoryInput, setNewStoryInput] = useState('');
  const [editInput, setEditInput] = useState('');

  useEffect(() => {
    if (stories.length === 0) {
      setStories([{ id: 1, title: '', points: null, isCompleted: false }]);
    }
  }, []);

  useEffect(() => {
    if (stories[currentStoryIndex]) {
      setStoryInput(stories[currentStoryIndex].title);
      onStoryChange(stories[currentStoryIndex].title);
    }
  }, [currentStoryIndex, stories]);

  const handleStorySubmit = () => {
    const updatedStories = [...stories];
    updatedStories[currentStoryIndex] = {
      ...updatedStories[currentStoryIndex],
      title: storyInput
    };
    setStories(updatedStories);
    onStoryChange(storyInput);
    setEditingStory(false);
  };

  const handleAddNewStory = () => {
    if (newStoryInput.trim()) {
      const newStory = {
        id: stories.length + 1,
        title: newStoryInput.trim(),
        points: null,
        isCompleted: false
      };
      setStories([...stories, newStory]);
      setNewStoryInput('');
    }
  };

  const handleSelectStory = (index) => {
    setCurrentStoryIndex(index);
    setEditingStory(false);
    setEditingStoryId(null);
  };

  const handleEditStory = (storyId, currentTitle, e) => {
    e.stopPropagation();
    setEditingStoryId(storyId);
    setEditInput(currentTitle);
  };

  const handleSaveEdit = (storyId) => {
    const updatedStories = stories.map(story => 
      story.id === storyId ? { ...story, title: editInput.trim() } : story
    );
    setStories(updatedStories);
    setEditingStoryId(null);
    setEditInput('');
  };

  const handleCancelEdit = () => {
    setEditingStoryId(null);
    setEditInput('');
  };

  const handleDeleteStory = (storyId, e) => {
    e.stopPropagation();
    const updatedStories = stories.filter(story => story.id !== storyId);
    setStories(updatedStories);
    
    // Adjust current story index if necessary
    if (currentStoryIndex >= updatedStories.length) {
      setCurrentStoryIndex(Math.max(0, updatedStories.length - 1));
    }
  };

  const handleCompleteStory = () => {
    const average = calculateAverage();
    const updatedStories = [...stories];
    updatedStories[currentStoryIndex] = {
      ...updatedStories[currentStoryIndex],
      points: parseFloat(average),
      isCompleted: true
    };
    setStories(updatedStories);
    onReset();
  };

  const calculateAverage = () => {
    const numericVotes = votingResults
      .filter(vote => vote.value !== '?' && vote.value !== 'coffee')
      .map(vote => vote.value === '1/2' ? 0.5 : parseFloat(vote.value))
      .filter(vote => !isNaN(vote));
    
    if (numericVotes.length === 0) return 0;
    
    const average = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
    
    // Round to nearest Fibonacci-like value used in planning poker
    const fibSequence = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
    return fibSequence.reduce((prev, curr) => 
      Math.abs(curr - average) < Math.abs(prev - average) ? curr : prev
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
      <h2 className="text-xl font-medium mb-4 text-neutral-800">Project Backlog</h2>
      
      {/* Story List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {stories.map((story, index) => (
          <div 
            key={story.id}
            onClick={() => editingStoryId !== story.id && handleSelectStory(index)}
            className={`group p-3 rounded-md border cursor-pointer transition-all ${
              index === currentStoryIndex 
                ? 'border-orange-500 bg-orange-50' 
                : story.isCompleted 
                  ? 'border-green-500 bg-green-50'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white'
            } ${editingStoryId === story.id ? 'cursor-default' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingStoryId === story.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editInput.trim()) {
                          e.preventDefault();
                          handleSaveEdit(story.id);
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelEdit();
                        }
                      }}
                      className="w-full p-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                      placeholder="Edit story title... (Enter to save, Esc to cancel)"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(story.id)}
                        className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 text-xs border border-neutral-300 text-neutral-600 rounded hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-neutral-800 pr-2">
                      {story.title || `Story ${story.id}`}
                    </p>
                    {story.isCompleted && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {story.points} story points
                      </p>
                    )}
                    {index === currentStoryIndex && !story.isCompleted && (
                      <p className="text-xs text-orange-600 mt-1">Currently estimating</p>
                    )}
                  </>
                )}
              </div>
              {editingStoryId !== story.id && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditStory(story.id, story.title, e)}
                    className="p-1 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                    title="Edit item"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {stories.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteStory(story.id, e)}
                      className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete item"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Story */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={newStoryInput}
          onChange={(e) => setNewStoryInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newStoryInput.trim()) {
              e.preventDefault();
              handleAddNewStory();
            }
          }}
          className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
          placeholder="Add new backlog item... (Press Enter to add)"
        />
        <button
          onClick={handleAddNewStory}
          disabled={!newStoryInput.trim()}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors shadow-sm"
        >
          + Add Item
        </button>
      </div>

      {/* Current Item Details */}
      <div className="border-t border-orange-200 pt-4">
        <h3 className="font-medium mb-2 text-neutral-800">Current Item</h3>
        {editingStory ? (
          <div className="space-y-2">
            <textarea
              value={storyInput}
              onChange={(e) => setStoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && storyInput.trim()) {
                  e.preventDefault();
                  handleStorySubmit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setEditingStory(false);
                  setStoryInput(stories[currentStoryIndex]?.title || '');
                }
              }}
              className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
              rows={3}
              placeholder="Enter backlog item details... (Ctrl+Enter to save, Esc to cancel)"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleStorySubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingStory(false);
                  setStoryInput(stories[currentStoryIndex]?.title || '');
                }}
                className="px-4 py-2 bg-neutral-400 text-white rounded-md hover:bg-neutral-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setEditingStory(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditingStory(true);
              }
            }}
            tabIndex={0}
            className="p-3 bg-orange-50 rounded-md cursor-pointer hover:bg-white transition-colors min-h-[60px] flex items-center border border-orange-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {stories[currentStoryIndex]?.title || (
              <span className="text-neutral-500 italic">Click or press Enter to edit item details...</span>
            )}
          </div>
        )}
      </div>

      {isRevealed && votingResults.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 rounded-md border border-orange-200 shadow-sm">
          <h3 className="font-medium mb-3 text-orange-800">Estimation Results</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {votingResults.map((result, index) => (
              <div key={index} className="bg-white px-3 py-2 rounded-md border border-neutral-200 shadow-sm">
                <span className="font-medium text-neutral-700">{result.userName}:</span>
                <span className="ml-2 font-semibold text-orange-700 text-base">
                  {result.value === 'coffee' ? 'Skip' : 
                   result.value === '1/2' ? '½' : result.value}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-orange-700 bg-white p-3 rounded-md border border-orange-200">
            Consensus: <span className="font-semibold text-base">{calculateAverage()}</span> story points
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {!isRevealed && allVotesIn && (
          <button
            onClick={onReveal}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 font-bold shadow-lg transform hover:scale-105"
          >
            🎭 Reveal All Cards
          </button>
        )}
        
        {isRevealed && (
          <div className="flex gap-2 w-full">
            <button
              onClick={handleCompleteStory}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 font-bold shadow-lg transform hover:scale-105"
            >
              ✅ Complete Story
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all duration-300 font-bold shadow-lg transform hover:scale-105"
            >
              🔄 Re-vote
            </button>
          </div>
        )}
        
        {!allVotesIn && !isRevealed && (
          <div className="px-8 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 rounded-lg font-semibold shadow-md">
            ⏳ Waiting for all players...
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingSession;