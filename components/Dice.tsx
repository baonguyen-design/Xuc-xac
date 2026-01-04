
import React, { useEffect, useState, useRef } from 'react';

interface DiceProps {
  label: string;
  value: string;
  isRolling: boolean;
  color: string;
}

const Dice: React.FC<DiceProps> = ({ label, value, isRolling, color }) => {
  const [shouldShake, setShouldShake] = useState(false);
  const rollAudio = useRef<HTMLAudioElement | null>(null);
  const impactAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    rollAudio.current = new Audio('https://www.soundjay.com/misc/sounds/dice-roll-1.mp3');
    impactAudio.current = new Audio('https://www.soundjay.com/misc/sounds/dice-throw-1.mp3');
    
    if (rollAudio.current) {
        rollAudio.current.loop = true;
        rollAudio.current.volume = 0.2;
    }
    if (impactAudio.current) {
        impactAudio.current.volume = 0.4;
    }
  }, []);

  useEffect(() => {
    if (isRolling) {
      if (rollAudio.current) {
          rollAudio.current.currentTime = 0;
          rollAudio.current.play().catch(() => {});
      }
    } else {
      if (rollAudio.current) {
          rollAudio.current.pause();
      }
      
      if (value !== '...' && value !== '') {
        if (impactAudio.current) {
            impactAudio.current.currentTime = 0;
            impactAudio.current.play().catch(() => {});
        }
        setShouldShake(true);
        const timer = setTimeout(() => setShouldShake(false), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isRolling, value]);

  const colorClasses = {
    'from-pink-400 to-rose-400': { bg: 'bg-rose-500', shadow: 'shadow-rose-500/30' },
    'from-rose-500 to-red-500': { bg: 'bg-red-600', shadow: 'shadow-red-600/30' },
    'from-red-600 to-purple-800': { bg: 'bg-purple-800', shadow: 'shadow-purple-900/30' },
    'from-purple-700 via-fuchsia-900 to-zinc-950': { bg: 'bg-fuchsia-950', shadow: 'shadow-fuchsia-950/40' }
  }[color] || { bg: 'bg-zinc-800', shadow: 'shadow-black/40' };

  return (
    <div className="flex flex-col items-center w-full">
      <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-3">
        {label}
      </span>
      
      <div className={`dice-scene ${shouldShake ? 'animate-dice-shake' : ''}`}>
        <div className={`dice-cube ${isRolling ? 'rolling' : 'settled'}`}>
          <div className={`face front ${colorClasses.bg} ${colorClasses.shadow} border border-white/20 flex flex-col items-center justify-center p-2`}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <span className="text-white font-bold text-[11px] leading-tight text-center z-10 break-words w-full">
              {isRolling ? '?' : value}
            </span>
          </div>
          <div className={`face back ${colorClasses.bg} opacity-80`} />
          <div className={`face right ${colorClasses.bg} opacity-70`} />
          <div className={`face left ${colorClasses.bg} opacity-70`} />
          <div className={`face top ${colorClasses.bg} opacity-90`} />
          <div className={`face bottom ${colorClasses.bg} opacity-60`} />
        </div>
      </div>

      <style>{`
        .dice-scene {
          width: 80px;
          height: 80px;
          perspective: 800px;
        }

        @media (min-width: 768px) {
          .dice-scene {
            width: 100px;
            height: 100px;
          }
        }

        .dice-cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dice-cube.rolling {
          animation: spin 0.4s linear infinite;
        }

        .dice-cube.settled {
          transform: rotateX(0deg) rotateY(0deg);
        }

        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.2);
          backface-visibility: hidden;
        }

        .front  { transform: rotateY(0deg) translateZ(40px); }
        .back   { transform: rotateY(180deg) translateZ(40px); }
        .right  { transform: rotateY(90deg) translateZ(40px); }
        .left   { transform: rotateY(-90deg) translateZ(40px); }
        .top    { transform: rotateX(90deg) translateZ(40px); }
        .bottom { transform: rotateX(-90deg) translateZ(40px); }

        @media (min-width: 768px) {
          .front  { transform: rotateY(0deg) translateZ(50px); }
          .back   { transform: rotateY(180deg) translateZ(50px); }
          .right  { transform: rotateY(90deg) translateZ(50px); }
          .left   { transform: rotateY(-90deg) translateZ(50px); }
          .top    { transform: rotateX(90deg) translateZ(50px); }
          .bottom { transform: rotateX(-90deg) translateZ(50px); }
        }

        @keyframes spin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(180deg); }
        }

        @keyframes dice-shake {
          0%, 100% { transform: translateX(0) scale(1); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(3deg); }
          50% { transform: scale(1.05); }
        }

        .animate-dice-shake {
          animation: dice-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Dice;
