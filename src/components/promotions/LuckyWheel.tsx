"use client";

import { useState } from "react";
import { Loader2, PartyPopper } from "lucide-react";

interface LuckyWheelProps {
  onSpin: () => Promise<string | null>; // Returns the prize won
  onFinish: (prize: string) => void;
  color: string;
}

const PRIZES = ["2% Off", "5% Off", "10% Off", "Free Lipstick", "Free Makeup"];
const SLICE_ANGLE = 360 / PRIZES.length;

export function LuckyWheel({ onSpin, onFinish, color }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const prize = await onSpin();
    
    if (!prize) {
      setIsSpinning(false);
      return; // Failed to spin or not eligible
    }

    const prizeIndex = PRIZES.indexOf(prize);
    if (prizeIndex === -1) {
      setIsSpinning(false);
      return;
    }

    // Calculate rotation to land on the prize
    // The pointer is at the top (0 degrees).
    // The prize's center is at: prizeIndex * SLICE_ANGLE + SLICE_ANGLE / 2
    // To bring it to the top, we need to rotate: 360 - (prize's center)
    // Add multiple full rotations (e.g., 5 spins = 5 * 360 = 1800)
    
    const targetAngle = 360 - (prizeIndex * SLICE_ANGLE + SLICE_ANGLE / 2);
    const totalRotation = rotation + 1800 + (targetAngle - (rotation % 360));

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      setTimeout(() => onFinish(prize), 2500); // Wait for a bit then finish
    }, 4000); // Spin duration matches CSS transition
  };

  // Generate conic gradient colors based on the theme color
  // We'll alternate between the primary color and white/gray
  const colors = [
    color,
    "#f3f4f6", // gray-100
    color,
    "#f3f4f6",
    color
  ];

  const gradient = PRIZES.map((_, i) => {
    const start = i * SLICE_ANGLE;
    const end = (i + 1) * SLICE_ANGLE;
    return `${colors[i]} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 my-8">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-slate-800 drop-shadow-md">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L22 20H2L12 2Z" />
          </svg>
        </div>

        {/* Wheel Container */}
        <div 
          className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden"
          style={{
            transition: "transform 4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(from 0deg, ${gradient})`
          }}
        >
          {/* Slices and Text */}
          {PRIZES.map((prize, i) => {
            const angle = i * SLICE_ANGLE + SLICE_ANGLE / 2;
            const isDarkBg = colors[i] === color;
            return (
              <div 
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`
                }}
              >
                <div 
                  className={`pt-6 text-center font-bold text-sm sm:text-base ${isDarkBg ? 'text-white' : 'text-slate-800'}`}
                >
                  {prize}
                </div>
              </div>
            );
          })}
          
          {/* Inner Circle for aesthetics */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-slate-800 shadow-inner z-20"></div>
        </div>
      </div>

      {wonPrize ? (
        <div className="text-center animate-in zoom-in fade-in duration-500">
          <div className="flex items-center justify-center gap-2 text-2xl font-black text-green-600 mb-2">
            <PartyPopper className="w-8 h-8" />
            <span>YOU WON!</span>
            <PartyPopper className="w-8 h-8" />
          </div>
          <p className="text-xl font-bold text-slate-800 bg-green-100 px-6 py-2 rounded-full inline-block">
            {wonPrize}
          </p>
        </div>
      ) : (
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold px-12 py-4 rounded-full shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSpinning && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSpinning ? "SPINNING..." : "SPIN NOW!"}
        </button>
      )}
    </div>
  );
}
