// Sports events and locations for quiz
export interface Question {
  id: string;
  text: string;
  lat: number;
  lng: number;
  category: 'stadium' | 'event' | 'club' | 'athlete';
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  country: string;
}

// Sample questions for demo (later will be from database)
export const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'Where is the legendary Santiago Bernabéu stadium located?',
    lat: 40.4531,
    lng: -3.6884,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Capital of Spain',
    country: 'Spain'
  },
  {
    id: '2',
    text: 'Which stadium hosted the 2014 World Cup final?',
    lat: -22.9122,
    lng: -43.2302,
    category: 'event',
    difficulty: 'medium',
    hint: 'City in Brazil famous for Cristo Redentor',
    country: 'Brazil'
  },
  {
    id: '3',
    text: 'Where is Camp Nou, home of FC Barcelona?',
    lat: 41.3809,
    lng: 2.1228,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Catalonia',
    country: 'Spain'
  },
  {
    id: '4',
    text: 'Where did Usain Bolt set the 100m world record?',
    lat: 39.9061,
    lng: 116.3912,
    category: 'event',
    difficulty: 'hard',
    hint: '2008 Olympics',
    country: 'China'
  },
  {
    id: '5',
    text: 'Where is Old Trafford stadium located?',
    lat: 53.4631,
    lng: -2.2913,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'City in northern England',
    country: 'England'
  },
  {
    id: '6',
    text: 'Where is Allianz Arena located?',
    lat: 48.2188,
    lng: 11.6247,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Bavaria, Germany',
    country: 'Germany'
  },
  {
    id: '7',
    text: 'Location of the iconic Maracanã Stadium?',
    lat: -22.9122,
    lng: -43.2302,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Rio de Janeiro',
    country: 'Brazil'
  },
  {
    id: '8',
    text: 'Where is the San Siro stadium?',
    lat: 45.4781,
    lng: 9.1240,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Fashion capital of Italy',
    country: 'Italy'
  },
  {
    id: '9',
    text: 'Location of Wimbledon Tennis Championships?',
    lat: 51.4344,
    lng: -0.2141,
    category: 'event',
    difficulty: 'easy',
    hint: 'London suburb',
    country: 'United Kingdom'
  },
  {
    id: '10',
    text: 'Where is the Melbourne Cricket Ground (MCG)?',
    lat: -37.8200,
    lng: 144.9834,
    category: 'stadium',
    difficulty: 'hard',
    hint: 'Australian sports capital',
    country: 'Australia'
  }
];

// Haversine formula for calculating distance
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Scoring system based on distance
export function calculateScore(distanceKm: number): number {
  if (distanceKm < 25) return 1000;
  if (distanceKm < 50) return 950;
  if (distanceKm < 100) return 900;
  if (distanceKm < 200) return 800;
  if (distanceKm < 500) return 600;
  if (distanceKm < 1000) return 400;
  if (distanceKm < 2000) return 200;
  if (distanceKm < 5000) return 100;
  return 50;
}

// Emoji for share cards
export function getResultEmoji(score: number): string {
  if (score >= 9000) return '🔥';
  if (score >= 8000) return '🏆';
  if (score >= 7000) return '⭐';
  if (score >= 6000) return '💪';
  if (score >= 5000) return '👍';
  if (score >= 4000) return '😊';
  if (score >= 3000) return '🎯';
  return '📍';
}

export function generateShareText(score: number, totalScore: number = 10000): string {
  const percentage = Math.round((score / totalScore) * 100);
  const emoji = getResultEmoji(score);
  return `GeoArena ${emoji}\nMy score: ${score}/${totalScore} (${percentage}%)\n\nCan you do better? 🌍⚽`;
}
