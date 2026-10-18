// Sportski događaji i lokacije za kviz
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

// Sample pitanja za demo (kasnije će biti iz baze)
export const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'Gde se nalazi legendarni stadion Santiago Bernabéu?',
    lat: 40.4531,
    lng: -3.6884,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Glavni grad Španije',
    country: 'Španija'
  },
  {
    id: '2',
    text: 'Na kom stadionu je održan finale Svetskog prvenstva 2014?',
    lat: -22.9122,
    lng: -43.2302,
    category: 'event',
    difficulty: 'medium',
    hint: 'Grad u Brazilu poznat po Cristo Redentor',
    country: 'Brazil'
  },
  {
    id: '3',
    text: 'Gde se nalazi Camp Nou, dom FC Barcelone?',
    lat: 41.3809,
    lng: 2.1228,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Katalonija',
    country: 'Španija'
  },
  {
    id: '4',
    text: 'Gde je Usain Bolt postavio svetski rekord u trci na 100m?',
    lat: 39.9061,
    lng: 116.3912,
    category: 'event',
    difficulty: 'hard',
    hint: 'Olimpijske igre 2008',
    country: 'Kina'
  },
  {
    id: '5',
    text: 'Gde se nalazi stadion Old Trafford?',
    lat: 53.4631,
    lng: -2.2913,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Grad u severnoj Engleskoj',
    country: 'Engleska'
  }
];

// Haversine formula za izračunavanje distance
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius Zemlje u km
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

// Scoring sistem baziran na udaljenosti
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

// Emoji za share kartice
export function getResultEmoji(score: number): string {
  if (score >= 4500) return '🔥';
  if (score >= 4000) return '🏆';
  if (score >= 3500) return '⭐';
  if (score >= 3000) return '💪';
  if (score >= 2500) return '👍';
  if (score >= 2000) return '😊';
  if (score >= 1500) return '🎯';
  return '📍';
}

export function generateShareText(score: number, totalScore: number = 5000): string {
  const percentage = Math.round((score / totalScore) * 100);
  const emoji = getResultEmoji(score);
  return `GeoArena ${emoji}\nMoj skor: ${score}/${totalScore} (${percentage}%)\n\nMožeš li bolje? 🌍⚽`;
}
