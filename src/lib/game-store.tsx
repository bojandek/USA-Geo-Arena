// Enhanced state management sa achievements i leaderboard
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface DailyResult {
  date: string;
  score: number;
  accuracy: number;
}

export interface GameState {
  // User progress
  level: number;
  totalScore: number;
  streak: number;
  lastPlayedDate: string | null;
  achievements: Achievement[];
  
  // Daily challenge
  dailyCompleted: boolean;
  dailyScore: number;
  
  // Stats
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalDistance: number;
  averageDistance: number;
  perfectGuesses: number; // < 25km
  
  // History
  dailyHistory: DailyResult[];
}

interface GameContextType extends GameState {
  updateScore: (score: number) => void;
  completeDaily: (score: number, totalDistance: number, perfectCount: number) => void;
  checkStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  resetDaily: () => void;
  getLeaderboard: () => DailyResult[];
}

// Predefined achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Steps', description: 'Complete your first daily challenge', icon: '🎯' },
  { id: 'perfect_10', title: 'Perfection', description: 'Score 10,000 points in a single game', icon: '💯' },
  { id: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑' },
  { id: 'perfect_guess', title: 'Sharpshooter', description: 'Guess within 25km', icon: '🎯' },
  { id: 'perfect_5', title: 'Eagle Eye', description: 'Get 5 perfect guesses (< 25km)', icon: '🦅' },
  { id: 'games_10', title: 'Dedicated Player', description: 'Play 10 daily challenges', icon: '🎮' },
  { id: 'games_50', title: 'Geography Expert', description: 'Play 50 daily challenges', icon: '🌍' },
  { id: 'games_100', title: 'World Traveler', description: 'Play 100 daily challenges', icon: '✈️' },
  { id: 'score_50k', title: 'Rising Star', description: 'Reach 50,000 total points', icon: '⭐' },
  { id: 'score_100k', title: 'Champion', description: 'Reach 100,000 total points', icon: '🏆' },
];

const defaultState: GameState = {
  level: 1,
  totalScore: 0,
  streak: 0,
  lastPlayedDate: null,
  achievements: [],
  dailyCompleted: false,
  dailyScore: 0,
  gamesPlayed: 0,
  bestScore: 0,
  averageScore: 0,
  totalDistance: 0,
  averageDistance: 0,
  perfectGuesses: 0,
  dailyHistory: [],
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

  const completeDaily = (score: number, totalDistance: number, perfectCount: number) => {
    setState(prev => {
      const newGamesPlayed = prev.gamesPlayed + 1;
      const newTotalScore = prev.totalScore + score;
      const newTotalDistance = prev.totalDistance + totalDistance;
      const newPerfectGuesses = prev.perfectGuesses + perfectCount;
      const today = new Date().toISOString().split('T')[0];
      
      const newHistory = [
        ...prev.dailyHistory,
        { 
          date: today, 
          score, 
          accuracy: Math.round((score / 10000) * 100) 
        }
      ].slice(-30); // Keep last 30 days
      
      return {
        ...prev,
        dailyCompleted: true,
        dailyScore: score,
        gamesPlayed: newGamesPlayed,
        totalScore: newTotalScore,
        bestScore: Math.max(prev.bestScore, score),
        averageScore: Math.round(newTotalScore / newGamesPlayed),
        totalDistance: newTotalDistance,
        averageDistance: Math.round(newTotalDistance / newGamesPlayed),
        perfectGuesses: newPerfectGuesses,
        dailyHistory: newHistory,
        lastPlayedDate: new Date().toISOString(),
      };
    });
    
    // Check for achievements after completing
    setTimeout(() => checkAchievements(score, state.gamesPlayed + 1, state.totalScore + score, perfectCount, state.perfectGuesses + perfectCount, state.streak), 100);
  };

  const checkAchievements = (
    score: number, 
    gamesPlayed: number, 
    totalScore: number, 
    perfectCount: number,
    totalPerfect: number,
    streak: number
  ) => {
    const toUnlock: string[] = [];
    
    if (gamesPlayed === 1) toUnlock.push('first_win');
    if (score === 10000) toUnlock.push('perfect_10');
    if (streak >= 3) toUnlock.push('streak_3');
    if (streak >= 7) toUnlock.push('streak_7');
    if (streak >= 30) toUnlock.push('streak_30');
    if (perfectCount > 0) toUnlock.push('perfect_guess');
    if (totalPerfect >= 5) toUnlock.push('perfect_5');
    if (gamesPlayed >= 10) toUnlock.push('games_10');
    if (gamesPlayed >= 50) toUnlock.push('games_50');
    if (gamesPlayed >= 100) toUnlock.push('games_100');
    if (totalScore >= 50000) toUnlock.push('score_50k');
    if (totalScore >= 100000) toUnlock.push('score_100k');
    
    toUnlock.forEach(id => unlockAchievement(id));
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

  const unlockAchievement = (achievementId: string) => {
    setState(prev => {
      // Check if already unlocked
      if (prev.achievements.some(a => a.id === achievementId)) {
        return prev;
      }
      
      const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return prev;
      
      return {
        ...prev,
        achievements: [
          ...prev.achievements,
          { ...achievement, unlockedAt: new Date().toISOString() }
        ],
      };
    });
  };

  const resetDaily = () => {
    setState(prev => ({
      ...prev,
      dailyCompleted: false,
      dailyScore: 0,
    }));
  };

  const getLeaderboard = () => {
    return state.dailyHistory
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  const value: GameContextType = {
    ...state,
    updateScore,
    completeDaily,
    checkStreak,
    unlockAchievement,
    resetDaily,
    getLeaderboard,
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
