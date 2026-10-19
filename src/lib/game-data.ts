// Sports events and locations for quiz
export interface Question {
  id: string;
  text: string;
  lat: number;
  lng: number;
  category: 'stadium' | 'event' | 'club' | 'athlete';
  hint?: string;
  country: string;
  facts: string[]; // 3-4 interesting facts about this location
}

/** Maximum points a single question can yield. */
export const MAX_QUESTION_SCORE = 1000;

// Full question pool (35+ questions for daily rotation - all medium difficulty)
export const questionPool: Question[] = [
  {
    id: '1',
    text: 'Where is the legendary Santiago Bernabéu stadium located?',
    lat: 40.4531,
    lng: -3.6884,
    category: 'stadium',
    hint: 'Capital of Spain',
    country: 'Spain',
    facts: [
      '🏟️ Opened in 1947, capacity 81,044',
      '👑 Named after legendary Real Madrid president',
      '🏆 Hosted 1982 World Cup final',
      '💰 Currently undergoing €1B renovation'
    ]
  },
  {
    id: '2',
    text: 'Which stadium hosted the 1998 FIFA World Cup final?',
    lat: 48.8414,
    lng: 2.253,
    category: 'event',
    hint: 'Paris, the city of light',
    country: 'France',
    facts: [
      '🇫🇷 France beat Brazil 3-0 in the final',
      '🏟️ Stade de France capacity: 80,698',
      '⚽ Zinedine Zidane scored twice',
      '🎉 Last World Cup final before the new millennium',
    ]
  },
  {
    id: '3',
    text: 'Where is Camp Nou, home of FC Barcelona?',
    lat: 41.3809,
    lng: 2.1228,
    category: 'stadium',
    hint: 'Catalonia',
    country: 'Spain',
    facts: [
      '🏟️ Europe\'s largest stadium (99,354 capacity)',
      '🏆 Opened in 1957',
      '⚽ Witnessed Messi\'s greatness for years',
      '🔄 Being rebuilt into "Spotify Camp Nou"'
    ]
  },
  {
    id: '4',
    text: 'Where did Usain Bolt set the 100m world record?',
    lat: 39.9061,
    lng: 116.3912,
    category: 'event',
    hint: '2008 Olympics',
    country: 'China',
    facts: [
      '⚡ 9.69s in 2008 Olympics (later 9.58s)',
      '🥇 Won triple-triple (3 golds × 3 Olympics)',
      '🏟️ Beijing National Stadium "Bird\'s Nest"',
      '🎆 Spectacular opening ceremony venue'
    ]
  },
  {
    id: '5',
    text: 'Where is Old Trafford stadium located?',
    lat: 53.4631,
    lng: -2.2913,
    category: 'stadium',
    hint: 'City in northern England',
    country: 'England',
    facts: [
      '😈 "Theatre of Dreams" - Man United home',
      '🏟️ Capacity 74,140 (UK\'s largest club stadium)',
      '🏆 Opened in 1910',
      '💣 Rebuilt after WWII bombing in 1941'
    ]
  },
  {
    id: '6',
    text: 'Where is Allianz Arena located?',
    lat: 48.2188,
    lng: 11.6247,
    category: 'stadium',
    hint: 'Bavaria, Germany',
    country: 'Germany',
    facts: [
      '🔴⚪ Changes color - red or white lighting',
      '🏟️ Capacity 75,000, opened 2005',
      '⚽ Bayern Munich home stadium',
      '💡 First stadium with fully lit exterior'
    ]
  },
  {
    id: '7',
    text: 'Location of the iconic Maracanã Stadium?',
    lat: -22.9068,
    lng: -43.1729,
    category: 'stadium',
    hint: 'Rio de Janeiro',
    country: 'Brazil',
    facts: [
      '🏟️ Once world\'s largest - 200,000 attendance',
      '⚽ Hosted 1950 & 2014 World Cup finals',
      '😢 "Maracanazo" - Uruguay shocked Brazil 1950',
      '🎭 Pelé\'s 1000th career goal scored here'
    ]
  },
  {
    id: '8',
    text: 'Where is the San Siro stadium?',
    lat: 45.4781,
    lng: 9.1240,
    category: 'stadium',
    hint: 'Fashion capital of Italy',
    country: 'Italy',
    facts: [
      '🔴⚫🔵⚫ Shared by AC Milan and Inter Milan',
      '🏟️ Capacity 75,923, opened 1926',
      '🏆 Hosted 4 European Cup/Champions League finals',
      '🎶 Legendary atmosphere and steep stands'
    ]
  },
  {
    id: '9',
    text: 'Location of Wimbledon Tennis Championships?',
    lat: 51.4344,
    lng: -0.2141,
    category: 'event',
    hint: 'London suburb',
    country: 'United Kingdom',
    facts: [
      '🎾 Oldest tennis tournament (since 1877)',
      '🍓 Famous for strawberries and cream',
      '👔 Strict all-white dress code',
      '🌧️ Retractable roof added to Centre Court 2009'
    ]
  },
  {
    id: '10',
    text: 'Where is the Melbourne Cricket Ground (MCG)?',
    lat: -37.8200,
    lng: 144.9834,
    category: 'stadium',
    hint: 'Australian sports capital',
    country: 'Australia',
    facts: [
      '🏟️ 100,024 capacity - world\'s 10th largest',
      '🏏 Cricket\'s most iconic venue',
      '🏈 Hosts AFL Grand Final annually',
      '🥇 Main stadium for 1956 Olympics'
    ]
  },
  {
    id: '11',
    text: 'Where is Wembley Stadium located?',
    lat: 51.5560,
    lng: -0.2817,
    category: 'stadium',
    hint: 'Capital of England',
    country: 'United Kingdom',
    facts: [
      '🏟️ 90,000 capacity - UK\'s largest',
      '⚽ England national team home',
      '🏆 Hosts FA Cup Final, Euro 2020 finals',
      '🎸 Legendary concert venue'
    ]
  },
  {
    id: '12',
    text: 'Location of the iconic Yankee Stadium?',
    lat: 40.8296,
    lng: -73.9262,
    category: 'stadium',
    hint: 'The Bronx, New York',
    country: 'United States',
    facts: [
      '⚾ "The House That Ruth Built" (original)',
      '🏟️ New stadium opened 2009, capacity 46,537',
      '🏆 27 World Series championships',
      '👻 Monument Park honors Yankee legends'
    ]
  },
  {
    id: '13',
    text: 'Where is the Stade de France?',
    lat: 48.9244,
    lng: 2.3601,
    category: 'stadium',
    hint: 'Paris suburb',
    country: 'France',
    facts: [
      '🏟️ 80,698 capacity - France\'s largest',
      '⚽ France beat Brazil 3-0 in 1998 WC final',
      '🎭 Hosts French national team matches',
      '🎵 Major concert and rugby venue'
    ]
  },
  {
    id: '14',
    text: 'Location of the famous Anfield stadium?',
    lat: 53.4308,
    lng: -2.9608,
    category: 'stadium',
    hint: 'Beatles birthplace',
    country: 'United Kingdom',
    facts: [
      '🎵 "You\'ll Never Walk Alone" anthem',
      '🏟️ Capacity 61,276, opened 1884',
      '⚽ Liverpool FC\'s fortress',
      '🌙 Famous European night atmosphere'
    ]
  },
  {
    id: '15',
    text: 'Where did Muhammad Ali fight George Foreman in "Rumble in the Jungle"?',
    lat: -4.3276,
    lng: 15.3136,
    category: 'event',
    hint: 'Democratic Republic of Congo',
    country: 'DR Congo',
    facts: [
      '🥊 October 30, 1974 - Ali\'s greatest victory',
      '📺 60,000 watched live, billions on TV',
      '🎯 "Rope-a-dope" strategy invented',
      '👑 Ali regained heavyweight title at 32'
    ]
  },
  {
    id: '16',
    text: 'Location of the Olympic Stadium that hosted 1936 Summer Olympics?',
    lat: 52.5145,
    lng: 13.2395,
    category: 'event',
    hint: 'Capital of Germany',
    country: 'Germany',
    facts: [
      '🥇 Jesse Owens won 4 gold medals',
      '🏟️ Berlin Olympiastadion, capacity 74,475',
      '⚽ 2006 World Cup final venue',
      '🎥 First Olympics televised'
    ]
  },
  {
    id: '17',
    text: 'Where is the famous Fenway Park located?',
    lat: 42.3467,
    lng: -71.0972,
    category: 'stadium',
    hint: 'Home of Red Sox',
    country: 'United States',
    facts: [
      '⚾ Oldest MLB ballpark (opened 1912)',
      '💚 Famous "Green Monster" left field wall',
      '🏆 Boston Red Sox home',
      '🎭 Iconic hand-operated scoreboard'
    ]
  },
  {
    id: '18',
    text: 'Location of the 1992 Summer Olympics?',
    lat: 41.3851,
    lng: 2.1734,
    category: 'event',
    hint: 'Catalonia, Spain',
    country: 'Spain',
    facts: [
      '🏹 Archer lit cauldron with flaming arrow',
      '🏀 Original "Dream Team" dominated',
      '🏊 Transformed Barcelona\'s waterfront',
      '🎭 Freddie Mercury & Montserrat tribute'
    ]
  },
  {
    id: '19',
    text: 'Where is the Azteca Stadium?',
    lat: 19.3029,
    lng: -99.1506,
    category: 'stadium',
    hint: 'Capital of Mexico',
    country: 'Mexico',
    facts: [
      '🏟️ Capacity 87,523 - altitude 2,200m',
      '⚽ Only stadium to host 2 WC finals (1970, 1986)',
      '✋ Maradona\'s "Hand of God" 1986',
      '👑 Pelé & Maradona lifted WC trophy here'
    ]
  },
  {
    id: '20',
    text: 'Location of the famous La Bombonera stadium?',
    lat: -34.6355,
    lng: -58.3647,
    category: 'stadium',
    hint: 'Boca Juniors, Argentina',
    country: 'Argentina',
    facts: [
      '💙💛 Boca Juniors iconic home',
      '🏟️ Capacity 54,000, opened 1940',
      '📦 "The Chocolate Box" - unique D-shape',
      '🎭 One of football\'s most passionate crowds'
    ]
  },
  {
    id: '21',
    text: 'Where did the "Miracle on Ice" take place?',
    lat: 44.2167,
    lng: -73.9778,
    category: 'event',
    hint: '1980 Winter Olympics, New York',
    country: 'United States',
    facts: [
      '🏒 USA beat USSR 4-3 in hockey semifinal',
      '🥇 USA then beat Finland for gold',
      '❄️ Lake Placid 1980 Winter Olympics',
      '🎙️ "Do you believe in miracles? YES!"'
    ]
  },
  {
    id: '22',
    text: 'Location of the Emirates Stadium?',
    lat: 51.5549,
    lng: -0.1084,
    category: 'stadium',
    hint: 'Arsenal FC, London',
    country: 'United Kingdom',
    facts: [
      '🔴⚪ Arsenal\'s home since 2006',
      '🏟️ Capacity 60,704',
      '💰 Named after airline sponsor',
      '🏛️ Replaced historic Highbury'
    ]
  },
  {
    id: '23',
    text: 'Where is the famous Circuit de Monaco?',
    lat: 43.7347,
    lng: 7.4206,
    category: 'event',
    hint: 'French Riviera city-state',
    country: 'Monaco',
    facts: [
      '🏎️ F1\'s most prestigious race since 1929',
      '🛥️ Racing through narrow city streets',
      '💎 Glamorous location with yachts',
      '🐢 Slowest average F1 track speed'
    ]
  },
  {
    id: '24',
    text: 'Location of the 2016 Summer Olympics?',
    lat: -22.9122,
    lng: -43.2302,
    category: 'event',
    hint: 'First South American Olympics',
    country: 'Brazil',
    facts: [
      '🇧🇷 First Olympics in South America',
      '⚽ Neymar led Brazil to football gold',
      '🏊 Usain Bolt\'s final Olympic triple',
      '🎆 Christ the Redeemer lit in colors'
    ]
  },
  {
    id: '25',
    text: 'Where is the new Estádio da Luz, home of Benfica?',
    lat: 38.7528,
    lng: -9.193,
    category: 'stadium',
    hint: 'Lisbon, Portugal',
    country: 'Portugal',
    facts: [
      '🏗️ Rebuilt from the ground up in 2003-2005',
      '🏟️ Capacity 65,000 with a retractable roof',
      '🇵🇹 Benfica\'s home since 2003',
      '🎬 The Champions League final was held here in 2005 and 2024',
    ]
  },
  {
    id: '26',
    text: 'Location of the Etihad Stadium?',
    lat: 53.4831,
    lng: -2.2004,
    category: 'stadium',
    hint: 'Manchester City FC',
    country: 'United Kingdom',
    facts: [
      '💙 Manchester City\'s home since 2003',
      '🏟️ Capacity 53,400',
      '🥇 Built for 2002 Commonwealth Games',
      '🏆 Transformed into title-winning fortress'
    ]
  },
  {
    id: '27',
    text: 'Where did Jesse Owens set his long jump world record in 1935?',
    lat: 42.2808,
    lng: -83.743,
    category: 'athlete',
    hint: 'Ann Arbor, Michigan',
    country: 'United States',
    facts: [
      '📏 8.13 metres - a record that stood for 25 years',
      '🤸 The jump was wind-legal over 15.76 m',
      '🎓 He was a student at the University of Michigan',
      '🥇 Later won four golds at the 1936 Berlin Olympics',
    ]
  },
  {
    id: '28',
    text: 'Location of the famous Monza racing circuit?',
    lat: 45.6156,
    lng: 9.2811,
    category: 'event',
    hint: 'Near Milan, Italy',
    country: 'Italy',
    facts: [
      '🏎️ "Temple of Speed" - fastest F1 track',
      '🏁 Italian Grand Prix since 1950',
      '👑 Steeped in Ferrari heritage',
      '🌳 Set in historic royal park'
    ]
  },
  {
    id: '29',
    text: 'Where is the Parc des Princes stadium?',
    lat: 48.8414,
    lng: 2.2531,
    category: 'stadium',
    hint: 'PSG home, Paris',
    country: 'France',
    facts: [
      '🔴🔵 Paris Saint-Germain home',
      '🏟️ Capacity 47,929, opened 1972',
      '⚽ Hosted 1998 World Cup matches',
      '🌟 Witnessed Messi, Neymar, Mbappé era'
    ]
  },
  {
    id: '30',
    text: 'Location of the 2020 Summer Olympics (held in 2021)?',
    lat: 35.6762,
    lng: 139.6503,
    category: 'event',
    hint: 'Capital of Japan',
    country: 'Japan',
    facts: [
      '😷 First Olympics postponed (COVID-19)',
      '🚫 Held without spectators',
      '🏐 Added skateboarding, surfing, karate',
      '🎌 Japan won record 27 gold medals'
    ]
  },
  {
    id: '31',
    text: 'Where is the famous Stamford Bridge stadium?',
    lat: 51.4817,
    lng: -0.1910,
    category: 'stadium',
    hint: 'Chelsea FC, London',
    country: 'United Kingdom',
    facts: [
      '💙 Chelsea\'s home since 1905',
      '🏟️ Capacity 40,341',
      '⚽ Compact, intimate atmosphere',
      '🏆 Witnessed Abramovich era success'
    ]
  },
  {
    id: '32',
    text: 'Location of the historic Rose Bowl stadium?',
    lat: 34.1613,
    lng: -118.1678,
    category: 'stadium',
    hint: 'Pasadena, California',
    country: 'United States',
    facts: [
      '🏟️ Capacity 88,565, opened 1922',
      '🏈 "The Granddaddy of Them All"',
      '⚽ 1994 World Cup final venue',
      '🏆 5 Super Bowls hosted'
    ]
  },
  {
    id: '33',
    text: 'Where is the Signal Iduna Park (Westfalenstadion)?',
    lat: 51.4925,
    lng: 7.4517,
    category: 'stadium',
    hint: 'Borussia Dortmund, Germany',
    country: 'Germany',
    facts: [
      '💛⚫ Borussia Dortmund\'s fortress',
      '🏟️ Capacity 81,365 - largest in Germany',
      '📣 "Yellow Wall" - 25,000 standing terrace',
      '🎭 Europe\'s most intimidating atmosphere'
    ]
  },
  {
    id: '34',
    text: 'Location of the iconic Lusail Stadium?',
    lat: 25.4206,
    lng: 51.4897,
    category: 'stadium',
    hint: '2022 World Cup Final',
    country: 'Qatar',
    facts: [
      '🏆 2022 World Cup final venue',
      '🏟️ Capacity 88,966',
      '❄️ Air-conditioned in desert heat',
      '🇦🇷 Messi lifted trophy here'
    ]
  },
  {
    id: '35',
    text: 'Where is the famous Velodrome stadium?',
    lat: 43.2699,
    lng: 5.3958,
    category: 'stadium',
    hint: 'Olympique Marseille',
    country: 'France',
    facts: [
      '⚪🔵 Olympique Marseille home',
      '🏟️ Capacity 67,394',
      '🏆 France\'s most passionate fans',
      '⚽ Hosted Euro 2016 matches'
    ]
  }
];

// Deterministic, well-distributed PRNG (mulberry32) seeded from the day key.
// A plain Math.sin hash produced correlated shuffles on adjacent days.
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Day key (YYYY-MM-DD) of a Date in the user's LOCAL calendar.
export function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert a day key into a numeric seed.
function dateToSeed(dateString: string): number {
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10) || 0;
  const month = parseInt(parts[1], 10) || 0;
  const day = parseInt(parts[2], 10) || 0;
  return (year * 10000 + month * 100 + day) >>> 0;
}

// Number of questions in a daily challenge.
export const DAILY_QUESTION_COUNT = 10;

/**
 * Get daily questions based on a date (deterministic).
 * The same day always yields the same 10 questions, for every player.
 */
export function getDailyQuestions(date: Date = new Date()): Question[] {
  const dateString = getDateString(date);
  const seed = dateToSeed(dateString);
  const random = seededRandom(seed);

  // Create a shuffled copy of the question pool
  const shuffled = [...questionPool];

  // Fisher-Yates shuffle with the seeded PRNG
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return the questions for this day
  return shuffled.slice(0, DAILY_QUESTION_COUNT);
}

/**
 * Questions used by the practice mode: a stable, hand-picked set that does
 * NOT change from day to day.
 */
export const PRACTICE_QUESTIONS: Question[] = questionPool.slice(0, 10);

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

export function generateShareText(
  score: number,
  totalScore: number = MAX_QUESTION_SCORE * DAILY_QUESTION_COUNT,
): string {
  const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  const emoji = getResultEmoji(score);
  return `GeoArena ${emoji}\nMy score: ${score}/${totalScore} (${percentage}%)\n\nCan you do better? 🌍⚽`;
}
