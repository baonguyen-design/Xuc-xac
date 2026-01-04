
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameIntensity, Player, GameState } from './types';
import { ACTIONS as DEFAULT_ACTIONS, BODY_PARTS as DEFAULT_BODY_PARTS, INTENSITY_COLORS } from './constants';
import Dice from './components/Dice';
import { getSpecialChallenge } from './services/geminiService';
import { Heart, Users, Flame, Play, RefreshCw, Sparkles, Plus, Trash2, ArrowRight, RotateCcw, Clock, Timer, Pause, Settings2, X, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    intensity: GameIntensity.MILD,
    lastResult: null,
    isRolling: false,
  });

  const [setupMode, setSetupMode] = useState(true);
  const [playerInput, setPlayerInput] = useState<string[]>(['Anh', 'Em']);
  const [aiChallenge, setAiChallenge] = useState<string | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  
  const [customActions, setCustomActions] = useState<Record<GameIntensity, string[]>>(DEFAULT_ACTIONS);
  const [customBodyParts, setCustomBodyParts] = useState<Record<GameIntensity, string[]>>(DEFAULT_BODY_PARTS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<GameIntensity>(GameIntensity.MILD);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const savedActions = localStorage.getItem('bondamour_actions');
    const savedBodyParts = localStorage.getItem('bondamour_bodyparts');
    if (savedActions) setCustomActions(JSON.parse(savedActions));
    if (savedBodyParts) setCustomBodyParts(JSON.parse(savedBodyParts));
  }, []);

  useEffect(() => {
    localStorage.setItem('bondamour_actions', JSON.stringify(customActions));
    localStorage.setItem('bondamour_bodyparts', JSON.stringify(customBodyParts));
  }, [customActions, customBodyParts]);

  const addPlayerField = () => {
    setPlayerInput([...playerInput, `P${playerInput.length + 1}`]);
  };

  const removePlayerField = (index: number) => {
    if (playerInput.length > 2) {
      const newList = [...playerInput];
      newList.splice(index, 1);
      setPlayerInput(newList);
    }
  };

  const handlePlayerInputChange = (index: number, value: string) => {
    const newList = [...playerInput];
    newList[index] = value;
    setPlayerInput(newList);
  };

  const handleUpdateItem = (type: 'action' | 'bodyPart', intensity: GameIntensity, index: number, value: string) => {
    if (type === 'action') {
      const newActions = { ...customActions };
      newActions[intensity][index] = value;
      setCustomActions(newActions);
    } else {
      const newParts = { ...customBodyParts };
      newParts[intensity][index] = value;
      setCustomBodyParts(newParts);
    }
  };

  const handleAddItem = (type: 'action' | 'bodyPart', intensity: GameIntensity) => {
    if (type === 'action') {
      const newActions = { ...customActions };
      newActions[intensity] = [...newActions[intensity], ''];
      setCustomActions(newActions);
    } else {
      const newParts = { ...customBodyParts };
      newParts[intensity] = [...newParts[intensity], ''];
      setCustomBodyParts(newParts);
    }
  };

  const handleRemoveItem = (type: 'action' | 'bodyPart', intensity: GameIntensity, index: number) => {
    if (type === 'action') {
      const newActions = { ...customActions };
      newActions[intensity] = newActions[intensity].filter((_, i) => i !== index);
      setCustomActions(newActions);
    } else {
      const newParts = { ...customBodyParts };
      newParts[intensity] = newParts[intensity].filter((_, i) => i !== index);
      setCustomBodyParts(newParts);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Khôi phục mặc định?')) {
      setCustomActions(DEFAULT_ACTIONS);
      setCustomBodyParts(DEFAULT_BODY_PARTS);
    }
  };

  const startGame = () => {
    const players: Player[] = playerInput.map((name, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim() || `P${i + 1}`,
    }));
    setGameState(prev => ({ ...prev, players, currentPlayerIndex: 0 }));
    setSetupMode(false);
  };

  const rollDice = useCallback(() => {
    if (gameState.isRolling) return;
    const currentActions = customActions[gameState.intensity];
    const currentBodyParts = customBodyParts[gameState.intensity];
    if (currentActions.length === 0 || currentBodyParts.length === 0) return;

    setGameState(prev => ({ ...prev, isRolling: true, lastResult: null }));
    setAiChallenge(null);
    setTimeLeft(null);
    setIsTimerRunning(false);

    setTimeout(() => {
      const action = currentActions[Math.floor(Math.random() * currentActions.length)];
      const bodyPart = currentBodyParts[Math.floor(Math.random() * currentBodyParts.length)];
      // Điều chỉnh durations trong khoảng 10 - 45 giây
      const durations = [10, 15, 20, 25, 30, 40, 45];
      const duration = durations[Math.floor(Math.random() * durations.length)];

      setGameState(prev => ({
        ...prev,
        isRolling: false,
        lastResult: { action, bodyPart, duration }
      }));
      setTimeLeft(duration);
    }, 1200);
  }, [gameState.intensity, gameState.isRolling, customActions, customBodyParts]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  const nextTurn = () => {
    setGameState(prev => ({ ...prev, currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length, lastResult: null }));
    setAiChallenge(null);
    setTimeLeft(null);
    setIsTimerRunning(false);
  };

  const generateAiChallenge = async () => {
    if (!gameState.lastResult) return;
    setIsLoadingChallenge(true);
    const p1 = gameState.players[gameState.currentPlayerIndex].name;
    const p2 = gameState.players[(gameState.currentPlayerIndex + 1) % gameState.players.length].name;
    const challenge = await getSpecialChallenge(gameState.intensity, p1, p2);
    setAiChallenge(challenge);
    setIsLoadingChallenge(false);
  };

  const resetGame = () => {
    setSetupMode(true);
    setGameState(prev => ({ ...prev, lastResult: null, currentPlayerIndex: 0 }));
    setAiChallenge(null);
  };

  const renderSetup = () => (
    <div className="w-full max-w-[340px] mx-auto space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="p-5 bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Thiết lập</h1>
            <p className="text-zinc-500 text-[10px] font-medium tracking-wide uppercase">Tùy chọn cuộc chơi</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              <Users className="w-3 h-3" /> Thành viên
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
              {playerInput.map((name, index) => (
                <div key={index} className="group relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handlePlayerInputChange(index, e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all text-xs"
                    placeholder={`P${index + 1}`}
                  />
                  {playerInput.length > 2 && (
                    <button onClick={() => removePlayerField(index)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addPlayerField} className="flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-zinc-700/50 rounded-lg text-zinc-500 hover:text-rose-400 transition-all text-[10px] font-bold bg-zinc-800/20">
                <Plus className="w-3 h-3" /> Thêm
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              <Flame className="w-3 h-3" /> Mức độ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(GameIntensity).map((level) => (
                <button
                  key={level}
                  onClick={() => setGameState({ ...gameState, intensity: level })}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all border-2
                    ${gameState.intensity === level 
                      ? `border-rose-500/50 bg-rose-500/10 text-rose-500` 
                      : 'border-zinc-800/50 bg-zinc-800/30 text-zinc-500 hover:border-zinc-700'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold
                ${showCustomizer ? 'bg-zinc-800/50 border-zinc-700 text-white' : 'bg-zinc-800/20 border-white/5 text-zinc-500'}`}
            >
              <span className="flex items-center gap-2"><Settings2 className="w-3.5 h-3.5" /> Tùy chỉnh kho dữ liệu</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${showCustomizer ? 'rotate-90' : ''}`} />
            </button>

            {showCustomizer && (
              <div className="mt-2 space-y-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 animate-in slide-in-from-top-1 duration-200">
                <div className="flex gap-1 border-b border-zinc-800/50 pb-1 overflow-x-auto custom-scrollbar">
                  {Object.values(GameIntensity).map((level) => (
                    <button key={level} onClick={() => setCustomizerTab(level)} className={`px-2 py-1 text-[9px] font-black whitespace-nowrap border-b ${customizerTab === level ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-600'}`}>
                      {level}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase">Hành động <button onClick={() => handleAddItem('action', customizerTab)}><Plus className="w-3 h-3 text-rose-500"/></button></div>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {customActions[customizerTab].map((item, i) => (
                        <div key={i} className="flex gap-1"><input type="text" value={item} onChange={(e) => handleUpdateItem('action', customizerTab, i, e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-[10px] text-zinc-300"/><button onClick={() => handleRemoveItem('action', customizerTab, i)} className="p-1 text-zinc-600 hover:text-rose-500"><X className="w-3 h-3"/></button></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase">Vị trí <button onClick={() => handleAddItem('bodyPart', customizerTab)}><Plus className="w-3 h-3 text-rose-500"/></button></div>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {customBodyParts[customizerTab].map((item, i) => (
                        <div key={i} className="flex gap-1"><input type="text" value={item} onChange={(e) => handleUpdateItem('bodyPart', customizerTab, i, e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-[10px] text-zinc-300"/><button onClick={() => handleRemoveItem('bodyPart', customizerTab, i)} className="p-1 text-zinc-600 hover:text-rose-500"><X className="w-3 h-3"/></button></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center"><button onClick={resetToDefaults} className="text-[8px] font-black text-zinc-600 hover:text-rose-400">KHÔI PHỤC MẶC ĐỊNH</button></div>
              </div>
            )}
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm tracking-widest uppercase"
          >
            BẮT ĐẦU
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const targetPlayer = gameState.players[(gameState.currentPlayerIndex + 1) % gameState.players.length];
    const colorClass = INTENSITY_COLORS[gameState.intensity];

    return (
      <div className="w-full max-w-[340px] mx-auto animate-in fade-in duration-700 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <button onClick={resetGame} className="flex items-center gap-1.5 text-zinc-600 hover:text-rose-400 text-[8px] font-black tracking-widest uppercase transition-colors">
            <RotateCcw className="w-3 h-3" /> THOÁT
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 rounded-full border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-gradient-to-r ${colorClass}`} />
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{gameState.intensity}</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-rose-400/80 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Đến lượt</span>
          <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
            {currentPlayer.name}
          </h2>
          <p className="text-zinc-500 text-xs">
            với <span className="text-white font-bold">{targetPlayer.name}</span>
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <Dice label="Hành động" value={gameState.lastResult?.action || '...'} isRolling={gameState.isRolling} color={colorClass}/>
          <Dice label="Vị trí" value={gameState.lastResult?.bodyPart || '...'} isRolling={gameState.isRolling} color={colorClass}/>
        </div>

        <div className="flex flex-col items-center mb-6">
           <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-2">Thời gian</span>
           <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 ${gameState.isRolling ? 'border-zinc-800' : 'border-rose-500/20'} transition-all duration-500`}>
              <div className={`absolute inset-0 rounded-full bg-rose-500/5 blur-lg ${isTimerRunning ? 'opacity-100' : 'opacity-0'}`} />
              <div className="flex flex-col items-center z-10">
                 <span className="text-2xl font-black text-white tabular-nums">
                   {gameState.isRolling ? '--' : `${timeLeft ?? gameState.lastResult?.duration ?? 0}s`}
                 </span>
                 {gameState.lastResult && !gameState.isRolling && (
                   <button onClick={toggleTimer} className="mt-1 p-1 bg-white/5 hover:bg-white/10 rounded-full active:scale-90">
                     {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-white fill-current" /> : <Timer className="w-3.5 h-3.5 text-white" />}
                   </button>
                 )}
              </div>
              {timeLeft === 0 && <span className="absolute -bottom-4 text-rose-500 text-[8px] font-black animate-bounce">HẾT GIỜ!</span>}
           </div>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          {!gameState.lastResult && !gameState.isRolling && (
            <button
              onClick={rollDice}
              className={`w-full py-4 bg-gradient-to-r ${colorClass} text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg tracking-widest`}
            >
              <RefreshCw className="w-5 h-5" /> LẮC XÚC XẮC
            </button>
          )}

          {gameState.lastResult && (
            <div className="w-full flex flex-col gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-full bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] p-5 border border-white/5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-rose-400 font-black uppercase text-[8px] tracking-[0.2em]">
                    <Sparkles className="w-3.5 h-3.5" /> Gợi ý đặc biệt
                  </h3>
                  {!aiChallenge && !isLoadingChallenge && (
                    <button onClick={generateAiChallenge} className="text-[8px] bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-3 py-1 rounded-lg font-black transition-all border border-rose-500/20">
                      Ý TƯỞNG AI
                    </button>
                  )}
                </div>
                
                <div className="min-h-[60px] flex items-center justify-center text-center">
                  {isLoadingChallenge ? (
                    <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-100" /><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-200" /></div>
                  ) : aiChallenge ? (
                    <p className="text-zinc-200 text-sm italic font-medium">"{aiChallenge}"</p>
                  ) : (
                    <p className="text-white text-base font-bold uppercase tracking-tight">
                      {gameState.lastResult.action} <span className="text-rose-400 text-[10px] font-normal lowercase mx-1">vào</span> {gameState.lastResult.bodyPart}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={nextTurn}
                className="w-full py-3.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-xs tracking-widest border border-white/5"
              >
                LƯỢT TIẾP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-rose-500/30 overflow-hidden flex flex-col justify-center items-center">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-rose-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full px-4 flex flex-col items-center max-h-screen overflow-y-auto custom-scrollbar py-6">
        <header className="mb-6 text-center animate-in fade-in slide-in-from-top-2 duration-700">
          <h1 className="text-4xl md:text-5xl font-accent bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-1">
            BondAmour
          </h1>
          <p className="text-zinc-700 text-[7px] font-black tracking-[0.5em] uppercase opacity-60">
            CONNECT • FEEL • LOVE
          </p>
        </header>

        <div className="w-full flex justify-center">
          {setupMode ? renderSetup() : renderGame()}
        </div>
      </main>

      <footer className="relative z-20 py-4 text-center opacity-40">
        <p className="text-rose-900/50 text-[7px] uppercase tracking-[0.2em] font-bold">
          Design by <span className="text-rose-900/70">Nguyen Chi Bao</span>
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        @font-face {
          font-family: 'Dancing Script';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/dancingscript/v25/If2cXEE97JyP_tNf8z0qviFzXhgG06WDjGv2f0eFh9X9.woff2) format('woff2');
        }
      `}</style>
    </div>
  );
};

export default App;
