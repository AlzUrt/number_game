import React, { useState, useEffect } from 'react';
import BG from '../assets/BG.png';

const fonts = ['Roboto', 'Absolute DB', 'Usuals'];
const fontStyles = [
  { fontStyle: 'normal', fontWeight: 'normal', textDecoration: 'none' },
  { fontStyle: 'italic', fontWeight: 'normal', textDecoration: 'none' },
  { fontStyle: 'normal', fontWeight: 'bold', textDecoration: 'none' },
  { fontStyle: 'italic', fontWeight: 'bold', textDecoration: 'none' },
  { fontStyle: 'normal', fontWeight: 'normal', textDecoration: 'underline' }
];

const TIMER_DURATION = 20;

const NumberGame = () => {
  // ... autres states identiques ...
  const [numbers, setNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scores, setScores] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });

  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    setIsTransitioning(false);

    if (numbers.length === 0) {
      const shuffledNumbers = Array.from({ length: 99 }, (_, index) => index + 1)
        .sort(() => Math.random() - 0.5);

      const initialNumbers = shuffledNumbers.map((value, index) => {
        const row = Math.floor(index / 11);
        const col = index % 11;
        const randomStyle = fontStyles[Math.floor(Math.random() * fontStyles.length)];
        const rotation = Math.random() * 360 - 180;
        
        return {
          value: value,
          isHovered: false,
          top: (row * 8) + Math.random() * 2 + 15,
          left: (col * 8) + Math.random() * 2 + 10,
          size: Math.random() * 40 + 30,
          rotation: rotation,
          font: fonts[Math.floor(Math.random() * fonts.length)],
          fontStyle: value === 6 || value === 9 ? 'normal' : randomStyle.fontStyle,
          fontWeight: value === 6 || value === 9 ? 'normal' : randomStyle.fontWeight,
          textDecoration: value === 6 || value === 9 ? 'underline' : randomStyle.textDecoration,
        };
      });
      
      setNumbers(initialNumbers);
    } else if (level === 4) { // Changé de 3 à 4 pour le dernier niveau
      const orderedNumbers = Array.from({ length: 41 }, (_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const value = index + 1;
        
        return {
          value: value,
          isHovered: false,
          top: (row * 12) + Math.random() * 4 + 20,
          left: (col * 12) + Math.random() * 4 + 6,
          size: 50,
          rotation: 0,
          font: 'Roboto',
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: value === 6 || value === 9 ? 'underline' : 'none',
        };
      });
      
      setNumbers(orderedNumbers);
    } else {
      const resetNumbers = numbers.map(num => ({
        ...num,
        isHovered: false
      }));
      setNumbers(resetNumbers);
    }
    setCurrentNumber(1);
  }, [level]);

  // Timer reste identique
  useEffect(() => {
    if (!isTransitioning && timeLeft > 0 && !gameWon) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !gameWon && !isTransitioning) {
      handleLevelEnd();
    }
  }, [timeLeft, isTransitioning, gameWon]);

  const handleLevelEnd = () => {
    setIsTransitioning(true);
    
    setScores(prev => ({
      ...prev,
      [level]: currentNumber - 1
    }));

    if (level < 4) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
      }, 2000);
    } else {
      setGameWon(true);
    }
  };

  const handleHover = (number) => {
    if (number.value === currentNumber && !number.isHovered && timeLeft > 0 && !isTransitioning) {
      const updatedNumbers = numbers.map(num =>
        num.value === number.value
          ? { ...num, isHovered: true }
          : num
      );
      setNumbers(updatedNumbers);
      
      if (number.value === 41) {
        setScores(prev => ({
          ...prev,
          [level]: 41
        }));
        
        handleLevelEnd();
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden"
         style={{
           backgroundImage: `url(${BG})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Timer */}
      <div className="absolute top-4 right-4 z-20">
        <div className="text-white px-4 py-2 rounded-lg text-6xl font-bold">
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Game container for numbers */}
      <div className="relative w-full h-full">
        {numbers.map((number) => {
          const isActive = level === 1 || number.value <= 41;
          const isNextNumber = level === 3 && number.value === currentNumber;
          
          return (
            <div
              key={number.value}
              style={{
                position: 'absolute',
                top: `${number.top}%`,
                left: `${number.left}%`,
                transform: `translate(-50%, -50%) rotate(${number.rotation}deg)`,
                opacity: isActive ? 1 : 0,
                backgroundColor: number.isHovered 
                  ? '#22c55e' 
                  : isNextNumber 
                    ? 'rgba(255, 255, 0, 0.3)' 
                    : 'transparent',
                color: number.isHovered ? 'white' : 'black',
                width: `${number.size}px`,
                height: `${number.size}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: number.font,
                fontSize: `${number.size * 0.7}px`,
                fontStyle: number.fontStyle,
                fontWeight: number.fontWeight,
                textDecoration: number.textDecoration,
                cursor: (isActive && !isTransitioning) ? 'pointer' : 'default',
                pointerEvents: (isActive && !isTransitioning) ? 'auto' : 'none',
                transition: 'all 0.5s ease-in-out',
                textShadow: number.isHovered ? 'none' : '0px 0px 4px rgba(255,255,255,0.8)',
              }}
              className="hover:scale-105"
              onMouseEnter={() => isActive && handleHover(number)}
            >
              {number.value}
            </div>
          );
        })}
      </div>

      {/* Level transition message */}
      {isTransitioning && level < 4 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-blue-500 text-white px-8 py-6 rounded-xl">
            <p className="text-2xl font-bold text-center">
              {timeLeft === 0 ? "Time's up!" : "Level Complete!"} 
              <br />
              Numbers found: {currentNumber - 1}
              <br />
              Moving to Level {level + 1}...
            </p>
          </div>
        </div>
      )}

      {/* Victory message with scores */}
      {gameWon && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-green-500 text-white px-8 py-6 rounded-xl">
            <p className="text-2xl font-bold text-center mb-4">
              Game Complete!
            </p>
            <div className="text-lg">
              <p>Level 1: {scores[1]} numbers found</p>
              <p>Level 2: {scores[2]} numbers found</p>
              <p>Level 3: {scores[3]} numbers found</p>
              <p>Level 4: {scores[4]+1} numbers found</p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberGame;