import { useState } from 'react';
import { Home, Trophy, Users, User } from 'lucide-react';
import LandingPage from '@/components/LandingPage';
import DailyChallenge from '@/components/DailyChallenge';
import BattleMode from '@/components/BattleMode';
import Leaderboard from '@/components/Leaderboard';
import Profile from '@/components/Profile';
import { Button } from '@/components/ui/button';

type Page = 'landing' | 'daily' | 'battle' | 'leaderboard' | 'profile';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onStartGame={() => setCurrentPage('daily')} />;
      case 'daily':
        return <DailyChallenge />;
      case 'battle':
        return <BattleMode onExit={() => setCurrentPage('landing')} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      default:
        return <LandingPage onStartGame={() => setCurrentPage('daily')} />;
    }
  };

  // Sakrij navigation za landing i game stranice
  const showNav = !['landing', 'daily', 'battle'].includes(currentPage);

  return (
    <div className="min-h-screen">
      {renderPage()}
      
      {/* Bottom Navigation */}
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-2 py-3">
              <Button
                variant={currentPage === 'landing' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('landing')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Home className="w-5 h-5 mb-1" />
                <span className="text-xs">Početna</span>
              </Button>
              
              <Button
                variant={currentPage === 'battle' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('battle')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs">Battle</span>
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

      {/* Floating Action Button for main game */}
      {showNav && (
        <div className="fixed bottom-24 right-6 z-50">
          <Button
            onClick={() => setCurrentPage('daily')}
            size="lg"
            className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-transform"
          >
            <Trophy className="w-8 h-8" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
