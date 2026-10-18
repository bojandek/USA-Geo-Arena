import { motion } from 'framer-motion';
import { Zap, Trophy, Clock, Star, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: 'daily' | 'battle' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard';
  badge?: string;
  onSelect: () => void;
  disabled?: boolean;
}

const iconMap = {
  daily: Trophy,
  battle: Zap,
  practice: Target,
};

const iconColorMap = {
  daily: 'from-orange-400 to-red-500',
  battle: 'from-blue-400 to-purple-500',
  practice: 'from-green-400 to-emerald-500',
};

export default function GameModeCard({
  title,
  description,
  icon,
  difficulty,
  badge,
  onSelect,
  disabled = false,
}: GameModeCardProps) {
  const Icon = iconMap[icon];
  const colorClass = iconColorMap[icon];

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    >
      <Card
        className={`border-2 rounded-3xl overflow-hidden hover:shadow-xl transition-all ${
          disabled ? '' : 'hover:border-primary/50'
        }`}
        onClick={() => !disabled && onSelect()}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                {badge && (
                  <Badge className="rounded-full bg-yellow-400 text-yellow-900 border-yellow-500">
                    {badge}
                  </Badge>
                )}
                {disabled && (
                  <Badge variant="secondary" className="rounded-full">
                    Coming Soon
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">{description}</p>
              
              <div className="flex gap-2">
                {difficulty && (
                  <Badge variant="outline" className="rounded-full text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'}
                  </Badge>
                )}
                <Badge variant="outline" className="rounded-full text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  5-10 min
                </Badge>
              </div>
            </div>

            {!disabled && (
              <Button size="lg" className="rounded-full self-center">
                Play
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
