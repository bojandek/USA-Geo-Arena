// Jednostavno state management za igru (lokalno sa localStorage)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GameState {
  // User progress
  level: number;
  totalScore: number;
  streak: number;
  lastPlayedDate: string | null;
  badges: string[];
  
  // Daily challenge
  dailyCompleted: boolean;
  dailyScore: number;
  
  // Stats
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
}

interface GameContextType extends GameState {
  updateScore: (score: number) => void;
  completeDaily: (score: number) => void;
  checkStreak: () => void;
  addBadge: (badge: string) => void;
  resetDaily: () => void;
}

const defaultState: GameState = {
  level: 1,
  totalScore: 0,
  streak: 0,
  lastPlayedDate: null,
  badges: [],
  dailyCompleted: false,
  dailyScore: 0,
  gamesPlayed: 0,
  bestScore: 0,
  averageScore: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('geoarena-storage');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('geoarena-storage', JSON.stringify(state));
  }, [state]);

  const updateScore = (score: number) => {
    setState(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      level: Math.floor((prev.totalScore + score) / 5000) + 1,
    }));
  };

  const completeDaily = (score: number) => {
    setState(prev => {
      const newGamesPlayed = prev.gamesPlayed + 1;
      const newTotalScore = prev.totalScore + score;
      return {
        ...prev,
        dailyCompleted: true,
        dailyScore: score,
        gamesPlayed: newGamesPlayed,
        totalScore: newTotalScore,
        bestScore: Math.max(prev.bestScore, score),
        averageScore: Math.round(newTotalScore / newGamesPlayed),
        lastPlayedDate: new Date().toISOString(),
      };
    });
  };

  const checkStreak = () => {
    setState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastPlayed = prev.lastPlayedDate
        ? new Date(prev.lastPlayedDate).toISOString().split('T')[0]
        : null;

      if (!lastPlayed) return { ...prev, streak: 1 };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastPlayed === yesterdayStr) {
        return { ...prev, streak: prev.streak + 1 };
      } else if (lastPlayed === today) {
        return prev;
      } else {
        return { ...prev, streak: 1 };
      }
    });
  };

  const addBadge = (badge: string) => {
    setState(prev => ({
      ...prev,
      badges: prev.badges.includes(badge) ? prev.badges : [...prev.badges, badge],
    }));
  };

  const resetDaily = () => {
    setState(prev => ({
      ...prev,
      dailyCompleted: false,
      dailyScore: 0,
    }));
  };

  const value: GameContextType = {
    ...state,
    updateScore,
    completeDaily,
    checkStreak,
    addBadge,
    resetDaily,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameStore() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore must be used within GameProvider');
  }
  return context;
}
