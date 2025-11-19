"use client";

const EstimationCard = ({ value, isSelected, onSelect, isRevealed, disabled }) => {
  const getCardDisplay = (value) => {
    switch (value) {
      case '1/2': return '½';
      case '?': return '?';
      case 'coffee': return 'Skip';
      default: return value;
    }
  };

  const getCardStyles = () => {
    if (disabled) {
      return 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200 shadow-sm';
    }
    
    if (isSelected) {
      return 'bg-orange-500 text-white border-orange-500 shadow-lg ring-2 ring-orange-300 transform scale-105';
    }

    // Color scheme: smaller values blue, larger values orange
    const blueValues = ['1/2', '1', '2', '3'];
    const orangeValues = ['20', '40', '100'];
    const greenValues = ['5', '8', '13'];
    
    if (blueValues.includes(value)) {
      return 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:shadow-lg hover:transform hover:scale-105 shadow-md';
    } else if (orangeValues.includes(value)) {
      return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:shadow-lg hover:transform hover:scale-105 shadow-md';
    } else if (greenValues.includes(value)) {
      return 'bg-green-500 text-white border-green-500 hover:bg-green-600 hover:shadow-lg hover:transform hover:scale-105 shadow-md';
    } else if (value === '?') {
      return 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600 hover:shadow-lg hover:transform hover:scale-105 shadow-md';
    } else {
      return 'bg-neutral-600 text-white border-neutral-600 hover:bg-neutral-700 hover:shadow-lg hover:transform hover:scale-105 shadow-md';
    }
  };

  const getSuitSymbol = () => {
    // Remove suit symbols for professional healthcare appearance
    return '';
  };

  const isSpecialCard = value === '?' || value === 'coffee' || value === '1/2';

  return (
    <button
      onClick={() => !disabled && onSelect(value)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onSelect(value);
        }
      }}
      disabled={disabled}
      className={`
        relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 
        ${getCardStyles()}
        transition-all duration-200 ease-in-out
        ${!disabled ? 'cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400' : ''}
        flex flex-col items-center justify-center
        font-bold text-sm sm:text-base
        m-1
      `}
    >
      {/* Always show card value */}
      <div className="flex items-center justify-center text-base sm:text-lg font-bold">
        {getCardDisplay(value)}
      </div>
    </button>
  );
};

export default EstimationCard;