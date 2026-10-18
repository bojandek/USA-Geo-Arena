import { motion } from 'framer-motion';
import { Trophy, Zap, Users, Globe2, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onStartGame: () => void;
}

export default function LandingPage({ onStartGame }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl transform rotate-6">
                <Globe2 className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-yellow-500 bg-clip-text text-transparent">
            GeoArena
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-4">
            Pogađaj sportske lokacije širom sveta! ⚽🏀🏈
          </p>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Testiraj svoje geografsko znanje o stadionima, događajima i legendarnim
            sportskim mestima. Igraj svakodnevno i postani šampion!
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Badge className="px-4 py-2 text-base rounded-full bg-gradient-to-r from-primary to-secondary">
              <Flame className="w-4 h-4 mr-2" />
              Dnevni izazovi
            </Badge>
            <Badge className="px-4 py-2 text-base rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Users className="w-4 h-4 mr-2" />
              Multiplayer
            </Badge>
            <Badge className="px-4 py-2 text-base rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <Star className="w-4 h-4 mr-2" />
              Rang lista
            </Badge>
          </div>

          <Button
            onClick={onStartGame}
            size="lg"
            className="text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"
          >
            <Zap className="w-6 h-6 mr-2" />
            Počni igru
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mt-20"
        >
          <Card className="border-2 border-orange-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Dnevni izazov</h3>
              <p className="text-gray-600">
                Svakog dana 5 novih pitanja o sportskim lokacijama. Osvoji do 1000 poena po pitanju!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Battle Mode</h3>
              <p className="text-gray-600">
                Takmiči se protiv drugih igrača u real-time mečevima i postani najbolji!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Streaks & Nivoi</h3>
              <p className="text-gray-600">
                Igraj svaki dan, zadržavaj streak i otključavaj bedževe i nagrade!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                5
              </div>
              <p className="text-gray-600 font-medium">Pitanja dnevno</p>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                1000
              </div>
              <p className="text-gray-600 font-medium">Max poena</p>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <p className="text-gray-600 font-medium">Zabave</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>🌍 Kreirano sa ❤️ za ljubitelje sporta i geografije</p>
        </div>
      </div>
    </div>
  );
}
