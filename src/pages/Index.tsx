import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, Users, User, X, Menu } from 'lucide-react';
import GameModeCard from '@/components/GameModeCard';
import DailyChallenge from '@/components/DailyChallenge';
import PracticeMode from '@/components/PracticeMode';
import BattleMode from '@/components/BattleMode';
import Leaderboard from '@/components/Leaderboard';
import Profile from '@/components/Profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/lib/game-store';

type Page = 'home' | 'modes' | 'daily' | 'practice' | 'battle' | 'leaderboard' | 'profile';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { streak, level, totalScore } = useGameStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-block mb-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl transform rotate-6">
                      <span className="text-5xl">🌍</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-yellow-500 bg-clip-text text-transparent">
                  GeoArena
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Pogađaj sportske lokacije širom sveta! Testiraj svoje znanje i takmiči se sa drugima.
                </p>

                {/* User Stats Card */}
                {totalScore > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-md mx-auto mb-8"
                  >
                    <Card className="border-2 border-primary/20 rounded-3xl shadow-lg">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{level}</div>
                            <p className="text-xs text-gray-600">Nivo</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-500">{streak}</div>
                            <p className="text-xs text-gray-600">Streak</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-500">{totalScore.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Poena</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <Button
                  onClick={() => setCurrentPage('modes')}
                  size="lg"
                  className="text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"
                >
                  <Trophy className="w-6 h-6 mr-2" />
                  Započni igru
                </Button>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid md:grid-cols-3 gap-6"
              >
                <Card className="border-2 border-orange-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Dnevni izazov</h3>
                    <p className="text-gray-600">
                      5 novih pitanja svaki dan. Osvoji do 5000 poena!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">⚔️</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Battle Mode</h3>
                    <p className="text-gray-600">
                      Takmiči se protiv drugih igrača u real-time!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🔥</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Streaks & Nivoi</h3>
                    <p className="text-gray-600">
                      Igraj svaki dan i otključavaj bedževe!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case 'modes':
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('home')}
                  className="mb-4 rounded-full"
                >
                  <X className="w-5 h-5 mr-2" />
                  Nazad
                </Button>
                <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Izaberi način igre
                </h2>
                <p className="text-gray-600 text-lg">
                  Koji izazov želiš danas?
                </p>
              </motion.div>

              {/* Game Modes */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <GameModeCard
                  title="Dnevni izazov"
                  description="5 pitanja o sportskim lokacijama. Novo pitanje svaki dan u ponoć!"
                  icon="daily"
                  difficulty="medium"
                  badge="Popularno"
                  onSelect={() => setCurrentPage('daily')}
                />

                <GameModeCard
                  title="Battle Mode"
                  description="Takmiči se protiv drugih igrača u 3 brze runde. Ko je precizniji?"
                  icon="battle"
                  difficulty="hard"
                  onSelect={() => setCurrentPage('battle')}
                />

                <GameModeCard
                  title="Trening mod"
                  description="Vežbaj bez ograničenja. Savršeno za učenje novih lokacija."
                  icon="practice"
                  difficulty="easy"
                  onSelect={() => setCurrentPage('practice')}
                />
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Card className="border-2 rounded-3xl">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-4">
                      Tvoj napredak danas
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">0/1</div>
                        <p className="text-xs text-gray-600">Dnevni izazov</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">0</div>
                        <p className="text-xs text-gray-600">Battle pobede</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">{streak}</div>
                        <p className="text-xs text-gray-600">Dana streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case 'daily':
        return <DailyChallenge />;
      case 'practice':
        return <PracticeMode onBack={() => setCurrentPage('modes')} />;
      case 'battle':
        return <BattleMode onExit={() => setCurrentPage('modes')} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  // Hide nav for game pages
  const showNav = ['home', 'modes', 'leaderboard', 'profile'].includes(currentPage);

  return (
    <div className="min-h-screen">
      {renderPage()}
      
      {/* Bottom Navigation */}
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-2 py-3">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('home')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Home className="w-5 h-5 mb-1" />
                <span className="text-xs">Početna</span>
              </Button>
              
              <Button
                variant={currentPage === 'modes' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('modes')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-xs">Igraj</span>
              </Button>
              
              <Button
                variant={currentPage === 'leaderboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('leaderboard')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Trophy className="w-5 h-5 mb-1" />
                <span className="text-xs">Rang lista</span>
              </Button>
              
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('profile')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <User className="w-5 h-5 mb-1" />
                <span className="text-xs">Profil</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
