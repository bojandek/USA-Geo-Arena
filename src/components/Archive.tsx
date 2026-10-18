import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trophy, ArrowLeft, Play, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArchiveEntry {
  date: string;
  score: number | null;
  completed: boolean;
  locked: boolean;
}

interface ArchiveProps {
  onBack: () => void;
  onSelectDate: (date: string) => void;
}

export default function Archive({ onBack, onSelectDate }: ArchiveProps) {
  // Generate archive entries for the last 30 days
  const generateArchive = (): ArchiveEntry[] => {
    const entries: ArchiveEntry[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mock data - in production, this would come from localStorage or backend
      const isToday = i === 0;
      const isRecent = i <= 7;
      
      entries.push({
        date: dateStr,
        score: isRecent && !isToday ? Math.floor(Math.random() * 10000) : null,
        completed: isRecent && !isToday,
        locked: false
      });
    }
    
    return entries;
  };

  const [archive] = useState<ArchiveEntry[]>(generateArchive());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9000) return 'text-yellow-500';
    if (score >= 8000) return 'text-green-500';
    if (score >= 7000) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 9000) return '🔥';
    if (score >= 8000) return '🏆';
    if (score >= 7000) return '⭐';
    return '🎯';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-script mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Challenge Archive
            </h1>
            <p className="text-gray-600 text-xl">
              Replay past daily challenges and improve your score
            </p>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-gray-800">
                {archive.filter(e => e.completed).length}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold text-gray-800">{archive.length}</div>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card className="border-2 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-gray-800">
                {Math.max(...archive.filter(e => e.score).map(e => e.score || 0))}
              </div>
              <p className="text-sm text-gray-600">Best Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Archive List */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-200 p-6">
              <CardTitle className="text-3xl font-bold font-script text-gray-800">
                Past Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {archive.map((entry, index) => (
                  <motion.div
                    key={entry.date}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      entry.locked ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Date */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600">
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-xl font-bold text-gray-800">
                            {new Date(entry.date).getDate()}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 text-lg">
                            {formatDate(entry.date)}
                          </h3>
                          {entry.completed && (
                            <Badge variant="outline" className="rounded-full text-xs bg-green-50 text-green-700 border-green-300">
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                        {entry.score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Score:</span>
                            <span className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                              {entry.score.toLocaleString()} {getScoreEmoji(entry.score)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {index === 0 ? 'Play today\'s challenge' : 'Not played yet'}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        {entry.locked ? (
                          <Button variant="ghost" disabled className="rounded-full">
                            <Lock className="w-5 h-5" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onSelectDate(entry.date)}
                            className="rounded-full"
                            variant={entry.completed ? 'outline' : 'default'}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {entry.completed ? 'Replay' : 'Play'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
