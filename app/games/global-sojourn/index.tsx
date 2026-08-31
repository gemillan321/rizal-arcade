"use client";

import { useState, useEffect } from "react";
import { GameHeader } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import { globalSojournChallenges } from "./content";

export function GlobalSojournGame({ onClose }: GameProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4);
  const [streak, setStreak] = useState(0);
  const [route, setRoute] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const maxRounds = 6;

  // In production, shuffle and slice 6 items chronologically
  const currentChallenge = globalSojournChallenges[round - 1];

  const handleDrop = (e: React.DragEvent | null, selectedPlace: string) => {
    e?.preventDefault();
    
    if (selectedPlace === currentChallenge.place) {
      // Correct: Audio chime, animate route, stamp passport
      setScore(prev => prev + 100 + (streak * 20));
      setStreak(prev => prev + 1);
      setRoute([...route, selectedPlace]);
      setShowFeedback(true);
    } else {
      // Incorrect: Audio buzzer, camera shake, lose life
      setStreak(0);
      setLives(prev => prev - 1);
      if (lives - 1 <= 0) {
        setShowFeedback(true);
        setIsGameOver(true);
      }
    }
  };

  const nextRound = () => {
    setShowFeedback(false);
    if (round < maxRounds && !isGameOver) {
      setRound(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (isGameOver && !showFeedback) {
    return (
      <div className="p-8 text-center bg-[#f4ebd8] text-gray-900 min-h-screen">
        <h2 className="text-3xl font-bold font-serif mb-4">Journey Complete</h2>
        <p className="mb-4">Final Score: {score}</p>
        <p className="mb-8">Destinations Reached: {route.length} / {maxRounds}</p>
        <button onClick={onClose} className="px-6 py-2 bg-red-800 text-white rounded">Return to Arcade</button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] min-h-screen font-serif text-gray-800 flex flex-col items-center p-4">
      <GameHeader title="Global Sojourn" status={[{ label: "Score", value: String(score) }, { label: "Lives", value: String(lives) }]} onClose={onClose} />
      
      {/* 19th Century Map Container */}
      <div className="relative w-full max-w-4xl h-[50vh] bg-[#e2d5b8] border-4 border-[#8b7355] rounded-md shadow-inner overflow-hidden mb-6 bg-[url('/art/historical-map-bg.jpg')] bg-cover">
        
        {/* Render City Pins */}
        {globalSojournChallenges.map((city) => (
          <button
            key={city.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, city.place)}
            onClick={() => handleDrop(null, city.place)}
            className="absolute w-8 h-8 -ml-4 -mt-4 bg-red-600 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 focus:ring-4 focus:ring-yellow-400 z-10"
            style={{ top: city.coordinates.top, left: city.coordinates.left }}
            aria-label={`Drop or click to travel to ${city.place}`}
          >
            {route.includes(city.place) && <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full px-1">✓</span>}
          </button>
        ))}
      </div>

      {/* Travel Document / Archive Folder */}
      {!showFeedback ? (
        <div 
          draggable 
          onDragStart={(e) => e.dataTransfer.setData("text/plain", currentChallenge.id)}
          className="bg-[#fdfbf7] p-6 w-full max-w-2xl border border-[#d2c4a7] shadow-xl rounded cursor-grab active:cursor-grabbing"
        >
          <div className="border-b-2 border-red-800 pb-2 mb-4 flex justify-between uppercase text-sm tracking-widest text-red-900 font-bold">
            <span>Travel Document</span>
            <span>Stop {round} of {maxRounds}</span>
          </div>
          <p className="text-gray-500 text-sm mb-1">{currentChallenge.period}</p>
          <h3 className="text-xl font-bold mb-4">{currentChallenge.mission}</h3>
          <ul className="list-disc pl-5 text-gray-700">
            {currentChallenge.evidence.map((clue, idx) => <li key={idx}>{clue}</li>)}
          </ul>
          <p className="text-center mt-6 text-sm text-gray-400 italic">Drag this document to the correct map pin.</p>
        </div>
      ) : (
        <div className="bg-[#fdfbf7] p-6 w-full max-w-2xl border-4 border-green-800 shadow-xl rounded">
          <h3 className="text-2xl font-bold text-green-900 mb-2">Stamp Acquired: {currentChallenge.place}</h3>
          <p className="mb-4 text-gray-800">{currentChallenge.explanation}</p>
          <a href={currentChallenge.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline text-sm block mb-6">
            Source: {currentChallenge.source}
          </a>
          <button onClick={nextRound} className="w-full py-3 bg-green-800 text-white font-bold rounded shadow hover:bg-green-700">
            {isGameOver ? "View Final Route" : "Proceed to Next Destination"}
          </button>
        </div>
      )}
    </div>
  );
}
