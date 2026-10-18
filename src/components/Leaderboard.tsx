import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  country: string;
  streak: number;
}

// Demo podaci
const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Stefan M.', score: 48500, country: '🇷🇸', streak: 47 },
  { rank: 2, name: 'Ana K.', score: 46200, country: '🇷🇸', streak: 38 },
  { rank: 3, name: 'Marko P.', score: 45100, country: '🇭🇷', streak: 41 },
  { rank: 4, name: 'Nina D.', score: 43800, country: '🇧🇦', streak: 35 },
  { rank: 5, name: 'Luka J.', score: 42500, country: '🇷🇸', streak: 33 },
  { rank: 6, name: 'Jovana S.', score: 41200, country: '🇲🇪', streak: 29 },
  { rank: 7, name: 'Petar V.', score: 39800, country: '🇷🇸', streak: 31 },
  { rank: 8, name: 'Milica R.', score: 38500, country: '🇷🇸', streak: 27 },
  { rank: 9, name: 'Nikola T.', score: 37200, country: '🇭🇷', streak: 25 },
  { rank: 10, name: 'Sara M.', score: 36000, country: '🇧🇦', streak: 23 },
];

export default function Leaderboard() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg">
            Top players with the most points
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-gray-800">1,247</div>
              <p className="text-sm text-gray-600">Active Players</p>
            </CardContent>
          </Card>
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Target className="w-10 h-10 mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold text-gray-800">42,350</div>
              <p className="text-sm text-gray-600">Average Score</p>
            </CardContent>
          </Card>
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Medal className="w-10 h-10 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold text-gray-800">47</div>
              <p className="text-sm text-gray-600">Longest Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-200 p-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Top 10 Players</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {demoLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      getRankBg(entry.rank)
                    } border-l-4`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg">
                          {entry.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name & Country */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-lg">{entry.name}</span>
                          <span className="text-xl">{entry.country}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="rounded-full text-xs">
                            🔥 {entry.streak} days
                          </Badge>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {entry.score.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Rank */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <Card className="border-2 border-primary/50 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      ?
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Your Position</p>
                      <p className="text-sm text-gray-600">Play to see where you rank!</p>
                    </div>
                  </div>
                  <Badge className="rounded-full px-4 py-2">
                    Start Playing
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
