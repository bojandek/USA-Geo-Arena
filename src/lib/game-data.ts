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

// Full question pool (30+ questions for daily rotation)
export const questionPool: Question[] = [
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
  },
  {
    id: '11',
    text: 'Where is Wembley Stadium located?',
    lat: 51.5560,
    lng: -0.2817,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Capital of England',
    country: 'United Kingdom'
  },
  {
    id: '12',
    text: 'Location of the iconic Yankee Stadium?',
    lat: 40.8296,
    lng: -73.9262,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'The Bronx, New York',
    country: 'United States'
  },
  {
    id: '13',
    text: 'Where is the Stade de France?',
    lat: 48.9244,
    lng: 2.3601,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Paris suburb',
    country: 'France'
  },
  {
    id: '14',
    text: 'Location of the famous Anfield stadium?',
    lat: 53.4308,
    lng: -2.9608,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Beatles birthplace',
    country: 'United Kingdom'
  },
  {
    id: '15',
    text: 'Where did Muhammad Ali fight George Foreman in "Rumble in the Jungle"?',
    lat: -4.3276,
    lng: 15.3136,
    category: 'event',
    difficulty: 'hard',
    hint: 'Democratic Republic of Congo',
    country: 'DR Congo'
  },
  {
    id: '16',
    text: 'Location of the Olympic Stadium that hosted 1936 Summer Olympics?',
    lat: 52.5145,
    lng: 13.2395,
    category: 'event',
    difficulty: 'medium',
    hint: 'Capital of Germany',
    country: 'Germany'
  },
  {
    id: '17',
    text: 'Where is the famous Fenway Park located?',
    lat: 42.3467,
    lng: -71.0972,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Home of Red Sox',
    country: 'United States'
  },
  {
    id: '18',
    text: 'Location of the 1992 Summer Olympics?',
    lat: 41.3851,
    lng: 2.1734,
    category: 'event',
    difficulty: 'easy',
    hint: 'Catalonia, Spain',
    country: 'Spain'
  },
  {
    id: '19',
    text: 'Where is the Azteca Stadium?',
    lat: 19.3029,
    lng: -99.1506,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Capital of Mexico',
    country: 'Mexico'
  },
  {
    id: '20',
    text: 'Location of the famous La Bombonera stadium?',
    lat: -34.6355,
    lng: -58.3647,
    category: 'stadium',
    difficulty: 'hard',
    hint: 'Boca Juniors, Argentina',
    country: 'Argentina'
  },
  {
    id: '21',
    text: 'Where did the "Miracle on Ice" take place?',
    lat: 44.2167,
    lng: -73.9778,
    category: 'event',
    difficulty: 'hard',
    hint: '1980 Winter Olympics, New York',
    country: 'United States'
  },
  {
    id: '22',
    text: 'Location of the Emirates Stadium?',
    lat: 51.5549,
    lng: -0.1084,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'Arsenal FC, London',
    country: 'United Kingdom'
  },
  {
    id: '23',
    text: 'Where is the famous Circuit de Monaco?',
    lat: 43.7347,
    lng: 7.4206,
    category: 'event',
    difficulty: 'medium',
    hint: 'French Riviera city-state',
    country: 'Monaco'
  },
  {
    id: '24',
    text: 'Location of the 2016 Summer Olympics?',
    lat: -22.9068,
    lng: -43.1729,
    category: 'event',
    difficulty: 'easy',
    hint: 'First South American Olympics',
    country: 'Brazil'
  },
  {
    id: '25',
    text: 'Where is the famous Nou Camp stadium being renovated?',
    lat: 41.3809,
    lng: 2.1228,
    category: 'stadium',
    difficulty: 'easy',
    hint: 'FC Barcelona home',
    country: 'Spain'
  },
  {
    id: '26',
    text: 'Location of the Etihad Stadium?',
    lat: 53.4831,
    lng: -2.2004,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Manchester City FC',
    country: 'United Kingdom'
  },
  {
    id: '27',
    text: 'Where did Jesse Owens win 4 gold medals in 1936?',
    lat: 52.5145,
    lng: 13.2395,
    category: 'event',
    difficulty: 'medium',
    hint: 'Berlin Olympics',
    country: 'Germany'
  },
  {
    id: '28',
    text: 'Location of the famous Monza racing circuit?',
    lat: 45.6156,
    lng: 9.2811,
    category: 'event',
    difficulty: 'hard',
    hint: 'Near Milan, Italy',
    country: 'Italy'
  },
  {
    id: '29',
    text: 'Where is the Parc des Princes stadium?',
    lat: 48.8414,
    lng: 2.2531,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'PSG home, Paris',
    country: 'France'
  },
  {
    id: '30',
    text: 'Location of the 2020 Summer Olympics (held in 2021)?',
    lat: 35.6762,
    lng: 139.6503,
    category: 'event',
    difficulty: 'easy',
    hint: 'Capital of Japan',
    country: 'Japan'
  },
  {
    id: '31',
    text: 'Where is the famous Stamford Bridge stadium?',
    lat: 51.4817,
    lng: -0.1910,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Chelsea FC, London',
    country: 'United Kingdom'
  },
  {
    id: '32',
    text: 'Location of the historic Rose Bowl stadium?',
    lat: 34.1613,
    lng: -118.1678,
    category: 'stadium',
    difficulty: 'hard',
    hint: 'Pasadena, California',
    country: 'United States'
  },
  {
    id: '33',
    text: 'Where is the Signal Iduna Park (Westfalenstadion)?',
    lat: 51.4925,
    lng: 7.4517,
    category: 'stadium',
    difficulty: 'hard',
    hint: 'Borussia Dortmund, Germany',
    country: 'Germany'
  },
  {
    id: '34',
    text: 'Location of the iconic Lusail Stadium?',
    lat: 25.4206,
    lng: 51.4897,
    category: 'stadium',
    difficulty: 'medium',
    hint: '2022 World Cup Final',
    country: 'Qatar'
  },
  {
    id: '35',
    text: 'Where is the famous Velodrome stadium?',
    lat: 43.2699,
    lng: 5.3958,
    category: 'stadium',
    difficulty: 'medium',
    hint: 'Olympique Marseille',
    country: 'France'
  }
];

// Simple seeded random number generator for consistent daily rotation
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get date string in YYYY-MM-DD format (UTC)
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Convert date string to seed number
function dateToSeed(dateString: string): number {
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  return year * 10000 + month * 100 + day;
}

// Get daily questions based on date (deterministic)
export function getDailyQuestions(date: Date = new Date()): Question[] {
  const dateString = getDateString(date);
  const seed = dateToSeed(dateString);
  
  // Create a shuffled copy of the question pool
  const shuffled = [...questionPool];
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return first 10 questions
  return shuffled.slice(0, 10);
}

// Alias for compatibility (gets today's questions)
export const sampleQuestions = getDailyQuestions();

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
