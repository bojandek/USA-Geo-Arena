var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/admin/newsletter.ts
var newsletter_exports = {};
__export(newsletter_exports, {
  default: () => newsletter_default
});
module.exports = __toCommonJS(newsletter_exports);

// server/_lib/backend.ts
function isBackendConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
async function supabase(path, init = {}) {
  const base = String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...init.headers ?? {}
    }
  });
}

// src/lib/questions/base.ts
var baseQuestions = [
  {
    id: "1",
    text: "Where is the legendary Santiago Bernab\xE9u stadium located?",
    lat: 40.4531,
    lng: -3.6884,
    category: "stadium",
    venue: "Santiago Bernabeu",
    hint: "Capital of Spain",
    country: "Spain",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1947, capacity 81,044",
      "\u{1F451} Named after legendary Real Madrid president",
      "\u{1F3C6} Hosted 1982 World Cup final",
      "\u{1F4B0} Renovated 2019-2024 with a retractable roof"
    ]
  },
  {
    id: "2",
    text: "Which stadium hosted the 1998 FIFA World Cup final?",
    lat: 48.9245,
    lng: 2.3602,
    category: "event",
    venue: "Stade de France",
    hint: "Saint-Denis, just north of Paris",
    country: "France",
    facts: [
      "\u{1F1EB}\u{1F1F7} France beat Brazil 3-0 in the final",
      "\u{1F3DF}\uFE0F Stade de France capacity: 80,698",
      "\u26BD Zinedine Zidane scored twice",
      "\u{1F389} Last World Cup final before the new millennium"
    ]
  },
  {
    id: "3",
    text: "Where is Camp Nou, home of FC Barcelona?",
    lat: 41.3809,
    lng: 2.1228,
    category: "stadium",
    venue: "Camp Nou",
    hint: "Catalonia",
    country: "Spain",
    facts: [
      "\u{1F3DF}\uFE0F Europe's largest stadium, rebuilt to about 105,000 seats",
      "\u{1F3C6} Opened in 1957",
      "\u26BD Witnessed Messi's greatness for years",
      "\u{1F504} Rebuilt from 2023, with Bar\xE7a back from November 2025"
    ]
  },
  {
    id: "4",
    text: "Where did Usain Bolt set the 100m world record?",
    lat: 52.5147,
    lng: 13.2395,
    category: "event",
    venue: "Olympiastadion Berlin (2009 World Championships)",
    hint: "2009 World Championships",
    country: "Germany",
    facts: [
      "\u26A1 9.58s on 16 August 2009, at the World Championships",
      "\u{1F948} Tyson Gay finished second in 9.71",
      "\u{1F3C3} He also set the 200m record (19.19) at the same championships",
      "\u{1F3DF}\uFE0F The same stadium hosted the 1936 Olympics"
    ]
  },
  {
    id: "5",
    text: "Where is Old Trafford stadium located?",
    lat: 53.4631,
    lng: -2.2913,
    category: "stadium",
    venue: "Old Trafford",
    hint: "City in northern England",
    country: "United Kingdom",
    facts: [
      '\u{1F608} "Theatre of Dreams" - Man United home',
      "\u{1F3DF}\uFE0F Capacity 74,140 (UK's largest club stadium)",
      "\u{1F3C6} Opened in 1910",
      "\u{1F4A3} Rebuilt after WWII bombing in 1941"
    ]
  },
  {
    id: "6",
    text: "Where is Allianz Arena located?",
    lat: 48.2188,
    lng: 11.6247,
    category: "stadium",
    venue: "Allianz Arena",
    hint: "Bavaria, Germany",
    country: "Germany",
    facts: [
      "\u{1F534}\u26AA\u{1F535} Lit red for Bayern, blue for 1860, white for Germany",
      "\u{1F3DF}\uFE0F Capacity 75,000, opened 2005",
      "\u26BD Bayern Munich home stadium",
      "\u{1F4A1} Its facade is made of nearly 3,000 inflatable ETFE panels"
    ]
  },
  {
    id: "7",
    text: "Location of the iconic Maracan\xE3 Stadium?",
    lat: -22.9121,
    lng: -43.2302,
    category: "stadium",
    venue: "Maracana",
    hint: "Rio de Janeiro",
    country: "Brazil",
    facts: [
      "\u{1F3DF}\uFE0F Once world's largest - 200,000 attendance",
      "\u26BD Hosted 1950 & 2014 World Cup finals",
      '\u{1F622} "Maracanazo" - Uruguay shocked Brazil 1950',
      "\u{1F3AD} Pel\xE9's 1000th career goal scored here"
    ]
  },
  {
    id: "8",
    text: "Where is the San Siro stadium?",
    lat: 45.4781,
    lng: 9.124,
    category: "stadium",
    venue: "San Siro",
    hint: "Fashion capital of Italy",
    country: "Italy",
    facts: [
      "\u{1F534}\u26AB\u{1F535}\u26AB Shared by AC Milan and Inter Milan",
      "\u{1F3DF}\uFE0F Capacity 75,923, opened 1926",
      "\u{1F3C6} Hosted 4 European Cup/Champions League finals",
      "\u{1F3B6} Legendary atmosphere and steep stands"
    ]
  },
  {
    id: "9",
    text: "Location of Wimbledon Tennis Championships?",
    lat: 51.4344,
    lng: -0.2141,
    category: "event",
    venue: "All England Lawn Tennis Club",
    hint: "London suburb",
    country: "United Kingdom",
    facts: [
      "\u{1F3BE} Oldest tennis tournament (since 1877)",
      "\u{1F353} Famous for strawberries and cream",
      "\u{1F454} Strict all-white dress code",
      "\u{1F327}\uFE0F Retractable roof added to Centre Court 2009"
    ]
  },
  {
    id: "10",
    text: "Where is the Melbourne Cricket Ground (MCG)?",
    lat: -37.82,
    lng: 144.9834,
    category: "stadium",
    venue: "Melbourne Cricket Ground",
    hint: "Australian sports capital",
    country: "Australia",
    facts: [
      "\u{1F3DF}\uFE0F 100,024 capacity - world's 10th largest",
      "\u{1F3CF} Cricket's most iconic venue",
      "\u{1F3C8} Hosts AFL Grand Final annually",
      "\u{1F947} Main stadium for 1956 Olympics"
    ]
  },
  {
    id: "11",
    text: "Where is Wembley Stadium located?",
    lat: 51.556,
    lng: -0.2817,
    category: "stadium",
    venue: "Wembley Stadium",
    hint: "Capital of England",
    country: "United Kingdom",
    facts: [
      "\u{1F3DF}\uFE0F 90,000 capacity - UK's largest",
      "\u26BD England national team home",
      "\u{1F3C6} Hosts FA Cup Final, Euro 2020 finals",
      "\u{1F3B8} Legendary concert venue"
    ]
  },
  {
    id: "12",
    text: "Location of the iconic Yankee Stadium?",
    lat: 40.8296,
    lng: -73.9262,
    category: "stadium",
    venue: "Yankee Stadium",
    hint: "The Bronx, New York",
    country: "United States",
    facts: [
      '\u26BE "The House That Ruth Built" (original)',
      "\u{1F3DF}\uFE0F New stadium opened 2009, capacity 46,537",
      "\u{1F3C6} 27 World Series championships",
      "\u{1F47B} Monument Park honors Yankee legends"
    ]
  },
  {
    id: "13",
    text: "Where is the Stade de France?",
    lat: 48.9244,
    lng: 2.3601,
    category: "stadium",
    venue: "Stade de France",
    hint: "Paris suburb",
    country: "France",
    facts: [
      "\u{1F3DF}\uFE0F 80,698 capacity - France's largest",
      "\u26BD France beat Brazil 3-0 in 1998 WC final",
      "\u{1F3AD} Hosts French national team matches",
      "\u{1F3B5} Major concert and rugby venue"
    ]
  },
  {
    id: "14",
    text: "Location of the famous Anfield stadium?",
    lat: 53.4308,
    lng: -2.9608,
    category: "stadium",
    venue: "Anfield",
    hint: "Beatles birthplace",
    country: "United Kingdom",
    facts: [
      `\u{1F3B5} "You'll Never Walk Alone" anthem`,
      "\u{1F3DF}\uFE0F Capacity 61,276, opened 1884",
      "\u26BD Liverpool FC's fortress",
      "\u{1F319} Famous European night atmosphere"
    ]
  },
  {
    id: "15",
    text: 'Where did Muhammad Ali fight George Foreman in "Rumble in the Jungle"?',
    lat: -4.3381,
    lng: 15.3222,
    category: "event",
    venue: "Stade Tata Raphael (then Stade du 20 Mai)",
    hint: "Democratic Republic of Congo",
    country: "DR Congo",
    facts: [
      "\u{1F94A} October 30, 1974 - Ali's greatest victory",
      "\u{1F4FA} 60,000 watched live, billions on TV",
      '\u{1F3AF} "Rope-a-dope" strategy invented',
      "\u{1F451} Ali regained heavyweight title at 32"
    ]
  },
  {
    id: "16",
    text: "Location of the Olympic Stadium that hosted 1936 Summer Olympics?",
    lat: 52.5145,
    lng: 13.2395,
    category: "event",
    venue: "Olympiastadion",
    hint: "Capital of Germany",
    country: "Germany",
    facts: [
      "\u{1F947} Jesse Owens won 4 gold medals",
      "\u{1F3DF}\uFE0F Berlin Olympiastadion, capacity 74,475",
      "\u26BD 2006 World Cup final venue",
      "\u{1F3A5} First Olympics televised"
    ]
  },
  {
    id: "17",
    text: "Where is the famous Fenway Park located?",
    lat: 42.3467,
    lng: -71.0972,
    category: "stadium",
    venue: "Fenway Park",
    hint: "Home of Red Sox",
    country: "United States",
    facts: [
      "\u26BE Oldest MLB ballpark (opened 1912)",
      '\u{1F49A} Famous "Green Monster" left field wall',
      "\u{1F3C6} Boston Red Sox home",
      "\u{1F3AD} Iconic hand-operated scoreboard"
    ]
  },
  {
    id: "18",
    text: "Location of the 1992 Summer Olympics?",
    lat: 41.3647,
    lng: 2.1556,
    category: "event",
    venue: "Estadi Olimpic de Montjuic",
    hint: "Catalonia, Spain",
    country: "Spain",
    facts: [
      "\u{1F3F9} Archer lit cauldron with flaming arrow",
      '\u{1F3C0} Original "Dream Team" dominated',
      "\u{1F3CA} Transformed Barcelona's waterfront",
      "\u{1F3AD} Freddie Mercury & Montserrat tribute"
    ]
  },
  {
    id: "19",
    text: "Where is the Azteca Stadium?",
    lat: 19.3029,
    lng: -99.1506,
    category: "stadium",
    venue: "Estadio Azteca",
    hint: "Capital of Mexico",
    country: "Mexico",
    facts: [
      "\u{1F3DF}\uFE0F Capacity 87,523 - altitude 2,200m",
      "\u26BD Only stadium to host 2 WC finals (1970, 1986)",
      `\u270B Maradona's "Hand of God" 1986`,
      "\u{1F451} Pel\xE9 & Maradona lifted WC trophy here"
    ]
  },
  {
    id: "20",
    text: "Location of the famous La Bombonera stadium?",
    lat: -34.6355,
    lng: -58.3647,
    category: "stadium",
    venue: "La Bombonera",
    hint: "Boca Juniors, Argentina",
    country: "Argentina",
    facts: [
      "\u{1F499}\u{1F49B} Boca Juniors iconic home",
      "\u{1F3DF}\uFE0F Capacity 54,000, opened 1940",
      '\u{1F4E6} "The Chocolate Box" - unique D-shape',
      "\u{1F3AD} One of football's most passionate crowds"
    ]
  },
  {
    id: "21",
    text: 'Where did the "Miracle on Ice" take place?',
    lat: 44.2833,
    lng: -73.9856,
    category: "event",
    venue: "Olympic Center (Herb Brooks Arena)",
    hint: "1980 Winter Olympics, New York",
    country: "United States",
    facts: [
      "\u{1F3D2} USA beat USSR 4-3 in the medal round",
      "\u{1F947} USA then beat Finland for gold",
      "\u2744\uFE0F Lake Placid 1980 Winter Olympics",
      '\u{1F399}\uFE0F "Do you believe in miracles? YES!"'
    ]
  },
  {
    id: "22",
    text: "Location of the Emirates Stadium?",
    lat: 51.5549,
    lng: -0.1084,
    category: "stadium",
    venue: "Emirates Stadium",
    hint: "Arsenal FC, London",
    country: "United Kingdom",
    facts: [
      "\u{1F534}\u26AA Arsenal's home since 2006",
      "\u{1F3DF}\uFE0F Capacity 60,704",
      "\u{1F4B0} Named after airline sponsor",
      "\u{1F3DB}\uFE0F Replaced historic Highbury"
    ]
  },
  {
    id: "23",
    text: "Where is the famous Circuit de Monaco?",
    lat: 43.7347,
    lng: 7.4206,
    category: "event",
    venue: "Circuit de Monaco",
    hint: "French Riviera city-state",
    country: "Monaco",
    facts: [
      "\u{1F3CE}\uFE0F Grand Prix held here since 1929, part of F1 since 1950",
      "\u{1F6E5}\uFE0F Racing through narrow city streets",
      "\u{1F48E} Glamorous location with yachts",
      "\u{1F422} Slowest average F1 track speed"
    ]
  },
  {
    id: "24",
    text: "Where were the opening and closing ceremonies of the 2016 Summer Olympics held?",
    lat: -22.9122,
    lng: -43.2302,
    category: "event",
    venue: "Maracan\xE3 (2016 Olympic ceremonies)",
    hint: "First South American Olympics",
    country: "Brazil",
    facts: [
      "\u{1F1E7}\u{1F1F7} First Olympics in South America",
      "\u26BD Neymar led Brazil to football gold",
      "\u{1F3CA} Usain Bolt's final Olympic triple",
      "\u{1F386} Christ the Redeemer lit in colors"
    ]
  },
  {
    id: "25",
    text: "Where is the new Est\xE1dio da Luz, home of Benfica?",
    lat: 38.7528,
    lng: -9.1847,
    category: "stadium",
    venue: "Estadio da Luz",
    hint: "Lisbon, Portugal",
    country: "Portugal",
    facts: [
      "\u{1F3D7}\uFE0F Built in 2002-2003 next to the old Luz, opened October 2003",
      "\u{1F3DF}\uFE0F Capacity about 65,000 (68,100 after 2025 work)",
      "\u{1F3C6} Hosted the Euro 2004 final",
      "\u{1F3AC} Champions League finals were held here in 2014 and 2020"
    ]
  },
  {
    id: "26",
    text: "Location of the Etihad Stadium?",
    lat: 53.4831,
    lng: -2.2004,
    category: "stadium",
    venue: "Etihad Stadium",
    hint: "Manchester City FC",
    country: "United Kingdom",
    facts: [
      "\u{1F499} Manchester City's home since 2003",
      "\u{1F3DF}\uFE0F Capacity 53,400",
      "\u{1F947} Built for 2002 Commonwealth Games",
      "\u{1F3C6} Transformed into title-winning fortress"
    ]
  },
  {
    id: "27",
    text: "Where did Jesse Owens set his long jump world record in 1935?",
    lat: 42.2688,
    lng: -83.7418,
    category: "athlete",
    venue: "Ferry Field",
    hint: "Ann Arbor, Michigan",
    country: "United States",
    facts: [
      "\u{1F4CF} 8.13 metres, on 25 May 1935 - a record that stood for 25 years",
      "\u23F1\uFE0F He set or tied four world records within about 45 minutes that afternoon",
      "\u{1F393} He was competing for Ohio State at the Big Ten championships",
      "\u{1F947} Later won four golds at the 1936 Berlin Olympics"
    ]
  },
  {
    id: "28",
    text: "Location of the famous Monza racing circuit?",
    lat: 45.6156,
    lng: 9.2811,
    category: "event",
    venue: "Autodromo Nazionale Monza",
    hint: "Near Milan, Italy",
    country: "Italy",
    facts: [
      '\u{1F3CE}\uFE0F "Temple of Speed" - fastest F1 track',
      "\u{1F3C1} Has hosted every F1 Italian Grand Prix since 1950 except 1980",
      "\u{1F451} Steeped in Ferrari heritage",
      "\u{1F333} Set in historic royal park"
    ]
  },
  {
    id: "29",
    text: "Where is the Parc des Princes stadium?",
    lat: 48.8414,
    lng: 2.2531,
    category: "stadium",
    venue: "Parc des Princes",
    hint: "PSG home, Paris",
    country: "France",
    facts: [
      "\u{1F534}\u{1F535} Paris Saint-Germain home",
      "\u{1F3DF}\uFE0F Capacity 47,929, opened 1972",
      "\u26BD Hosted 1998 World Cup matches",
      "\u{1F31F} Witnessed Messi, Neymar, Mbapp\xE9 era"
    ]
  },
  {
    id: "30",
    text: "Where were the opening and closing ceremonies of the 2020 Summer Olympics (held in 2021)?",
    lat: 35.6783,
    lng: 139.7147,
    category: "event",
    venue: "Japan National Stadium",
    hint: "Capital of Japan",
    country: "Japan",
    facts: [
      "\u{1F637} First Olympics postponed (COVID-19)",
      "\u{1F6AB} Held without spectators",
      "\u{1F3D0} Added skateboarding, surfing, karate",
      "\u{1F38C} Japan won record 27 gold medals"
    ]
  },
  {
    id: "31",
    text: "Where is the famous Stamford Bridge stadium?",
    lat: 51.4817,
    lng: -0.191,
    category: "stadium",
    venue: "Stamford Bridge",
    hint: "Chelsea FC, London",
    country: "United Kingdom",
    facts: [
      "\u{1F499} Chelsea's home since 1905",
      "\u{1F3DF}\uFE0F Capacity 40,341",
      "\u26BD Compact, intimate atmosphere",
      "\u{1F3C6} Witnessed Abramovich era success"
    ]
  },
  {
    id: "32",
    text: "Location of the historic Rose Bowl stadium?",
    lat: 34.1613,
    lng: -118.1678,
    category: "stadium",
    venue: "Rose Bowl",
    hint: "Pasadena, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Capacity 88,565, opened 1922",
      '\u{1F3C8} "The Granddaddy of Them All"',
      "\u26BD 1994 World Cup final venue",
      "\u{1F3C6} 5 Super Bowls hosted"
    ]
  },
  {
    id: "33",
    text: "Where is the Signal Iduna Park (Westfalenstadion)?",
    lat: 51.4925,
    lng: 7.4517,
    category: "stadium",
    venue: "Signal Iduna Park",
    hint: "Borussia Dortmund, Germany",
    country: "Germany",
    facts: [
      "\u{1F49B}\u26AB Borussia Dortmund's fortress",
      "\u{1F3DF}\uFE0F Capacity 81,365 - largest in Germany",
      '\u{1F4E3} "Yellow Wall" - 25,000 standing terrace',
      "\u{1F3AD} Europe's most intimidating atmosphere"
    ]
  },
  {
    id: "34",
    text: "Location of the iconic Lusail Stadium?",
    lat: 25.4206,
    lng: 51.4897,
    category: "stadium",
    venue: "Lusail Stadium",
    hint: "2022 World Cup Final",
    country: "Qatar",
    facts: [
      "\u{1F3C6} 2022 World Cup final venue",
      "\u{1F3DF}\uFE0F Capacity 88,966",
      "\u2744\uFE0F Air-conditioned in desert heat",
      "\u{1F1E6}\u{1F1F7} Messi lifted trophy here"
    ]
  },
  {
    id: "35",
    text: "Where is the famous Velodrome stadium?",
    lat: 43.2699,
    lng: 5.3958,
    category: "stadium",
    venue: "Stade Velodrome",
    hint: "Olympique Marseille",
    country: "France",
    facts: [
      "\u26AA\u{1F535} Olympique Marseille home",
      "\u{1F3DF}\uFE0F Capacity 67,394",
      "\u{1F3C6} France's most passionate fans",
      "\u26BD Hosted Euro 2016 matches"
    ]
  }
];

// src/lib/questions/stadiums.ts
var stadiumQuestions = [
  {
    id: "s1",
    text: "Where is the Camp Nou, the home of FC Barcelona?",
    lat: 41.3812,
    lng: 2.123,
    category: "stadium",
    venue: "Camp Nou",
    hint: "Catalonia, Spain",
    country: "Spain",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1957, designed by Francesc Mitjans",
      "\u{1F465} Capacity around 99,000 - one of the largest in Europe",
      "\u{1F3D7}\uFE0F Rebuilt in stages since 2023, aiming for around 105,000 seats",
      '\u{1F3B5} Fans sing the "Cant del Bar\xE7a" before kick-off'
    ]
  },
  {
    id: "s2",
    text: "Where is Wembley Stadium, the home of England football?",
    lat: 51.556,
    lng: -0.284,
    category: "stadium",
    venue: "Wembley Stadium",
    hint: "North-west London",
    country: "United Kingdom",
    facts: [
      "\u{1F3C6} The old Wembley on this site hosted the 1966 World Cup final, won by England",
      "\u{1F3DF}\uFE0F Capacity 90,000, the largest in the UK",
      "\u{1F396}\uFE0F Its arch rises 133 metres above the pitch",
      "\u{1F4B7} Cost around 800 million pounds to build"
    ]
  },
  {
    id: "s3",
    text: 'Where is Old Trafford, the "Theatre of Dreams"?',
    lat: 53.4634,
    lng: -2.2911,
    category: "club",
    venue: "Old Trafford",
    hint: "Manchester, England",
    country: "United Kingdom",
    facts: [
      "\u{1F534} Home of Manchester United since 1910",
      "\u{1F465} Holds over 74,000 spectators",
      "\u{1F687} The nearest station is named after the club",
      "\u{1F3C6} United have won 20 English league titles"
    ]
  },
  {
    id: "s4",
    text: "Where is the San Siro, home of AC Milan and Inter Milan?",
    lat: 45.4784,
    lng: 9.1242,
    category: "stadium",
    venue: "San Siro",
    hint: "Milan, Italy",
    country: "Italy",
    facts: [
      "\u{1F3DF}\uFE0F Built in 1926, expanded in 1955 and for the 1990 World Cup",
      "\u{1F465} Capacity around 75,000",
      '\u{1F3A8} The concrete and steel "tubes" outside are its signature',
      "\u{1F3C6} Hosted four European Cup finals"
    ]
  },
  {
    id: "s5",
    text: "Where is Anfield, the home of Liverpool FC?",
    lat: 53.4318,
    lng: -2.9608,
    category: "club",
    venue: "Anfield",
    hint: "Port city in the north of England",
    country: "United Kingdom",
    facts: [
      "\u{1F534} Opened in 1884 - one of the oldest grounds still in use",
      "\u{1F465} Capacity around 61,000",
      "\u{1F3B6} The Kop is the huge single-tier stand behind the goal",
      "\u{1F3C6} Liverpool have won six European Cups"
    ]
  },
  {
    id: "s6",
    text: "Where is the Emirates Stadium, home of Arsenal?",
    lat: 51.5553,
    lng: -0.1081,
    category: "club",
    venue: "Emirates Stadium",
    hint: "North London",
    country: "United Kingdom",
    facts: [
      "\u{1F534} Opened in 2006, designed by Populous",
      "\u{1F465} Capacity around 60,700",
      "\u{1F9F1} The glass and steel exterior is wrapped in murals of Arsenal legends",
      "\u{1F4B7} Cost around 390 million pounds"
    ]
  },
  {
    id: "s7",
    text: "Where is the Allianz Arena, home of Bayern Munich?",
    lat: 48.2191,
    lng: 11.625,
    category: "club",
    venue: "Allianz Arena",
    hint: "Bavaria, southern Germany",
    country: "Germany",
    facts: [
      "\u{1F534} Opened in 2005 for the FIFA World Cup",
      "\u{1F465} Capacity around 75,000",
      "\u{1F4A1} The translucent bubble lights up in the club colours",
      "\u{1F3C6} Hosted the 2012 and 2025 Champions League finals"
    ]
  },
  {
    id: "s8",
    text: "Where is the Stade de France, home of the French national team?",
    lat: 48.9245,
    lng: 2.3602,
    category: "stadium",
    venue: "Stade de France",
    hint: "Just north of Paris",
    country: "France",
    facts: [
      "\u{1F956} Built for the 1998 World Cup, which France won",
      "\u{1F465} Capacity around 80,000",
      "\u{1F3A4} The lower tier can slide back to reveal an athletics track",
      "\u{1F3C6} Hosted the 1998 World Cup final and the Euro 2016 final"
    ]
  },
  {
    id: "s9",
    text: "Where is the Est\xE1dio da Luz, home of Benfica?",
    lat: 38.7528,
    lng: -9.1937,
    category: "club",
    venue: "Est\xE1dio da Luz",
    hint: "Portuguese capital",
    country: "Portugal",
    facts: [
      "\u{1F534} Opened in 2003, replacing the old Est\xE1dio da Luz",
      "\u{1F465} Capacity around 65,000",
      "\u2600\uFE0F The roof is made of steel and polycarbonate, like a cathedral",
      "\u{1F3C6} Hosted the 2014 and 2020 Champions League finals"
    ]
  },
  {
    id: "s10",
    text: "Where is the Orange V\xE9lodrome, home of Olympique de Marseille?",
    lat: 43.2699,
    lng: 5.3959,
    category: "club",
    venue: "Orange V\xE9lodrome",
    hint: "France's second city, on the Mediterranean",
    country: "France",
    facts: [
      "\u{1F535} Opened in 1937, rebuilt in 2014",
      "\u{1F465} Capacity around 67,000",
      '\u{1F6F5} The "V\xE9lodrome" name comes from the cycle races held there',
      "\u{1F4A1} The roof is a fixed white canopy, not retractable"
    ]
  },
  {
    id: "s11",
    text: "Where is the Parc Olympique Lyonnais, known as Groupama Stadium?",
    lat: 45.7653,
    lng: 4.9822,
    category: "stadium",
    venue: "Parc Olympique Lyonnais",
    hint: "Lyon, France",
    country: "France",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2016, designed by Populous",
      "\u{1F465} Capacity around 59,000",
      "\u{1F3A4} The roof is split into two translucent sections",
      "\u26BD Hosted the 2018 UEFA Europa League final"
    ]
  },
  {
    id: "s12",
    text: "Where is the Signal Iduna Park, home of Borussia Dortmund?",
    lat: 51.4925,
    lng: 7.4519,
    category: "club",
    venue: "Signal Iduna Park",
    hint: "Rhine-Ruhr, western Germany",
    country: "Germany",
    facts: [
      "\u{1F49B}\u26AB Capacity around 81,000 - the largest in Germany",
      '\u{1F4E3} The "Yellow Wall" holds 25,000 standing supporters',
      "\u{1F3C6} Hosted the 2001 UEFA Cup final",
      '\u{1F686} It has its own railway stop, "Dortmund Signal Iduna Park"'
    ]
  },
  {
    id: "s13",
    text: "Where is the Tottenham Hotspur Stadium, home of Spurs?",
    lat: 51.6043,
    lng: -0.0665,
    category: "club",
    venue: "Tottenham Hotspur Stadium",
    hint: "North London",
    country: "United Kingdom",
    facts: [
      "\u{1F90D} Opened in 2019 on the site of White Hart Lane",
      "\u{1F465} Capacity around 62,850",
      "\u{1F3DF}\uFE0F The South Stand is the largest single-tier stand in the UK",
      "\u{1F3C8} A retractable grass pitch slides away to reveal an NFL surface"
    ]
  },
  {
    id: "s14",
    text: "Where is the Etihad Stadium, home of Manchester City?",
    lat: 53.4834,
    lng: -2.2002,
    category: "club",
    venue: "Etihad Stadium",
    hint: "Manchester, England",
    country: "United Kingdom",
    facts: [
      "\u{1F535} Opened in 2002 as the City of Manchester Stadium",
      "\u{1F465} Capacity over 61,000 after the North Stand expansion",
      "\u{1F3C5} Built for the 2002 Commonwealth Games; City moved in a year later",
      "\u{1F4B7} Renamed in 2011 after a sponsorship deal"
    ]
  },
  {
    id: "s15",
    text: "Where is the Metropolitano, home of Atl\xE9tico Madrid?",
    lat: 40.4362,
    lng: -3.5995,
    category: "club",
    venue: "Riyadh Air Metropolitano",
    aliases: ["Wanda Metropolitano", "Metropolitano Stadium"],
    hint: "Spanish capital",
    country: "Spain",
    facts: [
      "\u{1F534}\u26AA Opened in 2017, replacing the Vicente Calder\xF3n",
      "\u{1F465} Capacity around 68,000",
      "\u{1F309} A single sweeping roof covers every seat",
      "\u{1F3C6} Hosted the 2019 UEFA Champions League final"
    ]
  },
  {
    id: "s16",
    text: "Where is the Est\xE1dio do Drag\xE3o, home of FC Porto?",
    lat: 41.1618,
    lng: -8.5838,
    category: "club",
    venue: "Est\xE1dio do Drag\xE3o",
    hint: "Northern Portugal, by the Douro",
    country: "Portugal",
    facts: [
      "\u{1F535}\u26AA Opened in 2003 for Euro 2004",
      "\u{1F465} Capacity around 50,000",
      "\u{1F409} The ceiling is a lattice of white steel cables",
      "\u{1F3C6} Hosted the 2021 UEFA Champions League final"
    ]
  },
  {
    id: "s17",
    text: "Where is Celtic Park, the home of Celtic FC?",
    lat: 55.8497,
    lng: -4.2055,
    category: "club",
    venue: "Celtic Park",
    hint: "Glasgow, Scotland",
    country: "United Kingdom",
    facts: [
      "\u{1F49A}\u26AA Opened in 1892, rebuilt between 1994 and 1998",
      "\u{1F465} Capacity around 60,000",
      '\u{1F308} Fans call the ground "Paradise"',
      "\u{1F3C6} Celtic won the European Cup in 1967, the first British club to do so"
    ]
  },
  {
    id: "s18",
    text: "Where is Villa Park, home of Aston Villa?",
    lat: 52.5092,
    lng: -1.8848,
    category: "club",
    venue: "Villa Park",
    hint: "Birmingham, England",
    country: "United Kingdom",
    facts: [
      "\u{1F7E3}\u{1F535} Opened in 1897",
      "\u{1F465} Capacity around 42,000",
      '\u{1F3AD} The famous "Holte End" is named after the old Holte Hotel',
      "\u{1F3C6} Villa won seven league titles and the 1982 European Cup"
    ]
  },
  {
    id: "s19",
    text: "Where is St James' Park, home of Newcastle United?",
    lat: 54.9754,
    lng: -1.6216,
    category: "club",
    venue: "St James' Park",
    hint: "North-east England",
    country: "United Kingdom",
    facts: [
      "\u26AB\u26AA Football played here since 1880; Newcastle United since 1892",
      "\u{1F465} Capacity around 52,000",
      "\u{1F3D9}\uFE0F It sits right in the city centre",
      '\u{1F426} The club is nicknamed "the Magpies"'
    ]
  },
  {
    id: "s20",
    text: "Where is the Stadio Olimpico in Rome?",
    lat: 41.9331,
    lng: 12.4547,
    category: "stadium",
    venue: "Stadio Olimpico",
    hint: "Italian capital, near the Tiber",
    country: "Italy",
    facts: [
      "\u{1F1EE}\u{1F1F9} Opened in 1953, main stadium of the 1960 Olympics",
      "\u{1F465} Capacity around 70,000",
      "\u26BD Home of both AS Roma and Lazio",
      "\u26BD Hosted the 1990 FIFA World Cup final"
    ]
  },
  {
    id: "s21",
    text: "Where is Stadio San Nicola, home of SSC Bari?",
    lat: 41.0848,
    lng: 16.8401,
    category: "stadium",
    venue: "Stadio San Nicola",
    hint: "Apulia, southern Italy",
    country: "Italy",
    facts: [
      "\u{1F3DF}\uFE0F Designed by Renzo Piano, opened in 1990",
      "\u{1F465} Capacity around 58,000",
      '\u{1F6F8} Nicknamed "the spaceship" for its petal-shaped upper tier',
      "\u{1F3C6} Hosted the 1991 European Cup final"
    ]
  },
  {
    id: "s22",
    text: "Where is San Mam\xE9s, the home of Athletic Bilbao?",
    lat: 43.2641,
    lng: -2.9494,
    category: "club",
    venue: "San Mam\xE9s",
    hint: "Basque Country, northern Spain",
    country: "Spain",
    facts: [
      '\u{1F534}\u26AA\u26AB Known as "La Catedral", the new ground opened in 2013',
      "\u{1F465} Capacity around 53,000",
      "\u{1F3DB}\uFE0F Built right beside the old San Mam\xE9s, which opened in 1913",
      "\u{1F3C6} Athletic have never dropped below the top flight in Spain"
    ]
  },
  {
    id: "s23",
    text: "Where is the Mestalla, home of Valencia CF?",
    lat: 39.4747,
    lng: -0.3583,
    category: "club",
    venue: "Mestalla",
    hint: "East coast of Spain",
    country: "Spain",
    facts: [
      "\u{1F987} Opened in 1923",
      "\u{1F465} Capacity around 49,000",
      "\u{1F5BC}\uFE0F The club museum is inside the stadium",
      "\u{1F3C6} Valencia have won six La Liga titles"
    ]
  },
  {
    id: "s24",
    text: "Where is the Ram\xF3n S\xE1nchez Pizju\xE1n, home of Sevilla FC?",
    lat: 37.3841,
    lng: -5.9706,
    category: "club",
    venue: "Ram\xF3n S\xE1nchez Pizju\xE1n",
    hint: "Seville, Andalusia",
    country: "Spain",
    facts: [
      "\u{1F534}\u26AA Opened in 1958",
      "\u{1F465} Capacity around 43,000",
      '\u{1F4E3} The "Biris Norte" ultras fill the north end',
      '\u{1F3BA} Fans sing the "Himno del Centenario" before kick-off'
    ]
  },
  {
    id: "s25",
    text: "Where is the Est\xE1dio Municipal de Braga, home of SC Braga?",
    lat: 41.5627,
    lng: -8.43,
    category: "stadium",
    venue: "Est\xE1dio Municipal de Braga",
    hint: "Northern Portugal",
    country: "Portugal",
    facts: [
      "\u{1F3DF}\uFE0F Designed by Eduardo Souto de Moura, opened in 2003",
      "\u{1F465} Capacity around 30,000",
      "\u26CF\uFE0F The stands are carved into the quarry rock",
      "\u26BD Hosted matches at Euro 2004"
    ]
  },
  {
    id: "s26",
    text: "Where is the Olympiastadion in Munich?",
    lat: 48.1731,
    lng: 11.5466,
    category: "stadium",
    venue: "Olympiastadion",
    hint: "Bavarian capital",
    country: "Germany",
    facts: [
      "\u{1F3DF}\uFE0F Built in 1972 for the Summer Olympics",
      "\u{1F465} Capacity around 69,000",
      "\u{1F9F1} A transparent tent roof covers part of the stands",
      "\u{1F3C6} Hosted the 1974 World Cup final"
    ]
  },
  {
    id: "s27",
    text: "Where is the Deutsche Bank Park, formerly the Commerzbank-Arena, in Frankfurt?",
    lat: 50.0686,
    lng: 8.6452,
    category: "club",
    venue: "Deutsche Bank Park",
    aliases: ["Commerzbank-Arena", "Waldstadion"],
    hint: "Financial centre on the Main, western Germany",
    country: "Germany",
    facts: [
      "\u{1F534}\u26AA Opened in 2005 on the site of the old Waldstadion",
      "\u{1F465} Capacity around 58,000",
      "\u{1F4FA} A giant video cube hangs above the centre of the pitch",
      "\u{1F3C6} Hosted the 2005 Confederations Cup final"
    ]
  },
  {
    id: "s28",
    text: "Where is the Olympiastadion in Berlin?",
    lat: 52.5146,
    lng: 13.2399,
    category: "stadium",
    venue: "Olympiastadion",
    hint: "German capital",
    country: "Germany",
    facts: [
      "\u{1F3DF}\uFE0F Built in 1936 for the Berlin Olympics",
      "\u{1F465} Capacity around 74,000",
      "\u{1F3CB}\uFE0F A translucent roof was added in the 2000-2004 renovation",
      "\u26BD Hosted the 2006 World Cup final"
    ]
  },
  {
    id: "s29",
    text: "Where is the St. Jakob-Park in Basel?",
    lat: 47.5416,
    lng: 7.6203,
    category: "stadium",
    venue: "St. Jakob-Park",
    hint: "Swiss city on the Rhine",
    country: "Switzerland",
    facts: [
      "\u{1F534}\u{1F535} Opened in 2001",
      "\u{1F465} Capacity around 38,000",
      "\u{1F9F1} The roof is a huge cantilever of steel and glass",
      "\u26BD Hosted the 2016 UEFA Europa League final"
    ]
  },
  {
    id: "s30",
    text: "Where is the Letzigrund stadium in Zurich?",
    lat: 47.3828,
    lng: 8.504,
    category: "stadium",
    venue: "Letzigrund stadium",
    hint: "Swiss city, the biggest in the country",
    country: "Switzerland",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1925, completely rebuilt in 2007",
      "\u{1F465} Capacity around 26,000",
      "\u{1F3C3} Hosts the Weltklasse Z\xFCrich athletics meeting",
      "\u26BD Home of FC Z\xFCrich and Grasshopper Club"
    ]
  },
  {
    id: "s31",
    text: "Where is the Arena Na\u021Bional\u0103 in Bucharest?",
    lat: 44.4373,
    lng: 26.1525,
    category: "stadium",
    venue: "Arena Na\u021Bional\u0103",
    hint: "Romanian capital",
    country: "Romania",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2011 on the site of the old National Stadium",
      "\u{1F465} Capacity around 55,000",
      "\u{1F3A4} It has a retractable roof",
      "\u26BD Hosted the 2012 UEFA Europa League final"
    ]
  },
  {
    id: "s32",
    text: "Where is the Vasil Levski National Stadium in Sofia?",
    lat: 42.6919,
    lng: 23.3322,
    category: "stadium",
    venue: "Vasil Levski National Stadium",
    hint: "Bulgarian capital",
    country: "Bulgaria",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1953, rebuilt in 2002",
      "\u{1F465} Capacity around 46,000",
      "\u{1F1E7}\u{1F1EC} Home of the Bulgarian national team",
      "\u{1F333} It sits inside Borisova Gradina, Sofia's oldest park"
    ]
  },
  {
    id: "s33",
    text: "Where is the Wankdorf Stadium in Bern?",
    lat: 46.9632,
    lng: 7.4646,
    category: "stadium",
    venue: "Stadion Wankdorf",
    aliases: ["Stade de Suisse", "Stade de Suisse Wankdorf"],
    hint: "Swiss capital",
    country: "Switzerland",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2005",
      "\u{1F465} Capacity around 31,500",
      "\u2600\uFE0F Its roof carries a large solar power plant",
      "\u26BD Hosted UEFA Euro 2008 matches"
    ]
  },
  {
    id: "s34",
    text: "Where is the Athens Olympic Stadium, main venue of the 2004 Games?",
    lat: 38.0361,
    lng: 23.7875,
    category: "stadium",
    venue: "Athens Olympic Stadium (OAKA)",
    aliases: ["Spyros Louis Olympic Stadium", "OAKA"],
    hint: "Marousi, northern Athens",
    country: "Greece",
    facts: [
      "\u{1F3DB}\uFE0F Opened in 1982",
      "\u{1F465} Capacity around 69,000",
      "\u{1F309} Santiago Calatrava added its steel arch roof for 2004",
      "\u{1F3C6} Hosted the 1994 and 2007 Champions League finals"
    ]
  },
  {
    id: "s35",
    text: "Where is the Stade de la Mosson in Montpellier?",
    lat: 43.622,
    lng: 3.81,
    category: "club",
    venue: "Stade de la Mosson",
    hint: "Southern France, near the Mediterranean",
    country: "France",
    facts: [
      "\u{1F535}\u26AA Opened in 1972, rebuilt for the 1998 World Cup",
      "\u{1F465} Capacity around 32,000",
      '\u{1F3B5} The "Butte Paillade" ultras fill the north end',
      "\u{1F3C6} Home of Montpellier, French champions in 2012"
    ]
  },
  {
    id: "s36",
    text: "Where is the Stade Geoffroy-Guichard in Saint-\xC9tienne?",
    lat: 45.4608,
    lng: 4.3906,
    category: "club",
    venue: "Stade Geoffroy-Guichard",
    hint: 'The "Green" city in the Loire valley',
    country: "France",
    facts: [
      '\u{1F49A} Opened in 1931, known as "Le Chaudron"',
      "\u{1F465} Capacity around 41,000",
      "\u{1F3DF}\uFE0F Hosted matches at Euro 2016",
      "\u{1F3C6} Saint-\xC9tienne won ten French league titles"
    ]
  },
  {
    id: "s37",
    text: "Where is the Parc des Princes in Paris?",
    lat: 48.8414,
    lng: 2.25,
    category: "club",
    venue: "Parc des Princes",
    hint: "French capital, in the 16th arrondissement",
    country: "France",
    facts: [
      "\u{1F535}\u26AA Opened in 1972 on the site of the old stadium",
      "\u{1F465} Capacity around 48,000",
      "\u{1F687} The nearest metro station is Porte de Saint-Cloud",
      "\u{1F3C6} Hosted the first European Cup final, in 1956"
    ]
  },
  {
    id: "s38",
    text: "Where is the Stade de la Beaujoire in Nantes?",
    lat: 47.2561,
    lng: -1.5251,
    category: "club",
    venue: "Stade de la Beaujoire",
    hint: "Western France, on the Loire",
    country: "France",
    facts: [
      "\u{1F49B}\u{1F7E2} Opened in 1984",
      "\u{1F465} Capacity around 35,000",
      "\u26BD Hosted matches at Euro 1984 and the 1998 World Cup",
      "\u{1F3C9} Hosted matches at the 2007 and 2023 Rugby World Cups"
    ]
  },
  {
    id: "s39",
    text: "Where is the King Power Stadium in Leicester?",
    lat: 52.62,
    lng: -1.142,
    category: "club",
    venue: "King Power Stadium",
    hint: "Midlands city, England",
    country: "United Kingdom",
    facts: [
      "\u{1F535} Opened in 2002, a short walk from the old Filbert Street",
      "\u{1F465} Capacity around 32,000",
      "\u{1F3C6} Leicester famously won the Premier League in 2016",
      '\u{1F98A} The club is nicknamed "The Foxes"'
    ]
  },
  {
    id: "s40",
    text: "Where is the Estadi Ol\xEDmpic Llu\xEDs Companys, Barcelona's temporary home from 2023 to 2025?",
    lat: 41.3648,
    lng: 2.1556,
    category: "stadium",
    venue: "Estadio Ol\xEDmpico Llu\xEDs Companys",
    hint: "Montju\xEFc, Barcelona",
    country: "Spain",
    facts: [
      "\u{1F3DF}\uFE0F Built in 1927 for the 1929 International Exposition",
      "\u{1F465} Capacity around 55,000",
      "\u{1F3DB}\uFE0F The 1929 facade was kept when it was rebuilt for the 1992 Games",
      "\u26BD It was the main Olympic stadium of the 1992 Games"
    ]
  },
  {
    id: "s41",
    text: "Where is the Riverside Stadium in Middlesbrough?",
    lat: 54.5747,
    lng: -1.2184,
    category: "club",
    venue: "Riverside Stadium",
    hint: "North-east England",
    country: "United Kingdom",
    facts: [
      "\u{1F534} Opened in 1995 at the Middlehaven docks",
      "\u{1F465} Capacity around 34,000",
      "\u{1F30A} It stands beside the River Tees, hence the name",
      '\u{1F4D6} The club is nicknamed "Boro"'
    ]
  },
  {
    id: "s42",
    text: "Where is the Stadio Olimpico Grande Torino in Turin?",
    lat: 45.0416,
    lng: 7.6472,
    category: "stadium",
    venue: "Stadio Olimpico Grande Torino",
    hint: "Turin, northern Italy",
    country: "Italy",
    facts: [
      "\u26BD\u26AA Opened in 1933, rebuilt in 2006",
      "\u{1F465} Capacity around 28,000",
      "\u2708\uFE0F The name honours the Torino team lost in the 1949 Superga air crash",
      "\u{1F402} Home of Torino FC; Juventus also played here until 1990"
    ]
  },
  {
    id: "s43",
    text: "Where is the Stadio Ennio Tardini in Parma?",
    lat: 44.7952,
    lng: 10.3385,
    category: "club",
    venue: "Stadio Ennio Tardini",
    hint: "Emilia-Romagna, northern Italy",
    country: "Italy",
    facts: [
      "\u{1F49B}\u{1F535} Named after Ennio Tardini, a former club president",
      "\u{1F465} Capacity around 22,000",
      "\u{1F3C6} Parma won the UEFA Cup in 1995 and 1999",
      "\u{1F3D9}\uFE0F It sits close to the city centre of Parma"
    ]
  },
  {
    id: "s44",
    text: "Where is the Stadium de Toulouse?",
    lat: 43.5833,
    lng: 1.4342,
    category: "club",
    venue: "Stadium de Toulouse",
    hint: "Southern France, on the Garonne",
    country: "France",
    facts: [
      "\u{1F7E3}\u26AA Opened in 1937, on an island in the Garonne",
      "\u{1F465} Capacity around 33,000",
      '\u26BD Home of Toulouse FC, "Le TFC"',
      "\u{1F3C6} Toulouse won the French Cup in 2023"
    ]
  },
  {
    id: "s45",
    text: "Where is the Est\xE1dio do Bessa, home of Boavista?",
    lat: 41.1622,
    lng: -8.6428,
    category: "club",
    venue: "Est\xE1dio do Bessa",
    hint: "Porto, northern Portugal",
    country: "Portugal",
    facts: [
      "\u26AB\u26AA Rebuilt for Euro 2004",
      "\u{1F465} Capacity around 28,000",
      `\u{1F406} The "Panteras Negras" are Boavista's ultras`,
      "\u{1F947} Boavista won the Portuguese title in 2001"
    ]
  },
  {
    id: "s46",
    text: "Where is the Est\xE1dio Jos\xE9 Alvalade, home of Sporting CP?",
    lat: 38.7612,
    lng: -9.1608,
    category: "club",
    venue: "Est\xE1dio Jos\xE9 Alvalade",
    hint: "Portuguese capital",
    country: "Portugal",
    facts: [
      "\u{1F49A}\u26AA Opened in 2003, next to the site of the old Alvalade",
      "\u{1F465} Capacity around 50,000",
      "\u{1F981} Sporting were founded in 1906",
      "\u{1F3C6} Hosted the 2005 UEFA Cup final"
    ]
  },
  {
    id: "s47",
    text: "Where is the Est\xE1dio da Madeira in Funchal?",
    lat: 32.6706,
    lng: -16.8835,
    category: "stadium",
    venue: "Est\xE1dio da Madeira",
    hint: "Portuguese island in the Atlantic",
    country: "Portugal",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1999, high in the hills above Funchal",
      "\u{1F465} Capacity around 5,200",
      "\u{1F304} Known as the Choupana, after its neighbourhood",
      "\u{1F3C6} Home of C.D. Nacional"
    ]
  },
  {
    id: "s48",
    text: "Where is the Estadio Gran Canaria in Las Palmas?",
    lat: 28.1,
    lng: -15.456,
    category: "stadium",
    venue: "Estadio Gran Canaria",
    hint: "Canary Island in the Atlantic",
    country: "Spain",
    facts: [
      "\u{1F7E1} Opened in 2003",
      "\u{1F465} Capacity around 32,000",
      "\u{1F3C3} It was built with an athletics track around the pitch",
      "\u26BD Home of UD Las Palmas"
    ]
  },
  {
    id: "s49",
    text: "Where is the Est\xE1dio Municipal de Aveiro?",
    lat: 40.6475,
    lng: -8.5936,
    category: "stadium",
    venue: "Est\xE1dio Municipal de Aveiro",
    hint: "Central Portuguese coast",
    country: "Portugal",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2003",
      "\u{1F465} Capacity around 32,000",
      "\u{1F3A8} Designed by Tom\xE1s Taveira with a multicoloured facade",
      "\u26BD Hosted two group matches at Euro 2004"
    ]
  },
  {
    id: "s50",
    text: "Where is the Stade de la Meinau in Strasbourg?",
    lat: 48.5606,
    lng: 7.7553,
    category: "club",
    venue: "Stade de la Meinau",
    hint: "Alsace, eastern France",
    country: "France",
    facts: [
      "\u{1F535} Home of RC Strasbourg",
      "\u{1F465} Capacity around 26,000",
      "\u26BD Hosted matches at the 1938 World Cup and Euro 1984",
      "\u{1F3C6} The club won the French title in 1979"
    ]
  },
  {
    id: "s51",
    text: "Where is the Stade Olympique de Rad\xE8s in Tunis?",
    lat: 36.7481,
    lng: 10.2725,
    category: "stadium",
    venue: "Stade Olympique de Rad\xE8s",
    hint: "Tunisian capital",
    country: "Tunisia",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2001 for the Mediterranean Games",
      "\u{1F465} Capacity around 60,000",
      "\u26BD Hosted the 2004 Africa Cup of Nations final",
      "\u{1F3D9}\uFE0F It lies in Rad\xE8s, just south-east of Tunis"
    ]
  },
  {
    id: "s52",
    text: "Where is the Moi International Sports Centre in Nairobi?",
    lat: -1.2281,
    lng: 36.8906,
    category: "stadium",
    venue: "Moi International Sports Centre",
    hint: "Kenyan capital",
    country: "Kenya",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1987 for the All-Africa Games",
      "\u{1F4CD} Better known as Kasarani, after its neighbourhood",
      "\u{1F396}\uFE0F Named after Daniel arap Moi, Kenya's second president",
      "\u{1F3C6} A venue for the 2027 Africa Cup of Nations"
    ]
  },
  {
    id: "s53",
    text: "Where is the National Stadium in Lagos?",
    lat: 6.4986,
    lng: 3.3653,
    category: "stadium",
    venue: "National Stadium",
    hint: "Surulere, Lagos",
    country: "Nigeria",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1972",
      "\u{1F3C6} Hosted the 1973 All-Africa Games",
      "\u{1F3C6} Hosted the 1980 Africa Cup of Nations final",
      "\u{1F1F3}\u{1F1EC} Nigeria won their first continental title here in 1980"
    ]
  },
  {
    id: "s54",
    text: "Where is the FNB Stadium, also known as Soccer City, in Johannesburg?",
    lat: -26.2348,
    lng: 27.9825,
    category: "stadium",
    venue: "FNB Stadium",
    hint: "South Africa's largest city",
    country: "South Africa",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1989, rebuilt for the 2010 World Cup",
      "\u{1F465} Capacity around 94,000",
      "\u{1F3A8} Shaped like a calabash, an African cooking pot",
      "\u{1F3C6} Hosted the 2010 World Cup final and the 1996 Africa Cup of Nations final"
    ]
  },
  {
    id: "s55",
    text: "Where is the Estadio Nacional de Chile in Santiago?",
    lat: -33.4645,
    lng: -70.6106,
    category: "stadium",
    venue: "Estadio Nacional de Chile",
    hint: "Chilean capital",
    country: "Chile",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1938, rebuilt in 2010",
      "\u{1F465} Capacity around 47,000",
      '\u{1F1E8}\u{1F1F1} The nickname "El Coloso de \xD1u\xF1oa" means the Colossus of \xD1u\xF1oa',
      "\u{1F3C6} Hosted the 1962 FIFA World Cup final"
    ]
  },
  {
    id: "s56",
    text: "Where is the Estadio Nacional del Peru in Lima?",
    lat: -12.0672,
    lng: -77.0336,
    category: "stadium",
    venue: "Estadio Nacional del Peru",
    hint: "Peruvian capital",
    country: "Peru",
    facts: [
      "\u{1F1F5}\u{1F1EA} Opened in 1952",
      "\u{1F465} Capacity around 43,000",
      "\u26BD Home of the Peru national team",
      "\u{1F3C6} Hosted the 2004 Copa Am\xE9rica final"
    ]
  },
  {
    id: "s57",
    text: "Where is the Estadio Ol\xEDmpico Universitario in Mexico City?",
    lat: 19.3256,
    lng: -99.1806,
    category: "stadium",
    venue: "Estadio Ol\xEDmpico Universitario",
    hint: "Mexican capital, in the south of the city",
    country: "Mexico",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1952, on the campus of the National Autonomous University",
      "\u{1F465} Capacity around 48,000 today",
      "\u{1F3C3} Main stadium of the 1968 Olympics, where the thin air helped sprinters",
      "\u{1F5BC}\uFE0F Diego Rivera designed the relief mosaic on its facade"
    ]
  },
  {
    id: "s58",
    text: "Where is the Arena do Gr\xEAmio in Porto Alegre?",
    lat: -29.9739,
    lng: -51.195,
    category: "club",
    venue: "Arena do Gr\xEAmio",
    hint: "Southern Brazilian city on the Guaiba",
    country: "Brazil",
    facts: [
      "\u{1F535}\u26AA\u26AB Opened in 2012 in the Humait\xE1 neighbourhood",
      "\u{1F465} Capacity around 55,000",
      "\u{1F6E1}\uFE0F It replaced Gr\xEAmio's old Est\xE1dio Ol\xEDmpico",
      "\u{1F3C6} Gr\xEAmio won the first leg of the 2017 Copa Libertadores final here"
    ]
  },
  {
    id: "s59",
    text: "Where is the Est\xE1dio do Morumbi in Sao Paulo?",
    lat: -23.6,
    lng: -46.7222,
    category: "club",
    venue: "Est\xE1dio do Morumbi",
    hint: "Brazil's largest city",
    country: "Brazil",
    facts: [
      "\u{1F534}\u26AA Opened in 1960",
      "\u{1F465} Capacity around 66,000",
      '\u{1F3DF}\uFE0F Known since 2024 as "MorumBIS" under a naming deal',
      "\u26BD Home of S\xE3o Paulo FC"
    ]
  },
  {
    id: "s60",
    text: "Where is the Estadio Monumental in Buenos Aires, home of River Plate?",
    lat: -34.5453,
    lng: -58.4498,
    category: "club",
    venue: "Estadio Monumental",
    hint: "Argentine capital, in the N\xFA\xF1ez district",
    country: "Argentina",
    facts: [
      "\u{1F90D}\u26AA Opened in 1938",
      "\u{1F465} Capacity around 85,000, the largest in South America",
      "\u{1F3C6} Hosted the 1978 FIFA World Cup final",
      "\u{1F3A4} River won the 2015 Copa Libertadores here"
    ]
  },
  {
    id: "s61",
    text: "Where is the Estadio Metropolitano de Merida?",
    lat: 8.5564,
    lng: -71.2167,
    category: "stadium",
    venue: "Estadio Metropolitano de Merida",
    hint: "Venezuelan Andes",
    country: "Venezuela",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2007",
      "\u{1F465} Capacity around 42,000",
      "\u{1F3D4}\uFE0F Surrounded by the peaks of the Andes",
      "\u26BD Built for the 2007 Copa Am\xE9rica"
    ]
  },
  {
    id: "s62",
    text: "Where is the Estadio Corregidora in Queretaro?",
    lat: 20.5778,
    lng: -100.3664,
    category: "stadium",
    venue: "Estadio Corregidora",
    hint: "Central Mexican state",
    country: "Mexico",
    facts: [
      '\u{1F3DF}\uFE0F Opened in 1985, named after the independence heroine "La Corregidora"',
      "\u{1F465} Capacity around 34,000",
      "\u26BD Hosted matches at the 1986 FIFA World Cup",
      '\u{1F413} Home of Quer\xE9taro FC, the "Gallos Blancos"'
    ]
  },
  {
    id: "s63",
    text: "Where is the Estadio Jalisco in Guadalajara?",
    lat: 20.705,
    lng: -103.3281,
    category: "stadium",
    venue: "Estadio Jalisco",
    hint: "Jalisco state, western Mexico",
    country: "Mexico",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1960",
      "\u{1F465} Capacity around 55,000",
      "\u{1F98A} Home of Atlas; Chivas played here until 2010",
      "\u26BD Hosted matches at the 1970 and 1986 World Cups"
    ]
  },
  {
    id: "s64",
    text: "Where is the Estadio Ol\xEDmpico Atahualpa in Quito?",
    lat: -0.1775,
    lng: -78.4766,
    category: "stadium",
    venue: "Estadio Ol\xEDmpico Atahualpa",
    hint: "Ecuadorian capital, high in the Andes",
    country: "Ecuador",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1951",
      "\u{1F465} Capacity around 35,000",
      "\u{1F3D4}\uFE0F Quito, at about 2,850 metres, is one of the highest capitals in the world",
      "\u{1F1EA}\u{1F1E8} Long the home of the Ecuador national team"
    ]
  },
  {
    id: "s65",
    text: "Where is the Estadio Nacional de Costa Rica in San Jose?",
    lat: 9.9365,
    lng: -84.1063,
    category: "stadium",
    venue: "Estadio Nacional de Costa Rica",
    hint: "Costa Rican capital",
    country: "Costa Rica",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2011 in La Sabana park",
      "\u{1F465} Capacity around 35,000",
      "\u{1F91D} It was built with funding from China",
      "\u26BD Hosted the 2014 FIFA U-17 Women's World Cup final"
    ]
  },
  {
    id: "s66",
    text: "Where is the Estadio Monumental in Lima?",
    lat: -12.0557,
    lng: -76.9359,
    category: "club",
    venue: "Estadio Monumental",
    hint: "Peruvian capital, in the district of Ate",
    country: "Peru",
    facts: [
      "\u{1F534}\u26AA Opened in 2000, home of Universitario",
      "\u{1F465} Capacity around 80,000, the largest in Peru",
      '\u{1F397}\uFE0F "La U" is short for Universitario',
      "\u{1F3C6} Universitario reached the 1972 Copa Libertadores final"
    ]
  },
  {
    id: "s67",
    text: "Where is the Estadio Hernando Siles in La Paz?",
    lat: -16.4995,
    lng: -68.1225,
    category: "stadium",
    venue: "Estadio Hernando Siles",
    hint: "Bolivian capital, the highest seat of government",
    country: "Bolivia",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1930",
      "\u{1F465} Capacity around 41,000",
      "\u{1F3D4}\uFE0F At 3,640 metres, home matches are played in thin air",
      "\u26BD Bolivia play their home World Cup qualifiers here"
    ]
  },
  {
    id: "s68",
    text: "Where is the Estadio Gonzalo Pozo Ripalda in Quito?",
    lat: -0.2789,
    lng: -78.5461,
    category: "stadium",
    venue: "Estadio Gonzalo Pozo Ripalda",
    hint: "Ecuadorian capital, in the south of the city",
    country: "Ecuador",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1994",
      "\u{1F465} Capacity around 18,800",
      '\u{1F525} Nicknamed "La Caldera del Sur"',
      "\u26BD Home of SD Aucas"
    ]
  },
  {
    id: "s69",
    text: "Where is the Est\xE1dio do Restelo in Belem?",
    lat: 38.6976,
    lng: -9.2064,
    category: "club",
    venue: "Est\xE1dio do Restelo",
    hint: "Bel\xE9m district of Lisbon",
    country: "Portugal",
    facts: [
      "\u{1F535}\u26AA Opened in 1956, home of Belenenses",
      "\u{1F465} Capacity around 19,800",
      "\u{1F30A} The stands look out over the Tagus river",
      "\u{1F3DB}\uFE0F It sits just above the Jer\xF3nimos Monastery"
    ]
  },
  {
    id: "s70",
    text: "Where is the Arena da Baixada in Curitiba?",
    lat: -25.4482,
    lng: -49.2769,
    category: "club",
    venue: "Arena da Baixada",
    hint: "Southern Brazilian state capital",
    country: "Brazil",
    facts: [
      "\u26BD Rebuilt for the 2014 World Cup",
      "\u{1F465} Capacity around 42,000",
      "\u{1F3DF}\uFE0F It has a retractable roof and an artificial pitch",
      "\u{1F3C6} Athletico Paranaense won the 2018 Copa Sudamericana here"
    ]
  },
  {
    id: "s71",
    text: "Where is the Estadio Alejandro Villanueva, home of Alianza Lima?",
    lat: -12.0686,
    lng: -77.0228,
    category: "club",
    venue: "Estadio Alejandro Villanueva",
    aliases: ["Matute"],
    hint: "Peruvian capital",
    country: "Peru",
    facts: [
      "\u{1F535} Opened in 1974",
      "\u{1F465} Capacity around 34,000",
      "\u{1F396}\uFE0F Alianza Lima were founded in 1901",
      '\u{1F3D9}\uFE0F Known as "Matute", in the La Victoria district'
    ]
  },
  {
    id: "s72",
    text: "Where is the Estadio Monumental Virgen de Chapi in Arequipa?",
    lat: -16.4072,
    lng: -71.5203,
    category: "stadium",
    venue: "Estadio Monumental Virgen de Chapi",
    hint: "Peruvian city under the Misti volcano",
    country: "Peru",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1993",
      "\u{1F465} Capacity around 40,000",
      "\u{1F534}\u26AB Home of FBC Melgar",
      "\u{1F3C6} Cienciano won the 2003 Copa Sudamericana here"
    ]
  },
  {
    id: "s73",
    text: "Where is the Estadio Alejandro Morera Soto in Alajuela?",
    lat: 10.0166,
    lng: -84.2125,
    category: "club",
    venue: "Estadio Alejandro Morera Soto",
    hint: "Costa Rican city near the capital",
    country: "Costa Rica",
    facts: [
      "\u{1F7E0}\u26AA Opened in 1942",
      "\u{1F465} Capacity around 17,000",
      "\u26BD Home of Liga Deportiva Alajuelense",
      '\u{1F331} The club is nicknamed "La Liga"'
    ]
  },
  {
    id: "s74",
    text: "Where is the Estadio Departamental Libertad in Pasto?",
    lat: 1.198,
    lng: -77.2776,
    category: "club",
    venue: "Estadio Departamental Libertad",
    hint: "Colombian city near the Ecuador border",
    country: "Colombia",
    facts: [
      "\u{1F7E0} Opened in 1955",
      "\u{1F465} Capacity around 20,000",
      '\u{1F30B} Home of Deportivo Pasto, "El Volc\xE1nico"',
      "\u{1F3D4}\uFE0F Pasto sits at 2,527 metres above sea level"
    ]
  },
  {
    id: "s75",
    text: "Where is the Estadio Atanasio Girardot in Medellin?",
    lat: 6.2566,
    lng: -75.5901,
    category: "club",
    venue: "Estadio Atanasio Girardot",
    hint: "Colombian city in the Andes",
    country: "Colombia",
    facts: [
      "\u{1F7E2}\u26AA Opened in 1953",
      "\u{1F465} Capacity around 40,000",
      "\u{1F3C6} Home of both Atl\xE9tico Nacional and Independiente Medell\xEDn",
      '\u{1F33A} The city is known as the "City of Eternal Spring"'
    ]
  },
  {
    id: "s76",
    text: "Where is the Estadio Ol\xEDmpico Pascual Guerrero in Cali?",
    lat: 3.4299,
    lng: -76.5411,
    category: "club",
    venue: "Estadio Ol\xEDmpico Pascual Guerrero",
    hint: "Colombian city in the Cauca valley",
    country: "Colombia",
    facts: [
      "\u{1F7E2}\u26AA Opened in 1937",
      "\u{1F465} Capacity around 35,000",
      "\u{1F3C6} Home of Am\xE9rica de Cali; Deportivo Cali played here until 2015",
      "\u{1F3B6} The barra is famous for its noise and its flags"
    ]
  },
  {
    id: "s77",
    text: "Where is the Gran Parque Central in Montevideo?",
    lat: -34.8919,
    lng: -56.1589,
    category: "club",
    venue: "Gran Parque Central",
    hint: "Uruguayan capital on the coast",
    country: "Uruguay",
    facts: [
      "\u{1F535}\u26AA\u{1F534} Opened in 1900, home of Club Nacional",
      "\u{1F465} Capacity around 34,000",
      "\u26BD Hosted one of the two first-ever World Cup matches in 1930",
      "\u{1F3C6} Nacional won the Copa Libertadores in 1971, 1980 and 1988"
    ]
  },
  {
    id: "s78",
    text: "Where is the Estadio Centenario in Montevideo?",
    lat: -34.8945,
    lng: -56.1528,
    category: "stadium",
    venue: "Estadio Centenario",
    hint: "Uruguayan capital",
    country: "Uruguay",
    facts: [
      "\u{1F3DF}\uFE0F Built for the first FIFA World Cup in 1930",
      "\u{1F465} Capacity around 60,000",
      "\u{1F5FC} The Torre de los Homenajes rises above the main stand",
      "\u{1F3C6} Uruguay beat Argentina in the 1930 World Cup final here"
    ]
  },
  {
    id: "s79",
    text: "Where is the Estadio Campe\xF3n del Siglo, home of Pe\xF1arol?",
    lat: -34.7969,
    lng: -56.0672,
    category: "stadium",
    venue: "Estadio Campeon del Siglo",
    hint: "Uruguayan capital",
    country: "Uruguay",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2016",
      "\u{1F465} Capacity around 40,000",
      "\u{1F7E1}\u26AB Pe\xF1arol's own ground, in Ba\xF1ados de Carrasco",
      "\u{1F3C6} Named after Pe\xF1arol being voted South America's club of the 20th century"
    ]
  },
  {
    id: "s80",
    text: "Where is the Estadio Monumental de Maturin?",
    lat: 9.7099,
    lng: -63.2677,
    category: "stadium",
    venue: "Estadio Monumental de Maturin",
    hint: "Venezuelan state capital, near the Orinoco delta",
    country: "Venezuela",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2007",
      "\u{1F465} Capacity around 52,000, the largest in Venezuela",
      "\u26BD Built for the 2007 Copa Am\xE9rica",
      "\u{1F3C6} Home of Monagas SC"
    ]
  },
  {
    id: "s81",
    text: "Where is the Circuit de Monaco, the most famous street circuit?",
    lat: 43.735,
    lng: 7.4209,
    category: "stadium",
    venue: "Circuit de Monaco",
    hint: "Principality on the French Riviera",
    country: "Monaco",
    facts: [
      "\u{1F3CE}\uFE0F Raced around the streets of Monte Carlo since 1929",
      "\u{1F504} The hairpin at Fairmont is the slowest corner in Formula 1",
      "\u{1F697} The tunnel under the Fairmont hotel is the most famous part of the track",
      "\u{1F3C6} Ayrton Senna won here six times"
    ]
  },
  {
    id: "s82",
    text: "Where is the Autodromo Nazionale Monza, home of the Italian Grand Prix?",
    lat: 45.6159,
    lng: 9.2813,
    category: "stadium",
    venue: "Autodromo Nazionale Monza",
    hint: "Northern Italy, near Milan",
    country: "Italy",
    facts: [
      '\u{1F3CE}\uFE0F Opened in 1922, known as the "Temple of Speed"',
      "\u{1F3CE}\uFE0F The old high-speed banking still stands beside the track",
      "\u{1F332} It sits inside the royal park of Monza",
      "\u26A1 Its long straights make it the fastest track on the calendar"
    ]
  },
  {
    id: "s83",
    text: "Where is the Silverstone Circuit, home of the British Grand Prix?",
    lat: 52.0786,
    lng: -1.0169,
    category: "stadium",
    venue: "Silverstone Circuit",
    hint: "Northamptonshire, England",
    country: "United Kingdom",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1948 on an airfield",
      "\u{1F3C1} The Grand Prix circuit is 5.89 kilometres long",
      "\u{1F3C6} It has hosted the British Grand Prix every year since 1987",
      "\u{1F3E2} The Silverstone Wing pit building opened in 2011"
    ]
  },
  {
    id: "s84",
    text: "Where is the Circuit de Spa-Francorchamps?",
    lat: 50.4372,
    lng: 5.9822,
    category: "stadium",
    venue: "Circuit de Spa-Francorchamps",
    hint: "Wallonia, eastern Belgium",
    country: "Belgium",
    facts: [
      '\u{1F3CE}\uFE0F Often called the "spiritual home of motorsport"',
      "\u{1F4CF} Around 7 kilometres long, with long straights and fast corners",
      "\u{1F3C6} Seven-time world champion Michael Schumacher called it his favourite",
      "\u{1F3C1} Hosted a round of the first Formula 1 season in 1950"
    ]
  },
  {
    id: "s85",
    text: "Where is the Suzuka International Racing Course?",
    lat: 34.8431,
    lng: 136.5407,
    category: "stadium",
    venue: "Suzuka International Racing Course",
    hint: "Mie prefecture, central Japan",
    country: "Japan",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1962, designed by John Hugenholtz",
      "\u{1F3C1} The figure-of-eight layout is the only one on the Formula 1 calendar",
      "\u{1F3A1} A Ferris wheel overlooks the track from the amusement park",
      "\u{1F3C6} Senna and Prost collided here in 1989 and 1990"
    ]
  },
  {
    id: "s86",
    text: "Where is the Nurburgring, home of the Nordschleife?",
    lat: 50.3356,
    lng: 6.9475,
    category: "stadium",
    venue: "Nurburgring",
    hint: "Western Germany, near the Eifel",
    country: "Germany",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1927 around N\xFCrburg castle",
      "\u{1F608} The Nordschleife is about 20.8 kilometres long",
      `\u{1F3AC} Niki Lauda's 1976 crash here was retold in the film "Rush"`,
      "\u{1F3C6} The German Grand Prix was held on the Nordschleife until 1976"
    ]
  },
  {
    id: "s87",
    text: "Where is the Circuit Gilles Villeneuve in Montreal?",
    lat: 45.5,
    lng: -73.5228,
    category: "stadium",
    venue: "Circuit Gilles Villeneuve",
    hint: "Quebec, Canada",
    country: "Canada",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1978 on the island of Notre Dame",
      "\u{1F3C1} Named after the Canadian driver Gilles Villeneuve",
      "\u{1F306} The city skyline rises on the horizon behind the pit straight",
      '\u{1F9F1} The "Wall of Champions" at the final chicane is famous'
    ]
  },
  {
    id: "s88",
    text: "Where is the Autodromo Hermanos Rodriguez in Mexico City?",
    lat: 19.4042,
    lng: -99.0907,
    category: "stadium",
    venue: "Autodromo Hermanos Rodriguez",
    hint: "Mexican capital",
    country: "Mexico",
    facts: [
      "\u{1F3CE}\uFE0F The first permanent racing circuit in Mexico",
      "\u{1F3C1} Named after the Rodriguez brothers, Mexican racing pioneers",
      "\u{1F32E} The stadium section is banked and the fans are loud",
      "\u{1F3C6} It hosted the 2015 Mexican Grand Prix"
    ]
  },
  {
    id: "s89",
    text: "Where is the Autodromo Jose Carlos Pace in Sao Paulo?",
    lat: -23.7036,
    lng: -46.6997,
    category: "stadium",
    venue: "Autodromo Jose Carlos Pace",
    hint: "Brazilian city, Interlagos district",
    country: "Brazil",
    facts: [
      "\u{1F3CE}\uFE0F Better known as Interlagos, it opened in 1940",
      "\u{1F3C1} It runs anti-clockwise, rare on the calendar",
      "\u{1F3C6} Ayrton Senna won his home race here in 1991 and 1993",
      "\u{1F4CF} The circuit is in a hilly area of the city"
    ]
  },
  {
    id: "s90",
    text: "Where is the Fuji Speedway?",
    lat: 35.3717,
    lng: 138.927,
    category: "stadium",
    venue: "Fuji Speedway",
    hint: "At the foot of Mount Fuji, Japan",
    country: "Japan",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1965 at the base of Mount Fuji",
      "\u{1F3C1} The original layout had a steep banked first corner",
      "\u{1F5FB} The mountain is visible from almost every part of the track",
      "\u{1F38C} Redesigned by Hermann Tilke and reopened in 2005"
    ]
  },
  {
    id: "s91",
    text: "Where is the Circuit de Barcelona-Catalunya?",
    lat: 41.57,
    lng: 2.2611,
    category: "stadium",
    venue: "Circuit de Barcelona-Catalunya",
    hint: "North-east Spain, near the Mediterranean",
    country: "Spain",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1991",
      "\u{1F3C1} Hosted the Spanish Grand Prix every year from 1991 to 2025",
      "\u{1F3CD}\uFE0F It also hosts the Catalan MotoGP round",
      "\u{1F4CD} It lies in Montmel\xF3, north of Barcelona"
    ]
  },
  {
    id: "s92",
    text: "Where is the Hungaroring, home of the Hungarian Grand Prix?",
    lat: 47.5789,
    lng: 19.2486,
    category: "stadium",
    venue: "Hungaroring",
    hint: "Mogyor\xF3d, near Budapest",
    country: "Hungary",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1986, outside Budapest",
      '\u{1F3C1} Tight and twisty, often called "Monaco without the walls"',
      "\u{1F3DE}\uFE0F Much of the track sits in a natural valley, giving fans a wide view",
      "\u{1F3C6} It was the first Formula 1 race behind the Iron Curtain"
    ]
  },
  {
    id: "s93",
    text: "Where is the Red Bull Ring in Spielberg?",
    lat: 47.2197,
    lng: 14.7647,
    category: "stadium",
    venue: "Red Bull Ring",
    hint: "Styrian region of Austria",
    country: "Austria",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1969 as the \xD6sterreichring, rebuilt in 1996",
      "\u{1F3D4}\uFE0F The hills of Styria rise right behind the circuit",
      "\u{1F3B6} A natural amphitheatre makes it one of the best atmospheres on the grid",
      "\u{1F3C1} Renamed the Red Bull Ring in 2011"
    ]
  },
  {
    id: "s94",
    text: "Where is the Zandvoort circuit?",
    lat: 52.3888,
    lng: 4.5409,
    category: "stadium",
    venue: "Zandvoort circuit",
    hint: "On the Dutch coast, near Haarlem",
    country: "Netherlands",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1948, in the sand dunes",
      "\u{1F3C1} A Formula 1 circuit again from 2021",
      "\u{1F3D6}\uFE0F The Tarzan corner runs close to the beach",
      "\u{1F981} Max Verstappen won the first three races after its 2021 return"
    ]
  },
  {
    id: "s95",
    text: "Where is the Bahrain International Circuit?",
    lat: 26.0325,
    lng: 50.5106,
    category: "stadium",
    venue: "Bahrain International Circuit",
    hint: "Island in the Persian Gulf",
    country: "Bahrain",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 2004, the first circuit in the Middle East",
      "\u{1F5FC} A tall VIP tower overlooks the main straight",
      "\u{1F319} It has held a floodlit night race since 2014",
      "\u{1F3DC}\uFE0F It is built in the desert of Sakhir"
    ]
  },
  {
    id: "s96",
    text: "Where is the Marina Bay Street Circuit in Singapore?",
    lat: 1.2914,
    lng: 103.864,
    category: "stadium",
    venue: "Marina Bay Street Circuit",
    hint: "City state in South-East Asia",
    country: "Singapore",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 2008, the first night race on the Formula 1 calendar",
      "\u{1F303} The circuit runs past the Singapore Flyer and the ArtScience Museum",
      "\u{1F975} One of the hottest and longest races of the season",
      "\u{1F4B0} The Singapore Grand Prix is one of the richest races on the calendar"
    ]
  },
  {
    id: "s97",
    text: "Where is the Baku City Circuit?",
    lat: 40.3725,
    lng: 49.8533,
    category: "stadium",
    venue: "Baku City Circuit",
    hint: "Azerbaijani capital on the Caspian Sea",
    country: "Azerbaijan",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 2016, along the old city walls",
      "\u{1F3F0} The track runs through a UNESCO World Heritage site",
      "\u{1F3C1} The castle section is the slowest part of the lap",
      "\u{1F30A} A flat out run down the seafront is one of the longest on the grid"
    ]
  },
  {
    id: "s98",
    text: "Where is the Buddh International Circuit?",
    lat: 28.3487,
    lng: 77.5331,
    category: "stadium",
    venue: "Buddh International Circuit",
    hint: "Greater Noida, near Delhi",
    country: "India",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 2011, in the northern state of Uttar Pradesh",
      "\u{1F3C1} The track was designed by Hermann Tilke",
      "\u{1F1EE}\u{1F1F3} The first Formula 1 race in India was held here in 2011",
      "\u{1F3CE}\uFE0F It has a high-downforce layout with a double-apex hairpin"
    ]
  },
  {
    id: "s99",
    text: "Where is the Yas Marina Circuit in Abu Dhabi?",
    lat: 24.4672,
    lng: 54.603,
    category: "stadium",
    venue: "Yas Marina Circuit",
    hint: "Emirate capital in the Persian Gulf",
    country: "United Arab Emirates",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 2009, on Yas Island",
      "\u{1F306} The hotel and the marina are built right over the track",
      "\u{1F319} The race starts at sunset and finishes in the dark",
      "\u{1F3C1} It has hosted the season finale most years since 2014"
    ]
  },
  {
    id: "s100",
    text: "Where is the Albert Park Circuit in Melbourne?",
    lat: -37.8497,
    lng: 144.968,
    category: "stadium",
    venue: "Albert Park Circuit",
    hint: "Australian city, around a public park",
    country: "Australia",
    facts: [
      "\u{1F3CE}\uFE0F Opened in 1953, a street circuit around Albert Park lake",
      "\u{1F998} The track has a famously fast corner past the palm trees",
      "\u{1F3C6} The Australian Grand Prix has been held there since 1996",
      "\u{1F697} It is one of the most popular street circuits with drivers"
    ]
  },
  {
    id: "s101",
    text: "Where is Centre Court at Wimbledon, the most famous tennis court in the world?",
    lat: 51.434,
    lng: -0.214,
    category: "stadium",
    venue: "Centre Court at Wimbledon",
    hint: "South-west London",
    country: "United Kingdom",
    facts: [
      "\u{1F3BE} Opened in 1922; the Championships began in 1877",
      "\u{1F465} Capacity around 15,000",
      "\u{1F4FA} The roof was added in 2009, partly because of the rain",
      "\u{1F3A9} The all-white dress code is still enforced"
    ]
  },
  {
    id: "s102",
    text: "Where is Arthur Ashe Stadium at the US Open?",
    lat: 40.7499,
    lng: -73.8463,
    category: "stadium",
    venue: "Arthur Ashe Stadium",
    hint: "Flushing Meadows, New York",
    country: "United States",
    facts: [
      "\u{1F3BE} Opened in 1997, the largest tennis stadium in the world",
      "\u{1F465} Capacity around 23,771",
      "\u{1F4A1} The retractable roof was added in 2016",
      "\u{1F5FD} Arthur Ashe was the first Black man to win the US Open"
    ]
  },
  {
    id: "s103",
    text: "Where is the Philippe-Chatrier court at Roland Garros?",
    lat: 48.8463,
    lng: 2.247,
    category: "stadium",
    venue: "Philippe-Chatrier court at Roland Garros",
    hint: "Paris, on the edge of the Bois de Boulogne",
    country: "France",
    facts: [
      "\u{1F3BE} Home of the French Open since 1928",
      "\u{1F9F1} The stadium is famous for its clay and its orange courts",
      "\u{1F465} Capacity around 15,000",
      "\u{1F3C6} Rafael Nadal won fourteen French Open titles on this court"
    ]
  },
  {
    id: "s104",
    text: "Where is Melbourne Park, home of the Australian Open?",
    lat: -37.8216,
    lng: 144.9785,
    category: "stadium",
    venue: "Melbourne Park",
    hint: "Australian city, beside the Yarra River",
    country: "Australia",
    facts: [
      "\u{1F3BE} Opened in 1988 as Flinders Park, the first Grand Slam venue with a retractable roof",
      "\u{1F465} Capacity around 15,000 on the main court",
      "\u{1F998} The Rod Laver Arena is named after the Australian champion",
      "\u{1F3BE} The tournament is played in January, in the Australian summer"
    ]
  },
  {
    id: "s105",
    text: "Where is the Foro Italico in Rome?",
    lat: 41.929,
    lng: 12.468,
    category: "stadium",
    venue: "Foro Italico",
    hint: "Italian capital",
    country: "Italy",
    facts: [
      "\u{1F3DB}\uFE0F Built in the 1930s under Mussolini as a monument to the Empire",
      "\u{1F3BE} Home of the Italian Open and the Rome Masters tennis event",
      "\u{1F3CA} The Foro Italico swimming stadium is one of the fastest in the world",
      "\u{1F5FF} Statues and marble courts fill the whole complex"
    ]
  },
  {
    id: "s106",
    text: "Where is the Maracanazinho arena in Rio de Janeiro?",
    lat: -22.9137,
    lng: -43.2289,
    category: "stadium",
    venue: "Maracanazinho arena",
    hint: "Brazilian city, next to the Maracana",
    country: "Brazil",
    facts: [
      "\u{1F3C0} Opened in 1954, opposite the Maracan\xE3",
      "\u{1F465} Capacity around 11,800",
      "\u{1F3C6} Brazil won the 1963 Basketball World Championship here",
      "\u{1F3B5} The crowd is close enough to touch the court"
    ]
  },
  {
    id: "s107",
    text: "Where is the Est\xE1dio Nilton Santos, also known as the Engenh\xE3o, in Rio de Janeiro?",
    lat: -22.8932,
    lng: -43.2922,
    category: "stadium",
    venue: "Est\xE1dio Nilton Santos",
    aliases: ["Engenh\xE3o", "Estadio Olimpico Joao Havelange"],
    hint: "Brazilian city, in Engenho de Dentro",
    country: "Brazil",
    facts: [
      "\u{1F3DF}\uFE0F Built for the 2007 Pan American Games",
      "\u{1F465} Capacity around 46,000",
      "\u{1F309} Four large arches hold up its roof",
      "\u{1F3C3} It was the athletics stadium of the 2016 Olympics; home of Botafogo"
    ]
  },
  {
    id: "s108",
    text: "Where is the Panathenaic Stadium in Athens?",
    lat: 37.9683,
    lng: 23.7411,
    category: "stadium",
    venue: "Panathenaic Stadium",
    hint: "Greek capital, near the National Garden",
    country: "Greece",
    facts: [
      "\u{1F3DB}\uFE0F The only stadium in the world built entirely of marble",
      "\u{1F3C3} Main venue of the first modern Olympics in 1896",
      "\u{1F525} The Olympic flame is handed to each host city here",
      "\u{1F3DB}\uFE0F The marble seats were funded by Georgios Averoff, a Greek businessman"
    ]
  },
  {
    id: "s109",
    text: "Where is the Luzhniki Stadium in Moscow?",
    lat: 55.7159,
    lng: 37.5536,
    category: "stadium",
    venue: "Luzhniki Stadium",
    hint: "Russian capital",
    country: "Russia",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1956, the main Olympic stadium of the Soviet era",
      "\u{1F465} Capacity around 78,000 before the renovation",
      "\u{1F3C6} Hosted the 2018 FIFA World Cup final",
      "\u{1F6E0}\uFE0F It was completely rebuilt between 2013 and 2017"
    ]
  },
  {
    id: "s110",
    text: "Where is the SoFi Stadium in Inglewood, near Los Angeles?",
    lat: 33.9535,
    lng: -118.3392,
    category: "stadium",
    venue: "SoFi Stadium",
    hint: "Southern California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2020, the most expensive stadium ever built",
      "\u{1F465} Capacity around 70,000",
      "\u{1F305} The translucent roof canopy is a huge circular structure",
      "\u{1F3A4} It hosted the Super Bowl in 2022"
    ]
  }
];

// src/lib/questions/events.ts
var eventQuestions = [
  {
    id: "e1",
    text: "Where did Babe Ruth hit his famous 60th home run in 1927?",
    lat: 40.8274,
    lng: -73.9281,
    category: "event",
    venue: "Original Yankee Stadium",
    hint: "The original Yankee Stadium, in the Bronx",
    country: "United States",
    facts: [
      "\u26BE Hit off Washington's Tom Zachary on September 30, 1927",
      "\u{1F3AF} It landed in the right-field bleachers",
      "\u{1F4CF} The record stood until Roger Maris hit 61 in 1961",
      "\u{1F9E2} Joe Forner, a 40-year-old Bronx truck driver, got the ball"
    ]
  },
  {
    id: "e2",
    text: "Where did the 1985 European Cup final happen, where a crowd tragedy unfolded?",
    lat: 50.8958,
    lng: 4.3341,
    category: "event",
    venue: "Heysel Stadium",
    hint: "Heysel Stadium, outside Brussels",
    country: "Belgium",
    facts: [
      "\u26BD Juventus beat Liverpool 1-0 with a Michel Platini penalty",
      "\u{1F622} Thirty-nine people died when a wall collapsed before kick-off",
      "\u{1F3DB}\uFE0F The stadium was rebuilt and renamed the King Baudouin Stadium",
      "\u{1F6AB} English clubs were banned from European competition for five years"
    ]
  },
  {
    id: "e3",
    text: "Where was the 1934 FIFA World Cup final played?",
    lat: 41.9241,
    lng: 12.4729,
    category: "event",
    venue: "Stadio Nazionale PNF",
    hint: "Stadio Nazionale PNF, Rome",
    country: "Italy",
    facts: [
      "\u{1F3C6} Italy beat Czechoslovakia 2-1 in extra time",
      "\u26BD Raimundo Orsi equalised late and Angelo Schiavio won it in extra time",
      "\u{1F396}\uFE0F It was the first World Cup final that went into extra time",
      "\u{1F3DF}\uFE0F The Stadio Flaminio now stands on the site"
    ]
  },
  {
    id: "e4",
    text: "Where was the 2005 UEFA Champions League final, decided by a famous penalty?",
    lat: 41.0744,
    lng: 28.7656,
    category: "event",
    venue: "Atat\xFCrk Olympic Stadium",
    hint: "Atat\xFCrk Olympic Stadium, Istanbul",
    country: "Turkey",
    facts: [
      "\u26BD Liverpool came back from 3-0 down to draw 3-3 and won 3-2 on penalties",
      "\u{1F945} Jerzy Dudek saved Andriy Shevchenko's decisive penalty",
      "\u{1F9E4} Dudek's double save from Shevchenko in extra time kept Liverpool alive",
      "\u{1F3C6} It was Liverpool's fifth European Cup"
    ]
  },
  {
    id: "e5",
    text: "Where was the 1982 FIFA World Cup final played?",
    lat: 40.4534,
    lng: -3.6882,
    category: "event",
    venue: "Santiago Bernab\xE9u, Madrid",
    hint: "Santiago Bernab\xE9u, Madrid",
    country: "Spain",
    facts: [
      "\u{1F3C6} Italy beat West Germany 3-1",
      "\u{1F3AF} Paolo Rossi opened the scoring and won the Golden Boot",
      "\u{1F631} Marco Tardelli's screaming celebration became iconic",
      "\u{1F9E4} Dino Zoff lifted the trophy at 40"
    ]
  },
  {
    id: "e6",
    text: 'Where did the 1950 "Maracanazo" happen, when Brazil lost the deciding match of the World Cup?',
    lat: -22.9121,
    lng: -43.2302,
    category: "event",
    venue: "Maracan\xE3",
    hint: "Rio de Janeiro",
    country: "Brazil",
    facts: [
      "\u{1F631} Uruguay beat Brazil 2-1 in front of 173,850 spectators",
      "\u{1F3DF}\uFE0F It remains the largest crowd at a World Cup match or final",
      "\u{1F4FB} The goal by Alcides Ghiggia silenced the whole stadium",
      "\u{1F1E7}\u{1F1F7} It is still remembered as a national wound in Brazil"
    ]
  },
  {
    id: "e7",
    text: "Where did England win the 1966 World Cup final?",
    lat: 51.5563,
    lng: -0.2838,
    category: "event",
    venue: "Old Wembley Stadium",
    hint: "Wembley Stadium, London",
    country: "United Kingdom",
    facts: [
      "\u{1F3C6} England beat West Germany 4-2 in extra time",
      "\u{1F3A9} Bobby Moore was captain, and Geoff Hurst scored a hat-trick",
      "\u{1F3C6} England's only World Cup title",
      "\u{1F415} Pickles the dog found the stolen trophy months earlier"
    ]
  },
  {
    id: "e8",
    text: 'Where was the 1954 FIFA World Cup final, the "Miracle of Bern"?',
    lat: 46.9631,
    lng: 7.4646,
    category: "event",
    venue: "Wankdorf Stadium",
    hint: "Wankdorf Stadium, Bern",
    country: "Switzerland",
    facts: [
      "\u{1F3C6} West Germany beat Hungary 3-2 in the rain",
      "\u{1F945} Helmut Rahn scored the winning goal six minutes from time",
      "\u{1F3DF}\uFE0F Hungary had arrived as the favourites of the world",
      "\u{1F396}\uFE0F It was the first World Cup shown live on television"
    ]
  },
  {
    id: "e9",
    text: "Where did Zidane headbutt Materazzi in the 2006 World Cup final?",
    lat: 52.5147,
    lng: 13.2395,
    category: "event",
    venue: "Olympiastadion Berlin (2006 final)",
    hint: "Olympiastadion, Berlin",
    country: "Germany",
    facts: [
      "\u{1F621} Zidane was sent off in the extra time of the final",
      "\u{1F3C6} Italy went on to win the match on penalties",
      "\u{1F464} It was the last match of Zidane's career",
      "\u{1F4FA} The headbutt is one of the most replayed moments in sport"
    ]
  },
  {
    id: "e10",
    text: "Where was the first FIFA World Cup final ever played?",
    lat: -34.8945,
    lng: -56.1528,
    category: "event",
    venue: "Estadio Centenario, Montevideo",
    hint: "The Centenario, in Montevideo",
    country: "Uruguay",
    facts: [
      "\u{1F3C6} Uruguay beat Argentina 4-2 on 30 July 1930",
      "\u{1F465} 68,000 people packed the stadium for the final",
      "\u{1F3DF}\uFE0F The Centenario was named for the centenary of Uruguay's first constitution",
      "\u{1F6A2} Romania, France and Belgium sailed to Uruguay on the SS Conte Verde"
    ]
  },
  {
    id: "e11",
    text: "Where was the 1978 FIFA World Cup final played?",
    lat: -34.5453,
    lng: -58.4498,
    category: "event",
    venue: "El Monumental, Buenos Aires",
    hint: "The Monumental, Buenos Aires",
    country: "Argentina",
    facts: [
      "\u{1F3C6} Argentina beat the Netherlands 3-1 after extra time",
      "\u{1F3AF} Mario Kempes scored twice",
      "\u{1F1E6}\u{1F1F7} It was Argentina's first World Cup title",
      "\u{1F622} It was the Netherlands' second final defeat in a row"
    ]
  },
  {
    id: "e12",
    text: "Where was the 1994 FIFA World Cup final, the first decided on penalties?",
    lat: 34.1613,
    lng: -118.1678,
    category: "event",
    venue: "Rose Bowl, Pasadena",
    hint: "Rose Bowl, Pasadena, California",
    country: "United States",
    facts: [
      "\u{1F3C6} Brazil beat Italy 3-2 on penalties",
      "\u{1F945} Roberto Baggio missed the deciding penalty",
      "\u{1F3DF}\uFE0F The first World Cup final to end 0-0",
      "\u{1F1E7}\u{1F1F7} It was Brazil's record fourth title"
    ]
  },
  {
    id: "e13",
    text: "Where was the 2003 Champions League final, the first between two Italian clubs?",
    lat: 53.4638,
    lng: -2.2908,
    category: "event",
    venue: "Old Trafford, Manchester",
    hint: "Old Trafford, Manchester",
    country: "United Kingdom",
    facts: [
      "\u26BD Milan and Juventus drew 0-0 after extra time",
      "\u{1F945} Milan won 3-2 on penalties",
      "\u{1F9E4} Dida saved three Juventus penalties",
      "\u{1F3AF} Andriy Shevchenko scored the winning kick"
    ]
  },
  {
    id: "e14",
    text: "Where was the first European Cup final in 1956, Real Madrid's comeback against Reims?",
    lat: 48.8417,
    lng: 2.2502,
    category: "event",
    venue: "Parc des Princes, Paris",
    hint: "Parc des Princes, Paris",
    country: "France",
    facts: [
      "\u26BD Real Madrid came from 2-0 down to beat Reims 4-3",
      "\u{1F3AF} H\xE9ctor Rial scored twice, including the winner",
      "\u{1F3C6} It was the first of five straight European Cups for Real",
      "\u2B50 Alfredo Di St\xE9fano started the comeback"
    ]
  },
  {
    id: "e15",
    text: "Where was the 1994 Champions League final, won 4-0 by Milan?",
    lat: 38.0363,
    lng: 23.7875,
    category: "event",
    venue: "Olympic Stadium, Athens",
    hint: "Olympic Stadium, Athens",
    country: "Greece",
    facts: [
      "\u26BD Milan beat Barcelona 4-0",
      "\u{1F3AF} Daniele Massaro scored twice and Dejan Savicevic added a famous lob",
      "\u{1F6E1}\uFE0F Milan won without the suspended Baresi and Costacurta",
      `\u{1F631} Cruyff's "Dream Team" had been the favourites`
    ]
  },
  {
    id: "e16",
    text: "Where was the 2006 FA Cup final, decided by penalties after a Steven Gerrard equaliser?",
    lat: 51.4817,
    lng: -3.1791,
    category: "event",
    venue: "Millennium Stadium",
    hint: "The Millennium Stadium, Cardiff",
    country: "United Kingdom",
    facts: [
      "\u26BD Liverpool and West Ham drew 3-3, Liverpool won 3-1 on penalties",
      "\u{1F3AF} Gerrard scored twice, including a long-range equaliser in stoppage time",
      "\u{1F9E4} Pepe Reina saved three penalties",
      "\u{1F3DF}\uFE0F The FA Cup final was in Cardiff while Wembley was rebuilt"
    ]
  },
  {
    id: "e17",
    text: "Where was the 2008 Champions League final, when Manchester United beat Chelsea on penalties?",
    lat: 55.7162,
    lng: 37.5539,
    category: "event",
    venue: "Luzhniki",
    hint: "Luzhniki Stadium, Moscow",
    country: "Russia",
    facts: [
      "\u26BD Chelsea and Manchester United drew 1-1 after extra time",
      "\u{1F945} John Terry slipped on the wet turf when he could have won it",
      "\u{1F3C6} It was the first all-English European Cup final",
      "\u{1F9E4} Edwin van der Sar saved Nicolas Anelka's penalty to win it"
    ]
  },
  {
    id: "e18",
    text: "Where was the 2015 Champions League final, won by Barcelona?",
    lat: 52.5149,
    lng: 13.2401,
    category: "event",
    venue: "Olympiastadion Berlin (2015 final)",
    hint: "Olympiastadion, Berlin",
    country: "Germany",
    facts: [
      "\u26BD Barcelona beat Juventus 3-1",
      "\u{1F3AF} Ivan Rakitic scored in the 4th minute",
      "\u{1F3C6} It was Barcelona's fifth Champions League, and their second treble",
      "\u26BD Andr\xE9s Iniesta was voted man of the match"
    ]
  },
  {
    id: "e19",
    text: "Where was the 2024 Champions League final, Real Madrid's fifteenth title?",
    lat: 51.5567,
    lng: -0.2835,
    category: "event",
    venue: "Wembley Stadium (2024 final)",
    hint: "Wembley Stadium, London",
    country: "United Kingdom",
    facts: [
      "\u26BD Real Madrid beat Borussia Dortmund 2-0",
      "\u{1F3AF} Dani Carvajal headed the opener and Vin\xEDcius J\xFAnior added the second",
      "\u{1F3C6} It was Real Madrid's fifteenth European Cup",
      "\u{1F44B} It was Toni Kroos's last club match"
    ]
  },
  {
    id: "e20",
    text: "Where was the 2017 Champions League final, when Real Madrid became the first club to retain the trophy?",
    lat: 51.482,
    lng: -3.1789,
    category: "event",
    venue: "National Stadium of Wales",
    hint: "Cardiff, Wales",
    country: "United Kingdom",
    facts: [
      "\u26BD Real Madrid beat Juventus 4-1",
      "\u{1F3AF} Cristiano Ronaldo scored twice",
      "\u{1F622} Juventus had also lost the 2015 final",
      "\u{1F3DF}\uFE0F The first Champions League final played under a closed roof"
    ]
  },
  {
    id: "e21",
    text: "Where was the 1970 FIFA World Cup final, the first ever shown in colour?",
    lat: 19.3029,
    lng: -99.1505,
    category: "event",
    venue: "Estadio Azteca (1970 final)",
    hint: "Azteca Stadium, Mexico City",
    country: "Mexico",
    facts: [
      "\u{1F3C6} Brazil beat Italy 4-1",
      "\u{1F3AF} Pel\xE9 headed the opening goal on the way to a record third title",
      "\u{1F4FA} It was the first World Cup final broadcast in colour",
      "\u26BD Carlos Alberto finished a famous team move for the fourth goal"
    ]
  },
  {
    id: "e22",
    text: "Where did the 1986 World Cup final take place, Maradona's crowning moment?",
    lat: 19.3033,
    lng: -99.1502,
    category: "event",
    venue: "Estadio Azteca (1986 final)",
    hint: "Azteca Stadium, Mexico City",
    country: "Mexico",
    facts: [
      "\u{1F3C6} Argentina beat West Germany 3-2",
      "\u{1F91D} Brown, Valdano and Burruchaga scored, Maradona set up the winner",
      "\u{1F1E6}\u{1F1F7} It was Argentina's last title until 2022",
      "\u{1F396}\uFE0F Maradona was named player of the tournament"
    ]
  },
  {
    id: "e23",
    text: "Where were the 1992 Olympic Games held?",
    lat: 41.3647,
    lng: 2.1556,
    category: "event",
    venue: "Montju\xEFc Olympic Stadium",
    hint: "Barcelona, at the Montju\xEFc Olympic Stadium",
    country: "Spain",
    facts: [
      "\u{1F3C5} Spain hosted the Summer Olympics for the first time",
      "\u{1F3F9} Archer Antonio Rebollo lit the cauldron with a flaming arrow",
      '\u{1F3C0} The US "Dream Team" won the basketball',
      "\u{1F3DF}\uFE0F The stadium on Montju\xEFc hill was first built in 1929"
    ]
  },
  {
    id: "e24",
    text: "Where were the 1960 Summer Olympics held?",
    lat: 41.9335,
    lng: 12.455,
    category: "event",
    venue: "Stadio Olimpico, Rome",
    hint: "Rome, at the Stadio Olimpico",
    country: "Italy",
    facts: [
      "\u{1F30B} Rome had been due to host in 1908 before Vesuvius erupted",
      "\u{1F3DF}\uFE0F The Stadio Olimpico hosted the athletics and the opening ceremony",
      "\u{1F3C3} Wilma Rudolph won three gold medals",
      "\u{1F3C3} Abebe Bikila won the marathon barefoot"
    ]
  },
  {
    id: "e25",
    text: "Where were the 1980 Summer Olympics held?",
    lat: 55.7166,
    lng: 37.5541,
    category: "event",
    venue: "Central Lenin Stadium",
    hint: "Moscow, at the Luzhniki Stadium",
    country: "Russia",
    facts: [
      "\u{1F3C5} The Soviet Union hosted the Games for the first time",
      "\u{1F3C3} Only eighty nations took part",
      "\u{1F6AB} About 65 countries boycotted the Games",
      "\u{1F3DF}\uFE0F The Luzhniki hosted the opening ceremony and the athletics"
    ]
  },
  {
    id: "e26",
    text: "Where were the 2008 Summer Olympics held?",
    lat: 39.9929,
    lng: 116.3967,
    category: "event",
    venue: "Beijing National Stadium",
    hint: "Beijing, at the National Stadium",
    country: "China",
    facts: [
      "\u{1F3CA} Michael Phelps won a record eight gold medals",
      `\u{1F3DF}\uFE0F The "Bird's Nest" stadium was designed for the Games`,
      "\u{1F3C3} Usain Bolt set world records in the 100m and 200m",
      "\u{1F93C} China topped the gold medal table"
    ]
  },
  {
    id: "e27",
    text: "Where were the 2012 Summer Olympics held?",
    lat: 51.5386,
    lng: -0.0166,
    category: "event",
    venue: "London Stadium",
    hint: "London, at the Olympic Stadium in Stratford",
    country: "United Kingdom",
    facts: [
      "\u{1F3C5} The first city to host the modern Olympics three times",
      "\u{1F3DF}\uFE0F The Olympic Stadium was designed to be converted afterwards",
      "\u{1F3C3} Mo Farah and Jessica Ennis became national heroes",
      "\u{1F3AD} The opening ceremony was directed by Danny Boyle"
    ]
  },
  {
    id: "e28",
    text: "Where were the 1952 Summer Olympics held?",
    lat: 60.1877,
    lng: 24.9228,
    category: "event",
    venue: "Helsinki Olympic Stadium",
    hint: "Helsinki, at the Olympic Stadium",
    country: "Finland",
    facts: [
      "\u{1F3C5} The Soviet Union made its Summer Olympic debut",
      "\u{1F3DF}\uFE0F The Olympic Stadium tower is a landmark of Helsinki",
      "\u{1F3C3} Emil Zatopek won three gold medals in one week",
      "\u{1F525} Paavo Nurmi lit the cauldron by hand"
    ]
  },
  {
    id: "e29",
    text: "Where was the 1976 Olympics, where Nadia Comaneci scored a perfect ten?",
    lat: 45.4898,
    lng: -73.588,
    category: "event",
    venue: "Montreal Forum",
    hint: "Montreal, at the Montreal Forum",
    country: "Canada",
    facts: [
      "\u{1F5A5}\uFE0F The scoreboard showed 1.00 because it could not display a 10",
      "\u{1F938} Comaneci was the first to score a perfect 10 on the uneven bars",
      "\u{1F4FA} The score became an instant global sensation",
      "\u{1F1E8}\u{1F1E6} The last time Canada hosted the Summer Games"
    ]
  },
  {
    id: "e30",
    text: "Where were the 2000 Summer Olympics held?",
    lat: -33.8474,
    lng: 151.0631,
    category: "event",
    venue: "Stadium Australia",
    hint: "Sydney, at Stadium Australia",
    country: "Australia",
    facts: [
      "\u{1F3C5} It was the first Games of the new millennium",
      "\u{1F3DF}\uFE0F The venue is now called the Accor Stadium",
      "\u{1F3C3} Cathy Freeman won the 400m in front of a home crowd",
      "\u{1F389} The handover to Athens at the closing ceremony was a highlight"
    ]
  },
  {
    id: "e31",
    text: "Where were the 1988 Summer Olympics held?",
    lat: 37.5159,
    lng: 127.0728,
    category: "event",
    venue: "Seoul Olympic Stadium",
    hint: "Seoul, at the Olympic Stadium",
    country: "South Korea",
    facts: [
      "\u{1F3C5} The first Olympics held in Asia since 1964",
      "\u{1F525} 1936 marathon champion Sohn Kee-chung carried the torch into the stadium",
      "\u{1F3C3} Ben Johnson won the 100m in a world record, then was stripped of it for doping",
      "\u{1F91D} The first Games since 1976 with both the USA and the Soviet Union"
    ]
  },
  {
    id: "e32",
    text: 'Where is the Melbourne Cricket Ground, the "MCG"?',
    lat: -37.8166,
    lng: 144.9833,
    category: "stadium",
    venue: "Melbourne Cricket Ground (MCG)",
    hint: "Australian city, in East Melbourne",
    country: "Australia",
    facts: [
      "\u{1F3CF} One of the largest sports grounds in the world",
      "\u{1F465} Capacity around 100,000",
      "\u{1F3C6} Main stadium of the 1956 Olympics and the 2006 Commonwealth Games",
      "\u{1F3CF} It hosted the first ever Test match, in 1877, and the 1992 and 2015 World Cup finals"
    ]
  },
  {
    id: "e33",
    text: "Where is Croke Park in Dublin?",
    lat: 53.3607,
    lng: -6.2512,
    category: "stadium",
    venue: "Croke Park",
    hint: "Irish capital, with the GAA",
    country: "Ireland",
    facts: [
      "\u{1F3D0} The home of the GAA and of Gaelic football and hurling",
      "\u{1F465} Capacity around 82,300",
      "\u{1F3C9} Rugby and football were played here from 2007 to 2010, while Lansdowne Road was rebuilt",
      "\u{1F56F}\uFE0F Fourteen people were killed here by British forces on Bloody Sunday, 1920"
    ]
  },
  {
    id: "e34",
    text: "Where is the Eden Gardens in Kolkata?",
    lat: 22.5646,
    lng: 88.3433,
    category: "stadium",
    venue: "Eden Gardens",
    hint: "City of Joy, eastern India",
    country: "India",
    facts: [
      '\u{1F3CF} Known as the "Mecca of Indian cricket"',
      "\u{1F465} Capacity around 68,000",
      "\u{1F3C6} It hosted the 1987 Cricket World Cup final",
      "\u{1F54A}\uFE0F A crowd of 90,000 once attended a Test match here"
    ]
  },
  {
    id: "e35",
    text: "Where was the 1979 Cricket World Cup final won?",
    lat: 51.5294,
    lng: -0.1727,
    category: "event",
    venue: "Lord's Cricket Ground",
    hint: "Lord's Cricket Ground, London",
    country: "United Kingdom",
    facts: [
      "\u{1F3CF} West Indies beat England by 92 runs",
      "\u{1F3CF} Viv Richards made 138 not out and was man of the match",
      "\u{1F3AF} Joel Garner took five wickets",
      "\u{1F3C6} West Indies retained the title they won in 1975"
    ]
  },
  {
    id: "e36",
    text: "Where did India and England tie a 2011 Cricket World Cup match, both scoring 338?",
    lat: 12.9788,
    lng: 77.5996,
    category: "event",
    venue: "M. Chinnaswamy Stadium",
    hint: "The Chinnaswamy Stadium, Bangalore",
    country: "India",
    facts: [
      "\u{1F3CF} Andrew Strauss made 158 for England",
      "\u{1F3CF} Sachin Tendulkar made 120 for India",
      "\u{1F3AF} England needed two off the last ball and Graeme Swann got one",
      "\u{1F3AF} Tim Bresnan took five wickets"
    ]
  },
  {
    id: "e37",
    text: "Where was the 1996 Cricket World Cup final played?",
    lat: 31.5134,
    lng: 74.3335,
    category: "event",
    venue: "Gaddafi Stadium",
    hint: "Gaddafi Stadium, Lahore",
    country: "Pakistan",
    facts: [
      "\u{1F3CF} Sri Lanka won their first World Cup, beating Australia by seven wickets",
      "\u{1F3CF} Aravinda de Silva made 107 not out in the final",
      "\u{1F3AF} De Silva also took three wickets and was man of the match",
      "\u{1F3C6} The first World Cup final played under floodlights"
    ]
  },
  {
    id: "e38",
    text: "Where is the Sydney Cricket Ground?",
    lat: -33.8915,
    lng: 151.2248,
    category: "stadium",
    venue: "Sydney Cricket Ground",
    hint: "Australian city, in Moore Park",
    country: "Australia",
    facts: [
      '\u{1F3CF} Known as "the SCG"',
      "\u{1F465} Capacity around 48,000",
      "\u{1F3DB}\uFE0F The Members' Pavilion dates from 1886",
      "\u{1F3CF} Don Bradman scored 452 not out here in 1930"
    ]
  },
  {
    id: "e39",
    text: "Where was the 1987 Cricket World Cup final, won by Australia?",
    lat: 22.5646,
    lng: 88.3433,
    category: "event",
    venue: "Eden Gardens (1987 final)",
    hint: "Eden Gardens, Kolkata",
    country: "India",
    facts: [
      "\u{1F3CF} Australia beat England by seven runs",
      "\u{1F3CF} David Boon made 75 and was man of the match",
      "\u{1F631} Mike Gatting was out to a reverse sweep at a key moment",
      "\u{1F3C6} The first World Cup final held outside England"
    ]
  },
  {
    id: "e40",
    text: "Where was the 2003 Rugby World Cup final, won by a drop goal in extra time?",
    lat: -33.8453,
    lng: 151.0651,
    category: "event",
    venue: "Telstra Stadium",
    hint: "Stadium Australia, Sydney",
    country: "Australia",
    facts: [
      "\u{1F3C9} England beat Australia 20-17 after extra time",
      "\u{1F9B6} Jonny Wilkinson kicked the winning drop goal in the last minute",
      "\u{1F3C6} England remain the only northern-hemisphere world champions",
      "\u{1F1E6}\u{1F1FA} Australia were the defending champions"
    ]
  }
];

// src/lib/questions/athletes.ts
var athleteQuestions = [
  {
    id: "a1",
    text: "Where did Jesse Owens win four gold medals at the 1936 Olympics?",
    lat: 52.5147,
    lng: 13.2395,
    category: "athlete",
    venue: "The Olympiastadion, Berlin",
    hint: "Capital of Germany",
    country: "Germany",
    facts: [
      "\u{1F947} 100m, 200m, long jump and 4x100m relay",
      "\u{1F91D} German rival Luz Long befriended him during the long jump",
      "\u{1F3C3} His 8.06 m jump stood as the Olympic record until 1960",
      "\u{1F3DF}\uFE0F The stadium later hosted the 2006 World Cup final"
    ]
  },
  {
    id: "a2",
    text: "Where did Bob Beamon jump 8.90 m, an Olympic record that still stands?",
    lat: 19.3319,
    lng: -99.1922,
    category: "athlete",
    venue: "The Olympic Stadium, Mexico City (long jump, 1968)",
    hint: "Capital of Mexico",
    country: "Mexico",
    facts: [
      "\u{1F3C3} 8.90 metres, in 1968 - 55 cm beyond the old world record",
      "\u{1F4CF} The optical measuring device could not reach, so officials measured it by tape",
      "\u{1F62E} He did not grasp the metric distance until a teammate converted it to feet",
      "\u23F3 It stood as the world record for almost 23 years"
    ]
  },
  {
    id: "a3",
    text: "Where did Usain Bolt run 9.69 seconds to win 100m gold at the 2008 Olympics?",
    lat: 39.9932,
    lng: 116.3969,
    category: "athlete",
    venue: "The Bird's Nest, Beijing",
    hint: "Capital of China",
    country: "China",
    facts: [
      "\u{1F3C3} 9.69 seconds, in 2008 - a world record at the time",
      "\u{1F32A}\uFE0F He eased up before the line and still broke the record",
      "\u{1F947} It was his first individual Olympic gold",
      "\u26A1 He also won the 200m in a world record 19.30"
    ]
  },
  {
    id: "a4",
    text: "Where did Usain Bolt become the first man to retain both the 100m and 200m Olympic titles?",
    lat: 51.5386,
    lng: -0.0166,
    category: "athlete",
    venue: "The Olympic Stadium, London",
    hint: "East London, England",
    country: "United Kingdom",
    facts: [
      "\u{1F3C3} He won the 100m in an Olympic record 9.63 and the 200m in 19.32",
      "\u{1F948} Yohan Blake took silver in both races",
      "\u{1F4AA} He did push-ups on the track after the 200m",
      "\u{1F3DF}\uFE0F The stadium later became West Ham United's home"
    ]
  },
  {
    id: "a5",
    text: "Where did Roger Bannister run the first four minute mile?",
    lat: 51.748,
    lng: -1.241,
    category: "athlete",
    venue: "Iffley Road track, Oxford",
    hint: "University city in England",
    country: "United Kingdom",
    facts: [
      "\u{1F3C3} 3:59.4, on 6 May 1954",
      "\u{1F407} Chris Brasher and Chris Chataway were his pacemakers",
      '\u{1F399}\uFE0F Announcer Norris McWhirter got to "three..." before the roar drowned him out',
      "\u{1F550} The record stood for 46 days"
    ]
  },
  {
    id: "a6",
    text: "Where did Mike Powell break Bob Beamon's long jump world record?",
    lat: 35.6783,
    lng: 139.7147,
    category: "athlete",
    venue: "The National Stadium, Tokyo",
    hint: "Capital of Japan",
    country: "Japan",
    facts: [
      "\u{1F4CF} 8.95 metres, on 30 August 1991, at the World Championships",
      "\u23F3 It beat Beamon's record, which had stood for almost 23 years",
      "\u{1F948} He beat Carl Lewis, who had won 65 long jump competitions in a row",
      "\u{1F3DF}\uFE0F The old stadium was rebuilt on the same site for the 2020 Olympics"
    ]
  },
  {
    id: "a7",
    text: "Where did Cathy Freeman win the 400m at the 2000 Olympics?",
    lat: -33.8471,
    lng: 151.0633,
    category: "athlete",
    venue: "Stadium Australia, Sydney",
    hint: "Australia's biggest city",
    country: "Australia",
    facts: [
      "\u{1F3C3} 49.11 seconds, in front of a home crowd of over 110,000",
      "\u{1F1E6}\u{1F1FA} Her lap of honour carried both the Aboriginal and Australian flags",
      "\u{1F525} She had lit the Olympic cauldron at the same stadium ten days earlier",
      "\u{1F9E5} She raced in a full-body hooded suit"
    ]
  },
  {
    id: "a8",
    text: "Where did Nadia Comaneci score the first perfect ten in the Olympics?",
    lat: 45.4903,
    lng: -73.5847,
    category: "athlete",
    venue: "Montreal Forum (1976 Olympic gymnastics)",
    hint: "Quebec, Canada",
    country: "Canada",
    facts: [
      "\u{1F938} A 10.00 on the uneven bars, in 1976",
      '\u{1F4FA} The scoreboard could not show a ten, so it showed "1.00"',
      "\u{1F947} She won three golds, a silver and a bronze at the same Games",
      "\u{1F467} She was only 14 years old"
    ]
  },
  {
    id: "a9",
    text: "Where did Mark Spitz win seven gold medals in a single Olympics?",
    lat: 48.1736,
    lng: 11.5517,
    category: "athlete",
    venue: "Olympia Schwimmhalle, Munich",
    hint: "Bavaria, Germany",
    country: "Germany",
    facts: [
      "\u{1F3CA} 100m and 200m freestyle, 100m and 200m butterfly, and three relays",
      "\u{1F396}\uFE0F A world record in all seven - the most golds at one Games until Phelps won eight in 2008",
      "\u{1F3DF}\uFE0F He was only 22 years old",
      "\u{1F631} The Munich Games were later overshadowed by the attack on the Israeli team"
    ]
  },
  {
    id: "a10",
    text: "Where did Larisa Latynina win the first four of her nine Olympic gold medals?",
    lat: -37.8111,
    lng: 144.9464,
    category: "athlete",
    venue: "West Melbourne Stadium (now Festival Hall)",
    hint: "Victoria, Australia",
    country: "Australia",
    facts: [
      "\u{1F938} Four golds, a silver and a bronze in 1956",
      "\u{1F396}\uFE0F Her 18 Olympic medals were the overall record until Michael Phelps in 2012",
      "\u{1F469} She is still the most decorated female Olympian",
      "\u{1F1FA}\u{1F1E6} She was born in Kherson, in today's Ukraine"
    ]
  },
  {
    id: "a11",
    text: "Where did Dick Fosbury win the high jump with his revolutionary Fosbury flop?",
    lat: 19.3317,
    lng: -99.1919,
    category: "athlete",
    venue: "The Olympic Stadium, Mexico City (high jump, 1968)",
    hint: "1968 Olympic host city",
    country: "Mexico",
    facts: [
      "\u{1F3C3} He cleared 2.24 metres in 1968",
      "\u{1F4A1} He went over the bar with his back to it, and every high jumper copied him",
      "\u{1F947} The flop is still the standard technique today",
      "\u{1F4D0} He was a civil engineer from Oregon State University"
    ]
  },
  {
    id: "a12",
    text: "Where did Steve Ovett and Sebastian Coe swap 800m and 1500m gold at the 1980 Olympics?",
    lat: 55.7169,
    lng: 37.5543,
    category: "athlete",
    venue: "Luzhniki Stadium, Moscow",
    hint: "Capital of Russia",
    country: "Russia",
    facts: [
      "\u{1F947} Ovett won the 800m, the event Coe held the world record in",
      "\u{1F504} Six days later Coe won the 1500m, where Ovett was favourite",
      "\u{1F6AB} The United States and dozens of other nations boycotted the Games",
      "\u{1F3DF}\uFE0F The same stadium hosted the 2018 World Cup final"
    ]
  },
  {
    id: "a13",
    text: "Where did Michael Schumacher take his first Formula 1 win?",
    lat: 50.4375,
    lng: 5.9825,
    category: "athlete",
    venue: "Spa-Francorchamps, in the Ardennes",
    hint: "The Ardennes, Belgium",
    country: "Belgium",
    facts: [
      "\u{1F3CE}\uFE0F He won the Belgian Grand Prix in 1992, in his second season",
      "\u{1F382} It came almost exactly a year after his F1 debut at the same circuit",
      "\u{1F3C6} He went on to win seven world championships",
      "\u{1F464} He was 23 years old on his first win"
    ]
  },
  {
    id: "a14",
    text: "Where did Hicham El Guerrouj set his 1500m and mile world records?",
    lat: 41.9339,
    lng: 12.4547,
    category: "athlete",
    venue: "Stadio Olimpico, Rome (Golden Gala)",
    hint: "Capital of Italy",
    country: "Italy",
    facts: [
      "\u{1F3C3} 3:26.00 for 1500m on 14 July 1998",
      "\u{1F3C3} 3:43.13 for the mile on 7 July 1999",
      "\u23F3 Both records lasted more than 25 years",
      "\u{1F947} He won Olympic 1500m and 5000m gold in Athens in 2004"
    ]
  },
  {
    id: "a15",
    text: "Where did Jonathan Edwards set the triple jump world record?",
    lat: 57.7058,
    lng: 11.9872,
    category: "athlete",
    venue: "The Ullevi stadium, Gothenburg",
    hint: "West coast of Sweden",
    country: "Sweden",
    facts: [
      "\u{1F3C3} 18.29 metres, at the 1995 World Championships - a record that lasted over 30 years",
      "\u{1F947} He went on to win Olympic gold in Sydney in 2000",
      "\u{1F998} He broke the record twice in the same final, 18.16 m then 18.29 m",
      "\u{1F4CF} The first man to jump beyond 18 metres legally"
    ]
  }
];

// src/lib/questions/usa-venues.ts
var usaVenueQuestions = [
  {
    id: "us-venue-001",
    text: "Where is the AT&T Stadium, home of the Dallas Cowboys?",
    lat: 32.7473,
    lng: -97.0945,
    category: "stadium",
    venue: "AT&T Stadium",
    hint: "Arlington, Texas",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Dallas Cowboys since 2009",
      "\u{1F3DF}\uFE0F Capacity 80,000, with a retractable roof",
      "\u{1F4FA} The centre-hung video board is about 160 feet long",
      "\u{1F3C8} Hosted Super Bowl XLV in 2011"
    ]
  },
  {
    id: "us-venue-002",
    text: "Where is Allegiant Stadium, home of the Las Vegas Raiders?",
    lat: 36.0909,
    lng: -115.1833,
    category: "stadium",
    venue: "Allegiant Stadium",
    hint: "Paradise, Nevada",
    country: "United States",
    facts: [
      "\u{1F4B0} Home of the Las Vegas Raiders since 2020",
      "\u{1F3DF}\uFE0F Its fixed translucent ETFE roof keeps the bowl climate controlled",
      "\u{1F3C8} Hosted Super Bowl LVIII in 2024",
      "\u{1F525} The 85-foot Al Davis Memorial Torch stands inside the stadium"
    ]
  },
  {
    id: "us-venue-003",
    text: "Where is Bank of America Stadium, home of the Carolina Panthers?",
    lat: 35.2258,
    lng: -80.8528,
    category: "stadium",
    venue: "Bank of America Stadium",
    hint: "Charlotte, North Carolina",
    country: "United States",
    facts: [
      "\u{1F43C}\uFE0F Home of the Carolina Panthers",
      "\u{1F3DF}\uFE0F Opened in 1996 in Uptown Charlotte",
      "\u26BD Also home of Charlotte FC in MLS",
      "\u{1F3C8} Hosts the ACC Championship Game"
    ]
  },
  {
    id: "us-venue-004",
    text: "Where is Ford Field, home of the Detroit Lions?",
    lat: 42.34,
    lng: -83.0456,
    category: "stadium",
    venue: "Ford Field",
    hint: "Detroit, Michigan",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Detroit Lions",
      "\u{1F3E0} Opened in 2002, it wraps around a former Hudson department store warehouse",
      "\u{1F3C8} Hosted Super Bowl XL in 2006",
      "\u{1F3C0} Hosted the 2009 NCAA Final Four"
    ]
  },
  {
    id: "us-venue-005",
    text: "Where is Northwest Stadium, home of the Washington Commanders?",
    lat: 38.9076,
    lng: -76.8645,
    category: "stadium",
    venue: "Northwest Stadium",
    hint: "Landover, Maryland",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Washington Commanders since 1997",
      "\u{1F3DF}\uFE0F Known as FedExField until 2024",
      "\u{1F3C8} Once the largest NFL stadium, with more than 91,000 seats",
      "\u{1F3E0} The Commanders plan to move back to the old RFK Stadium site in Washington"
    ]
  },
  {
    id: "us-venue-006",
    text: "Where is Gillette Stadium, home of the New England Patriots?",
    lat: 42.0909,
    lng: -71.2643,
    category: "stadium",
    venue: "Gillette Stadium",
    hint: "Foxborough, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F402} Home of the New England Patriots since 2002",
      "\u26BD Also home of the New England Revolution",
      "\u{1F3C6} Hosted matches at the 2026 FIFA World Cup",
      "\u{1F3DF}\uFE0F It replaced the old Foxboro Stadium next door"
    ]
  },
  {
    id: "us-venue-007",
    text: "Where is Hard Rock Stadium, home of the Miami Dolphins?",
    lat: 25.958,
    lng: -80.2389,
    category: "stadium",
    venue: "Hard Rock Stadium",
    hint: "Miami Gardens, Florida",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Miami Dolphins",
      "\u{1F3C8} Hosted six Super Bowls",
      "\u{1F3DF}\uFE0F A canopy added in 2016 shades most of the seats",
      "\u{1F3BE}\uFE0F Also hosts the Miami Open tennis tournament"
    ]
  },
  {
    id: "us-venue-008",
    text: "Where is Acrisure Stadium, home of the Pittsburgh Steelers?",
    lat: 40.4468,
    lng: -80.0158,
    category: "stadium",
    venue: "Acrisure Stadium",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Pittsburgh Steelers",
      "\u{1F3DF}\uFE0F Famous for the Terrible Towels and the 1970s steel dynasty",
      "\u{1F3C8} Opened in 2001 on the North Shore of Pittsburgh",
      "\u{1F3B2} Known as Heinz Field until 2022"
    ]
  },
  {
    id: "us-venue-009",
    text: "Where is Highmark Stadium, home of the Buffalo Bills?",
    lat: 42.7738,
    lng: -78.787,
    category: "stadium",
    venue: "Highmark Stadium",
    hint: "Orchard Park, New York",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Buffalo Bills",
      "\u{1F3DF}\uFE0F The new stadium opened in 2026, across the road from the old one",
      "\u{1F3C8} It holds about 60,000 fans, fewer than the old stadium",
      "\u{1F325} Known for the lake-effect snow that piles up around it"
    ]
  },
  {
    id: "us-venue-010",
    text: "Where is Huntington Bank Field, home of the Cleveland Browns?",
    lat: 41.5061,
    lng: -81.6995,
    category: "stadium",
    venue: "Huntington Bank Field",
    hint: "Cleveland, Ohio",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Cleveland Browns",
      "\u{1F30A} Opened in 1999 on the Lake Erie shore",
      "\u{1F3C8} The Browns have never won a playoff game there",
      "\u{1F3DF}\uFE0F Known as FirstEnergy Stadium until 2023"
    ]
  },
  {
    id: "us-venue-011",
    text: "Where is Lumen Field, home of the Seattle Seahawks?",
    lat: 47.5952,
    lng: -122.3316,
    category: "stadium",
    venue: "Lumen Field",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Seattle Seahawks",
      "\u{1F3DF}\uFE0F Roofs cover about 70 percent of the seats but leave the field open",
      "\u26BD Also home of Seattle Sounders FC",
      "\u{1F4BA} Home of the 12th Man, the loudest crowd in the NFL"
    ]
  },
  {
    id: "us-venue-012",
    text: "Where is Levi's Stadium, home of the San Francisco 49ers?",
    lat: 37.403,
    lng: -121.9698,
    category: "stadium",
    venue: "Levi's Stadium",
    hint: "Santa Clara, California",
    country: "United States",
    facts: [
      "\u{1F402} Home of the San Francisco 49ers since 2014",
      "\u{1F3DF}\uFE0F Opened in 2014 in Santa Clara, about 45 miles south of San Francisco",
      "\u{1F3C8} Hosted Super Bowl 50 in 2016 and Super Bowl LX in 2026",
      "\u{1F3DB}\uFE0F Its green roof makes it one of the greenest stadiums in America"
    ]
  },
  {
    id: "us-venue-013",
    text: "Where is Lucas Oil Stadium, home of the Indianapolis Colts?",
    lat: 39.7601,
    lng: -86.1639,
    category: "stadium",
    venue: "Lucas Oil Stadium",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Indianapolis Colts",
      "\u{1F3DF}\uFE0F A retractable roof and a huge sliding window wall can open it to the air",
      "\u{1F3C8} Hosted Super Bowl XLVI in 2012",
      "\u{1F3E0} It was built across the street from the Indiana Convention Center"
    ]
  },
  {
    id: "us-venue-014",
    text: "Where is Mercedes-Benz Stadium, home of the Atlanta Falcons?",
    lat: 33.7554,
    lng: -84.4008,
    category: "stadium",
    venue: "Mercedes-Benz Stadium",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Atlanta Falcons",
      "\u{1F3DF}\uFE0F The eight-panel roof opens like a camera aperture",
      "\u{1F3C8} Hosted Super Bowl LIII in 2019",
      "\u26BD Also home of Atlanta United in MLS"
    ]
  },
  {
    id: "us-venue-015",
    text: "Where is MetLife Stadium, home of the New York Giants and Jets?",
    lat: 40.8135,
    lng: -74.0745,
    category: "stadium",
    venue: "MetLife Stadium",
    hint: "East Rutherford, New Jersey",
    country: "United States",
    facts: [
      "\u{1F402} Home of both the New York Giants and the New York Jets",
      "\u{1F3C8} Hosted Super Bowl XLVIII in 2014 and the 2026 FIFA World Cup final",
      "\u{1F3DF}\uFE0F Its capacity of about 82,500 is the largest in the NFL",
      "\u{1F3E0} Built next to the old Giants Stadium, demolished in 2010"
    ]
  },
  {
    id: "us-venue-016",
    text: "Where is M&T Bank Stadium, home of the Baltimore Ravens?",
    lat: 39.278,
    lng: -76.6227,
    category: "stadium",
    venue: "M&T Bank Stadium",
    hint: "Baltimore, Maryland",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Baltimore Ravens",
      "\u{1F3DF}\uFE0F Opened in 1998 as Ravens Stadium",
      "\u26BE Stands right next to Oriole Park at Camden Yards",
      "\u{1F3C6} The Ravens won Super Bowls XXXV and XLVII while playing here"
    ]
  },
  {
    id: "us-venue-017",
    text: "Where is NRG Stadium, home of the Houston Texans?",
    lat: 29.6847,
    lng: -95.4107,
    category: "stadium",
    venue: "NRG Stadium",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Houston Texans",
      "\u{1F3DF}\uFE0F The first retractable-roof NFL stadium",
      "\u{1F3C8} Hosted Super Bowl XXXVIII in 2004 and Super Bowl LI in 2017",
      "\u{1F3E0} Stands next to the Astrodome, the first domed stadium for major league sports"
    ]
  },
  {
    id: "us-venue-018",
    text: "Where is Paycor Stadium, home of the Cincinnati Bengals?",
    lat: 39.0954,
    lng: -84.516,
    category: "stadium",
    venue: "Paycor Stadium",
    hint: "Cincinnati, Ohio",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Cincinnati Bengals",
      "\u{1F30A} Opened in 2000 on the Ohio River in downtown Cincinnati",
      "\u{1F3DF}\uFE0F Known as Paul Brown Stadium until 2022",
      "\u{1F3C8} A January 2022 playoff win here ended a 31-year drought for the Bengals"
    ]
  },
  {
    id: "us-venue-019",
    text: "Where is Soldier Field, home of the Chicago Bears?",
    lat: 41.8623,
    lng: -87.6167,
    category: "stadium",
    venue: "Soldier Field",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Chicago Bears since 1971",
      "\u{1F3DF}\uFE0F Opened in 1924, it is the oldest stadium in the NFL",
      "\u{1F3E0} A 2003 rebuild set a modern bowl inside the old Greek-style colonnades",
      "\u26BD Hosted the opening match of the 1994 FIFA World Cup"
    ]
  },
  {
    id: "us-venue-020",
    text: "Where is State Farm Stadium, home of the Arizona Cardinals?",
    lat: 33.5276,
    lng: -112.2626,
    category: "stadium",
    venue: "State Farm Stadium",
    hint: "Glendale, Arizona",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Arizona Cardinals",
      "\u{1F33F} Its grass field rolls outside on a giant tray to soak up the sun",
      "\u{1F3C8} Hosted Super Bowls XLII, XLIX and LVII",
      "\u{1F3DF}\uFE0F Opened in 2006 in Glendale, west of Phoenix"
    ]
  },
  {
    id: "us-venue-021",
    text: "Where is GEHA Field at Arrowhead Stadium, home of the Kansas City Chiefs?",
    lat: 39.0489,
    lng: -94.4839,
    category: "stadium",
    venue: "GEHA Field at Arrowhead Stadium",
    hint: "Kansas City, Missouri",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Kansas City Chiefs since 1972",
      "\u{1F4E2} Fans set a Guinness record for the loudest outdoor stadium crowd in 2014",
      "\u26BE Shares the Truman Sports Complex with Kauffman Stadium",
      "\u26BD Hosted matches at the 2026 FIFA World Cup"
    ]
  },
  {
    id: "us-venue-022",
    text: "Where is U.S. Bank Stadium, home of the Minnesota Vikings?",
    lat: 44.9738,
    lng: -93.2575,
    category: "stadium",
    venue: "U.S. Bank Stadium",
    hint: "Minneapolis, Minnesota",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Minnesota Vikings",
      "\u{1F3DF}\uFE0F A translucent ETFE roof lets daylight into the building",
      "\u{1F3C8} Hosted Super Bowl LII in 2018",
      "\u{1F3E0} Opened in 2016 on the site of the old Metrodome"
    ]
  },
  {
    id: "us-venue-023",
    text: "Where is Empower Field at Mile High, home of the Denver Broncos?",
    lat: 39.7439,
    lng: -105.0201,
    category: "stadium",
    venue: "Empower Field at Mile High",
    hint: "Denver, Colorado",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Denver Broncos",
      "\u{1F3DF}\uFE0F Opened in 2001 next to the site of the old Mile High Stadium",
      "\u{1F3D4}\uFE0F It sits about a mile above sea level, hence the name",
      "\u{1F40E} A statue of the bucking horse Bucky Bronco tops the south scoreboard"
    ]
  },
  {
    id: "us-venue-024",
    text: "Where is the stadium known as LP Field from 2006 to 2015, home of the Tennessee Titans?",
    lat: 36.1665,
    lng: -86.7713,
    category: "stadium",
    venue: "LP Field",
    hint: "Nashville, Tennessee",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Tennessee Titans since 1999",
      "\u{1F3DF}\uFE0F Opened in 1999 as Adelphia Coliseum",
      "\u{1F3C8} Known as Nissan Stadium since 2015",
      "\u{1F3D7}\uFE0F A new enclosed stadium for the Titans is being built next door, due in 2027"
    ]
  },
  {
    id: "us-venue-025",
    text: "Where is EverBank Stadium, home of the Jacksonville Jaguars?",
    lat: 30.3233,
    lng: -81.6373,
    category: "stadium",
    venue: "EverBank Stadium",
    hint: "Jacksonville, Florida",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Jacksonville Jaguars",
      "\u{1F3C8} Hosted Super Bowl XXXIX in 2005",
      "\u{1F3DF}\uFE0F Hosts the yearly Florida vs Georgia college football game",
      "\u{1F3CA} Fans can swim in pools in the north end zone during games"
    ]
  },
  {
    id: "us-venue-026",
    text: "Where is Lambeau Field, home of the Green Bay Packers?",
    lat: 44.5013,
    lng: -88.0622,
    category: "stadium",
    venue: "Lambeau Field",
    hint: "Green Bay, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Green Bay Packers",
      "\u{1F3DF}\uFE0F Opened in 1957, the longest continuously used stadium in the NFL",
      "\u2744\uFE0F Hosted the frozen 1967 Ice Bowl NFL Championship Game",
      "\u{1F3C8} Players jump into the stands after touchdowns in the Lambeau Leap"
    ]
  },
  {
    id: "us-venue-027",
    text: "Where is Lincoln Financial Field, home of the Philadelphia Eagles?",
    lat: 39.9008,
    lng: -75.1675,
    category: "stadium",
    venue: "Lincoln Financial Field",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F402} Home of the Philadelphia Eagles",
      "\u{1F3DF}\uFE0F Also home of the Temple Owls football team",
      "\u{1F3E0} Opened in 2003, replacing Veterans Stadium",
      "\u26BD Hosted matches at the 2026 FIFA World Cup"
    ]
  },
  {
    id: "us-venue-028",
    text: "Where is SoFi Stadium, home of the Los Angeles Rams and Chargers?",
    lat: 33.9535,
    lng: -118.3392,
    category: "stadium",
    venue: "SoFi Stadium",
    hint: "Inglewood, California",
    country: "United States",
    facts: [
      "\u{1F402} Shared home of the Los Angeles Rams and the Los Angeles Chargers",
      "\u{1F3DF}\uFE0F It is covered by a huge translucent canopy that keeps the bowl in shade",
      "\u{1F3C8} Hosted Super Bowl LVI in 2022, won by the home team Rams",
      "\u{1F3E0} It is the most expensive stadium ever built"
    ]
  },
  {
    id: "us-venue-029",
    text: "Where is Dodger Stadium, home of the Los Angeles Dodgers?",
    lat: 34.0739,
    lng: -118.24,
    category: "stadium",
    venue: "Dodger Stadium",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Los Angeles Dodgers since 1962",
      "\u{1F3D4}\uFE0F Built in Chavez Ravine, with the San Gabriel Mountains beyond",
      "\u{1F465} Its 56,000 seats are the most of any major league ballpark",
      "\u26BE Hosted the 2022 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-030",
    text: "Where is Wrigley Field, home of the Chicago Cubs?",
    lat: 41.9484,
    lng: -87.6553,
    category: "stadium",
    venue: "Wrigley Field",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Chicago Cubs",
      "\u{1F33F} The famous ivy on the outfield walls was added in 1937",
      "\u{1F3E0} Second oldest ballpark in the major leagues, opened in 1914",
      "\u{1F522} The hand-turned centre field scoreboard dates from 1937"
    ]
  },
  {
    id: "us-venue-031",
    text: "Where is Rate Field, home of the Chicago White Sox?",
    lat: 41.8299,
    lng: -87.6338,
    category: "stadium",
    venue: "Rate Field",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Chicago White Sox since 1991",
      "\u{1F3E0} Built across the street from the old Comiskey Park",
      "\u26BE Hosted the 2005 World Series, won by the White Sox",
      "\u{1F386} Known as Guaranteed Rate Field until 2025"
    ]
  },
  {
    id: "us-venue-032",
    text: "Where is Busch Stadium, home of the St. Louis Cardinals?",
    lat: 38.6226,
    lng: -90.1928,
    category: "stadium",
    venue: "Busch Stadium",
    hint: "St. Louis, Missouri",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the St. Louis Cardinals since 2006",
      "\u{1F3C6} The Cardinals won the World Series in its first season and again in 2011",
      "\u26BE Hosted the 2009 MLB All-Star Game",
      "\u{1F5FF} A statue of Stan Musial stands outside the third base gate"
    ]
  },
  {
    id: "us-venue-033",
    text: "Where is Kauffman Stadium, home of the Kansas City Royals?",
    lat: 39.0517,
    lng: -94.4803,
    category: "stadium",
    venue: "Kauffman Stadium",
    hint: "Kansas City, Missouri",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Kansas City Royals",
      "\u26F2 Its outfield fountains are the largest privately funded fountain in the world",
      "\u{1F451} Opened in 1973, its scoreboard is topped by a giant crown",
      "\u26BE Hosted Game 7 of the 2014 World Series"
    ]
  },
  {
    id: "us-venue-034",
    text: "Where is Truist Park, home of the Atlanta Braves?",
    lat: 33.8908,
    lng: -84.4678,
    category: "stadium",
    venue: "Truist Park",
    hint: "Cumberland, Georgia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Atlanta Braves since 2017",
      "\u{1F37D}\uFE0F The Battery district around it is a whole new neighbourhood of restaurants and offices",
      "\u{1F5FA}\uFE0F It stands in Cobb County, northwest of downtown Atlanta",
      "\u26BE Hosted the 2025 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-035",
    text: "Where is Target Field, home of the Minnesota Twins?",
    lat: 44.9797,
    lng: -93.276,
    category: "stadium",
    venue: "Target Field",
    hint: "Minneapolis, Minnesota",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Minnesota Twins",
      "\u{1F3E0} Opened in 2010 in the North Loop of downtown Minneapolis",
      "\u26BE Hosted the 2014 MLB All-Star Game",
      "\u{1FAA8} Its walls are clad in Kasota limestone from southern Minnesota"
    ]
  },
  {
    id: "us-venue-036",
    text: "Where is Progressive Field, home of the Cleveland Guardians?",
    lat: 41.4962,
    lng: -81.6852,
    category: "stadium",
    venue: "Progressive Field",
    hint: "Cleveland, Ohio",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Cleveland Guardians",
      "\u{1F3E0} Opened in 1994 as Jacobs Field",
      "\u{1F39F}\uFE0F Sold out 455 games in a row from 1995 to 2001",
      "\u26BE Hosted the 2016 World Series and the 2019 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-037",
    text: "Where is Comerica Park, home of the Detroit Tigers?",
    lat: 42.3467,
    lng: -83.0572,
    category: "stadium",
    venue: "Comerica Park",
    hint: "Detroit, Michigan",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Detroit Tigers since 2000",
      "\u{1F3E0} It was designed so that the Detroit skyline sits behind the centre field wall",
      "\u26BE Hosted the 2005 MLB All-Star Game",
      "\u{1F42F} Giant tiger statues guard the main entrance"
    ]
  },
  {
    id: "us-venue-038",
    text: "Where is Daikin Park, home of the Houston Astros?",
    lat: 29.7573,
    lng: -95.3555,
    category: "stadium",
    venue: "Daikin Park",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Houston Astros since 2000",
      "\u{1F3E0} Known as Minute Maid Park until 2025",
      "\u26BE Hosted World Series games in 2005, 2017, 2019, 2021 and 2022",
      "\u{1F682} A replica steam train runs along the left field wall after Astros home runs"
    ]
  },
  {
    id: "us-venue-039",
    text: "Where is Oracle Park, home of the San Francisco Giants?",
    lat: 37.7786,
    lng: -122.3893,
    category: "stadium",
    venue: "Oracle Park",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the San Francisco Giants",
      "\u{1F30A} Home runs to right field can splash into McCovey Cove",
      "\u{1F3E0} Opened in 2000 on the San Francisco waterfront",
      "\u{1F964} A giant Coca-Cola bottle with slides sits beyond left field"
    ]
  },
  {
    id: "us-venue-040",
    text: "Where is T-Mobile Park, home of the Seattle Mariners?",
    lat: 47.5914,
    lng: -122.3325,
    category: "stadium",
    venue: "T-Mobile Park",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Seattle Mariners",
      "\u{1F3E0} Opened in 1999 as Safeco Field",
      "\u2602\uFE0F Its retractable roof covers the field without fully enclosing it",
      "\u26BE Hosted the 2001 and 2023 MLB All-Star Games"
    ]
  },
  {
    id: "us-venue-041",
    text: "Where is Globe Life Field, home of the Texas Rangers?",
    lat: 32.7473,
    lng: -97.0842,
    category: "stadium",
    venue: "Globe Life Field",
    hint: "Arlington, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Texas Rangers since 2020",
      "\u26BE Hosted the whole 2020 World Series and the 2024 MLB All-Star Game",
      "\u{1F3E0} Built near AT&T Stadium in the Arlington entertainment district",
      "\u{1F3D6} The ballpark has a retractable roof and air conditioning"
    ]
  },
  {
    id: "us-venue-042",
    text: "Where is Chase Field, home of the Arizona Diamondbacks?",
    lat: 33.4453,
    lng: -112.066,
    category: "stadium",
    venue: "Chase Field",
    hint: "Phoenix, Arizona",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Arizona Diamondbacks",
      "\u{1F3E0} Opened in 1998 as Bank One Ballpark, the first US ballpark with a retractable roof",
      "\u{1F3E0} It is the only big league ballpark with a swimming pool in the outfield",
      "\u{1F321} The roof and air conditioning make it a natural place to watch a game in the desert heat"
    ]
  },
  {
    id: "us-venue-043",
    text: "Where is PNC Park, home of the Pittsburgh Pirates?",
    lat: 40.4469,
    lng: -80.0057,
    category: "stadium",
    venue: "PNC Park",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Pittsburgh Pirates",
      "\u{1F3D6} It sits right on the Allegheny River, with the Roberto Clemente Bridge behind it",
      "\u{1F3E0} Opened in 2001 near the site of the old Three Rivers Stadium",
      "\u26BE Hosted the 2006 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-044",
    text: "Where is Great American Ball Park, home of the Cincinnati Reds?",
    lat: 39.0972,
    lng: -84.517,
    category: "stadium",
    venue: "Great American Ball Park",
    hint: "Cincinnati, Ohio",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Cincinnati Reds",
      "\u{1F6A2} Riverboat smokestacks beyond centre field fire after Reds home runs",
      "\u{1F3E0} Opened in 2003 next to the Ohio River",
      "\u26BE Hosted the 2015 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-045",
    text: "Where is American Family Field, home of the Milwaukee Brewers?",
    lat: 43.028,
    lng: -87.9712,
    category: "stadium",
    venue: "American Family Field",
    hint: "Milwaukee, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Milwaukee Brewers",
      "\u{1FA6D} Its fan-shaped retractable roof opens and closes like a folding fan",
      "\u{1F3E0} Opened in 2001 as Miller Park",
      "\u26BE Hosted the 2002 MLB All-Star Game, which ended in a tie"
    ]
  },
  {
    id: "us-venue-046",
    text: "Where is Petco Park, home of the San Diego Padres?",
    lat: 32.7076,
    lng: -117.1566,
    category: "stadium",
    venue: "Petco Park",
    hint: "San Diego, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the San Diego Padres",
      "\u{1F3ED} The 1909 Western Metal Supply Co. building forms the left field corner",
      "\u{1F3E0} Opened in 2004 in the East Village, next to the Gaslamp Quarter",
      "\u26BE Hosted the 2016 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-047",
    text: "Where is Angel Stadium, home of the Los Angeles Angels?",
    lat: 33.8003,
    lng: -117.8827,
    category: "stadium",
    venue: "Angel Stadium",
    hint: "Anaheim, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Los Angeles Angels",
      "\u{1F170}\uFE0F A 230-foot sign shaped like a giant letter A stands in the parking lot",
      "\u{1F3E0} Opened in 1966 as Anaheim Stadium",
      "\u{1F3C6} The Angels won the 2002 World Series here"
    ]
  },
  {
    id: "us-venue-048",
    text: "Where is Camden Yards, home of the Baltimore Orioles?",
    lat: 39.2839,
    lng: -76.6217,
    category: "stadium",
    venue: "Camden Yards",
    hint: "Baltimore, Maryland",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Baltimore Orioles",
      "\u{1F9F1} The long brick B&O Warehouse lines the right field side",
      "\u{1F3E0} Opened in 1992, it started the wave of retro-style ballparks",
      "\u26BE Cal Ripken Jr. broke the record for consecutive games played here in 1995"
    ]
  },
  {
    id: "us-venue-049",
    text: "Where is Citi Field, home of the New York Mets?",
    lat: 40.7571,
    lng: -73.8458,
    category: "stadium",
    venue: "Citi Field",
    hint: "Queens, New York",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the New York Mets since 2009",
      "\u{1F3E0} Built next to the old site of Shea Stadium",
      "\u{1F34E} The Home Run Apple rises from centre field after every Mets homer",
      "\u26BE Hosted the 2013 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-050",
    text: "Where is Nationals Park, home of the Washington Nationals?",
    lat: 38.8721,
    lng: -77.0074,
    category: "stadium",
    venue: "Nationals Park",
    hint: "Washington, District of Columbia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Washington Nationals since 2008",
      "\u{1F30A} Stands on the Anacostia River waterfront",
      "\u{1F33F} The first major US stadium to be LEED certified as a green building",
      "\u26BE Hosted the 2018 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-051",
    text: "Where is loanDepot park, home of the Miami Marlins?",
    lat: 25.7781,
    lng: -80.2197,
    category: "stadium",
    venue: "loanDepot park",
    hint: "Miami, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Miami Marlins",
      "\u{1F41F} A colourful home run sculpture comes alive after Marlins homers",
      "\u{1F3E0} Opened in 2012 in Little Havana, on the site of the old Orange Bowl",
      "\u26BE Hosted the 2017 MLB All-Star Game"
    ]
  },
  {
    id: "us-venue-052",
    text: "Where is Tropicana Field, home of the Tampa Bay Rays?",
    lat: 27.7682,
    lng: -82.6534,
    category: "stadium",
    venue: "Tropicana Field",
    hint: "St. Petersburg, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Tampa Bay Rays since 1998",
      "\u26FA Its tilted fixed dome is the only non-retractable roof in the major leagues",
      "\u{1F3E0} Opened in 1990 as the Florida Suncoast Dome",
      "\u{1F32A}\uFE0F Hurricane Milton tore off much of its roof fabric in 2024"
    ]
  },
  {
    id: "us-venue-053",
    text: "Where is Sutter Health Park, temporary home of the Athletics?",
    lat: 38.5804,
    lng: -121.5135,
    category: "stadium",
    venue: "Sutter Health Park",
    hint: "West Sacramento, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Temporary home of the Athletics since 2025, while their Las Vegas ballpark is built",
      "\u{1F3E0} Opened in 2000 as Raley Field, home of the minor league Sacramento River Cats",
      "\u{1F30A} Stands on the Sacramento River, across from downtown Sacramento",
      "\u26BE The Athletics moved here from Oakland after 57 seasons"
    ]
  },
  {
    id: "us-venue-054",
    text: "Where is Fenway Park, home of the Boston Red Sox?",
    lat: 42.3467,
    lng: -71.0972,
    category: "stadium",
    venue: "Fenway Park",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Boston Red Sox since 1912",
      "\u{1F33F} The Green Monster, a 37-foot wall, stands in left field",
      "\u{1F3E0} The oldest ballpark in the major leagues still in use",
      "\u{1F3C6} The Red Sox won the 2013 World Series here, their first title at home since 1918"
    ]
  },
  {
    id: "us-venue-055",
    text: "Where is Yankee Stadium, home of the New York Yankees?",
    lat: 40.8296,
    lng: -73.9262,
    category: "stadium",
    venue: "Yankee Stadium",
    hint: "The Bronx, New York",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the New York Yankees since 2009",
      "\u{1F3D6} Monument Park behind the outfield wall holds retired numbers on marble columns",
      "\u{1F3E0} Built across the street from the original 1923 Yankee Stadium",
      "\u{1F3C6} The Yankees won the 2009 World Series in its very first season"
    ]
  },
  {
    id: "us-venue-056",
    text: "Where is the historic Oakland Coliseum, former home of the Oakland Athletics?",
    lat: 37.7516,
    lng: -122.2005,
    category: "stadium",
    venue: "Oakland Coliseum",
    hint: "Oakland, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Oakland Athletics from 1968 to 2024",
      "\u{1F3C6} The A's won three straight World Series from 1972 to 1974 while playing here",
      "\u{1F3C8} Home of the Raiders from 1966 to 1981 and again from 1995 to 2019",
      "\u26F0\uFE0F A towering 1996 stand in the outfield is nicknamed Mount Davis"
    ]
  },
  {
    id: "us-venue-057",
    text: "Where is Madison Square Garden, the oldest arena in the NBA?",
    lat: 40.7505,
    lng: -73.9934,
    category: "stadium",
    venue: "Madison Square Garden",
    hint: "Manhattan, New York",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the New York Knicks and the New York Rangers",
      "\u{1F3E0} Opened in 1968 on top of Penn Station",
      "\u{1F3C0} Hosted Knicks games in the 1994 and 1999 NBA Finals",
      "\u{1F3D2} The Rangers won the 1994 Stanley Cup here"
    ]
  },
  {
    id: "us-venue-058",
    text: "Where is Crypto.com Arena, home of the Los Angeles Lakers?",
    lat: 34.0433,
    lng: -118.2671,
    category: "stadium",
    venue: "Crypto.com Arena",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Los Angeles Lakers and the LA Kings",
      "\u{1F3E0} Opened in 1999 as Staples Center",
      "\u2B50 Hosted the NBA All-Star Game in 2004, 2011 and 2018",
      "\u{1F3AD} Stands next to the L.A. Live entertainment district"
    ]
  },
  {
    id: "us-venue-059",
    text: "Where is TD Garden, home of the Boston Celtics?",
    lat: 42.3662,
    lng: -71.0621,
    category: "stadium",
    venue: "TD Garden",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Boston Celtics and the Boston Bruins",
      "\u{1F686} It sits on top of North Station, with trains running underneath it",
      "\u{1F3E0} Opened in 1995 next to the site of the old Boston Garden",
      "\u{1F3C6} The Celtics won the 2008 and 2024 NBA titles here"
    ]
  },
  {
    id: "us-venue-060",
    text: "Where is the United Center, home of the Chicago Bulls?",
    lat: 41.8807,
    lng: -87.6742,
    category: "stadium",
    venue: "United Center",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Chicago Bulls and Blackhawks since 1994",
      "\u{1F5FF} A bronze statue of Michael Jordan stands inside the atrium",
      "\u{1F3C6} The Bulls clinched NBA titles here in 1996 and 1997",
      "\u2B50 Hosted the 2020 NBA All-Star Game"
    ]
  },
  {
    id: "us-venue-061",
    text: "Where is Chase Center, home of the Golden State Warriors?",
    lat: 37.768,
    lng: -122.3877,
    category: "stadium",
    venue: "Chase Center",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Golden State Warriors since 2019",
      "\u{1F3E0} Opened in 2019 in the Mission Bay neighbourhood",
      "\u2B50 Hosted the 2025 NBA All-Star Game",
      "\u{1F3C0} Also home of the WNBA Golden State Valkyries since 2025"
    ]
  },
  {
    id: "us-venue-062",
    text: "Where is Barclays Center, home of the Brooklyn Nets?",
    lat: 40.6826,
    lng: -73.9721,
    category: "stadium",
    venue: "Barclays Center",
    hint: "Brooklyn, New York",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Brooklyn Nets since 2012",
      "\u{1F3E0} Its rust-coloured weathered steel facade is a Brooklyn landmark",
      "\u{1F687} Sits on top of the Atlantic Avenue-Barclays Center subway station",
      "\u{1F3C0} Also home of the WNBA New York Liberty"
    ]
  },
  {
    id: "us-venue-063",
    text: "Where is the American Airlines Center, home of the Dallas Mavericks?",
    lat: 32.7905,
    lng: -96.8103,
    category: "stadium",
    venue: "American Airlines Center",
    hint: "Dallas, Texas",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Dallas Mavericks",
      "\u{1F3D2} Also home of the Dallas Stars",
      "\u{1F3E0} Opened in 2001 in Victory Park, just north of downtown Dallas",
      "\u{1F3C6} Hosted NBA Finals games in 2006, 2011 and 2024"
    ]
  },
  {
    id: "us-venue-064",
    text: "Where is the Frost Bank Center, home of the San Antonio Spurs?",
    lat: 29.427,
    lng: -98.4375,
    category: "stadium",
    venue: "Frost Bank Center",
    hint: "San Antonio, Texas",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the San Antonio Spurs",
      "\u{1F3E0} Opened in 2002 as the SBC Center",
      "\u{1F3C6} The Spurs clinched NBA titles here in 2003, 2005 and 2014",
      "\u{1F3AD} Known as the AT&T Center until 2023"
    ]
  },
  {
    id: "us-venue-065",
    text: "Where is Ball Arena, home of the Denver Nuggets?",
    lat: 39.7487,
    lng: -105.0077,
    category: "stadium",
    venue: "Ball Arena",
    hint: "Denver, Colorado",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Denver Nuggets",
      "\u{1F3E0} Opened in 1999 as the Pepsi Center",
      "\u{1F3C6} The Nuggets won their first NBA title here in 2023",
      "\u{1F3D2} Also home of the Colorado Avalanche"
    ]
  },
  {
    id: "us-venue-066",
    text: "Where is Mortgage Matchup Center, home of the Phoenix Suns?",
    lat: 33.4457,
    lng: -112.0712,
    category: "stadium",
    venue: "Mortgage Matchup Center",
    hint: "Phoenix, Arizona",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Phoenix Suns and the Phoenix Mercury",
      "\u{1F3E0} Opened in 1992 as America West Arena",
      "\u{1F3AD} Known as Footprint Center from 2021 to 2025",
      "\u{1F3C6} Hosted NBA Finals games in 1993 and 2021"
    ]
  },
  {
    id: "us-venue-067",
    text: "Where is Moda Center, home of the Portland Trail Blazers?",
    lat: 45.5316,
    lng: -122.6765,
    category: "stadium",
    venue: "Moda Center",
    hint: "Portland, Oregon",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Portland Trail Blazers",
      "\u{1F3E0} Opened in 1995 as the Rose Garden",
      "\u{1F3C6} Stands beside the old Memorial Coliseum, where the Blazers won the 1977 title",
      "\u{1F688} MAX light rail trains stop right outside"
    ]
  },
  {
    id: "us-venue-068",
    text: "Where is Climate Pledge Arena, home of the Seattle Kraken?",
    lat: 47.6221,
    lng: -122.354,
    category: "stadium",
    venue: "Climate Pledge Arena",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Seattle Kraken and the WNBA Seattle Storm",
      "\u{1F3E0} Rebuilt beneath the landmark 1962 roof of the old KeyArena",
      "\u{1F331} The first arena certified zero carbon by the International Living Future Institute",
      "\u{1F5FC} Stands at Seattle Center, close to the Space Needle"
    ]
  },
  {
    id: "us-venue-069",
    text: "Where is Little Caesars Arena, home of the Detroit Pistons?",
    lat: 42.3411,
    lng: -83.0553,
    category: "stadium",
    venue: "Little Caesars Arena",
    hint: "Detroit, Michigan",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Detroit Pistons since 2017",
      "\u{1F3D2} Replaced Joe Louis Arena as home of the Detroit Red Wings in 2017",
      "\u2B07\uFE0F The ice and court sit about 40 feet below street level",
      "\u{1F3E0} A glass-roofed concourse wraps around the bowl like an indoor street"
    ]
  },
  {
    id: "us-venue-070",
    text: "Where is Capital One Arena, home of the Washington Wizards?",
    lat: 38.8981,
    lng: -77.0209,
    category: "stadium",
    venue: "Capital One Arena",
    hint: "Washington, District of Columbia",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Washington Wizards and the Washington Capitals",
      "\u{1F3E0} Opened in 1997 as the MCI Center",
      "\u2B50 Hosted the 2001 NBA All-Star Game",
      "\u{1F3EE} Stands in the Penn Quarter and Chinatown neighbourhood"
    ]
  },
  {
    id: "us-venue-071",
    text: "Where is FedExForum, home of the Memphis Grizzlies?",
    lat: 35.1394,
    lng: -90.0493,
    category: "stadium",
    venue: "FedExForum",
    hint: "Memphis, Tennessee",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Memphis Grizzlies",
      "\u{1F3E0} Opened in 2004, replacing the Pyramid Arena as the Grizzlies home",
      "\u{1F3B7} Stands a block from Beale Street, the home of Memphis blues",
      "\u{1F3C0} Also home of the Memphis Tigers men's basketball team"
    ]
  },
  {
    id: "us-venue-072",
    text: "Where is the Kia Center, home of the Orlando Magic?",
    lat: 28.5392,
    lng: -81.3839,
    category: "stadium",
    venue: "Kia Center",
    hint: "Orlando, Florida",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Orlando Magic",
      "\u{1F3E0} Opened in 2010 as the Amway Center",
      "\u{1F3AD} Known as the Kia Center since 2023",
      "\u2B50 Hosted the 2012 NBA All-Star Game"
    ]
  },
  {
    id: "us-venue-073",
    text: "Where is State Farm Arena, home of the Atlanta Hawks?",
    lat: 33.7573,
    lng: -84.3963,
    category: "stadium",
    venue: "State Farm Arena",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Atlanta Hawks",
      "\u{1F3E0} Opened in 1999 as Philips Arena, on the site of the old Omni Coliseum",
      "\u{1F333} Stands next to Centennial Olympic Park",
      "\u2B50 Hosted the 2003 NBA All-Star Game"
    ]
  },
  {
    id: "us-venue-074",
    text: "Where is the Smoothie King Center, home of the New Orleans Pelicans?",
    lat: 29.9446,
    lng: -90.0752,
    category: "stadium",
    venue: "Smoothie King Center",
    hint: "New Orleans, Louisiana",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the New Orleans Pelicans",
      "\u{1F3E0} Opened in 1999 as the New Orleans Arena",
      "\u{1F3DF}\uFE0F Stands right next to the Caesars Superdome",
      "\u2B50 Hosted the NBA All-Star Game in 2014 and 2017"
    ]
  },
  {
    id: "us-venue-075",
    text: "Where is Paycom Center, home of the Oklahoma City Thunder?",
    lat: 35.4673,
    lng: -97.5157,
    category: "stadium",
    venue: "Paycom Center",
    hint: "Oklahoma City, Oklahoma",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Oklahoma City Thunder",
      "\u{1F3E0} Opened in 2002 as the Ford Center",
      "\u{1F69A} The Thunder moved here from Seattle in 2008",
      "\u{1F3C6} The Thunder won the 2025 NBA title here in Game 7"
    ]
  },
  {
    id: "us-venue-076",
    text: "Where is the Toyota Center, home of the Houston Rockets?",
    lat: 29.7508,
    lng: -95.3621,
    category: "stadium",
    venue: "Toyota Center",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Houston Rockets",
      "\u{1F3E0} Opened in 2003 in downtown Houston",
      "\u{1F3AD} The retired number 34 of Hakeem Olajuwon hangs in the rafters",
      "\u2B50 Hosted the NBA All-Star Game in 2006 and 2013"
    ]
  },
  {
    id: "us-venue-077",
    text: "Where is the Delta Center, home of the Utah Jazz?",
    lat: 40.7603,
    lng: -111.891,
    category: "stadium",
    venue: "Delta Center",
    hint: "Salt Lake City, Utah",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Utah Jazz",
      "\u{1F3E0} Opened in 1991 as the Delta Center and took the name back in 2023",
      "\u26F8\uFE0F Hosted figure skating and short track at the 2002 Winter Olympics",
      "\u{1F3D2} Also home of the NHL Utah Mammoth"
    ]
  },
  {
    id: "us-venue-078",
    text: "Where is the Target Center, home of the Minnesota Timberwolves?",
    lat: 44.9795,
    lng: -93.278,
    category: "stadium",
    venue: "Target Center",
    hint: "Minneapolis, Minnesota",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Minnesota Timberwolves",
      "\u{1F3E0} Opened in 1990 in downtown Minneapolis",
      "\u26BE Stands across the street from Target Field",
      "\u{1F3C0} Also home of the WNBA Minnesota Lynx"
    ]
  },
  {
    id: "us-venue-079",
    text: "Where is Gainbridge Fieldhouse, home of the Indiana Pacers?",
    lat: 39.7654,
    lng: -86.1664,
    category: "stadium",
    venue: "Gainbridge Fieldhouse",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Indiana Pacers",
      "\u{1F3E0} Opened in 1999 as Conseco Fieldhouse, styled after old Indiana high school gyms",
      "\u2B50 Hosted the 2024 NBA All-Star Game",
      "\u{1F3C0} Also home of the WNBA Indiana Fever"
    ]
  },
  {
    id: "us-venue-080",
    text: "Where is Fiserv Forum, home of the Milwaukee Bucks?",
    lat: 43.045,
    lng: -87.9017,
    category: "stadium",
    venue: "Fiserv Forum",
    hint: "Milwaukee, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Milwaukee Bucks",
      "\u{1F3E0} Opened in 2018 in downtown Milwaukee",
      "\u{1F98C} The Deer District plaza outside hosts huge watch parties",
      "\u{1F3C6} The Bucks won the 2021 NBA title here"
    ]
  },
  {
    id: "us-venue-081",
    text: "Where is the Spectrum Center, home of the Charlotte Hornets?",
    lat: 35.2251,
    lng: -80.8392,
    category: "stadium",
    venue: "Spectrum Center",
    hint: "Charlotte, North Carolina",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Charlotte Hornets",
      "\u{1F3E0} Opened in 2005 in Uptown Charlotte as Charlotte Bobcats Arena",
      "\u{1F5F3}\uFE0F Hosted the 2012 Democratic National Convention",
      "\u2B50 Hosted the 2019 NBA All-Star Game"
    ]
  },
  {
    id: "us-venue-082",
    text: "Where is Xfinity Mobile Arena, home of the Philadelphia 76ers?",
    lat: 39.9012,
    lng: -75.172,
    category: "stadium",
    venue: "Xfinity Mobile Arena",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Philadelphia 76ers and the Philadelphia Flyers",
      "\u{1F3E0} It was called the CoreStates Center when it opened in 1996",
      "\u{1F3AD} Known as the Wells Fargo Center until 2025",
      "\u{1F5F3}\uFE0F Hosted the 2016 Democratic National Convention"
    ]
  },
  {
    id: "us-venue-083",
    text: "Where is Golden 1 Center, home of the Sacramento Kings?",
    lat: 38.5804,
    lng: -121.4938,
    category: "stadium",
    venue: "Golden 1 Center",
    hint: "Sacramento, California",
    country: "United States",
    facts: [
      "\u{1F3C0} Home of the Sacramento Kings",
      "\u{1F3E0} Opened in 2016 in downtown Sacramento",
      "\u2600\uFE0F Billed as the first indoor arena powered entirely by solar energy",
      "\u{1F4A1} A purple light beam shoots into the sky after Kings wins"
    ]
  },
  {
    id: "us-venue-084",
    text: "Where is PPG Paints Arena, home of the Pittsburgh Penguins?",
    lat: 40.4395,
    lng: -79.9892,
    category: "stadium",
    venue: "PPG Paints Arena",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Pittsburgh Penguins",
      "\u{1F3E0} Opened in 2010 across the street from the old Civic Arena",
      "\u{1F3B8} The Beatles played the old Civic Arena next door in 1964",
      "\u{1F3AD} Known as Consol Energy Center until 2016"
    ]
  },
  {
    id: "us-venue-085",
    text: "Where is Nationwide Arena, home of the Columbus Blue Jackets?",
    lat: 39.9693,
    lng: -83.0061,
    category: "stadium",
    venue: "Nationwide Arena",
    hint: "Columbus, Ohio",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Columbus Blue Jackets",
      "\u{1F3E0} Opened in 2000 in the Arena District of downtown Columbus",
      "\u{1F4A5} A replica Civil War cannon fires when the Blue Jackets score",
      "\u2B50 Hosted the 2015 NHL All-Star Game"
    ]
  },
  {
    id: "us-venue-086",
    text: "Where is Xcel Energy Center, home of the Minnesota Wild?",
    lat: 44.9448,
    lng: -93.101,
    category: "stadium",
    venue: "Xcel Energy Center",
    hint: "Saint Paul, Minnesota",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Minnesota Wild",
      "\u{1F3E0} Opened in 2000 in downtown Saint Paul",
      "\u2B50 Hosted the 2004 NHL All-Star Game",
      "\u{1F3EB} Hosts the Minnesota state high school hockey tournament every year"
    ]
  },
  {
    id: "us-venue-087",
    text: "Where is T-Mobile Arena, home of the Vegas Golden Knights?",
    lat: 36.1029,
    lng: -115.1784,
    category: "stadium",
    venue: "T-Mobile Arena",
    hint: "Paradise, Nevada",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Vegas Golden Knights",
      "\u{1F3E0} Opened in 2016 just off the Las Vegas Strip",
      "\u{1F3AD} The Knights reached the Stanley Cup Final in their very first season",
      "\u{1F3C6} The Golden Knights won the 2023 Stanley Cup here"
    ]
  },
  {
    id: "us-venue-088",
    text: "Where is Amerant Bank Arena, home of the Florida Panthers?",
    lat: 26.1584,
    lng: -80.3256,
    category: "stadium",
    venue: "Amerant Bank Arena",
    hint: "Sunrise, Florida",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Florida Panthers",
      "\u{1F3E0} Opened in 1998 next to the Sawgrass Mills mall",
      "\u{1F3C6} The Panthers won the Stanley Cup here in 2024 and 2025",
      "\u2B50 Hosted the 2003 and 2023 NHL All-Star Games"
    ]
  },
  {
    id: "us-venue-089",
    text: "Where is UBS Arena, home of the New York Islanders?",
    lat: 40.7123,
    lng: -73.7259,
    category: "stadium",
    venue: "UBS Arena",
    hint: "Elmont, New York",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the New York Islanders",
      "\u{1F40E} Built on the grounds of Belmont Park racetrack",
      "\u{1F686} Served by its own Long Island Rail Road station, Elmont-UBS Arena",
      "\u{1F3E0} The Islanders moved in when it opened in November 2021"
    ]
  },
  {
    id: "us-venue-090",
    text: "Where is the SAP Center, home of the San Jose Sharks?",
    lat: 37.3382,
    lng: -121.886,
    category: "stadium",
    venue: "SAP Center",
    hint: "San Jose, California",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the San Jose Sharks",
      "\u{1F3E0} Opened in 1993 as the San Jose Arena",
      "\u{1F988} Fans call it the Shark Tank",
      "\u2B50 Hosted the 1997 and 2019 NHL All-Star Games"
    ]
  },
  {
    id: "us-venue-091",
    text: "Where is Honda Center, home of the Anaheim Ducks?",
    lat: 33.8078,
    lng: -117.8765,
    category: "stadium",
    venue: "Honda Center",
    hint: "Anaheim, California",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the Anaheim Ducks",
      "\u{1F3E0} Opened in 1993 as the Arrowhead Pond of Anaheim",
      "\u{1F3C6} The Ducks won the 2007 Stanley Cup here",
      "\u26BE Stands across the freeway from Angel Stadium"
    ]
  },
  {
    id: "us-venue-092",
    text: "Where is Enterprise Center, home of the St. Louis Blues?",
    lat: 38.6268,
    lng: -90.2026,
    category: "stadium",
    venue: "Enterprise Center",
    hint: "St. Louis, Missouri",
    country: "United States",
    facts: [
      "\u{1F3D2} Home of the St. Louis Blues",
      "\u{1F3E0} Opened in 1994 as the Kiel Center",
      "\u{1F3C0} Hosts the Missouri Valley Conference basketball tournament, Arch Madness",
      "\u2B50 Hosted the 2020 NHL All-Star Game"
    ]
  },
  {
    id: "us-venue-093",
    text: 'Where is Michigan Stadium, the "Big House"?',
    lat: 42.2658,
    lng: -83.7487,
    category: "stadium",
    venue: "Michigan Stadium",
    hint: "Ann Arbor, Michigan",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Michigan Wolverines football team",
      "\u{1F3E0} It is the largest college football stadium in the United States",
      "\u{1F3C8} Players leap to touch the Go Blue banner as they run onto the field",
      "\u{1F3D2} Drew a record 105,491 fans for the 2014 NHL Winter Classic"
    ]
  },
  {
    id: "us-venue-094",
    text: "Where is Ohio Stadium, known as the Horseshoe?",
    lat: 40.0017,
    lng: -83.0195,
    category: "stadium",
    venue: "Ohio Stadium",
    hint: "Columbus, Ohio",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Ohio State Buckeyes",
      "\u{1F3E0} The horseshoe shape seats 102,780 people, making it one of the largest stadiums anywhere",
      "\u{1F3BA} The marching band spells out Script Ohio, finishing by dotting the i",
      "\u{1F3DB}\uFE0F Opened in 1922 and listed on the National Register of Historic Places"
    ]
  },
  {
    id: "us-venue-095",
    text: "Where is Beaver Stadium, home of the Penn State Nittany Lions?",
    lat: 40.8122,
    lng: -77.8561,
    category: "stadium",
    venue: "Beaver Stadium",
    hint: "State College, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Penn State Nittany Lions",
      "\u{1F3E0} Capacity of 106,572, the second largest college football stadium in the country",
      "\u{1F3C8} The whiteout crowds there are a genuine national tradition",
      "\u{1F3E0} Opened in 1960, partly built from the steel of an older stadium on campus"
    ]
  },
  {
    id: "us-venue-096",
    text: "Where is Memorial Stadium, home of the Clemson Tigers?",
    lat: 34.6833,
    lng: -82.8518,
    category: "stadium",
    venue: "Memorial Stadium",
    hint: "Clemson, South Carolina",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Clemson Tigers",
      "\u{1F480} Nicknamed Death Valley",
      "\u{1FAA8} Players rub Howard's Rock before running down the hill onto the field",
      "\u{1F3E0} Opened in 1942"
    ]
  },
  {
    id: "us-venue-097",
    text: "Where is Doak Campbell Stadium, home of the Florida State Seminoles?",
    lat: 30.4381,
    lng: -84.3044,
    category: "stadium",
    venue: "Doak Campbell Stadium",
    hint: "Tallahassee, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Florida State Seminoles",
      "\u{1F525} Chief Osceola plants a flaming spear at midfield before home games",
      "\u{1F3E0} Opened in 1950",
      "\u{1F9F1} Its brick facade is wrapped by the University Center building"
    ]
  },
  {
    id: "us-venue-098",
    text: "Where is Tiger Stadium, home of the LSU Tigers?",
    lat: 30.412,
    lng: -91.1838,
    category: "stadium",
    venue: "Tiger Stadium",
    hint: "Baton Rouge, Louisiana",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the LSU Tigers",
      '\u{1F3E0} Known as "Death Valley" and famous for its loud Saturday night games',
      "\u{1F405} Mike, a live tiger, lives in a habitat right next to the stadium",
      '\u{1F30E} The crowd roar at the 1988 "Earthquake Game" registered on a campus seismograph'
    ]
  },
  {
    id: "us-venue-099",
    text: "Where is Bryant-Denny Stadium, home of the Alabama Crimson Tide?",
    lat: 33.2083,
    lng: -87.5506,
    category: "stadium",
    venue: "Bryant-Denny Stadium",
    hint: "Tuscaloosa, Alabama",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Alabama Crimson Tide",
      "\u{1F3E0} Opened in 1929 as Denny Stadium",
      "\u{1F3A9} Bear Bryant's name was added in 1975, while he was still coaching",
      "\u{1F3C6} Statues of Alabama's national championship coaches line the Walk of Champions"
    ]
  },
  {
    id: "us-venue-100",
    text: "Where is Neyland Stadium, home of the Tennessee Volunteers?",
    lat: 35.951,
    lng: -83.926,
    category: "stadium",
    venue: "Neyland Stadium",
    hint: "Knoxville, Tennessee",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Tennessee Volunteers",
      "\u{1F3E0} The checkerboard end zone is a famous sight",
      "\u{1F6A4} Fans arrive by boat on the Tennessee River, a tradition called the Vol Navy",
      "\u{1F396}\uFE0F Named for Robert Neyland, the coach who was also an Army general"
    ]
  },
  {
    id: "us-venue-101",
    text: "Where is Darrell K Royal Stadium, home of the Texas Longhorns?",
    lat: 30.2868,
    lng: -97.7394,
    category: "stadium",
    venue: "Darrell K Royal Stadium",
    hint: "Austin, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Texas Longhorns",
      "\u{1F3E0} Opened in 1924 as War Memorial Stadium",
      "\u{1F402} Bevo, a live longhorn steer, watches games from the sideline",
      "\u{1F918} Fans flash the Hook 'em Horns hand sign"
    ]
  },
  {
    id: "us-venue-102",
    text: "Where is Ben Hill Griffin Stadium, home of the Florida Gators?",
    lat: 29.65,
    lng: -82.3486,
    category: "stadium",
    venue: "Ben Hill Griffin Stadium",
    hint: "Gainesville, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Florida Gators",
      '\u{1F3E0} Nicknamed "The Swamp"',
      "\u{1F40A} Fans do the Gator Chomp with their arms",
      "\u{1F3E0} Opened in 1930 as Florida Field"
    ]
  },
  {
    id: "us-venue-103",
    text: "Where is Spartan Stadium, home of the Michigan State Spartans?",
    lat: 42.7281,
    lng: -84.4848,
    category: "stadium",
    venue: "Spartan Stadium",
    hint: "East Lansing, Michigan",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Michigan State Spartans",
      "\u{1F5FF} A statue of Sparty, the team mascot, stands at the stadium",
      "\u{1F3E0} Opened in 1923",
      '\u{1F3C8} Hosted the famous 10-10 tie with Notre Dame in 1966, the "Game of the Century"'
    ]
  },
  {
    id: "us-venue-104",
    text: "Where is Notre Dame Stadium, home of the Fighting Irish?",
    lat: 41.6984,
    lng: -86.2339,
    category: "stadium",
    venue: "Notre Dame Stadium",
    hint: "South Bend, Indiana",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Notre Dame Fighting Irish",
      "\u{1F64C} The Touchdown Jesus mural on Hesburgh Library looms over the north end zone",
      "\u{1F3E0} Opened in 1930, with Knute Rockne helping shape its design",
      "\u{1F4FA} Every home game has been shown nationally on NBC since 1991"
    ]
  },
  {
    id: "us-venue-105",
    text: "Where is Sanford Stadium, home of the Georgia Bulldogs?",
    lat: 33.95,
    lng: -83.373,
    category: "stadium",
    venue: "Sanford Stadium",
    hint: "Athens, Georgia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Georgia Bulldogs",
      "\u{1F333} Privet hedges have surrounded the field since 1929",
      "\u{1F436} Past Uga bulldog mascots are buried in a vault inside the stadium",
      "\u{1F3E0} Opened in 1929"
    ]
  },
  {
    id: "us-venue-106",
    text: "Where is Kyle Field, home of the Texas A&M Aggies?",
    lat: 30.6196,
    lng: -96.334,
    category: "stadium",
    venue: "Kyle Field",
    hint: "College Station, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Texas A&M Aggies",
      "\u{1F3E0} Named for Edwin Kyle, the professor who set aside the land in 1904",
      "\u{1F9CD} Students stand for the whole game as the 12th Man",
      "\u{1F4E3} Midnight Yell practice is held here the night before home games"
    ]
  },
  {
    id: "us-venue-107",
    text: "Where is Folsom Field, home of the Colorado Buffaloes?",
    lat: 40.0098,
    lng: -105.2669,
    category: "stadium",
    venue: "Folsom Field",
    hint: "Boulder, Colorado",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Colorado Buffaloes",
      "\u{1F3E0} It sits a mile above sea level, in the shadow of the Flatirons",
      "\u{1F9AC} Ralphie, a live buffalo, charges around the field before each half",
      "\u{1F3E0} Opened in 1924"
    ]
  },
  {
    id: "us-venue-108",
    text: "Where is Husky Stadium, home of the Washington Huskies?",
    lat: 47.6503,
    lng: -122.3016,
    category: "stadium",
    venue: "Husky Stadium",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Washington Huskies",
      "\u{1F3E0} It overlooks Lake Washington, with Mount Rainier on the horizon on a clear day",
      "\u{1F6A4} Fans arrive by boat and tailgate on the water, known as sailgating",
      "\u{1F3DB}\uFE0F Opened in 1920"
    ]
  },
  {
    id: "us-venue-109",
    text: 'Where is the Indianapolis Motor Speedway, the "Brickyard"?',
    lat: 39.795,
    lng: -86.2347,
    category: "stadium",
    venue: "Indianapolis Motor Speedway",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F Home of the Indianapolis 500",
      "\u{1F3C1} The 2.5 mile oval opened in 1909",
      "\u{1F9F1} Paved with 3.2 million bricks in 1909; a one-yard strip still marks the finish line",
      "\u{1F95B} The Indy 500 winner celebrates with a bottle of milk"
    ]
  },
  {
    id: "us-venue-110",
    text: "Where is Daytona International Speedway?",
    lat: 29.1852,
    lng: -81.0705,
    category: "stadium",
    venue: "Daytona International Speedway",
    hint: "Daytona Beach, Florida",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F Home of the Daytona 500 and the Daytona 200",
      "\u{1F3E0} The 2.5 mile oval opened in 1959, with turns banked at 31 degrees",
      "\u{1F3D6}\uFE0F Before the speedway was built, races were run on the sand of Daytona Beach",
      "\u23F1\uFE0F Also hosts the Rolex 24 at Daytona endurance race"
    ]
  },
  {
    id: "us-venue-111",
    text: "Where is the Circuit of the Americas, home of the United States Grand Prix?",
    lat: 30.1328,
    lng: -97.6411,
    category: "stadium",
    venue: "Circuit of the Americas",
    hint: "Austin, Texas",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F Home of the United States Grand Prix",
      "\u{1F5FC} A 251 foot observation tower gives a view over the whole circuit",
      "\u{1F3C1} Has hosted Formula One since it opened in 2012",
      "\u26F0\uFE0F Turn 1 sits at the top of a steep 133 foot climb"
    ]
  },
  {
    id: "us-venue-112",
    text: "Where is Sebring International Raceway?",
    lat: 27.4547,
    lng: -81.3483,
    category: "stadium",
    venue: "Sebring International Raceway",
    hint: "Sebring, Florida",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F Home of the 12 Hours of Sebring, first run in 1952",
      "\u2708\uFE0F Built on Hendricks Field, a World War II bomber training base",
      "\u{1F3C1} Hosted the first Formula One United States Grand Prix in 1959",
      "\u{1F6E3}\uFE0F Bumpy concrete from the old runways is still part of the 3.74 mile course"
    ]
  },
  {
    id: "us-venue-113",
    text: "Where is Watkins Glen International?",
    lat: 42.3369,
    lng: -76.9272,
    category: "stadium",
    venue: "Watkins Glen International",
    hint: "Watkins Glen, New York",
    country: "United States",
    facts: [
      "\u{1F3C1} Hosted the Formula One United States Grand Prix from 1961 to 1980",
      "\u{1F3E0} Racing began on public roads around the village in 1948",
      "\u{1F3CE}\uFE0F A regular stop on the NASCAR Cup Series schedule",
      "\u{1F3DE}\uFE0F Sits in the Finger Lakes region, above Seneca Lake"
    ]
  },
  {
    id: "us-venue-114",
    text: "Where is Road America in Elkhart Lake, Wisconsin?",
    lat: 43.7977,
    lng: -87.9897,
    category: "stadium",
    venue: "Road America",
    hint: "Elkhart Lake, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F A 4.048 mile road course in the Wisconsin countryside",
      "\u{1F3E0} Opened in 1955",
      "\u21AA\uFE0F The flat-out right-hand bend called the Kink is one of its most feared corners",
      "\u{1F3C1} Hosts IndyCar and IMSA sports car races"
    ]
  },
  {
    id: "us-venue-115",
    text: "Where is Lime Rock Park?",
    lat: 41.9283,
    lng: -73.3832,
    category: "stadium",
    venue: "Lime Rock Park",
    hint: "Lakeville, Connecticut",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F A short 1.5 mile road course that opened in 1957",
      "\u{1F333} Set among the hills of northwest Connecticut",
      "\u{1F3C1} Hosts IMSA sports car races",
      "\u26EA Local rules have long kept racing off the track on Sundays"
    ]
  },
  {
    id: "us-venue-116",
    text: "Where is Pocono Raceway?",
    lat: 41.0553,
    lng: -75.511,
    category: "stadium",
    venue: "Pocono Raceway",
    hint: "Long Pond, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F Nicknamed the Tricky Triangle",
      "\u{1F3E0} The 2.5 mile triangular oval has three corners of very different character",
      "\u{1F3C1} Hosts a NASCAR Cup Series race every summer",
      "\u{1F3C6} IndyCar raced the Pocono 500 here from 1971 to 1989"
    ]
  },
  {
    id: "us-venue-117",
    text: "Where is Michigan International Speedway?",
    lat: 42.0664,
    lng: -84.2412,
    category: "stadium",
    venue: "Michigan International Speedway",
    hint: "Brooklyn, Michigan",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F A wide two mile D-shaped oval that opened in 1968",
      "\u{1F3C1} Hosts NASCAR Cup Series races every summer",
      "\u{1F4A8} Its wide, sweeping turns make it one of the fastest tracks in NASCAR",
      "\u{1F333} Sits in the Irish Hills of southern Michigan"
    ]
  },
  {
    id: "us-venue-118",
    text: "Where is Texas Motor Speedway in Fort Worth?",
    lat: 33.0372,
    lng: -97.2811,
    category: "stadium",
    venue: "Texas Motor Speedway",
    hint: "Fort Worth, Texas",
    country: "United States",
    facts: [
      "\u{1F3CE}\uFE0F A 1.5 mile quad-oval that opened in 1997",
      "\u{1F3C1} Hosted the NASCAR All-Star Race in 2021 and 2022",
      "\u{1F4FA} Its giant video board, Big Hoss TV, was once the largest HD screen in the world",
      "\u2708\uFE0F Stands near Alliance Airport, north of Fort Worth"
    ]
  },
  {
    id: "us-venue-119",
    text: "Where is Churchill Downs, home of the Kentucky Derby?",
    lat: 38.2028,
    lng: -85.765,
    category: "stadium",
    venue: "Churchill Downs",
    hint: "Louisville, Kentucky",
    country: "United States",
    facts: [
      "\u{1F40E} Home of the Kentucky Derby, the most famous horse race in America",
      "\u{1F3E0} Opened in 1875, one of the oldest sporting grounds still in use",
      "\u{1F3C8} The race is 1.25 miles and is run at Churchill Downs every year in May",
      "\u{1F3E0} The Twin Spires above the entrance are the symbol of the track"
    ]
  },
  {
    id: "us-venue-120",
    text: "Where is Saratoga Race Course?",
    lat: 43.0718,
    lng: -73.7703,
    category: "stadium",
    venue: "Saratoga Race Course",
    hint: "Saratoga Springs, New York",
    country: "United States",
    facts: [
      "\u{1F40E} Summer racing here dates back to 1863",
      "\u{1F3E0} One of the oldest sporting venues in the United States",
      "\u{1F3C8} The Whitney Stakes and the Travers Stakes are run there every summer",
      "\u{1FAA6} Nicknamed the Graveyard of Champions for the famous favourites beaten here"
    ]
  },
  {
    id: "us-venue-121",
    text: "Where is Belmont Park, home of the Belmont Stakes?",
    lat: 40.7151,
    lng: -73.7225,
    category: "stadium",
    venue: "Belmont Park",
    hint: "Elmont, New York",
    country: "United States",
    facts: [
      "\u{1F40E} Home of the Belmont Stakes, the third leg of the Triple Crown",
      "\u{1F3C7} The Belmont Stakes ran at Saratoga from 2024 to 2026 while the track was rebuilt",
      "\u{1F3E0} Opened in 1905",
      "\u{1F3D6}\uFE0F Nicknamed Big Sandy for its deep, sandy main track"
    ]
  },
  {
    id: "us-venue-122",
    text: "Where is Pimlico Race Course?",
    lat: 39.3533,
    lng: -76.6731,
    category: "stadium",
    venue: "Pimlico Race Course",
    hint: "Baltimore, Maryland",
    country: "United States",
    facts: [
      "\u{1F40E} Home of the Preakness Stakes, the second leg of the Triple Crown",
      "\u{1F3E0} Opened in 1870, the second oldest racetrack in the United States",
      "\u{1F3C7} The 2026 Preakness was run at Laurel Park while Pimlico is rebuilt",
      "\u26F0\uFE0F Nicknamed Old Hilltop after a small rise in the old infield"
    ]
  },
  {
    id: "us-venue-123",
    text: "Where is Aqueduct Racetrack in New York?",
    lat: 40.6722,
    lng: -73.8303,
    category: "stadium",
    venue: "Aqueduct Racetrack",
    hint: "Queens, New York",
    country: "United States",
    facts: [
      "\u{1F40E} The only racetrack in New York City",
      "\u{1F3E0} Opened in 1894 in South Ozone Park, Queens",
      "\u{1F3C6} Hosted the 1985 Breeders' Cup",
      "\u{1F339} Runs the Wood Memorial, a major Kentucky Derby prep race"
    ]
  },
  {
    id: "us-venue-124",
    text: "Where is Santa Anita Park?",
    lat: 34.1393,
    lng: -118.0442,
    category: "stadium",
    venue: "Santa Anita Park",
    hint: "Arcadia, California",
    country: "United States",
    facts: [
      "\u{1F3C6} Has hosted the Breeders' Cup more often than any other track",
      "\u{1F3E0} Opened in 1934, it sits in the foothills of the San Gabriel Mountains",
      "\u{1F3C8} The Santa Anita Handicap is one of the most important races in California",
      "\u{1F40E} Seabiscuit won the Santa Anita Handicap here in 1940"
    ]
  },
  {
    id: "us-venue-125",
    text: "Where is Augusta National Golf Club?",
    lat: 33.503,
    lng: -82.0199,
    category: "stadium",
    venue: "Augusta National Golf Club",
    hint: "Augusta, Georgia",
    country: "United States",
    facts: [
      "\u26F3 Home of the Masters Tournament, the first major of the year",
      "\u{1F3E0} The course was designed by Alister MacKenzie with Bobby Jones",
      "\u{1F7E2} The winner receives a green jacket",
      "\u{1F338} The par 3 12th sits at the heart of the stretch known as Amen Corner"
    ]
  },
  {
    id: "us-venue-126",
    text: "Where is Cypress Point Golf Club on the Monterey Peninsula?",
    lat: 36.5803,
    lng: -121.969,
    category: "stadium",
    venue: "Cypress Point Golf Club",
    hint: "Pebble Beach, California",
    country: "United States",
    facts: [
      "\u26F3 A private club on the Monterey Peninsula",
      "\u{1F3E0} Designed by Alister MacKenzie and opened in 1928",
      "\u{1F30A} The par 3 16th needs a carry of about 230 yards over the Pacific",
      "\u{1F3CC}\uFE0F Was part of the Bing Crosby Pro-Am rotation until 1990"
    ]
  },
  {
    id: "us-venue-127",
    text: "Where is Pebble Beach Golf Links?",
    lat: 36.568,
    lng: -121.95,
    category: "stadium",
    venue: "Pebble Beach Golf Links",
    hint: "Pebble Beach, California",
    country: "United States",
    facts: [
      "\u26F3 Has hosted the US Open six times, with a seventh set for 2027",
      "\u{1F30A} The par 5 18th curves along the shore of Carmel Bay",
      "\u{1F3C8} The Pebble Beach Pro-Am is a celebrity tournament played there every February",
      "\u{1F3C6} Jack Nicklaus hit the flagstick on the 17th with a 1-iron to win the 1972 US Open"
    ]
  },
  {
    id: "us-venue-128",
    text: "Where is Pinehurst No. 2, host of the United States Open?",
    lat: 35.1954,
    lng: -79.4655,
    category: "stadium",
    venue: "Pinehurst No. 2",
    hint: "Pinehurst, North Carolina",
    country: "United States",
    facts: [
      "\u26F3 Hosted the men's US Open in 1999, 2005, 2014 and 2024",
      "\u{1F3E0} Designed by Donald Ross, who opened it in 1907",
      "\u{1F422} Known for crowned turtleback greens that shed balls off the edges",
      "\u{1F3C6} Hosted the men's and women's US Opens in back-to-back weeks in 2014"
    ]
  },
  {
    id: "us-venue-129",
    text: "Where is Torrey Pines Golf Course?",
    lat: 32.899,
    lng: -117.2519,
    category: "stadium",
    venue: "Torrey Pines Golf Course",
    hint: "San Diego, California",
    country: "United States",
    facts: [
      "\u26F3 Hosted the US Open in 2008 and 2021",
      "\u{1F3E0} It sits on the cliffs above the Pacific at the very north of San Diego",
      "\u{1F3C6} Tiger Woods won the 2008 US Open here while playing on a broken leg",
      "\u{1F3CC}\uFE0F Hosts the PGA Tour's Farmers Insurance Open every year"
    ]
  },
  {
    id: "us-venue-130",
    text: "Where is Bandon Dunes?",
    lat: 43.1872,
    lng: -124.3934,
    category: "stadium",
    venue: "Bandon Dunes",
    hint: "Bandon, Oregon",
    country: "United States",
    facts: [
      "\u26F3 A remote links course on the Oregon coast, built in the dunes",
      "\u{1F3E0} Designed by David McLay Kidd and opened in 1999",
      "\u{1F6B6} The resort is walking only, with caddies instead of carts",
      "\u{1F3D6}\uFE0F One of several courses at a resort on the dunes above the Pacific"
    ]
  },
  {
    id: "us-venue-131",
    text: "Where is the Indian Wells Tennis Garden?",
    lat: 33.7238,
    lng: -116.3053,
    category: "stadium",
    venue: "Indian Wells Tennis Garden",
    hint: "Indian Wells, California",
    country: "United States",
    facts: [
      "\u{1F3BE} Home of the BNP Paribas Open, a combined men's and women's Masters event",
      "\u{1F3E0} Opened in 2000",
      "\u{1F3DF}\uFE0F Its stadium court seats about 16,000, one of the largest in tennis",
      "\u{1F3DC}\uFE0F Set in the Coachella Valley desert, ringed by mountains"
    ]
  },
  {
    id: "us-venue-132",
    text: "Where is the United States Open tennis championship played?",
    lat: 40.7498,
    lng: -73.8467,
    category: "stadium",
    venue: "Arthur Ashe Stadium",
    hint: "Flushing Meadows, Queens, New York",
    country: "United States",
    facts: [
      "\u{1F3BE} The US Open runs from late August into September on hard courts",
      "\u{1F3E0} It is the last of the four Grand Slams and the only one played in North America",
      "\u{1F3DF}\uFE0F Seats about 23,000, the largest tennis stadium in the world",
      "\u{1F3C6} Opened in 1997 and named for champion Arthur Ashe"
    ]
  },
  {
    id: "us-venue-133",
    text: "Where is the historic Kezar Stadium in San Francisco?",
    lat: 37.7679,
    lng: -122.456,
    category: "stadium",
    venue: "Kezar Stadium",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the San Francisco 49ers from 1946 to 1970",
      "\u{1F3C8} The last NFL game there was the NFC Championship in January 1971",
      "\u{1F3E0} The original stands were torn down in 1989 and replaced by a smaller stadium",
      "\u{1F333} Sits at the southeast corner of Golden Gate Park"
    ]
  },
  {
    id: "us-venue-134",
    text: "Where is the historic Polo Grounds in Manhattan?",
    lat: 40.8306,
    lng: -73.9372,
    category: "stadium",
    venue: "Polo Grounds",
    hint: "Manhattan, New York",
    country: "United States",
    facts: [
      "\u26BE Home of baseball's New York Giants until they moved to San Francisco after 1957",
      "\u{1F3E0} The Yankees rented it from 1913 to 1922, before Yankee Stadium opened",
      "\u{1F3C8} The site of the famous catch by Willie Mays in the 1954 World Series",
      "\u{1F3E2} Demolished in 1964; the Polo Grounds Towers housing project now stands on the site"
    ]
  }
];

// src/lib/questions/usa-venues-2.ts
var usaVenueQuestionsTwo = [
  {
    id: "us-venue-212",
    text: "Where is LoanDepot Park, home of the Miami Marlins?",
    lat: 25.7781,
    lng: -80.2197,
    category: "stadium",
    venue: "LoanDepot Park",
    hint: "Miami, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Marlins since it opened in April 2012",
      "\u{1F3E0} It was built on the site of the old Miami Orange Bowl",
      "\u{1F4FA} It has a retractable roof, and fish tanks once sat behind home plate",
      "\u{1F3C8} Japan beat the United States here in the 2023 World Baseball Classic final"
    ]
  },
  {
    id: "us-venue-227",
    text: "Where is the Alamodome, former home of the San Antonio Spurs?",
    lat: 29.4169,
    lng: -98.4789,
    category: "stadium",
    venue: "Alamodome",
    hint: "San Antonio, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Spurs from 1993 until 2002",
      "\u{1F3E0} It hosts the Alamo Bowl every winter",
      "\u{1F4FA} The men\u2019s Final Four was played here in 1998, 2004, 2008 and 2018",
      "\u{1F3C8} It opened in 1993, a short walk from downtown San Antonio"
    ]
  },
  {
    id: "us-venue-229",
    text: "Where is Nissan Stadium, home of the Tennessee Titans?",
    lat: 36.1672,
    lng: -86.772,
    category: "stadium",
    venue: "Nissan Stadium",
    hint: "Nashville, Tennessee",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 1999 as Adelphia Coliseum, and named Nissan Stadium since 2015",
      "\u{1F3E0} The Music City Miracle kick return beat the Bills here in January 2000",
      "\u{1F4FA} The CMA Fest country music festival fills it every June",
      "\u{1F3C8} A new enclosed stadium for the Titans is being built next door"
    ]
  },
  {
    id: "us-venue-240",
    text: "Where is Caesars Superdome, home of the New Orleans Saints?",
    lat: 29.9509,
    lng: -90.0812,
    category: "stadium",
    venue: "Caesars Superdome",
    hint: "New Orleans, Louisiana",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Saints since 1975, under a fixed dome roof",
      "\u{1F3E0} It sheltered thousands of people during Hurricane Katrina in 2005",
      "\u{1F4FA} It is a short walk from the French Quarter",
      "\u{1F3C8} It has hosted eight Super Bowls, most recently in February 2025"
    ]
  },
  {
    id: "us-venue-242",
    text: "Where is Assembly Hall, home of Indiana Hoosiers basketball?",
    lat: 39.1808,
    lng: -86.5256,
    category: "stadium",
    venue: "Assembly Hall",
    hint: "Bloomington, Indiana",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of Indiana Hoosiers basketball since it opened in 1971",
      "\u{1F3E0} Bob Knight coached the Hoosiers here for nearly three decades",
      "\u{1F4FA} Five NCAA title banners hang here: 1940, 1953, 1976, 1981 and 1987",
      "\u{1F3C8} The 1976 team went 32-0, the last unbeaten men\u2019s champion"
    ]
  },
  {
    id: "us-venue-248",
    text: "Where is PayPal Park, home of the San Jose Earthquakes?",
    lat: 37.3513,
    lng: -121.9251,
    category: "stadium",
    venue: "PayPal Park",
    hint: "San Jose, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Opened in 2015 as Avaya Stadium",
      "\u{1F3E0} The San Jose Clash played in the very first MLS game in 1996",
      "\u{1F4FA} It has the largest outdoor bar in North America",
      "\u{1F3C8} The Earthquakes won the MLS Cup in 2001 and 2003"
    ]
  },
  {
    id: "us-venue-254",
    text: "Where is Atlanta Motor Speedway?",
    lat: 33.3866,
    lng: -84.3166,
    category: "stadium",
    venue: "Atlanta Motor Speedway",
    hint: "Hampton, Georgia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F A 1.54-mile oval south of Atlanta",
      "\u{1F3E0} It hosted the NASCAR season finale from 1987 to 2001",
      "\u{1F4FA} The 1992 finale was Richard Petty\u2019s last race and Jeff Gordon\u2019s first",
      "\u{1F3C8} Alan Kulwicki clinched the 1992 title here by 10 points"
    ]
  },
  {
    id: "us-venue-255",
    text: "Where is Hughes Stadium, home of the Morgan State Bears?",
    lat: 39.3436,
    lng: -76.5831,
    category: "stadium",
    venue: "Hughes Stadium",
    hint: "Baltimore, Maryland",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Morgan State Bears",
      "\u{1F3E0} The field is named after the coach Earl Banks",
      "\u{1F4FA} Morgan State was founded in 1867",
      "\u{1F3C8} The campus is in north-east Baltimore"
    ]
  },
  {
    id: "us-venue-256",
    text: "Where is Rynearson Stadium, home of the Eastern Michigan Eagles?",
    lat: 42.2558,
    lng: -83.6472,
    category: "stadium",
    venue: "Rynearson Stadium",
    hint: "Ypsilanti, Michigan",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Eastern Michigan Eagles since 1969",
      "\u{1F3E0} Its grey turf earned it the nickname The Factory",
      "\u{1F4FA} Ypsilanti is named after the Greek independence hero Demetrios Ypsilantis",
      "\u{1F3C8} The field was named after former Eagle Maxx Crosby in 2024"
    ]
  },
  {
    id: "us-venue-259",
    text: "Where is David Booth Kansas Memorial Stadium, home of the Kansas Jayhawks?",
    lat: 38.9633,
    lng: -95.2464,
    category: "stadium",
    venue: "David Booth Kansas Memorial Stadium",
    hint: "Lawrence, Kansas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Built in 1921 as a memorial to Kansans who died in the First World War",
      "\u{1F3E0} It is one of the oldest college stadiums west of the Mississippi",
      "\u{1F4FA} The Kansas Relays were held here from 1923 to 2013",
      "\u{1F3C8} It was renamed for the donor David Booth in 2017"
    ]
  },
  {
    id: "us-venue-260",
    text: "Where is Williams Stadium, home of the Liberty Flames?",
    lat: 37.354,
    lng: -79.175,
    category: "stadium",
    venue: "Williams Stadium",
    hint: "Lynchburg, Virginia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Liberty Flames since 1989",
      "\u{1F3E0} Liberty University was founded in 1971 by Jerry Falwell",
      "\u{1F4FA} Expansions have raised its capacity to about 25,000",
      "\u{1F3C8} It was first known as Willard May Stadium"
    ]
  },
  {
    id: "us-venue-261",
    text: "Where is the Darrell K Royal Texas Memorial Stadium?",
    lat: 30.2837,
    lng: -97.7325,
    category: "stadium",
    venue: "Darrell K Royal Texas Memorial Stadium",
    hint: "Austin, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Texas Longhorns since 1924",
      "\u{1F3E0} It was built as a memorial to Texans who served in the First World War",
      "\u{1F4FA} The coach Darrell Royal\u2019s name was added in 1996",
      "\u{1F3C8} It holds more than 100,000 fans"
    ]
  },
  {
    id: "us-venue-263",
    text: "Where is Matthew Knight Arena in Eugene?",
    lat: 44.045,
    lng: -123.066,
    category: "stadium",
    venue: "Matthew Knight Arena",
    hint: "Eugene, Oregon",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of Oregon Ducks basketball since January 2011",
      "\u{1F3E0} It replaced McArthur Court, the Ducks\u2019 old home",
      "\u{1F4FA} Its floor shows a forest pattern called Deep in the Woods",
      "\u{1F3C8} It is named after Matthew Knight, the late son of Nike co-founder Phil Knight"
    ]
  },
  {
    id: "us-venue-267",
    text: "Where is Bristol Motor Speedway, the half-mile track called the Last Great Colosseum?",
    lat: 36.5157,
    lng: -82.257,
    category: "stadium",
    venue: "Bristol Motor Speedway",
    hint: "Bristol, Tennessee",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F A steeply banked half-mile oval, nicknamed the Last Great Colosseum",
      "\u{1F3E0} A football field was built inside the track for the 2016 Battle at Bristol",
      "\u{1F4FA} Tennessee beat Virginia Tech 45-24 in that game",
      "\u{1F3C8} A record 156,990 fans watched, the biggest crowd in college football history"
    ]
  },
  {
    id: "us-venue-270",
    text: "Where was Memorial Stadium, the old home of the Baltimore Colts and Orioles?",
    lat: 39.3294,
    lng: -76.6016,
    category: "stadium",
    venue: "Baltimore Memorial Stadium",
    hint: "Baltimore, Maryland",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Baltimore Colts until they left in 1984",
      "\u{1F3E0} The Orioles played here from 1954 to 1991",
      "\u{1F4FA} The Orioles clinched the 1966 and 1970 World Series here",
      "\u{1F3C8} The site is now housing and a YMCA"
    ]
  },
  {
    id: "us-story-201",
    text: "Where was the first MLB All-Star Game played, in 1933?",
    lat: 41.8312,
    lng: -87.634,
    category: "event",
    venue: "Comiskey Park",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3C5} The game was played on July 6, 1933",
      "\u{1F3E0} Babe Ruth hit the first home run in All-Star history",
      "\u{1F4FA} The American League won it 4-2",
      "\u{1F3C8} Arch Ward of the Chicago Tribune dreamed it up for the Century of Progress fair"
    ]
  },
  {
    id: "us-story-202",
    text: "Where was the first game of the first modern World Series played, in 1903?",
    lat: 42.3388,
    lng: -71.0895,
    category: "event",
    venue: "Huntington Avenue Grounds",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C5} The Boston Americans beat the Pittsburgh Pirates for the title",
      "\u{1F3E0} It was a best-of-nine series",
      "\u{1F4FA} Cy Young pitched for Boston",
      "\u{1F3C8} The site is now part of Northeastern University, with a Cy Young statue"
    ]
  },
  {
    id: "us-story-203",
    text: "Where was game 7 of the 1924 World Series played?",
    lat: 38.9171,
    lng: -77.0203,
    category: "event",
    venue: "Griffith Stadium",
    hint: "Washington, District of Columbia",
    country: "United States",
    facts: [
      "\u{1F3C5} The Senators beat the New York Giants in 12 innings",
      "\u{1F3E0} Walter Johnson won it in relief",
      "\u{1F4FA} The winning hit took a bad hop over third baseman Fred Lindstrom",
      "\u{1F3C8} It was Washington\u2019s only World Series title until 2019"
    ]
  },
  {
    id: "us-story-204",
    text: "Where did Bill Mazeroski hit his walk-off home run in the 1960 World Series?",
    lat: 40.4434,
    lng: -79.9534,
    category: "event",
    venue: "Forbes Field",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C5} The Pirates won game 7 10-9 against the Yankees",
      "\u{1F3E0} It is the only World Series game 7 to end on a home run",
      "\u{1F4FA} The Yankees outscored Pittsburgh 55-27 over the series",
      "\u{1F3C8} Bobby Richardson was named MVP despite playing for the losing team"
    ]
  },
  {
    id: "us-story-205",
    text: "Where was the Super Bowl played in January 1998?",
    lat: 32.7831,
    lng: -117.1196,
    category: "event",
    venue: "Qualcomm Stadium",
    hint: "San Diego, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The Denver Broncos beat the Green Bay Packers 31-24",
      "\u{1F3E0} Terrell Davis was the MVP despite a migraine",
      "\u{1F4FA} It was John Elway\u2019s first Super Bowl win",
      "\u{1F3C8} Davis scored the winning touchdown with under two minutes left"
    ]
  },
  {
    id: "us-story-206",
    text: "Where did Bryce Harper hit his pennant-winning home run in 2022?",
    lat: 39.9061,
    lng: -75.1665,
    category: "event",
    venue: "Citizens Bank Park",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C5} It came in game 5 of the NLCS against the San Diego Padres",
      "\u{1F3E0} Harper was named NLCS MVP",
      "\u{1F4FA} The Phillies won the series 4-1",
      "\u{1F3C8} It sent Philadelphia to its first World Series since 2009"
    ]
  },
  {
    id: "us-story-207",
    text: "Where was the Super Bowl played in January 1970?",
    lat: 29.9431,
    lng: -90.1171,
    category: "event",
    venue: "Tulane Stadium",
    hint: "New Orleans, Louisiana",
    country: "United States",
    facts: [
      "\u{1F3C5} The Kansas City Chiefs beat the Minnesota Vikings 23-7",
      "\u{1F3E0} Len Dawson was the MVP",
      "\u{1F4FA} Chiefs coach Hank Stram was wired for sound by NFL Films",
      "\u{1F3C8} It was the last Super Bowl before the AFL\u2013NFL merger"
    ]
  },
  {
    id: "us-story-208",
    text: "Where was the College World Series played from 1950 to 2010?",
    lat: 41.2672,
    lng: -95.93,
    category: "event",
    venue: "Rosenblatt Stadium",
    hint: "Omaha, Nebraska",
    country: "United States",
    facts: [
      "\u{1F3C5} The College World Series was held here for 61 years",
      "\u{1F3E0} It opened in 1948 as Omaha Municipal Stadium",
      "\u{1F4FA} Fans called it the Blatt",
      "\u{1F3C8} The Henry Doorly Zoo now uses the site"
    ]
  },
  {
    id: "us-story-209",
    text: "Where did Jackie Robinson make his MLB debut on April 15, 1947?",
    lat: 40.665,
    lng: -73.958,
    category: "event",
    venue: "Ebbets Field",
    hint: "Brooklyn, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} The Brooklyn Dodgers played the Boston Braves that day",
      "\u{1F3E0} Robinson broke baseball\u2019s colour line",
      "\u{1F4FA} His number 42 was retired across MLB in 1997",
      "\u{1F3C8} The park was demolished in 1960 and replaced by apartments"
    ]
  },
  {
    id: "us-story-210",
    text: "Where did the Chicago Cubs play their home games when they won the 1908 World Series?",
    lat: 41.8716,
    lng: -87.6738,
    category: "event",
    venue: "West Side Grounds",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3C5} The Cubs beat the Detroit Tigers four games to one",
      "\u{1F3E0} It was their second straight World Series win over Detroit",
      "\u{1F4FA} Tinker, Evers and Chance anchored the infield",
      "\u{1F3C8} The Cubs moved to what is now Wrigley Field in 1916"
    ]
  },
  {
    id: "us-story-211",
    text: "Where did Sandy Koufax clinch the 1965 World Series?",
    lat: 44.8549,
    lng: -93.2422,
    category: "event",
    venue: "Metropolitan Stadium",
    hint: "Bloomington, Minnesota",
    country: "United States",
    facts: [
      "\u{1F3C5} The Dodgers beat the Minnesota Twins 2-0 in game 7",
      "\u{1F3E0} Koufax threw a three-hit shutout on two days\u2019 rest",
      "\u{1F4FA} He had skipped game 1 to observe Yom Kippur",
      "\u{1F3C8} The site is now the Mall of America"
    ]
  },
  {
    id: "us-story-212",
    text: "Where did Villanova beat Georgetown in the 1985 NCAA final?",
    lat: 38.0491,
    lng: -84.5014,
    category: "event",
    venue: "Rupp Arena",
    hint: "Lexington, Kentucky",
    country: "United States",
    facts: [
      "\u{1F3C5} Villanova won 66-64",
      "\u{1F3E0} The Wildcats shot 78.6% from the field",
      "\u{1F4FA} Villanova was an eighth seed, the lowest seed ever to win the title",
      "\u{1F3C8} Ed Pinckney was named Most Outstanding Player"
    ]
  },
  {
    id: "us-story-213",
    text: "Where was the 1989 NCAA final between Michigan and Seton Hall played?",
    lat: 47.5952,
    lng: -122.3316,
    category: "event",
    venue: "Kingdome",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3C5} Michigan beat Seton Hall 80-79 in overtime",
      "\u{1F3E0} Rumeal Robinson hit two free throws with three seconds left",
      "\u{1F4FA} Steve Fisher took over as coach just before the tournament",
      "\u{1F3C8} Glen Rice set a tournament record with 184 points"
    ]
  },
  {
    id: "us-story-214",
    text: "Where did Texas Western beat Kentucky in the 1966 NCAA final?",
    lat: 38.9881,
    lng: -76.9467,
    category: "event",
    venue: "Cole Field House",
    hint: "College Park, Maryland",
    country: "United States",
    facts: [
      "\u{1F3C5} Texas Western won 72-65",
      "\u{1F3E0} It was the first all-Black starting five in a title game",
      "\u{1F4FA} Kentucky was coached by Adolph Rupp",
      "\u{1F3C8} The game inspired the film Glory Road"
    ]
  },
  {
    id: "us-story-215",
    text: "Where is Darlington Raceway, home of the Southern 500?",
    lat: 34.2952,
    lng: -79.9056,
    category: "event",
    venue: "Darlington Raceway",
    hint: "Darlington, South Carolina",
    country: "United States",
    facts: [
      "\u{1F3C5} It is nicknamed the Track Too Tough to Tame",
      "\u{1F3E0} Its egg shape came from a landowner who would not move his minnow pond",
      "\u{1F4FA} It was NASCAR\u2019s first paved superspeedway",
      "\u{1F3C8} The Southern 500 has been run here since 1950"
    ]
  },
  {
    id: "us-story-216",
    text: "Where did the Chicago Cubs hold their 2016 World Series victory rally?",
    lat: 41.8726,
    lng: -87.619,
    category: "event",
    venue: "Grant Park",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3C5} The Cubs came back from three games to one down against Cleveland",
      "\u{1F3E0} Ben Zobrist was the World Series MVP",
      "\u{1F4FA} Game 7 was interrupted by a rain delay before extra innings",
      "\u{1F3C8} It was the Cubs\u2019 first title since 1908"
    ]
  },
  {
    id: "us-story-217",
    text: "Where is Coors Field, home of the Colorado Rockies?",
    lat: 39.7559,
    lng: -104.9942,
    category: "event",
    venue: "Coors Field",
    hint: "Denver, Colorado",
    country: "United States",
    facts: [
      "\u{1F3C5} It opened in 1995",
      "\u{1F3E0} A row of purple seats marks 5,280 feet above sea level",
      "\u{1F4FA} Baseballs have been stored in a humidor here since 2002",
      "\u{1F3C8} The thin air makes it the most hitter-friendly park in the majors"
    ]
  },
  {
    id: "us-story-218",
    text: "Where is WeatherTech Raceway Laguna Seca, home of the Corkscrew?",
    lat: 36.5841,
    lng: -121.7535,
    category: "event",
    venue: "WeatherTech Raceway Laguna Seca",
    hint: "Monterey, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The Corkscrew drops steeply through a blind left-right turn",
      "\u{1F3E0} The track opened in 1957",
      "\u{1F4FA} Valentino Rossi passed Casey Stoner at the Corkscrew in 2008",
      "\u{1F3C8} It sits inside a county park near Monterey"
    ]
  },
  {
    id: "us-story-219",
    text: "Where is the NFL\u2019s preseason Hall of Fame Game played?",
    lat: 40.8206,
    lng: -81.3978,
    category: "event",
    venue: "Tom Benson Hall of Fame Stadium",
    hint: "Canton, Ohio",
    country: "United States",
    facts: [
      "\u{1F3C5} It stands next to the Pro Football Hall of Fame",
      "\u{1F3E0} The NFL was founded in Canton in 1920",
      "\u{1F4FA} The 2016 game was cancelled because of the paint on the field",
      "\u{1F3C8} The game opens the NFL preseason each August"
    ]
  },
  {
    id: "us-story-220",
    text: "Where is the Grand Prix of Long Beach street race held?",
    lat: 33.765,
    lng: -118.1895,
    category: "event",
    venue: "Long Beach street circuit",
    hint: "Long Beach, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The race has been held since 1975",
      "\u{1F3E0} It hosted Formula One\u2019s United States Grand Prix West from 1976 to 1983",
      "\u{1F4FA} IndyCar has raced here since 1984",
      "\u{1F3C8} It runs through the downtown streets each April"
    ]
  },
  {
    id: "us-story-221",
    text: "Where is Pauley Pavilion, home of UCLA basketball?",
    lat: 34.0703,
    lng: -118.4469,
    category: "event",
    venue: "Pauley Pavilion",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F3C5} It opened in 1965",
      "\u{1F3E0} John Wooden won 10 national titles in 12 years with UCLA",
      "\u{1F4FA} The court is named Nell and John Wooden Court",
      "\u{1F3C8} It sits on the UCLA campus in Westwood"
    ]
  },
  {
    id: "us-story-222",
    text: "Where was game 5 of the 1996 World Series between the Braves and the Yankees played?",
    lat: 33.739,
    lng: -84.389,
    category: "event",
    venue: "Atlanta\u2013Fulton County Stadium",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F3C5} The Yankees won 1-0 behind Andy Pettitte",
      "\u{1F3E0} It was the last game ever played at the stadium",
      "\u{1F4FA} The Yankees went on to win the series in six games",
      "\u{1F3C8} Hank Aaron hit his 715th home run here in 1974"
    ]
  },
  {
    id: "us-story-223",
    text: "Where was the US Open tennis championship played before it moved to Flushing Meadows?",
    lat: 40.7197,
    lng: -73.8467,
    category: "event",
    venue: "West Side Tennis Club",
    hint: "Forest Hills, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} Arthur Ashe won the first US Open here in 1968",
      "\u{1F3E0} Althea Gibson won the national title here in 1957 and 1958",
      "\u{1F4FA} The tournament was played on clay from 1975 to 1977",
      "\u{1F3C8} The event moved to Flushing Meadows in 1978"
    ]
  },
  {
    id: "us-story-224",
    text: "Where did Enos Slaughter make his mad dash in game 7 of the 1946 World Series?",
    lat: 38.6584,
    lng: -90.2203,
    category: "event",
    venue: "Sportsman\u2019s Park",
    hint: "St. Louis, Missouri",
    country: "United States",
    facts: [
      "\u{1F3C5} The Cardinals beat the Boston Red Sox",
      "\u{1F3E0} Harry Brecheen won three games in the series",
      "\u{1F4FA} It was Ted Williams\u2019 only World Series",
      "\u{1F3C8} Slaughter scored the winning run all the way from first base"
    ]
  },
  {
    id: "us-story-225",
    text: "Where did Ben Hogan hit his famous 1-iron at the 1950 US Open?",
    lat: 40.006,
    lng: -75.3093,
    category: "event",
    venue: "Merion Golf Club",
    hint: "Ardmore, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C5} Hogan won 16 months after a near-fatal car crash",
      "\u{1F3E0} He won the title in an 18-hole playoff",
      "\u{1F4FA} Bobby Jones completed his 1930 Grand Slam here",
      "\u{1F3C8} Wicker baskets top the pins instead of flags"
    ]
  },
  {
    id: "us-story-226",
    text: "Where did Louisville beat UCLA in the 1980 NCAA basketball final?",
    lat: 39.7683,
    lng: -86.1519,
    category: "event",
    venue: "Market Square Arena",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3C5} Louisville won 59-54",
      "\u{1F3E0} Darrell Griffith was named Most Outstanding Player",
      "\u{1F4FA} It was Louisville\u2019s first national title",
      "\u{1F3C8} Elvis Presley played his last concert here in 1977"
    ]
  },
  {
    id: "us-story-227",
    text: "Where was the main stadium of the 1904 Olympics, the first Games held in the United States?",
    lat: 38.6478,
    lng: -90.3124,
    category: "event",
    venue: "Francis Field",
    hint: "St. Louis, Missouri",
    country: "United States",
    facts: [
      "\u{1F3C5} Thomas Hicks won a chaotic marathon",
      "\u{1F3E0} Fred Lorz rode part of the marathon course in a car",
      "\u{1F4FA} It is on the campus of Washington University",
      "\u{1F3C8} The Games were held alongside the World\u2019s Fair"
    ]
  },
  {
    id: "us-story-228",
    text: "Where was the 1962 NCAA final between Cincinnati and Ohio State played?",
    lat: 38.2015,
    lng: -85.742,
    category: "event",
    venue: "Freedom Hall",
    hint: "Louisville, Kentucky",
    country: "United States",
    facts: [
      "\u{1F3C5} Cincinnati won 71-59",
      "\u{1F3E0} It was Cincinnati\u2019s second straight final win over Ohio State",
      "\u{1F4FA} Paul Hogue was named Most Outstanding Player",
      "\u{1F3C8} Freedom Hall stands on the Kentucky Exposition Center grounds"
    ]
  },
  {
    id: "us-story-229",
    text: "Where did Magic Johnson meet Larry Bird in the 1979 NCAA final?",
    lat: 40.7623,
    lng: -111.8388,
    category: "event",
    venue: "Jon M. Huntsman Center",
    hint: "Salt Lake City, Utah",
    country: "United States",
    facts: [
      "\u{1F3C5} Michigan State beat Indiana State 75-64",
      "\u{1F3E0} It is still the most-watched college basketball game on US television",
      "\u{1F4FA} Magic Johnson was named Most Outstanding Player",
      "\u{1F3C8} Indiana State came into the game unbeaten at 33-0"
    ]
  },
  {
    id: "us-story-230",
    text: "Where is Oakmont Country Club, a regular host of the US Open?",
    lat: 40.5268,
    lng: -79.8273,
    category: "event",
    venue: "Oakmont Country Club",
    hint: "Oakmont, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C5} Its Church Pews bunker is lined with rows of grass ridges",
      "\u{1F3E0} Jack Nicklaus beat Arnold Palmer here in a 1962 playoff for his first pro win",
      "\u{1F4FA} Johnny Miller shot a final-round 63 to win here in 1973",
      "\u{1F3C8} It has hosted more US Opens than any other course"
    ]
  },
  {
    id: "us-story-231",
    text: "Where did NC State beat Houston in the 1983 NCAA final?",
    lat: 35.0671,
    lng: -106.629,
    category: "event",
    venue: "University Arena (The Pit)",
    hint: "Albuquerque, New Mexico",
    country: "United States",
    facts: [
      "\u{1F3C5} NC State won 54-52",
      "\u{1F3E0} Lorenzo Charles dunked the winning basket at the buzzer",
      "\u{1F4FA} Coach Jim Valvano ran around the court looking for someone to hug",
      "\u{1F3C8} Hakeem Olajuwon of Houston was named Most Outstanding Player"
    ]
  },
  {
    id: "us-story-232",
    text: "Where is The Country Club, the historic golf club outside Boston?",
    lat: 42.3133,
    lng: -71.1494,
    category: "event",
    venue: "The Country Club",
    hint: "Brookline, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C5} The amateur Francis Ouimet won the 1913 US Open here",
      "\u{1F3E0} Justin Leonard\u2019s long putt clinched the 1999 Ryder Cup here",
      "\u{1F4FA} Matt Fitzpatrick won the 2022 US Open here",
      "\u{1F3C8} It is one of the oldest country clubs in America"
    ]
  },
  {
    id: "us-story-233",
    text: "Where did the Philadelphia Eagles win the 1960 NFL Championship?",
    lat: 39.9502,
    lng: -75.1901,
    category: "event",
    venue: "Franklin Field",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C5} The Eagles beat the Green Bay Packers 17-13",
      "\u{1F3E0} It was Vince Lombardi\u2019s only playoff loss",
      "\u{1F4FA} Chuck Bednarik tackled Jim Taylor on the final play",
      "\u{1F3C8} It also hosts the Penn Relays every spring"
    ]
  },
  {
    id: "us-story-234",
    text: "Where is Shinnecock Hills Golf Club?",
    lat: 40.8933,
    lng: -72.44,
    category: "event",
    venue: "Shinnecock Hills Golf Club",
    hint: "Southampton, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} It hosted the second US Open, in 1896",
      "\u{1F3E0} It was one of the founding clubs of the USGA",
      "\u{1F4FA} Brooks Koepka defended his US Open title here in 2018",
      "\u{1F3C8} It sits on the eastern end of Long Island"
    ]
  },
  {
    id: "us-story-235",
    text: "Where did Bill Wambsganss turn an unassisted triple play in the 1920 World Series?",
    lat: 41.5114,
    lng: -81.6443,
    category: "event",
    venue: "League Park",
    hint: "Cleveland, Ohio",
    country: "United States",
    facts: [
      "\u{1F3C5} It happened in game 5",
      "\u{1F3E0} Elmer Smith hit the first World Series grand slam in the same game",
      "\u{1F4FA} Cleveland beat Brooklyn in a best-of-nine series",
      "\u{1F3C8} The site is now a public park"
    ]
  },
  {
    id: "us-story-236",
    text: "Where is Harvard Stadium, the first big concrete stadium in America?",
    lat: 42.3668,
    lng: -71.1255,
    category: "event",
    venue: "Harvard Stadium",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C5} It opened in 1903",
      "\u{1F3E0} Its narrow field helped push the forward pass into the rules in 1906",
      "\u{1F4FA} Harvard plays Yale here in The Game every other year",
      "\u{1F3C8} Its horseshoe shape was modelled on ancient stadiums"
    ]
  },
  {
    id: "us-story-237",
    text: "Where is the National Baseball Hall of Fame?",
    lat: 42.6999,
    lng: -74.9235,
    category: "event",
    venue: "National Baseball Hall of Fame",
    hint: "Cooperstown, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} It opened in 1939",
      "\u{1F3E0} The first class was Cobb, Ruth, Wagner, Mathewson and Johnson",
      "\u{1F4FA} Ty Cobb got the most votes in that first election",
      "\u{1F3C8} Cooperstown was chosen because of the myth that Abner Doubleday invented baseball there"
    ]
  },
  {
    id: "us-story-239",
    text: "Where did Joan Benoit\u2019s winning 1984 Olympic marathon start?",
    lat: 34.0167,
    lng: -118.4706,
    category: "event",
    venue: "Santa Monica College",
    hint: "Santa Monica, California",
    country: "United States",
    facts: [
      "\u{1F3C5} It was the first Olympic marathon for women",
      "\u{1F3E0} Benoit broke away early and won by more than a minute",
      "\u{1F4FA} The race finished in the Los Angeles Memorial Coliseum",
      "\u{1F3C8} Grete Waitz of Norway took the silver medal"
    ]
  },
  {
    id: "us-story-240",
    text: "Where did tiny Milan win the 1954 Indiana state title that inspired the film Hoosiers?",
    lat: 39.8432,
    lng: -86.1679,
    category: "event",
    venue: "Hinkle Fieldhouse",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3C5} Bobby Plump\u2019s last-second shot beat Muncie Central 32-30",
      "\u{1F3E0} Milan High School had fewer than 200 students",
      "\u{1F4FA} The final game of Hoosiers was filmed here",
      "\u{1F3C8} It has been Butler University\u2019s home since 1928"
    ]
  },
  {
    id: "us-athlete-101",
    text: "Where was the first indoor World Cup match played, in 1994?",
    lat: 42.6459,
    lng: -83.2554,
    category: "athlete",
    venue: "Pontiac Silverdome",
    hint: "Pontiac, Michigan",
    country: "United States",
    facts: [
      "\u{1F3C5} The USA drew 1-1 with Switzerland there on June 18",
      "\u{1F3E0} Eric Wynalda scored the American goal from a free kick",
      "\u{1F4FA} Real grass was grown in trays outside and moved under the roof",
      "\u{1F3C8} The stadium was demolished in 2017 and 2018"
    ]
  },
  {
    id: "us-athlete-102",
    text: "Where were the first US National tennis championships held, in 1881?",
    lat: 41.4848,
    lng: -71.3093,
    category: "athlete",
    venue: "Newport Casino",
    hint: "Newport, Rhode Island",
    country: "United States",
    facts: [
      "\u{1F3C5} The first US National Championships were played here in 1881",
      "\u{1F3E0} It is home to the International Tennis Hall of Fame",
      "\u{1F4FA} Its courts are grass",
      "\u{1F3C8} The building was designed by McKim, Mead & White"
    ]
  },
  {
    id: "us-athlete-103",
    text: "Where is Camping World Stadium, home of the Citrus Bowl?",
    lat: 28.5392,
    lng: -81.4029,
    category: "athlete",
    venue: "Camping World Stadium",
    hint: "Orlando, Florida",
    country: "United States",
    facts: [
      "\u{1F3C5} It hosts the Citrus Bowl every winter",
      "\u{1F3E0} It opened in 1936",
      "\u{1F4FA} It hosted matches at the 1994 World Cup",
      "\u{1F3C8} Bethune-Cookman and Florida A&M meet here in the Florida Classic"
    ]
  },
  {
    id: "us-athlete-106",
    text: "Where was the famous 1962 USA\u2013USSR track meet held?",
    lat: 37.4346,
    lng: -122.1609,
    category: "athlete",
    venue: "Stanford Stadium",
    hint: "Stanford, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The meet was held on July 21 and 22, 1962",
      "\u{1F3E0} Valeriy Brumel set a high jump world record of 2.26 metres",
      "\u{1F4FA} Harold Connolly set a hammer throw world record",
      "\u{1F3C8} It took place at the height of the Cold War"
    ]
  },
  {
    id: "us-athlete-107",
    text: "Where is the Yale Bowl?",
    lat: 41.3133,
    lng: -72.96,
    category: "athlete",
    venue: "Yale Bowl",
    hint: "New Haven, Connecticut",
    country: "United States",
    facts: [
      "\u{1F3C5} It opened in 1914",
      "\u{1F3E0} It gave football bowls their name and inspired the Rose Bowl",
      "\u{1F4FA} Yale hosts Harvard here in The Game every other year",
      "\u{1F3C8} Its field sits below ground level, dug into the earth"
    ]
  },
  {
    id: "us-athlete-108",
    text: "Where was the 1963 NBA All Star Game played?",
    lat: 34.0127,
    lng: -118.285,
    category: "athlete",
    venue: "Los Angeles Memorial Sports Arena",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The East beat the West 115-108",
      "\u{1F3E0} Bill Russell was named the game\u2019s MVP",
      "\u{1F4FA} The arena was then the home of the Los Angeles Lakers",
      "\u{1F3C8} It also hosted the 1960 Democratic National Convention"
    ]
  },
  {
    id: "us-athlete-109",
    text: "Where is Legion Field, the Football Capital of the South?",
    lat: 33.5114,
    lng: -86.8433,
    category: "athlete",
    venue: "Legion Field",
    hint: "Birmingham, Alabama",
    country: "United States",
    facts: [
      "\u{1F3C5} It was nicknamed the Football Capital of the South",
      "\u{1F3E0} Alabama and Auburn met here every year until 1988",
      "\u{1F4FA} It hosted soccer at the 1996 Olympics",
      "\u{1F3C8} It opened in 1927 and is named for the American Legion"
    ]
  },
  {
    id: "us-athlete-110",
    text: "Where do Texas and Oklahoma play the Red River Rivalry?",
    lat: 32.7795,
    lng: -96.7597,
    category: "athlete",
    venue: "Cotton Bowl",
    hint: "Dallas, Texas",
    country: "United States",
    facts: [
      "\u{1F3C5} The game is played at Fair Park during the State Fair of Texas",
      "\u{1F3E0} The stands are split between the two fan bases at the 50-yard line",
      "\u{1F4FA} The stadium opened in 1930",
      "\u{1F3C8} It hosted matches at the 1994 World Cup"
    ]
  },
  {
    id: "us-athlete-111",
    text: "Where was the Super Bowl played in January 1996?",
    lat: 33.4264,
    lng: -111.9325,
    category: "athlete",
    venue: "Sun Devil Stadium",
    hint: "Tempe, Arizona",
    country: "United States",
    facts: [
      "\u{1F3C5} The Dallas Cowboys beat the Pittsburgh Steelers 27-17",
      "\u{1F3E0} Cornerback Larry Brown was the MVP",
      "\u{1F4FA} It was the Cowboys\u2019 third title in four seasons",
      "\u{1F3C8} The stadium is the home of Arizona State football"
    ]
  },
  {
    id: "us-athlete-112",
    text: "Where was the Super Bowl played in January 1974?",
    lat: 29.7165,
    lng: -95.4093,
    category: "athlete",
    venue: "Rice Stadium",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3C5} The Miami Dolphins beat the Minnesota Vikings 24-7",
      "\u{1F3E0} Larry Csonka was the MVP",
      "\u{1F4FA} It was Miami\u2019s second straight title",
      "\u{1F3C8} John F. Kennedy gave his moon speech here in 1962"
    ]
  },
  {
    id: "us-athlete-113",
    text: "Where did the Buffalo Bills play before they moved to Orchard Park?",
    lat: 42.91,
    lng: -78.8528,
    category: "athlete",
    venue: "War Memorial Stadium",
    hint: "Buffalo, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} The Bills played here from 1960 to 1972",
      "\u{1F3E0} Buffalo won the 1964 AFL title here",
      "\u{1F4FA} The baseball film The Natural was shot here",
      "\u{1F3C8} It was demolished in 1988"
    ]
  },
  {
    id: "us-athlete-114",
    text: "Where is Cameron Indoor Stadium, home of Duke basketball?",
    lat: 35.9975,
    lng: -78.9422,
    category: "athlete",
    venue: "Cameron Indoor Stadium",
    hint: "Durham, North Carolina",
    country: "United States",
    facts: [
      "\u{1F3C5} Duke has played here since 1940",
      "\u{1F3E0} Its student section is known as the Cameron Crazies",
      "\u{1F4FA} Students camp outside for tickets in a tent city called Krzyzewskiville",
      "\u{1F3C8} It is named after the coach and athletic director Eddie Cameron"
    ]
  },
  {
    id: "us-athlete-115",
    text: "Where did the Boston Braves play from 1915 to 1952?",
    lat: 42.3533,
    lng: -71.1186,
    category: "athlete",
    venue: "Braves Field",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C5} The Braves played here from 1915 until they moved to Milwaukee",
      "\u{1F3E0} The Red Sox borrowed it for their 1915 and 1916 World Series home games",
      "\u{1F4FA} A 26-inning game was played here in 1920",
      "\u{1F3C8} Part of it survives as Boston University\u2019s Nickerson Field"
    ]
  },
  {
    id: "us-athlete-116",
    text: "Where did the San Francisco Giants play their first West Coast home games in 1958?",
    lat: 37.7686,
    lng: -122.4066,
    category: "athlete",
    venue: "Seals Stadium",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3C5} The Giants beat the Dodgers in the first game here on April 15, 1958",
      "\u{1F3E0} It was built for the San Francisco Seals of the Pacific Coast League",
      "\u{1F4FA} The Giants played here until Candlestick Park opened in 1960",
      "\u{1F3C8} It was torn down soon after the Giants left"
    ]
  },
  {
    id: "us-athlete-117",
    text: "Where is Talladega Superspeedway?",
    lat: 33.5669,
    lng: -86.0656,
    category: "athlete",
    venue: "Talladega Superspeedway",
    hint: "Lincoln, Alabama",
    country: "United States",
    facts: [
      "\u{1F3C5} It is a 2.66-mile oval, the longest on the NASCAR schedule",
      "\u{1F3E0} It opened in 1969",
      "\u{1F4FA} Bill Elliott qualified at a record 212.809 mph here in 1987",
      "\u{1F3C8} Restrictor plates arrived after Bobby Allison\u2019s crash here in 1987"
    ]
  },
  {
    id: "us-athlete-118",
    text: "Where did the New York Highlanders, later the Yankees, play from 1903 to 1912?",
    lat: 40.8478,
    lng: -73.9388,
    category: "athlete",
    venue: "Hilltop Park",
    hint: "New York, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} The Highlanders played here from 1903 to 1912",
      "\u{1F3E0} The team became the Yankees and moved to the Polo Grounds in 1913",
      "\u{1F4FA} It stood in Washington Heights in upper Manhattan",
      "\u{1F3C8} The site is now covered by hospital buildings"
    ]
  },
  {
    id: "us-athlete-119",
    text: "Where does the Boston Marathon finish?",
    lat: 42.3497,
    lng: -71.0781,
    category: "athlete",
    venue: "Boston Marathon finish line",
    hint: "Boston, Massachusetts",
    country: "United States",
    facts: [
      "\u{1F3C5} The race has been run every year since 1897",
      "\u{1F3E0} It finishes on Boylston Street",
      "\u{1F4FA} It is run on Patriots\u2019 Day in April",
      "\u{1F3C8} Bobbi Gibb became the first woman to run it, in 1966"
    ]
  },
  {
    id: "us-athlete-120",
    text: "Where was the 1962 AFL Championship game played?",
    lat: 29.7224,
    lng: -95.3489,
    category: "athlete",
    venue: "Jeppesen Stadium",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3C5} The Dallas Texans beat the Houston Oilers 20-17 in double overtime",
      "\u{1F3E0} Tommy Brooker kicked the winning field goal",
      "\u{1F4FA} The Texans became the Kansas City Chiefs a few months later",
      "\u{1F3C8} It was the longest pro football game played up to that time"
    ]
  }
];

// src/lib/questions/usa-venues-3.ts
var usaVenueQuestionsThree = [
  {
    id: "us-venue-301",
    text: "Where is Lambeau Field, home of the Green Bay Packers?",
    lat: 44.5013,
    lng: -88.0622,
    category: "stadium",
    venue: "Lambeau Field",
    hint: "Green Bay, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Packers since 1957",
      "\u{1F3E0} The name comes from the Curly Lambeau who founded the team",
      "\u{1F4FA} The Packers have won thirteen league championships, more than any other NFL team",
      "\u{1F3C8} The stadium is in the smallest city to host an NFL team"
    ]
  },
  {
    id: "us-venue-302",
    text: "Where is Soldier Field in Chicago?",
    lat: 41.8623,
    lng: -87.6167,
    category: "stadium",
    venue: "Soldier Field",
    hint: "Chicago, Illinois",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Chicago Bears since 1971",
      "\u{1F3E0} It opened in 1924 as a memorial to American soldiers of the First World War",
      "\u{1F4FA} The columns outside were meant to look like ancient Greek ruins",
      "\u{1F3C8} The 1985 Bears won both of their home playoff games here on the way to Super Bowl XX"
    ]
  },
  {
    id: "us-venue-303",
    text: "Where is Huntington Bank Field, home of the Cleveland Browns?",
    lat: 41.5061,
    lng: -81.6995,
    category: "stadium",
    venue: "Cleveland Browns Stadium",
    hint: "Cleveland, Ohio",
    country: "United States",
    aliases: ["Huntington Bank Field", "FirstEnergy Stadium"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the Cleveland Browns",
      "\u{1F3E0} The bleachers at the east end are known as the Dawg Pound",
      "\u{1F4FA} The team plays in front of the big lake",
      "\u{1F3C8} The Browns first played in 1946, and the team was inactive from 1996 to 1998 while this stadium was built"
    ]
  },
  {
    id: "us-venue-304",
    text: "Where is Target Field in Minneapolis?",
    lat: 44.9817,
    lng: -93.2776,
    category: "stadium",
    venue: "Target Field",
    hint: "Minneapolis, Minnesota",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Minnesota Twins since 2010",
      "\u{1F3E0} The park looks out over the downtown Minneapolis skyline",
      "\u{1F4FA} The ballpark was built on a tight downtown site above rail lines",
      "\u{1F3C8} The Twins won the 1987 and 1991 World Series at the Metrodome"
    ]
  },
  {
    id: "us-venue-305",
    text: "Where is Citi Field in New York?",
    lat: 40.7571,
    lng: -73.8458,
    category: "stadium",
    venue: "Citi Field",
    hint: "Flushing, New York",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the New York Mets since 2009",
      "\u{1F3E0} The rotunda at the entrance is a tribute to Ebbets Field and Jackie Robinson",
      "\u{1F4FA} A big Home Run Apple rises in centre field after every Mets home run",
      "\u{1F3C8} The Mets won the 1969 championship at Shea Stadium, next door"
    ]
  },
  {
    id: "us-venue-306",
    text: "Where is the home of the Atlanta Dream?",
    lat: 33.6497,
    lng: -84.4495,
    category: "stadium",
    venue: "Gateway Center Arena",
    hint: "College Park, Georgia",
    country: "United States",
    aliases: ["College Park"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the Atlanta Dream of the WNBA",
      "\u{1F3E0} The arena is in College Park, near the Atlanta airport",
      "\u{1F4FA} The arena seats about 3,500 people",
      "\u{1F3C8} The Dream will move all their home games to State Farm Arena in 2027"
    ]
  },
  {
    id: "us-venue-307",
    text: "Where is FedExForum in Memphis?",
    lat: 35.1382,
    lng: -90.0506,
    category: "stadium",
    venue: "FedExForum",
    hint: "Memphis, Tennessee",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Memphis Grizzlies of the NBA",
      "\u{1F3E0} The arena is a block from Beale Street",
      "\u{1F4FA} The city has one of the best barbecue traditions in the country",
      "\u{1F3C8} The Grizzlies moved there in 2004"
    ]
  },
  {
    id: "us-venue-308",
    text: "Where is Toyota Center in Houston?",
    lat: 29.7573,
    lng: -95.3555,
    category: "stadium",
    venue: "Toyota Center",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Houston Rockets of the NBA",
      "\u{1F3E0} The arena opened in 2003 at the east end of downtown",
      "\u{1F4FA} The 1994 and 1995 titles were won at The Summit, before this arena was built",
      "\u{1F3C8} The arena is in the centre of the downtown"
    ]
  },
  {
    id: "us-venue-309",
    text: "Where is Moda Center in Portland?",
    lat: 45.5316,
    lng: -122.6668,
    category: "stadium",
    venue: "Moda Center",
    hint: "Portland, Oregon",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Portland Trail Blazers of the NBA",
      "\u{1F3E0} The arena opened in 1995 as the Rose Garden",
      "\u{1F4FA} The arena is in the Rose Quarter, beside the old Memorial Coliseum",
      "\u{1F3C8} The Blazers won the 1977 championship elsewhere"
    ]
  },
  {
    id: "us-venue-310",
    text: "Where is Paycom Center in Oklahoma City?",
    lat: 35.4684,
    lng: -97.5164,
    category: "stadium",
    venue: "Paycom Center",
    hint: "Oklahoma City, Oklahoma",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Oklahoma City Thunder",
      "\u{1F3E0} The arena opened in 2002 as the Ford Center",
      "\u{1F4FA} The team arrived from Seattle in 2008, where it had been the SuperSonics",
      "\u{1F3C8} The city is the biggest in Oklahoma"
    ]
  },
  {
    id: "us-venue-311",
    text: "Where is the arena that used to be called the American Airlines Arena?",
    lat: 25.7814,
    lng: -80.187,
    category: "stadium",
    venue: "Kaseya Center",
    hint: "Miami, Florida",
    country: "United States",
    aliases: ["American Airlines Arena", "FTX Arena", "Miami-Dade Arena"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the Miami Heat since 2000",
      "\u{1F3E0} The building is called Kaseya Center now",
      "\u{1F4FA} The arena stands on Biscayne Bay in downtown Miami",
      "\u{1F3C8} The Heat clinched the 2012 and 2013 championships here"
    ]
  },
  {
    id: "us-venue-312",
    text: "Where is PPG Paints Arena in Pittsburgh?",
    lat: 40.4395,
    lng: -79.9892,
    category: "stadium",
    venue: "PPG Paints Arena",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Pittsburgh Penguins of the NHL",
      "\u{1F3E0} The arena opened in 2010, across the street from the old Civic Arena",
      "\u{1F4FA} The arena sits at the edge of downtown, below the Hill District",
      "\u{1F3C8} The city is known as the city of bridges"
    ]
  },
  {
    id: "us-venue-313",
    text: "Where is Amerant Bank Arena in Florida?",
    lat: 26.1584,
    lng: -80.3256,
    category: "stadium",
    venue: "Amerant Bank Arena",
    hint: "Sunrise, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Florida Panthers of the NHL",
      "\u{1F3E0} The Panthers won the Stanley Cup on home ice here in 2024 and 2025",
      "\u{1F4FA} The arena is in Sunrise, not Miami",
      "\u{1F3C8} The team moved there from Miami"
    ]
  },
  {
    id: "us-venue-314",
    text: "Where is UBS Arena in New York?",
    lat: 40.7114,
    lng: -73.7264,
    category: "stadium",
    venue: "UBS Arena",
    hint: "Elmont, New York",
    country: "United States",
    aliases: ["Elmont", "Belmont Park"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the New York Islanders of the NHL",
      "\u{1F3E0} The arena opened in 2021 at Belmont Park racetrack",
      "\u{1F4FA} The Islanders played their last season at the Nassau Coliseum in 2021",
      "\u{1F3C8} The arena is just over the city line from Queens"
    ]
  },
  {
    id: "us-venue-315",
    text: "Where is Climate Pledge Arena in Seattle?",
    lat: 47.6129,
    lng: -122.3494,
    category: "stadium",
    venue: "Climate Pledge Arena",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Seattle Kraken of the NHL",
      "\u{1F3E0} The Kraken joined the league in 2021",
      "\u{1F4FA} The arena kept the landmark sloping roof of the 1962 original",
      "\u{1F3C8} The arena was the old Seattle Center Coliseum"
    ]
  },
  {
    id: "us-venue-316",
    text: "Where is Beaver Stadium in University Park?",
    lat: 40.8122,
    lng: -77.8561,
    category: "stadium",
    venue: "Beaver Stadium",
    hint: "University Park, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Penn State Nittany Lions",
      "\u{1F3E0} The stadium holds more than a hundred thousand people",
      "\u{1F4FA} White Out is the loudest game in college football",
      "\u{1F3C8} The White Out game is usually the biggest home game of the year"
    ]
  },
  {
    id: "us-venue-317",
    text: "Where is the stadium of the University of Texas?",
    lat: 30.2839,
    lng: -97.7394,
    category: "stadium",
    venue: "Darrell K Royal Texas Memorial Stadium",
    hint: "Austin, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Texas Longhorns",
      "\u{1F3E0} The stadium opened in 1924 as a memorial to Texans who served in the First World War",
      "\u{1F4FA} The tower is three hundred feet high",
      "\u{1F3C8} The team has won four national championships"
    ]
  },
  {
    id: "us-venue-318",
    text: "Where is Camp Randall Stadium in Madison?",
    lat: 43.07,
    lng: -89.4127,
    category: "stadium",
    venue: "Camp Randall Stadium",
    hint: "Madison, Wisconsin",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Wisconsin Badgers",
      "\u{1F3E0} The stadium opened in 1917 on the site of a Civil War training camp",
      '\u{1F4FA} The whole crowd jumps to "Jump Around" before the fourth quarter',
      "\u{1F3C8} The game against Minnesota for Paul Bunyan's Axe is the oldest rivalry"
    ]
  },
  {
    id: "us-venue-319",
    text: "Where is Doak Campbell Stadium in Tallahassee?",
    lat: 30.4381,
    lng: -84.3044,
    category: "stadium",
    venue: "Doak Campbell Stadium",
    hint: "Tallahassee, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Florida State Seminoles",
      "\u{1F3E0} The mascot is a seminole warrior",
      "\u{1F4FA} The stadium is nicknamed Doak",
      "\u{1F3C8} The city is the capital of Florida"
    ]
  },
  {
    id: "us-venue-320",
    text: "Where is BayCare Ballpark in Clearwater?",
    lat: 27.9707,
    lng: -82.7317,
    category: "stadium",
    venue: "BayCare Ballpark",
    hint: "Clearwater, Florida",
    country: "United States",
    aliases: ["Bright House Field", "Spectrum Field"],
    facts: [
      "\u{1F3DF}\uFE0F Spring training home of the Philadelphia Phillies",
      "\u{1F3E0} The ballpark opened in 2004 as Bright House Field",
      "\u{1F4FA} A grass berm runs around the outfield",
      "\u{1F3C8} The Clearwater Threshers play there in summer"
    ]
  },
  {
    id: "us-venue-321",
    text: "Where is Joker Marchant Stadium in Lakeland?",
    lat: 28.0747,
    lng: -81.951,
    category: "stadium",
    venue: "Publix Field at Joker Marchant Stadium",
    hint: "Lakeland, Florida",
    country: "United States",
    aliases: ["Joker Marchant Stadium"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the Detroit Tigers in the spring",
      "\u{1F3E0} The Tigers have held spring training in Lakeland since 1934, apart from the war years",
      "\u{1F4FA} The stadium opened in 1966 and was renovated in 2017",
      "\u{1F3C8} The club has a minor league team there too"
    ]
  },
  {
    id: "us-venue-322",
    text: "Where was the ballpark of the Charlotte Stone Crabs?",
    lat: 26.9907,
    lng: -82.2469,
    category: "stadium",
    venue: "Charlotte Sports Park",
    hint: "Port Charlotte, Florida",
    country: "United States",
    aliases: ["Port Charlotte"],
    facts: [
      "\u{1F3DF}\uFE0F Home of the minor league Charlotte Stone Crabs",
      "\u{1F3E0} The park is the spring training home of the Tampa Bay Rays",
      "\u{1F4FA} The Stone Crabs played there from 2009 until 2020",
      "\u{1F3C8} The park was built in 1987 for the Texas Rangers"
    ]
  },
  {
    id: "us-venue-323",
    text: "Where is the Circuit of the Americas in Austin?",
    lat: 30.1328,
    lng: -97.6411,
    category: "stadium",
    venue: "Circuit of the Americas",
    hint: "Austin, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the United States Grand Prix since 2012",
      "\u{1F3E0} The first turn is a steep uphill hairpin",
      "\u{1F4FA} The circuit also holds the Motorcycle Grand Prix",
      "\u{1F3C8} The track is about fifteen miles southeast of downtown Austin"
    ]
  },
  {
    id: "us-venue-324",
    text: "Where is Daytona International Speedway?",
    lat: 29.1852,
    lng: -81.0705,
    category: "stadium",
    venue: "Daytona International Speedway",
    hint: "Daytona Beach, Florida",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The place where the Daytona 500 is run every February",
      "\u{1F3E0} The track is two and a half miles long and banked",
      "\u{1F4FA} The Daytona 500 is the most watched race in the country",
      "\u{1F3C8} The infield road course hosts the Rolex 24 sports car race"
    ]
  },
  {
    id: "us-venue-325",
    text: "Where is Indianapolis Motor Speedway?",
    lat: 39.795,
    lng: -86.2347,
    category: "stadium",
    venue: "Indianapolis Motor Speedway",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Indianapolis 500, run every May",
      "\u{1F3E0} The yard of bricks on the track is a famous piece of the circuit",
      "\u{1F4FA} The oval is exactly two and a half miles long",
      "\u{1F3C8} The 500 has run there since 1911"
    ]
  },
  {
    id: "us-venue-401",
    text: "Where is Husky Stadium in Seattle?",
    lat: 47.6503,
    lng: -122.3016,
    category: "stadium",
    venue: "Husky Stadium",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the Washington Huskies",
      "\u{1F3E0} The stadium sits in a bowl with the mountains behind it",
      "\u{1F4FA} The team has played there since 1920",
      "\u{1F3C8} The stadium is on Lake Washington, and some fans arrive by boat"
    ]
  },
  {
    id: "us-venue-402",
    text: "Where is Kezar Stadium in San Francisco?",
    lat: 37.7671,
    lng: -122.4553,
    category: "stadium",
    venue: "Kezar Stadium",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the San Francisco 49ers from 1946 to 1970",
      "\u{1F3E0} It was built with money left to the city by the Kezar family",
      "\u{1F4FA} The stadium is in the corner of Golden Gate Park",
      "\u{1F3C8} The 49ers won no championships there"
    ]
  },
  {
    id: "us-venue-403",
    text: "Where is Shibe Park in Philadelphia?",
    lat: 39.9963,
    lng: -75.1653,
    category: "stadium",
    venue: "Shibe Park",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    aliases: ["Connie Mack Stadium"],
    facts: [
      "\u{1F3DF}\uFE0F The home of the Philadelphia Athletics and the Phillies",
      '\u{1F3E0} A tall "spite fence" in right field blocked the view from rooftops across 20th Street',
      "\u{1F4FA} The building was the first steel and concrete ballpark",
      "\u{1F3C8} The Athletics won the 1929 World Series there"
    ]
  },
  {
    id: "us-venue-404",
    text: "Where is Crosley Field in Cincinnati?",
    lat: 39.1167,
    lng: -84.5353,
    category: "stadium",
    venue: "Crosley Field",
    hint: "Cincinnati, Ohio",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Cincinnati Reds from 1912 to 1970",
      "\u{1F3E0} It hosted the first night game in the major leagues, in 1935",
      '\u{1F4FA} The outfield sloped up to the wall in a famous "terrace"',
      "\u{1F3C8} The Reds won Game 7 of the 1940 World Series there"
    ]
  },
  {
    id: "us-venue-405",
    text: "Where is Three Rivers Stadium in Pittsburgh?",
    lat: 40.4469,
    lng: -80.0058,
    category: "stadium",
    venue: "Three Rivers Stadium",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Pittsburgh Pirates from 1970 to 2000",
      "\u{1F3E0} It was known as the cookie cutter, because it was round",
      "\u{1F4FA} The Immaculate Reception happened there in 1972",
      "\u{1F3C8} Roberto Clemente got his 3,000th hit there in 1972"
    ]
  },
  {
    id: "us-venue-406",
    text: "Where is Riverfront Stadium in Cincinnati?",
    lat: 39.0954,
    lng: -84.516,
    category: "stadium",
    venue: "Riverfront Stadium",
    hint: "Cincinnati, Ohio",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Cincinnati Reds from 1970 to 2002",
      "\u{1F3E0} The outfield wall by the river was a landmark",
      "\u{1F4FA} It was demolished in 2002 and Great American Ball Park was built partly on the site",
      "\u{1F3C8} The Big Red Machine played there"
    ]
  },
  {
    id: "us-venue-407",
    text: "Where is Veterans Stadium in Philadelphia?",
    lat: 39.9069,
    lng: -75.1711,
    category: "stadium",
    venue: "Veterans Stadium",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Philadelphia Eagles and the Phillies",
      "\u{1F3E0} Its artificial turf was notorious among players",
      "\u{1F4FA} The stadium was demolished in 2004",
      "\u{1F3C8} The Phillies won their first World Series there in 1980"
    ]
  },
  {
    id: "us-venue-408",
    text: "Where is the Astrodome in Houston?",
    lat: 29.6847,
    lng: -95.4072,
    category: "stadium",
    venue: "Astrodome",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The first domed stadium in the world",
      "\u{1F3E0} The building was nicknamed the Eighth Wonder of the World",
      "\u{1F4FA} It was the first stadium with artificial turf, which became known as AstroTurf",
      "\u{1F3C8} The Astros played there for thirty five seasons, from 1965 to 1999"
    ]
  },
  {
    id: "us-venue-409",
    text: "Where is Busch Memorial Stadium in St. Louis?",
    lat: 38.624,
    lng: -90.1925,
    category: "stadium",
    venue: "Busch Memorial Stadium",
    hint: "St. Louis, Missouri",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the St. Louis Cardinals from 1966 to 2005",
      "\u{1F3E0} A ring of arches around the roof echoed the Gateway Arch nearby",
      "\u{1F4FA} The stadium was known as Busch Stadium II",
      "\u{1F3C8} The Cardinals won Game 7 of the 1982 World Series there"
    ]
  },
  {
    id: "us-venue-410",
    text: "Where is Texas Stadium in Irving, Texas?",
    lat: 32.8401,
    lng: -96.9113,
    category: "stadium",
    venue: "Texas Stadium",
    hint: "Irving, Texas",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the Dallas Cowboys from 1971 to 2008",
      "\u{1F3E0} The building had a hole in the roof that let a circle of sky through",
      "\u{1F4FA} The hole was never covered, and the stadium was imploded in 2010",
      "\u{1F3C8} The Cowboys won five Super Bowls while it was their home"
    ]
  },
  {
    id: "us-venue-411",
    text: "Where is Giants Stadium in East Rutherford?",
    lat: 40.8135,
    lng: -74.0745,
    category: "stadium",
    venue: "Giants Stadium",
    hint: "East Rutherford, New Jersey",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of the New York Giants and New York Jets until 2009",
      "\u{1F3E0} The stadium was built in 1976 in the Meadowlands marshes",
      "\u{1F4FA} The Jets left for New Jersey in 1984",
      "\u{1F3C8} The Giants won three Super Bowls while it was their home"
    ]
  },
  {
    id: "us-venue-412",
    text: "Where was RFK Stadium in Washington?",
    lat: 38.8898,
    lng: -76.9719,
    category: "stadium",
    venue: "RFK Stadium",
    hint: "Washington, District of Columbia",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The home of Washington's NFL team, now the Commanders, from 1961 to 1996",
      "\u{1F3E0} The concrete bowl had no roof",
      "\u{1F4FA} The stadium was named for Robert F. Kennedy",
      "\u{1F3C8} A new Commanders stadium is planned on the site"
    ]
  }
];

// src/lib/questions/usa-outlying.ts
var usaOutlyingQuestions = [
  {
    id: "us-out-001",
    text: "Where is Aloha Stadium in Honolulu?",
    lat: 21.3728,
    lng: -157.9303,
    category: "stadium",
    venue: "Aloha Stadium",
    hint: "Halawa, Oahu, Hawaii",
    country: "United States",
    aliases: ["Halawa", "Honolulu"],
    facts: [
      "\u{1F3DF}\uFE0F The old home of University of Hawaii football, closed to fans since 2020",
      "\u{1F3E0} The stadium is near Pearl Harbor, not Waikiki",
      "\u{1F4FA} The NFL Pro Bowl was played here for years",
      "\u{1F3C8} The stadium opened in 1975"
    ]
  },
  {
    id: "us-out-002",
    text: "Where is the Ironman World Championship in Hawaii?",
    lat: 19.64,
    lng: -155.99,
    category: "stadium",
    venue: "Kona Ironman World Championship",
    hint: "Kailua-Kona, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The race starts in the town of Kailua-Kona on the island of Hawaii",
      "\u{1F3E0} The bike course runs up the Queen Kaahumanu Highway to Hawi, and the race finishes on Alii Drive",
      "\u{1F4FA} The race began on Oahu in 1978 and moved to Kona in 1981",
      "\u{1F3C8} The swim is the first 2.4 miles, in the ocean"
    ]
  },
  {
    id: "us-out-003",
    text: "Where is Kapiolani Park in Honolulu?",
    lat: 21.269,
    lng: -157.821,
    category: "stadium",
    venue: "Kapiolani Park",
    hint: "Honolulu, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The Honolulu Marathon finishes in the park",
      "\u{1F3E0} The Honolulu Zoo and the Waikiki Shell are in the park",
      "\u{1F4FA} The park opened in 1877",
      "\u{1F3C8} It is named for Queen Kapiolani, wife of King Kalakaua"
    ]
  },
  {
    id: "us-out-004",
    text: "Where is Diamond Head in Honolulu?",
    lat: 21.262,
    lng: -157.8053,
    category: "stadium",
    venue: "Diamond Head",
    hint: "Honolulu, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The volcanic crater that stands behind Honolulu",
      "\u{1F3E0} The trail up the crater was built in 1908 as part of the coastal defences",
      "\u{1F4FA} The view from the top is the one everybody photographs",
      "\u{1F3C8} The crater is about two hundred and thirty metres high"
    ]
  },
  {
    id: "us-out-005",
    text: "Where is Lahaina on Maui?",
    lat: 20.8723,
    lng: -156.6742,
    category: "stadium",
    venue: "Lahaina",
    hint: "Maui, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The old town on the west side of the island of Maui",
      "\u{1F3E0} Whale watching boats leave from the harbour there",
      "\u{1F4FA} On the eighth of August 2023 a fire destroyed most of the historic town",
      "\u{1F3C8} The banyan tree in the square is more than a hundred and fifty years old"
    ]
  },
  {
    id: "us-out-006",
    text: "Where is Wailuku on Maui?",
    lat: 20.8911,
    lng: -156.5047,
    category: "stadium",
    venue: "Wailuku",
    hint: "Maui, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The county seat of Maui County",
      "\u{1F3E0} Kahului and the main airport are just to the east",
      "\u{1F4FA} The Iao Needle rises in the Iao Valley just west of the town",
      "\u{1F3C8} The town is inland from the coast"
    ]
  },
  {
    id: "us-out-007",
    text: "Where is Hilo on the island of Hawaii?",
    lat: 19.7297,
    lng: -155.09,
    category: "stadium",
    venue: "Hilo",
    hint: "Hilo, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The largest town on the Big Island, and the gateway to Hawaii Volcanoes National Park",
      "\u{1F3E0} Akaka Falls and Rainbow Falls are both near the town",
      "\u{1F4FA} The town is on the wet side of the island and gets a lot of rain",
      "\u{1F3C8} The town was hit by tsunamis in 1946 and 1960"
    ]
  },
  {
    id: "us-out-008",
    text: "Where is Lihue on Kauai?",
    lat: 21.981,
    lng: -159.371,
    category: "stadium",
    venue: "Lihue",
    hint: "Kauai, Hawaii",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The main town of the island of Kauai",
      "\u{1F3E0} Na Pali Coast is on the north west side of the island",
      "\u{1F4FA} The Kauai community college is in the town",
      "\u{1F3C8} Waimea Canyon is on the west side of the island"
    ]
  },
  {
    id: "us-out-009",
    text: "Where is the Alyeska Resort in Alaska?",
    lat: 60.9705,
    lng: -149.0985,
    category: "stadium",
    venue: "Alyeska Resort",
    hint: "Girdwood, Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The ski resort at Girdwood, south of Anchorage",
      "\u{1F3E0} It is the largest ski resort in Alaska",
      "\u{1F4FA} The aerial tram climbs Mount Alyeska to the Seven Glaciers restaurant",
      "\u{1F3C8} The Iditarod trail passes through the town"
    ]
  },
  {
    id: "us-out-010",
    text: "Where is Sullivan Arena in Anchorage?",
    lat: 61.2049,
    lng: -149.8674,
    category: "stadium",
    venue: "Sullivan Arena",
    hint: "Anchorage, Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Former home of the Alaska Aces of the ECHL",
      "\u{1F3E0} The Aces won the Kelly Cup in 2006, 2011 and 2014",
      "\u{1F4FA} The arena opened in 1983",
      "\u{1F3C8} The Aces folded in 2017"
    ]
  },
  {
    id: "us-out-011",
    text: "Where is the Alaska Airlines Center in Anchorage?",
    lat: 61.1898,
    lng: -149.8215,
    category: "stadium",
    venue: "Alaska Airlines Center",
    hint: "Anchorage, Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F Home of the University of Alaska Anchorage Seawolves",
      "\u{1F3E0} The arena opened in 2014 and seats about 5,000",
      "\u{1F4FA} The building is on the UAA campus on Providence Drive",
      "\u{1F3C8} The team is called the Seawolves"
    ]
  },
  {
    id: "us-out-012",
    text: "Where is Ketchikan in Alaska?",
    lat: 55.342,
    lng: -131.65,
    category: "stadium",
    venue: "Ketchikan",
    hint: "Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The town on the Tongass Narrows, known as the Salmon Capital of the World",
      "\u{1F3E0} The town has one of the largest collections of standing totem poles in the world",
      "\u{1F4FA} It is the first Alaskan port of call for many cruise ships",
      "\u{1F3C8} The town is on an island, and the airport is on another"
    ]
  },
  {
    id: "us-out-013",
    text: "Where is Homer in Alaska?",
    lat: 59.64,
    lng: -151.55,
    category: "stadium",
    venue: "Homer",
    hint: "Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The town at the end of the road on the Kenai Peninsula",
      "\u{1F3E0} Homer is the halibut capital of the world",
      "\u{1F4FA} The Homer Spit is where the fishing boats unload",
      "\u{1F3C8} The town sits on Kachemak Bay"
    ]
  },
  {
    id: "us-out-014",
    text: "Where is Juneau in Alaska?",
    lat: 58.3019,
    lng: -134.4197,
    category: "stadium",
    venue: "Juneau",
    hint: "Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The capital of Alaska, and one of the largest cities in the country by area",
      "\u{1F3E0} The city is on the mainland, and there is no road to it",
      "\u{1F4FA} The Mendenhall Glacier is just outside the city",
      "\u{1F3C8} The state capitol building is in the city"
    ]
  },
  {
    id: "us-out-015",
    text: "Where is Fairbanks in Alaska?",
    lat: 64.8378,
    lng: -147.7164,
    category: "stadium",
    venue: "Fairbanks",
    hint: "Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The second largest city in Alaska, and the coldest in the country",
      "\u{1F3E0} The temperature reached minus sixty six degrees there in 1934",
      "\u{1F4FA} The University of Alaska Fairbanks is in the city",
      "\u{1F3C8} The city is the home of the Yukon Quest sled dog race"
    ]
  },
  {
    id: "us-out-016",
    text: "Where is Nome in Alaska?",
    lat: 64.5011,
    lng: -165.4064,
    category: "stadium",
    venue: "Nome",
    hint: "Alaska",
    country: "United States",
    facts: [
      "\u{1F3DF}\uFE0F The town on the Bering Sea, where the Iditarod finishes",
      "\u{1F3E0} The gold rush of 1898 made the town famous",
      "\u{1F4FA} The end of the thousand mile dog sled race is here",
      "\u{1F3C8} The town is on the south coast of the Seward Peninsula"
    ]
  }
];

// src/lib/questions/usa-stories.ts
var usaStoryQuestions = [
  {
    id: "us-story-001",
    text: "Where was the 1984 Summer Olympics opening ceremony held?",
    lat: 34.0144,
    lng: -118.2919,
    category: "event",
    venue: "Los Angeles Memorial Coliseum (1984 opening ceremony)",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F3C5} 140 nations marched in, a record at the time",
      "\u{1F680} A man flew into the stadium wearing a rocket belt",
      "\u{1F6AB} The Soviet Union and most of the Eastern Bloc boycotted the Games",
      "\u{1F3DF}\uFE0F The Coliseum had also hosted the 1932 Olympics"
    ]
  },
  {
    id: "us-story-002",
    text: "Where was the cauldron lit for the 1996 Atlanta Olympics?",
    lat: 33.7353,
    lng: -84.3894,
    category: "event",
    venue: "Centennial Olympic Stadium (1996 cauldron)",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F525} Muhammad Ali lit the cauldron, his hands shaking from Parkinson\u2019s",
      "\u{1F3CA} Swimmer Janet Evans handed him the torch",
      "\u{1F389} The Games marked 100 years of the modern Olympics",
      "\u26BE The stadium later became Turner Field, home of the Atlanta Braves"
    ]
  },
  {
    id: "us-story-003",
    text: "Where were the 1960 Winter Olympics held?",
    lat: 39.196,
    lng: -120.235,
    category: "event",
    venue: "Squaw Valley",
    hint: "Olympic Valley, California",
    country: "United States",
    facts: [
      "\u{1F4FA} The first Winter Olympics shown live on American television",
      "\u{1F3AC} Walt Disney organised the opening and closing ceremonies",
      "\u{1F3D2} The US men won their first Olympic ice hockey gold",
      "\u{1F3D4}\uFE0F The resort was renamed Palisades Tahoe in 2021"
    ]
  },
  {
    id: "us-story-004",
    text: "Where were the 1932 Winter Olympics held?",
    lat: 44.279,
    lng: -73.979,
    category: "event",
    venue: "Lake Placid",
    hint: "Lake Placid, New York",
    country: "United States",
    facts: [
      "\u{1F3C5} The third Winter Olympic Games",
      "\u{1F94A} Eddie Eagan won bobsleigh gold, having won boxing gold in 1920",
      "\u{1F6F7} The bobsleigh run at Mount Van Hoevenberg was built for these Games",
      "\u{1F3D2} Forty-eight years later the town hosted the Miracle on Ice"
    ]
  },
  {
    id: "us-story-005",
    text: "Where was the 1972 Immaculate Reception?",
    lat: 40.4478,
    lng: -80.0103,
    category: "event",
    venue: "Three Rivers Stadium (Immaculate Reception)",
    hint: "Pittsburgh, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C8} Terry Bradshaw\u2019s pass deflected and Franco Harris caught it near his shoetops",
      "\u{1F384} It was a playoff game against the Oakland Raiders on 23 December 1972",
      "\u{1F3C6} It gave the Pittsburgh Steelers their first ever playoff win",
      "\u{1F4A5} Three Rivers Stadium was demolished in 2001"
    ]
  },
  {
    id: "us-story-006",
    text: 'Where did "The Catch" happen in the 1981 NFC Championship?',
    lat: 37.713,
    lng: -122.386,
    category: "event",
    venue: "Candlestick Park",
    hint: "San Francisco, California",
    country: "United States",
    facts: [
      "\u{1F3C8} Joe Montana threw it and Dwight Clark leapt to catch it in the end zone",
      "\u{1F3C6} The 49ers beat the Dallas Cowboys 28-27 and went on to win Super Bowl XVI",
      "\u{1F4C5} The game was played on 10 January 1982",
      "\u{1F4A5} Candlestick Park was demolished in 2015"
    ]
  },
  {
    id: "us-story-007",
    text: 'Where did Christian Laettner hit "The Shot" to beat Kentucky in 1992?',
    lat: 39.9042,
    lng: -75.1711,
    category: "event",
    venue: "The Spectrum",
    hint: "Philadelphia, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C0} Duke beat Kentucky 104-103 in overtime in the East Regional final",
      "\u23F1\uFE0F Grant Hill threw a full-court pass with 2.1 seconds left",
      "\u{1F3AF} Laettner went 10 for 10 from the field and 10 for 10 from the line",
      "\u{1F3C6} Duke went on to win its second straight national title"
    ]
  },
  {
    id: "us-story-008",
    text: 'Where did the "Miracle Mets" clinch the 1969 World Series?',
    lat: 40.7571,
    lng: -73.8458,
    category: "event",
    venue: "Shea Stadium",
    hint: "Queens, New York",
    country: "United States",
    facts: [
      "\u26BE The Mets beat the Baltimore Orioles four games to one",
      "\u{1F4C8} The team had finished ninth the year before",
      "\u{1F4C5} Founded in 1962, the Mets had never had a winning season before 1969",
      "\u{1F3B8} Shea hosted the Beatles in 1965 and was demolished in 2009"
    ]
  },
  {
    id: "us-story-009",
    text: "Where was the 2026 FIFA World Cup final played?",
    lat: 40.8135,
    lng: -74.0745,
    category: "event",
    venue: "MetLife Stadium (2026 World Cup final)",
    hint: "East Rutherford, New Jersey",
    country: "United States",
    facts: [
      "\u{1F30E} The first World Cup with 48 teams",
      "\u{1F91D} The tournament was co-hosted by the United States, Canada and Mexico",
      "\u{1F3C6} The first men\u2019s World Cup final in the United States since 1994",
      "\u{1F3C8} The stadium is home to the NFL\u2019s Giants and Jets"
    ]
  },
  {
    id: "us-story-010",
    text: "Where was the 1999 Women\u2019s World Cup final played?",
    lat: 34.1613,
    lng: -118.1676,
    category: "event",
    venue: "Rose Bowl (1999 Women\u2019s World Cup final)",
    hint: "Pasadena, California",
    country: "United States",
    facts: [
      "\u26BD The United States beat China 5-4 on penalties after a 0-0 draw",
      "\u{1F45F} Brandi Chastain scored the winning penalty",
      "\u{1F465} The crowd of 90,185 was a record at the time for a women\u2019s sporting event",
      "\u{1F3C6} It was the USA\u2019s second Women\u2019s World Cup title"
    ]
  },
  {
    id: "us-story-011",
    text: "Where was Super Bowl XLVIII played in 2014?",
    lat: 40.8135,
    lng: -74.0745,
    category: "event",
    venue: "MetLife Stadium (Super Bowl XLVIII)",
    hint: "East Rutherford, New Jersey",
    country: "United States",
    facts: [
      "\u{1F3C8} The Seattle Seahawks beat the Denver Broncos 43-8",
      "\u2744\uFE0F The first Super Bowl held outdoors in a cold-weather city",
      "\u23F1\uFE0F Seattle scored a safety 12 seconds in, the fastest score in Super Bowl history",
      "\u{1F3C6} It was the Seahawks\u2019 first Super Bowl title"
    ]
  },
  {
    id: "us-story-012",
    text: "Where was Super Bowl LI played in 2017?",
    lat: 29.6847,
    lng: -95.4107,
    category: "event",
    venue: "NRG Stadium (Super Bowl LI)",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3C8} The New England Patriots came back from 28-3 to beat the Atlanta Falcons 34-28",
      "\u23F1\uFE0F It was the first Super Bowl to go into overtime",
      "\u{1F4C8} The 25-point comeback is the largest in Super Bowl history",
      "\u{1F3A4} Lady Gaga performed the halftime show"
    ]
  },
  {
    id: "us-story-013",
    text: "Where was Super Bowl LIII played in 2019?",
    lat: 33.7554,
    lng: -84.4008,
    category: "event",
    venue: "Mercedes-Benz Stadium (Super Bowl LIII)",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F3C8} The New England Patriots beat the Los Angeles Rams 13-3",
      "\u{1F4C9} It was the lowest scoring Super Bowl in history",
      "\u{1F3C5} Julian Edelman was named MVP",
      "\u{1F3C6} Tom Brady won his sixth Super Bowl"
    ]
  },
  {
    id: "us-story-014",
    text: "Where was Super Bowl XLV played in 2011?",
    lat: 32.7473,
    lng: -97.0945,
    category: "event",
    venue: "AT&T Stadium (Super Bowl XLV)",
    hint: "Arlington, Texas",
    country: "United States",
    facts: [
      "\u{1F3C8} The Green Bay Packers beat the Pittsburgh Steelers 31-25",
      "\u{1F3C5} Aaron Rodgers was named MVP",
      "\u{1F3DF}\uFE0F The stadium was then called Cowboys Stadium",
      "\u{1F3A4} The Black Eyed Peas performed the halftime show"
    ]
  },
  {
    id: "us-story-015",
    text: "Where was Super Bowl LVIII played in 2024?",
    lat: 36.0909,
    lng: -115.1833,
    category: "event",
    venue: "Allegiant Stadium (Super Bowl LVIII)",
    hint: "Las Vegas, Nevada",
    country: "United States",
    facts: [
      "\u{1F3C8} The Kansas City Chiefs beat the San Francisco 49ers 25-22 in overtime",
      "\u{1F3B0} The first Super Bowl ever played in Las Vegas",
      "\u{1F3AF} Patrick Mahomes threw the winning touchdown to Mecole Hardman",
      "\u{1F3A4} Usher performed the halftime show"
    ]
  },
  {
    id: "us-story-016",
    text: "Where was Super Bowl LVI played in 2022?",
    lat: 33.9535,
    lng: -118.3392,
    category: "event",
    venue: "SoFi Stadium (Super Bowl LVI)",
    hint: "Inglewood, California",
    country: "United States",
    facts: [
      "\u{1F3C8} The Los Angeles Rams beat the Cincinnati Bengals 23-20",
      "\u{1F3C5} Cooper Kupp was named MVP",
      "\u{1F3E0} The Rams were the second team to win a Super Bowl in their home stadium",
      "\u{1F3A4} Dr. Dre led a halftime show with Snoop Dogg, Eminem and Kendrick Lamar"
    ]
  },
  {
    id: "us-story-017",
    text: 'Where did Marshawn Lynch\u2019s 2011 "Beast Quake" run shake the ground?',
    lat: 47.5952,
    lng: -122.3316,
    category: "event",
    venue: "Lumen Field (Beast Quake, 2011)",
    hint: "Seattle, Washington",
    country: "United States",
    facts: [
      "\u{1F3C8} Lynch ran 67 yards for a touchdown, shrugging off tackler after tackler",
      "\u{1F4C8} A nearby seismometer registered the crowd\u2019s reaction",
      "\u{1F3C6} Seattle beat the defending champion New Orleans Saints 41-36",
      "\u{1F4CA} The Seahawks had reached the playoffs with a 7-9 record"
    ]
  },
  {
    id: "us-story-018",
    text: "Where did the Tampa Bay Buccaneers become the first team to win a Super Bowl in their home stadium?",
    lat: 27.9759,
    lng: -82.5033,
    category: "event",
    venue: "Raymond James Stadium",
    hint: "Tampa, Florida",
    country: "United States",
    facts: [
      "\u{1F3C8} The Buccaneers beat the Kansas City Chiefs 31-9 in Super Bowl LV, in February 2021",
      "\u{1F3C6} Tom Brady won his seventh Super Bowl, his first with Tampa Bay",
      "\u{1F637} The crowd was limited to about 25,000 because of the COVID-19 pandemic",
      "\u{1F6A2} A pirate ship in the end zone fires its cannons when the Bucs score"
    ]
  },
  {
    id: "us-story-019",
    text: "Where did Wilt Chamberlain score his hundred point game?",
    lat: 40.2881,
    lng: -76.6564,
    category: "athlete",
    venue: "Hershey Sports Arena",
    hint: "Hershey, Pennsylvania",
    country: "United States",
    facts: [
      "\u{1F3C0} He scored 100 for the Philadelphia Warriors against the New York Knicks on 2 March 1962",
      "\u{1F3AF} He made 36 field goals and 28 free throws",
      "\u{1F4F7} No television cameras covered the game",
      "\u{1F465} The official attendance was just 4,124"
    ]
  },
  {
    id: "us-story-020",
    text: "Where did the Showtime Lakers clinch the 1987 NBA title against the Celtics?",
    lat: 33.9583,
    lng: -118.3419,
    category: "athlete",
    venue: "The Forum",
    hint: "Inglewood, California",
    country: "United States",
    facts: [
      "\u{1F3C0} The Lakers beat the Boston Celtics four games to two",
      "\u{1F3C6} Magic Johnson was named Finals MVP",
      '\u{1F4AB} His "junior skyhook" had won Game 4 in Boston',
      "\u{1F3B5} The building is now a concert venue, the Kia Forum"
    ]
  },
  {
    id: "us-story-021",
    text: "Where did Michael Johnson win the 200 metres at the 1996 Atlanta Olympics?",
    lat: 33.7353,
    lng: -84.3894,
    category: "athlete",
    venue: "Centennial Olympic Stadium (Michael Johnson, 1996)",
    hint: "Atlanta, Georgia",
    country: "United States",
    facts: [
      "\u{1F3C3} He won in a world record 19.32 seconds",
      "\u{1F947} He became the first man to win the 200m and 400m at the same Olympics",
      "\u{1F45F} He raced in gold spikes",
      "\u23F3 The record stood for 12 years, until Usain Bolt in 2008"
    ]
  },
  {
    id: "us-story-022",
    text: "Where did Carl Lewis win four gold medals at the 1984 Olympics?",
    lat: 34.0144,
    lng: -118.2919,
    category: "athlete",
    venue: "Los Angeles Memorial Coliseum (Carl Lewis, 1984)",
    hint: "Los Angeles, California",
    country: "United States",
    facts: [
      "\u{1F947} 100m, 200m, long jump and 4x100m relay",
      "\u{1F91D} He matched Jesse Owens\u2019 four golds from Berlin in 1936",
      "\u{1F3C5} He went on to win nine Olympic golds in total",
      "\u{1F3C3} He won the long jump at four Olympics in a row, from 1984 to 1996"
    ]
  },
  {
    id: "us-story-023",
    text: "Where did Katie Ledecky set the 1500m freestyle world record in 2018?",
    lat: 39.7706,
    lng: -86.175,
    category: "athlete",
    venue: "IU Natatorium",
    hint: "Indianapolis, Indiana",
    country: "United States",
    facts: [
      "\u{1F3CA} 15:20.48, on 16 May 2018",
      "\u23F1\uFE0F She cut five seconds off her own previous world record",
      "\u{1F393} The pool is on the Indiana University campus in Indianapolis",
      "\u{1F947} The women\u2019s 1500m joined the Olympics in Tokyo, and she won its first gold"
    ]
  },
  {
    id: "us-story-024",
    text: "Where did Don Larsen pitch the only perfect game in World Series history?",
    lat: 40.8272,
    lng: -73.9278,
    category: "event",
    venue: "Original Yankee Stadium (1956 perfect game)",
    hint: "The Bronx, New York",
    country: "United States",
    facts: [
      "\u26BE Game 5, on 8 October 1956, against the Brooklyn Dodgers",
      "\u{1F3AF} The Yankees won 2-0 as he retired all 27 batters",
      "\u{1F917} Catcher Yogi Berra leapt into his arms after the last out",
      "\u{1F3DF}\uFE0F The stadium was replaced by a new Yankee Stadium in 2009"
    ]
  },
  {
    id: "us-story-025",
    text: "Where was the 2016 World Series decided?",
    lat: 41.4962,
    lng: -81.6852,
    category: "event",
    venue: "Progressive Field (2016 World Series Game 7)",
    hint: "Cleveland, Ohio",
    country: "United States",
    facts: [
      "\u26BE The Chicago Cubs won Game 7 8-7 in ten innings",
      "\u{1F327}\uFE0F A short rain delay came before the tenth inning",
      "\u23F3 It ended a 108-year wait, the Cubs\u2019 first title since 1908",
      "\u{1F3DF}\uFE0F The ballpark opened in 1994 as Jacobs Field"
    ]
  },
  {
    id: "us-story-026",
    text: "Where was Super Bowl XXXVIII played in 2004?",
    lat: 29.6847,
    lng: -95.4107,
    category: "event",
    venue: "NRG Stadium (Super Bowl XXXVIII)",
    hint: "Houston, Texas",
    country: "United States",
    facts: [
      "\u{1F3C8} The New England Patriots beat the Carolina Panthers 32-29",
      "\u{1F3AF} Adam Vinatieri kicked the winning field goal with four seconds left",
      "\u{1F3DF}\uFE0F The stadium was then called Reliant Stadium",
      "\u{1F3C6} Tom Brady was named MVP for the second time"
    ]
  }
];

// src/lib/question-images.ts
var questionImages = {
  "1": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Estadio_Santiago_Bernab%C3%A9u_%E2%80%94_Real_Madrid_Juvenil_A_-_Santiago_Wanderers_Sub-20_%28Intercontinental_Sub-20_2026%29_%E2%80%94_R%C3%A9cord_de_asistencia_en_un_partido_de_juveniles.jpg/1280px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Santiago Bernabeu",
    credit: "Photo: Badefa / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Santiago_Bernab%C3%A9u_%E2%80%94_Real_Madrid_Juvenil_A_-_Santiago_Wanderers_Sub-20_(Intercontinental_Sub-20_2026)_%E2%80%94_R%C3%A9cord_de_asistencia_en_un_partido_de_juveniles.jpg"
  },
  "2": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/France-Islande_Stade_de_France_03.jpg/1280px-France-Islande_Stade_de_France_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stade de France",
    credit: "Photo: Zakarie Faibis / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:France-Islande_Stade_de_France_03.jpg"
  },
  "3": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Camp_Nou_aerial.jpg/1280px-Camp_Nou_aerial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Camp Nou",
    credit: "Photo: Oh-Barcelona.com from Barcelona, Spain / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Camp_Nou_aerial.jpg"
  },
  "5": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg/1280px-2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Old Trafford",
    credit: "Photo: Arne M\xFCseler from Salzburg, AT / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2023_07_31_arne_mueseler_00060-Verbessert-RR_(53106651455).jpg"
  },
  "6": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Allianz_Arena_2008-02-09.jpg/1280px-Allianz_Arena_2008-02-09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Allianz Arena",
    credit: "Photo: 2015 Michael 2015 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Allianz_Arena_2008-02-09.jpg"
  },
  "7": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Maracana_2022.jpg/1280px-Maracana_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Maracana",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Maracana_2022.jpg"
  },
  "8": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Stadio_Meazza_2021_3.jpg/1280px-Stadio_Meazza_2021_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of San Siro",
    credit: "Photo: Prelvini / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Meazza_2021_3.jpg"
  },
  "9": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Court_1%2C_All_England_Tennis_Club_-_geograph.org.uk_-_5773598.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of All England Lawn Tennis Club",
    credit: "Photo: Bradley Michael / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Court_1,_All_England_Tennis_Club_-_geograph.org.uk_-_5773598.jpg"
  },
  "10": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/2017_AFL_Grand_Final_panorama_during_national_anthem.jpg/1280px-2017_AFL_Grand_Final_panorama_during_national_anthem.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Melbourne Cricket Ground",
    credit: "Photo: Flickerd / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2017_AFL_Grand_Final_panorama_during_national_anthem.jpg"
  },
  "11": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/London_Wembley.jpg/1280px-London_Wembley.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Wembley Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Wembley.jpg"
  },
  "12": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Yankee_Stadium_overhead_2010.jpg/1280px-Yankee_Stadium_overhead_2010.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Yankee Stadium",
    credit: "Photo: vtravelled.com / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Yankee_Stadium_overhead_2010.jpg"
  },
  "14": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Liverpool_anfield_road_stadium.jpg/1280px-Liverpool_anfield_road_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Anfield",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Liverpool_anfield_road_stadium.jpg"
  },
  "16": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg/1280px-Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Olympiastadion",
    credit: "Photo: Matthias S\xFC\xDFen / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg"
  },
  "17": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/131023-F-PR861-033_Hanscom_participates_in_World_Series_pregame_events.jpg/1280px-131023-F-PR861-033_Hanscom_participates_in_World_Series_pregame_events.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Fenway Park",
    credit: "Photo: Rick Berry / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:131023-F-PR861-033_Hanscom_participates_in_World_Series_pregame_events.jpg"
  },
  "18": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/BCN-EstadiOlimpic-4860.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadi Olimpic de Montjuic",
    credit: "Photo: Amadalvarez / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:BCN-EstadiOlimpic-4860.jpg"
  },
  "19": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/1280px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Azteca",
    credit: "Photo: ProtoplasmaKid / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg"
  },
  "20": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Vista_a%C3%A9rea_del_Estadio_Alberto_J._Armando_%22La_Bombonera%22_01.jpg/1280px-Vista_a%C3%A9rea_del_Estadio_Alberto_J._Armando_%22La_Bombonera%22_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of La Bombonera",
    credit: "Photo: ProtoplasmaKid / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Estadio_Alberto_J._Armando_%22La_Bombonera%22_01.jpg"
  },
  "21": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/HerbBrooksArena.jpg/1280px-HerbBrooksArena.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Olympic Center (Herb Brooks Arena)",
    credit: "Photo: KevinTR at English Wikipedia / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:HerbBrooksArena.jpg"
  },
  "22": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/London_Emirates_Stadium_arsenal.jpg/1280px-London_Emirates_Stadium_arsenal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Emirates Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Emirates_Stadium_arsenal.jpg"
  },
  "23": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Circuit_de_Monaco%2C_April_1%2C_2018_SkySat.jpg/1280px-Circuit_de_Monaco%2C_April_1%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Circuit de Monaco",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Circuit_de_Monaco,_April_1,_2018_SkySat.jpg"
  },
  "25": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Estadio_da_Luz_2012.jpg/1280px-Estadio_da_Luz_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio da Luz",
    credit: "Photo: Florent Dusonchet / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_da_Luz_2012.jpg"
  },
  "26": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/City_of_Manchester_Stadium_2023_cropped.jpg/1280px-City_of_Manchester_Stadium_2023_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Etihad Stadium",
    credit: "Photo: Arne M\xFCseler , cropped by Blackcat / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:City_of_Manchester_Stadium_2023_cropped.jpg"
  },
  "27": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/FerryFieldIMBuilding.jpg/1280px-FerryFieldIMBuilding.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ferry Field",
    credit: "Photo: Dave Parker / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:FerryFieldIMBuilding.jpg"
  },
  "28": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Autodromo_Nazionale_Monza%2C_April_22%2C_2018_SkySat.jpg/1280px-Autodromo_Nazionale_Monza%2C_April_22%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Autodromo Nazionale Monza",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Autodromo_Nazionale_Monza,_April_22,_2018_SkySat.jpg"
  },
  "29": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Parc_des_Princes_Paris_Saint_Germain_z_30.jpg/1280px-Parc_des_Princes_Paris_Saint_Germain_z_30.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Parc des Princes",
    credit: "Photo: Zakarie Faibis / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Parc_des_Princes_Paris_Saint_Germain_z_30.jpg"
  },
  "30": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Japan_National_Stadium_C-gate_on_2021_July_28.jpg/1280px-Japan_National_Stadium_C-gate_on_2021_July_28.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Japan National Stadium",
    credit: "Photo: Syced / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Japan_National_Stadium_C-gate_on_2021_July_28.jpg"
  },
  "31": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/London_Stamford_Bridge.jpg/1280px-London_Stamford_Bridge.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stamford Bridge",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Stamford_Bridge.jpg"
  },
  "32": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg/1280px-2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Rose Bowl",
    credit: "Photo: Ted Eytan / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2018.06.17_Over_the_Rose_Bowl,_Pasadena,_CA_USA_0039_(42855669451)_(cropped).jpg"
  },
  "33": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Signal_Iduna_Park%2C_Dortmund%2C_Germany_%28Unsplash%29.jpg/1280px-Signal_Iduna_Park%2C_Dortmund%2C_Germany_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Signal Iduna Park",
    credit: "Photo: Marvin Ronsdorf marvin_ronsdorf / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Signal_Iduna_Park,_Dortmund,_Germany_(Unsplash).jpg"
  },
  "34": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Aerial_view_of_Lusail_Stadium_during_the_daytime.png/1280px-Aerial_view_of_Lusail_Stadium_during_the_daytime.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lusail Stadium",
    credit: "Photo: Djawed_vlog / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Lusail_Stadium_during_the_daytime.png"
  },
  "35": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Stade_V%C3%A9lodrome_en_novembre_2021_%281%29.jpg/1280px-Stade_V%C3%A9lodrome_en_novembre_2021_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stade Velodrome",
    credit: "Photo: Sophie P. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stade_V%C3%A9lodrome_en_novembre_2021_(1).jpg"
  },
  "a1": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg/1280px-Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Olympiastadion, Berlin",
    credit: "Photo: Matthias S\xFC\xDFen / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Olympiastadion_Berlin-Marathontor-msu-2020-3139.jpg"
  },
  "a3": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Beijing_China_Beijing-National-Stadium-01.jpg/1280px-Beijing_China_Beijing-National-Stadium-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Bird's Nest, Beijing",
    credit: "Photo: CEphoto, Uwe Aranas / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Beijing_China_Beijing-National-Stadium-01.jpg"
  },
  "a4": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/London_Olympic_Stadium_West_Ham.jpg/1280px-London_Olympic_Stadium_West_Ham.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Olympic Stadium, London",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Olympic_Stadium_West_Ham.jpg"
  },
  "a5": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/O2_Academy_Oxford.jpg/1280px-O2_Academy_Oxford.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Iffley Road track, Oxford",
    credit: "Photo: Oxfordmale / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:O2_Academy_Oxford.jpg"
  },
  "a6": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Tokyo_Metropolitan_Gymnasium_seen_from_Japan_National_Stadium.jpg/1280px-Tokyo_Metropolitan_Gymnasium_seen_from_Japan_National_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The National Stadium, Tokyo",
    credit: "Photo: Syced / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Tokyo_Metropolitan_Gymnasium_seen_from_Japan_National_Stadium.jpg"
  },
  "a7": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/2022_NRLGF_stadium.jpg/1280px-2022_NRLGF_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadium Australia, Sydney",
    credit: "Photo: Storm machine / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2022_NRLGF_stadium.jpg"
  },
  "a9": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/2022-08-21_Olympiapark_M%C3%BCnchen_by_Sandro_Halank%E2%80%93025.jpg/1280px-2022-08-21_Olympiapark_M%C3%BCnchen_by_Sandro_Halank%E2%80%93025.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Olympia Schwimmhalle, Munich",
    credit: "Photo: Sandro Halank, Wikimedia Commons / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2022-08-21_Olympiapark_M%C3%BCnchen_by_Sandro_Halank%E2%80%93025.jpg"
  },
  "a12": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/LuzhnikiStadium.jpg/1280px-LuzhnikiStadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Luzhniki Stadium, Moscow",
    credit: "Photo: Government of Moscow Press centre / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:LuzhnikiStadium.jpg"
  },
  "a13": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Spa-Francorchamps_overview.jpg/1280px-Spa-Francorchamps_overview.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Spa-Francorchamps, in the Ardennes",
    credit: "Photo: Nathanael Majoros / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Spa-Francorchamps_overview.jpg"
  },
  "a14": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Stadio_Olimpico_2024.jpg/1280px-Stadio_Olimpico_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Olimpico, Rome (Golden Gala)",
    credit: "Photo: Messapi , cropped by Blackcat / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Olimpico_2024.jpg"
  },
  "a15": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Ullevi_stadium_in_gothenburg_20060510.jpg/1280px-Ullevi_stadium_in_gothenburg_20060510.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Ullevi stadium, Gothenburg",
    credit: "Photo: Martin Olsson (mnemo on en/sv wikipedia and commons, martin@minimum.se). / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ullevi_stadium_in_gothenburg_20060510.jpg"
  },
  "e2": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Heysel-Stadium.jpg/1280px-Heysel-Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Heysel Stadium",
    credit: "Photo: Snowdog / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Heysel-Stadium.jpg"
  },
  "e3": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/2011-02-05_Rugby_Stadio_Flaminio_ITA_-_IRL.jpg/1280px-2011-02-05_Rugby_Stadio_Flaminio_ITA_-_IRL.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Nazionale PNF",
    credit: "Photo: Blackcat / CC BY-SA 3.0 it, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2011-02-05_Rugby_Stadio_Flaminio_ITA_-_IRL.jpg"
  },
  "e4": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Istanbul_Atat%C3%BCrk_Olympic_Stadium_1.jpg/1280px-Istanbul_Atat%C3%BCrk_Olympic_Stadium_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Atat\xFCrk Olympic Stadium",
    credit: "Photo: \u0412\u0430\u043B\u0435\u0440\u0438\u0439 \u0414\u0435\u0434 / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Istanbul_Atat%C3%BCrk_Olympic_Stadium_1.jpg"
  },
  "e5": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Estadio_Santiago_Bernab%C3%A9u_%E2%80%94_Real_Madrid_Juvenil_A_-_Santiago_Wanderers_Sub-20_%28Intercontinental_Sub-20_2026%29_%E2%80%94_R%C3%A9cord_de_asistencia_en_un_partido_de_juveniles.jpg/1280px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Santiago Bernab\xE9u, Madrid",
    credit: "Photo: Badefa / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Santiago_Bernab%C3%A9u_%E2%80%94_Real_Madrid_Juvenil_A_-_Santiago_Wanderers_Sub-20_(Intercontinental_Sub-20_2026)_%E2%80%94_R%C3%A9cord_de_asistencia_en_un_partido_de_juveniles.jpg"
  },
  "e6": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Maracana_2022.jpg/1280px-Maracana_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Maracan\xE3",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Maracana_2022.jpg"
  },
  "e7": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Wembley_bowl.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Old Wembley Stadium",
    credit: "Photo: Tony g100 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wembley_bowl.jpg"
  },
  "e8": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/The_Wankdorf_stadium_before_a_match_between_Young_Boys_and_Red_Star_Belgrade.jpg/1280px-The_Wankdorf_stadium_before_a_match_between_Young_Boys_and_Red_Star_Belgrade.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Wankdorf Stadium",
    credit: "Photo: Vincenzo.togni / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:The_Wankdorf_stadium_before_a_match_between_Young_Boys_and_Red_Star_Belgrade.jpg"
  },
  "e10": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Estadio_Centenario_2021.jpg/1280px-Estadio_Centenario_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Centenario, Montevideo",
    credit: "Photo: Marcelo Campi / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Centenario_2021.jpg"
  },
  "e11": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Estadio_mas_monumental.jpg/1280px-Estadio_mas_monumental.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of El Monumental, Buenos Aires",
    credit: "Photo: Dibumartinez23 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_mas_monumental.jpg"
  },
  "e13": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg/1280px-2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Old Trafford, Manchester",
    credit: "Photo: Arne M\xFCseler from Salzburg, AT / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2023_07_31_arne_mueseler_00060-Verbessert-RR_(53106651455).jpg"
  },
  "e14": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Paris_Stade_Jean-Bouin_%28cropped%29.jpg/1280px-Paris_Stade_Jean-Bouin_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Parc des Princes, Paris",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Paris_Stade_Jean-Bouin_(cropped).jpg"
  },
  "e15": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Panathinaikos_Inter_CL2008_09_b.jpg/1280px-Panathinaikos_Inter_CL2008_09_b.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Olympic Stadium, Athens",
    credit: "Photo: Sportingn / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Panathinaikos_Inter_CL2008_09_b.jpg"
  },
  "e16": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Principality_Stadium_May_3%2C_2016.jpg/1280px-Principality_Stadium_May_3%2C_2016.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Millennium Stadium",
    credit: "Photo: Clint Budd from About 15 miles North of Swansea, Wales / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Principality_Stadium_May_3,_2016.jpg"
  },
  "e17": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Luzhniki_Stadium_in_Moscow1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Luzhniki",
    credit: "Photo: mos.ru / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Luzhniki_Stadium_in_Moscow1.jpg"
  },
  "e19": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Wembley_bowl.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Wembley Stadium (2024 final)",
    credit: "Photo: Tony g100 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wembley_bowl.jpg"
  },
  "e20": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Millennium_Stadium_2008_Wales_Vs_Scotland.jpg/1280px-Millennium_Stadium_2008_Wales_Vs_Scotland.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of National Stadium of Wales",
    credit: "Photo: al_green profile at Flickr website / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Millennium_Stadium_2008_Wales_Vs_Scotland.jpg"
  },
  "e21": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/1280px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Azteca (1970 final)",
    credit: "Photo: ProtoplasmaKid / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg"
  },
  "e22": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/1280px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Azteca (1986 final)",
    credit: "Photo: ProtoplasmaKid / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg"
  },
  "e24": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Stadio_Olimpico_2024.jpg/1280px-Stadio_Olimpico_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Olimpico, Rome",
    credit: "Photo: Messapi , cropped by Blackcat / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Olimpico_2024.jpg"
  },
  "e26": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Beijing_China_Beijing-National-Stadium-01.jpg/1280px-Beijing_China_Beijing-National-Stadium-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Beijing National Stadium",
    credit: "Photo: CEphoto, Uwe Aranas / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Beijing_China_Beijing-National-Stadium-01.jpg"
  },
  "e27": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/London_Olympic_Stadium_West_Ham.jpg/1280px-London_Olympic_Stadium_West_Ham.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of London Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Olympic_Stadium_West_Ham.jpg"
  },
  "e28": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Olympiastadion_2_2020-08-12.jpg/1280px-Olympiastadion_2_2020-08-12.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Helsinki Olympic Stadium",
    credit: "Photo: Joneikifi / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Olympiastadion_2_2020-08-12.jpg"
  },
  "e29": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/FrontCommun1972_ForumMontreal_19720307_09.jpg/1280px-FrontCommun1972_ForumMontreal_19720307_09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Montreal Forum",
    credit: "Photo: Michel Giroux / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:FrontCommun1972_ForumMontreal_19720307_09.jpg"
  },
  "e30": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/2022_NRLGF_stadium.jpg/1280px-2022_NRLGF_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadium Australia",
    credit: "Photo: Storm machine / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2022_NRLGF_stadium.jpg"
  },
  "e31": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/AFC_Champions_League_Final_1st_leg.jpg/1280px-AFC_Champions_League_Final_1st_leg.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Seoul Olympic Stadium",
    credit: "Photo: Photo and Share CC / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:AFC_Champions_League_Final_1st_leg.jpg"
  },
  "e33": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Croke_Park_Panorama_%28From_the_UCF_stand%29.jpg/1280px-Croke_Park_Panorama_%28From_the_UCF_stand%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Croke Park",
    credit: "Photo: Fraser Reid / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Croke_Park_Panorama_(From_the_UCF_stand).jpg"
  },
  "e34": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/%E0%A6%87%E0%A6%A1%E0%A7%87%E0%A6%A8_%E0%A6%97%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%E0%A7%87%E0%A6%A8%E0%A7%87_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%93_%E0%A6%AA%E0%A6%BE%E0%A6%95%E0%A6%BF%E0%A6%B8%E0%A7%8D%E0%A6%A4%E0%A6%BE%E0%A6%A8%E0%A7%87%E0%A6%B0_%E0%A6%96%E0%A7%87%E0%A6%B2%E0%A6%BE_%E0%A7%AB.jpg/1280px-%E0%A6%87%E0%A6%A1%E0%A7%87%E0%A6%A8_%E0%A6%97%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%E0%A7%87%E0%A6%A8%E0%A7%87_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%93_%E0%A6%AA%E0%A6%BE%E0%A6%95%E0%A6%BF%E0%A6%B8%E0%A7%8D%E0%A6%A4%E0%A6%BE%E0%A6%A8%E0%A7%87%E0%A6%B0_%E0%A6%96%E0%A7%87%E0%A6%B2%E0%A6%BE_%E0%A7%AB.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Eden Gardens",
    credit: "Photo: \u09B6\u09B0\u09A6\u09BF\u09A8\u09CD\u09A6\u09C1 \u09AD\u099F\u09CD\u099F\u09BE\u099A\u09BE\u09B0\u09CD\u09AF\u09CD\u09AF / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:%E0%A6%87%E0%A6%A1%E0%A7%87%E0%A6%A8_%E0%A6%97%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%E0%A7%87%E0%A6%A8%E0%A7%87_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%93_%E0%A6%AA%E0%A6%BE%E0%A6%95%E0%A6%BF%E0%A6%B8%E0%A7%8D%E0%A6%A4%E0%A6%BE%E0%A6%A8%E0%A7%87%E0%A6%B0_%E0%A6%96%E0%A7%87%E0%A6%B2%E0%A6%BE_%E0%A7%AB.jpg"
  },
  "e35": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Lord%27s_Cricket_Ground_Grand_Stand.jpg/1280px-Lord%27s_Cricket_Ground_Grand_Stand.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lord's Cricket Ground",
    credit: "Photo: Jguk / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lord%27s_Cricket_Ground_Grand_Stand.jpg"
  },
  "e36": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Chinnaswamy_Stadium.jpg/1280px-Chinnaswamy_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of M. Chinnaswamy Stadium",
    credit: "Photo: Aniket Suryavanshi from Solapur, India / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chinnaswamy_Stadium.jpg"
  },
  "e37": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Gaddafi_Stadium_during_PSL_2026.jpg/1280px-Gaddafi_Stadium_during_PSL_2026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Gaddafi Stadium",
    credit: "Photo: PCB / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Gaddafi_Stadium_during_PSL_2026.jpg"
  },
  "e38": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Sydney_Cricket_Ground_%2824509044622%29.jpg/1280px-Sydney_Cricket_Ground_%2824509044622%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sydney Cricket Ground",
    credit: "Photo: Marc Dalmulder from Hamlyn Terrace, Australia / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sydney_Cricket_Ground_(24509044622).jpg"
  },
  "e40": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Telstra_Stadium_at_Night.jpg/1280px-Telstra_Stadium_at_Night.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Telstra Stadium",
    credit: "Photo: The original uploader was Alexormes at English Wikipedia . / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Telstra_Stadium_at_Night.jpg"
  },
  "s9": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Estadio_da_Luz_2012.jpg/1280px-Estadio_da_Luz_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio da Luz",
    credit: "Photo: Florent Dusonchet / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_da_Luz_2012.jpg"
  },
  "s10": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Stade_V%C3%A9lodrome_en_novembre_2021_%281%29.jpg/1280px-Stade_V%C3%A9lodrome_en_novembre_2021_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Orange V\xE9lodrome",
    credit: "Photo: Sophie P. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stade_V%C3%A9lodrome_en_novembre_2021_(1).jpg"
  },
  "s11": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Olympique_lyonnais_-_Stade_rennais%2C_demi-finale_de_Coupe_de_France_2019.jpg/1280px-Olympique_lyonnais_-_Stade_rennais%2C_demi-finale_de_Coupe_de_France_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Parc Olympique Lyonnais",
    credit: "Photo: Sebleouf / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Olympique_lyonnais_-_Stade_rennais,_demi-finale_de_Coupe_de_France_2019.jpg"
  },
  "s13": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/London_Tottenham_Hotspur_Stadium.jpg/1280px-London_Tottenham_Hotspur_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Tottenham Hotspur Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:London_Tottenham_Hotspur_Stadium.jpg"
  },
  "s16": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Porto_Est%C3%A1dio_do_Drag%C3%A3o_2.jpg/1280px-Porto_Est%C3%A1dio_do_Drag%C3%A3o_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio do Drag\xE3o",
    credit: "Photo: \u0412\u0430\u043B\u0435\u0440\u0438\u0439 \u0414\u0435\u0434 / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Porto_Est%C3%A1dio_do_Drag%C3%A3o_2.jpg"
  },
  "s17": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Celtic_Park_during_an_Old_Firm_derby_between_Celtic_FC_and_Rangers_FC.jpg/1280px-Celtic_Park_during_an_Old_Firm_derby_between_Celtic_FC_and_Rangers_FC.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Celtic Park",
    credit: "Photo: Vincenzo.togni / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Celtic_Park_during_an_Old_Firm_derby_between_Celtic_FC_and_Rangers_FC.jpg"
  },
  "s18": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Birmingham_aston_villa_park_stadium.jpg/1280px-Birmingham_aston_villa_park_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Villa Park",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Birmingham_aston_villa_park_stadium.jpg"
  },
  "s19": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Newcastle_st-james-park_stadium.jpg/1280px-Newcastle_st-james-park_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of St James' Park",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Newcastle_st-james-park_stadium.jpg"
  },
  "s20": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Stadio_Olimpico_2024.jpg/1280px-Stadio_Olimpico_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Olimpico",
    credit: "Photo: Messapi , cropped by Blackcat / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Olimpico_2024.jpg"
  },
  "s21": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Stadiosannicola2023.jpg/1280px-Stadiosannicola2023.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio San Nicola",
    credit: "Photo: Cianciola Fabio / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadiosannicola2023.jpg"
  },
  "s22": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/San_Mam%C3%A9s_%286%29.jpg/1280px-San_Mam%C3%A9s_%286%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of San Mam\xE9s",
    credit: "Photo: Alberto-g-rovi / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:San_Mam%C3%A9s_(6).jpg"
  },
  "s23": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Mestalla_antes_del_partido_Valencia-Barcelona_LaLiga_2023-2024.jpg/1280px-Mestalla_antes_del_partido_Valencia-Barcelona_LaLiga_2023-2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Mestalla",
    credit: "Photo: Anidae / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Mestalla_antes_del_partido_Valencia-Barcelona_LaLiga_2023-2024.jpg"
  },
  "s24": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/2022-10-25_1_Estadio_Ram%C3%B3n_S%C3%A1nchez_Pizju%C3%A1n_%28Sevilla_FC%29.jpg/1280px-2022-10-25_1_Estadio_Ram%C3%B3n_S%C3%A1nchez_Pizju%C3%A1n_%28Sevilla_FC%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ram\xF3n S\xE1nchez Pizju\xE1n",
    credit: "Photo: Niels98 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2022-10-25_1_Estadio_Ram%C3%B3n_S%C3%A1nchez_Pizju%C3%A1n_(Sevilla_FC).jpg"
  },
  "s25": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Eduardo_Souto_de_Moura_-_Braga_Stadium_02_%286010593292%29.jpg/1280px-Eduardo_Souto_de_Moura_-_Braga_Stadium_02_%286010593292%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio Municipal de Braga",
    credit: "Photo: \u6E96\u5EFA\u7BC9\u4EBA\u624B\u672D\u7DB2\u7AD9 Forgemind ArchiMedia from Taichung, Taiwan, Taiwan / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Eduardo_Souto_de_Moura_-_Braga_Stadium_02_(6010593292).jpg"
  },
  "s27": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Deutsche_bank_park.jpg/1280px-Deutsche_bank_park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Deutsche Bank Park",
    credit: "Photo: Patrik Meyer / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Deutsche_bank_park.jpg"
  },
  "s29": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/StJakobParkB.JPG/1280px-StJakobParkB.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of St. Jakob-Park",
    credit: "Photo: Sven Scharr / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:StJakobParkB.JPG"
  },
  "s30": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Letzigrund_2024_2.jpg/1280px-Letzigrund_2024_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Letzigrund stadium",
    credit: "Photo: Seasider53 / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Letzigrund_2024_2.jpg"
  },
  "s31": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Arena-bukareszt.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Arena Na\u021Bional\u0103",
    credit: "Photo: Nowy Styl Group / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arena-bukareszt.jpg"
  },
  "s32": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Vasil_Levski_National_Stadium_2022.jpg/1280px-Vasil_Levski_National_Stadium_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Vasil Levski National Stadium",
    credit: "Photo: JukoFF / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vasil_Levski_National_Stadium_2022.jpg"
  },
  "s33": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Wankdorfhalle_NE_2015.jpg/1280px-Wankdorfhalle_NE_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadion Wankdorf",
    credit: "Photo: Sandstein / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wankdorfhalle_NE_2015.jpg"
  },
  "s34": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Panathinaikos_Inter_CL2008_09_b.jpg/1280px-Panathinaikos_Inter_CL2008_09_b.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Athens Olympic Stadium (OAKA)",
    credit: "Photo: Sportingn / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Panathinaikos_Inter_CL2008_09_b.jpg"
  },
  "s35": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Australie-Fidji.5.JPG/1280px-Australie-Fidji.5.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stade de la Mosson",
    credit: "Photo: Ben.83 / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Australie-Fidji.5.JPG"
  },
  "s36": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/99/St_Etienne_Stade_Geoffroy_Guichard.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Stade Geoffroy-Guichard",
    credit: "Photo: \xA9ville de St Etienne / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:St_Etienne_Stade_Geoffroy_Guichard.jpg"
  },
  "s38": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Match_Football_FC_Nantes_x_RC_Lens_Stade_Beaujoire_-_Nantes_%28FR44%29_-_2022-09-18_-_51.jpg/1280px-Match_Football_FC_Nantes_x_RC_Lens_Stade_Beaujoire_-_Nantes_%28FR44%29_-_2022-09-18_-_51.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stade de la Beaujoire",
    credit: "Photo: Chabe01 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Match_Football_FC_Nantes_x_RC_Lens_Stade_Beaujoire_-_Nantes_(FR44)_-_2022-09-18_-_51.jpg"
  },
  "s39": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Leicester_city_king_power_stadium.jpg/1280px-Leicester_city_king_power_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of King Power Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Leicester_city_king_power_stadium.jpg"
  },
  "s40": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Estadio_Ol%C3%ADmpico_Llu%C3%ADs_Companys%2C_Barcelona_-_panoramio.jpg/1280px-Estadio_Ol%C3%ADmpico_Llu%C3%ADs_Companys%2C_Barcelona_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Ol\xEDmpico Llu\xEDs Companys",
    credit: "Photo: Nikolai Karaneschev / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Ol%C3%ADmpico_Llu%C3%ADs_Companys,_Barcelona_-_panoramio.jpg"
  },
  "s41": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Middlesbrough_riverside_stadium.jpg/1280px-Middlesbrough_riverside_stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Riverside Stadium",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Middlesbrough_riverside_stadium.jpg"
  },
  "s42": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Stadio_Olimpico_Torino_2017_cropped.jpg/1280px-Stadio_Olimpico_Torino_2017_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Olimpico Grande Torino",
    credit: "Photo: Original photo by Asgaw , cropped by Blackcat / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Olimpico_Torino_2017_cropped.jpg"
  },
  "s43": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Stadio_Ennio_Tardini_2026.jpg/1280px-Stadio_Ennio_Tardini_2026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadio Ennio Tardini",
    credit: "Photo: Brodol\xF21 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Ennio_Tardini_2026.jpg"
  },
  "s44": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Stadium-Lory.jpg/1280px-Stadium-Lory.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stadium de Toulouse",
    credit: "Photo: Laurie Laberinto / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadium-Lory.jpg"
  },
  "s45": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Est%C3%A1dio_do_Bessa_-_Porto_-_Portugal_%286488730091%29.jpg/1280px-Est%C3%A1dio_do_Bessa_-_Porto_-_Portugal_%286488730091%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio do Bessa",
    credit: "Photo: Vitor Oliveira from Torres Vedras, PORTUGAL / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A1dio_do_Bessa_-_Porto_-_Portugal_(6488730091).jpg"
  },
  "s46": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Est%C3%A1dio_Jos%C3%A9_Alvalade_antes_do_jogo_Sporting_-_Arouca.jpg/1280px-Est%C3%A1dio_Jos%C3%A9_Alvalade_antes_do_jogo_Sporting_-_Arouca.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio Jos\xE9 Alvalade",
    credit: "Photo: Megutim / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A1dio_Jos%C3%A9_Alvalade_antes_do_jogo_Sporting_-_Arouca.jpg"
  },
  "s47": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Est%C3%A1dio_Eng._Rui_Alves_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Est\xE1dio da Madeira",
    credit: "Photo: Mghamburg / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A1dio_Eng._Rui_Alves_1.jpg"
  },
  "s48": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Estadio_Gran_Canaria.jpg/1280px-Estadio_Gran_Canaria.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Gran Canaria",
    credit: "Photo: Merelun / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Gran_Canaria.jpg"
  },
  "s49": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Est%C3%A1dio_Municipal_de_Aveiro_aerial_view.jpg/1280px-Est%C3%A1dio_Municipal_de_Aveiro_aerial_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio Municipal de Aveiro",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A1dio_Municipal_de_Aveiro_aerial_view.jpg"
  },
  "s50": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/La_Meinau_en_National.jpg/1280px-La_Meinau_en_National.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Stade de la Meinau",
    credit: "Photo: Xaviyeah / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:La_Meinau_en_National.jpg"
  },
  "s52": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Inside_the_Kasarani_Stadium.jpg/1280px-Inside_the_Kasarani_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Moi International Sports Centre",
    credit: "Photo: Endesia94 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Inside_the_Kasarani_Stadium.jpg"
  },
  "s53": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/National_Stadium_Surulere.jpg/1280px-National_Stadium_Surulere.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of National Stadium",
    credit: "Photo: Juganutt / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:National_Stadium_Surulere.jpg"
  },
  "s54": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/FNB_Stadium_and_mooifontein_Arrial_View_-_panoramio.jpg/1280px-FNB_Stadium_and_mooifontein_Arrial_View_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of FNB Stadium",
    credit: "Photo: fading / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:FNB_Stadium_and_mooifontein_Arrial_View_-_panoramio.jpg"
  },
  "s55": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Estadio_Nacional_de_Chile_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadio Nacional de Chile",
    credit: "Photo: Alstradiaan at Spanish Wikipedia / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Nacional_de_Chile_3.jpg"
  },
  "s56": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Estadio_Nacional_del_Per%C3%BA.jpg/1280px-Estadio_Nacional_del_Per%C3%BA.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Nacional del Peru",
    credit: "Photo: Ministerio de Defensa del Per\xFA / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Nacional_del_Per%C3%BA.jpg"
  },
  "s57": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Estadio_Ol%C3%ADmpico_Universitario_1.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadio Ol\xEDmpico Universitario",
    credit: "Photo: Ebidej / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Ol%C3%ADmpico_Universitario_1.jpeg"
  },
  "s58": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Arena_do_Gr%C3%AAmio_2014.jpg/1280px-Arena_do_Gr%C3%AAmio_2014.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Arena do Gr\xEAmio",
    credit: "Photo: Contato: clickdearaujo@gmail.com / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arena_do_Gr%C3%AAmio_2014.jpg"
  },
  "s59": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Est%C3%A1dio_do_Morumbi.jpg/1280px-Est%C3%A1dio_do_Morumbi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio do Morumbi",
    credit: "Photo: Arne M\xFCseler / CC BY-SA 3.0 de, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A1dio_do_Morumbi.jpg"
  },
  "s60": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Estadio_mas_monumental.jpg/1280px-Estadio_mas_monumental.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Monumental",
    credit: "Photo: Dibumartinez23 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_mas_monumental.jpg"
  },
  "s61": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Estadio_metropolitana_de_merida.jpg/1280px-Estadio_metropolitana_de_merida.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Metropolitano de Merida",
    credit: "Photo: Jorge Paparoni from Venezuela / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_metropolitana_de_merida.jpg"
  },
  "s62": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Estadio_la_Corregidora.JPG/1280px-Estadio_la_Corregidora.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Corregidora",
    credit: "Photo: No machine-readable author provided. Gabriel monarca assumed (based on copyright claims). / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_la_Corregidora.JPG"
  },
  "s63": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Estadio_Jalisco_06022022.jpg/1280px-Estadio_Jalisco_06022022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Jalisco",
    credit: "Photo: Alejan98 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Jalisco_06022022.jpg"
  },
  "s64": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Estadio_Atahualpa_Ecuador_vs_Brazil_March_2009.jpg/1280px-Estadio_Atahualpa_Ecuador_vs_Brazil_March_2009.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Ol\xEDmpico Atahualpa",
    credit: "Photo: Andres Perez / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Atahualpa_Ecuador_vs_Brazil_March_2009.jpg"
  },
  "s65": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Estadio_Nacional_de_Costa_Rica%2C_2011.jpg/1280px-Estadio_Nacional_de_Costa_Rica%2C_2011.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Nacional de Costa Rica",
    credit: "Photo: MadriCR / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Nacional_de_Costa_Rica,_2011.jpg"
  },
  "s67": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Estadio_Hernando_Siles.jpg/1280px-Estadio_Hernando_Siles.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Hernando Siles",
    credit: "Photo: Daniel Illatarco / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Hernando_Siles.jpg"
  },
  "s69": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Lisboa_Estadio_do_Restelo_Belem_September_2013_aerial_view.jpg/1280px-Lisboa_Estadio_do_Restelo_Belem_September_2013_aerial_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Est\xE1dio do Restelo",
    credit: "Photo: Wiki-observer / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lisboa_Estadio_do_Restelo_Belem_September_2013_aerial_view.jpg"
  },
  "s70": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Arena-fifa-wc-2014_%289%29.jpg/1280px-Arena-fifa-wc-2014_%289%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Arena da Baixada",
    credit: "Photo: Luiz Carlos Volpato / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arena-fifa-wc-2014_(9).jpg"
  },
  "s71": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Estadio_Alejandro_Villanueva_vista_a%C3%A9rea_2017.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadio Alejandro Villanueva",
    credit: "Photo: Carlos Pozo / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Alejandro_Villanueva_vista_a%C3%A9rea_2017.jpg"
  },
  "s72": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Tribuna_Occidente_Estadio_Virgen_de_Chapi.JPG/1280px-Tribuna_Occidente_Estadio_Virgen_de_Chapi.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Monumental Virgen de Chapi",
    credit: "Photo: Rojinegro81 / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Tribuna_Occidente_Estadio_Virgen_de_Chapi.JPG"
  },
  "s73": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Estadio_Morera_Soto.jpg/1280px-Estadio_Morera_Soto.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Alejandro Morera Soto",
    credit: "Photo: JuanJos\xE9LP from Alajuela, Costa Rica / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Morera_Soto.jpg"
  },
  "s74": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Estadio_Departamental_Libertad.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadio Departamental Libertad",
    credit: "Photo: Rey del Norte / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Departamental_Libertad.jpg"
  },
  "s75": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Estadio_Atanasio_Girardot-Medellin.JPG/1280px-Estadio_Atanasio_Girardot-Medellin.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Atanasio Girardot",
    credit: "Photo: SajoR / CC BY-SA 2.5, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Atanasio_Girardot-Medellin.JPG"
  },
  "s76": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Pascual_Guerrero_Stadium.jpg/1280px-Pascual_Guerrero_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Ol\xEDmpico Pascual Guerrero",
    credit: "Photo: Johannes Bud / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Pascual_Guerrero_Stadium.jpg"
  },
  "s77": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/GPC_por_dentro_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Gran Parque Central",
    credit: "Photo: ChinoChino96 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:GPC_por_dentro_2021.jpg"
  },
  "s78": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Estadio_Centenario_2021.jpg/1280px-Estadio_Centenario_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Centenario",
    credit: "Photo: Marcelo Campi / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Centenario_2021.jpg"
  },
  "s79": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Estadio_Campe%C3%B3n_del_Siglo_setiembre_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Estadio Campeon del Siglo",
    credit: "Photo: NicoCDS / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Campe%C3%B3n_del_Siglo_setiembre_2021.jpg"
  },
  "s80": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Estadio_Monumental_de_Matur%C3%ADn.2.jpg/1280px-Estadio_Monumental_de_Matur%C3%ADn.2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Estadio Monumental de Maturin",
    credit: "Photo: Josman Suarez / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Estadio_Monumental_de_Matur%C3%ADn.2.jpg"
  },
  "s83": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Silverstone_Circuit%2C_July_2%2C_2018_SkySat.jpg/1280px-Silverstone_Circuit%2C_July_2%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Silverstone Circuit",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Silverstone_Circuit,_July_2,_2018_SkySat.jpg"
  },
  "s84": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Circuit_de_Spa-Francorchamps%2C_April_22%2C_2018_SkySat.jpg/1280px-Circuit_de_Spa-Francorchamps%2C_April_22%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Circuit de Spa-Francorchamps",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Circuit_de_Spa-Francorchamps,_April_22,_2018_SkySat.jpg"
  },
  "s85": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Suzuka_International_Racing_Course.png/1280px-Suzuka_International_Racing_Course.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Suzuka International Racing Course",
    credit: "Photo: OpenStreetMap contributors / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Suzuka_International_Racing_Course.png"
  },
  "s86": {
    url: "https://images.pexels.com/photos/39133754/pexels-photo-39133754.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "A blue sports car speeds through a racetrack corner at Nordschleife, showcasing precision driving.",
    credit: "Photo: Mick Declercq on Pexels",
    creditUrl: "https://www.pexels.com/photo/blue-racing-car-on-asphalt-track-at-nordschleife-39133754/",
    illustrative: true
  },
  "s87": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Circuit_Gilles-Villeneuve1.JPG/1280px-Circuit_Gilles-Villeneuve1.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Circuit Gilles Villeneuve",
    credit: "Photo: No machine-readable author provided. Colocho assumed (based on copyright claims). / CC BY-SA 2.5, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Circuit_Gilles-Villeneuve1.JPG"
  },
  "s88": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Autodromo_Hermanos_Rodriguez_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Autodromo Hermanos Rodriguez",
    credit: "Photo: Wiper M\xE9xico / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Autodromo_Hermanos_Rodriguez_-_panoramio.jpg"
  },
  "s89": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Autodromo-jose-_carlos-pace-interlagos-1997.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Autodromo Jose Carlos Pace",
    credit: "Photo: MotorOilStains / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Autodromo-jose-_carlos-pace-interlagos-1997.png"
  },
  "s90": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Fuji_Speedway_with_Mount_Fuji.jpg/1280px-Fuji_Speedway_with_Mount_Fuji.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Fuji Speedway",
    credit: "Photo: MATSUOKA Kohei / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Fuji_Speedway_with_Mount_Fuji.jpg"
  },
  "s91": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Circuit_de_Catalunya%2C_Barcelona_%28Ank_Kumar%29_01.jpg/1280px-Circuit_de_Catalunya%2C_Barcelona_%28Ank_Kumar%29_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Circuit de Barcelona-Catalunya",
    credit: "Photo: Ank Kumar / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Circuit_de_Catalunya,_Barcelona_(Ank_Kumar)_01.jpg"
  },
  "s92": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Hungaroring_-_wide_view_from_gate_3_09-2022.jpg/1280px-Hungaroring_-_wide_view_from_gate_3_09-2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hungaroring",
    credit: "Photo: LoMit / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hungaroring_-_wide_view_from_gate_3_09-2022.jpg"
  },
  "s93": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Red_Bull_Ring%2C_April_18%2C_2018_SkySat.jpg/1280px-Red_Bull_Ring%2C_April_18%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Red Bull Ring",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Red_Bull_Ring,_April_18,_2018_SkySat.jpg"
  },
  "s94": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Zandvoort_Circuit.png/1280px-Zandvoort_Circuit.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Zandvoort circuit",
    credit: "Photo: Anthony Alessio Tralongo / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Zandvoort_Circuit.png"
  },
  "s95": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Bahrain_International_Circuit_back_straight.jpg/1280px-Bahrain_International_Circuit_back_straight.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Bahrain International Circuit",
    credit: "Photo: Derek Morrison from Kuwait, Kuwait / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bahrain_International_Circuit_back_straight.jpg"
  },
  "s96": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Marina_Bay_Street_Circuit_Pit_Entrance.JPG/1280px-Marina_Bay_Street_Circuit_Pit_Entrance.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Marina Bay Street Circuit",
    credit: "Photo: Oahiyeel / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Marina_Bay_Street_Circuit_Pit_Entrance.JPG"
  },
  "s97": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Baku_City_Circuit%2C_April_9%2C_2018_SkySat.jpg/1280px-Baku_City_Circuit%2C_April_9%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Baku City Circuit",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Baku_City_Circuit,_April_9,_2018_SkySat.jpg"
  },
  "s98": {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Buddh_international_circuit.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Buddh International Circuit",
    credit: "Photo: Alok09031995 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Buddh_international_circuit.jpg"
  },
  "s99": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Yas_Marina_Circuit.png/1280px-Yas_Marina_Circuit.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Yas Marina Circuit",
    credit: "Photo: Anthony Alessio Tralongo / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Yas_Marina_Circuit.png"
  },
  "s100": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Albert_park_aerial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Albert Park Circuit",
    credit: "Photo: Tim Serong / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Albert_park_aerial.jpg"
  },
  "s101": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Flavia_Pennetta_v_Elena_Baltacha_on_Court_3_%289285893445%29.jpg/1280px-Flavia_Pennetta_v_Elena_Baltacha_on_Court_3_%289285893445%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Centre Court at Wimbledon",
    credit: "Photo: Carine06 from UK / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Flavia_Pennetta_v_Elena_Baltacha_on_Court_3_(9285893445).jpg"
  },
  "s102": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Arthur_Ashe_Stadium_with_the_roof_closed_%2832938595438%29.jpg/1280px-Arthur_Ashe_Stadium_with_the_roof_closed_%2832938595438%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Arthur Ashe Stadium",
    credit: "Photo: Carine06 from UK / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arthur_Ashe_Stadium_with_the_roof_closed_(32938595438).jpg"
  },
  "s103": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Court_Philippe_Chatrier%2C_2011_Roland_Garros.jpg/1280px-Court_Philippe_Chatrier%2C_2011_Roland_Garros.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Philippe-Chatrier court at Roland Garros",
    credit: "Photo: Yann Caradec from Paris, France / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Court_Philippe_Chatrier,_2011_Roland_Garros.jpg"
  },
  "s104": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Melbourne_Park_-_Tennis.jpg/1280px-Melbourne_Park_-_Tennis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Melbourne Park",
    credit: "Photo: annieb / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Melbourne_Park_-_Tennis.jpg"
  },
  "s105": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Foro_italico_1.jpg/1280px-Foro_italico_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Foro Italico",
    credit: "Photo: Dedda71 / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Foro_italico_1.jpg"
  },
  "s106": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/The_Maracan%C3%A3zinho_arena_in_2013.jpg/1280px-The_Maracan%C3%A3zinho_arena_in_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Maracanazinho arena",
    credit: "Photo: Brazilian Government / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:The_Maracan%C3%A3zinho_arena_in_2013.jpg"
  },
  "s107": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Nilton_Santos%2C_Est%C3%A1dio_Nilton_Santos.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Est\xE1dio Nilton Santos",
    credit: "Photo: Andrea Hern\xE1ndez / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Nilton_Santos,_Est%C3%A1dio_Nilton_Santos.jpg"
  },
  "s108": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Panathenaic_Stadium_-_panoramio_%281%29.jpg/1280px-Panathenaic_Stadium_-_panoramio_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Panathenaic Stadium",
    credit: "Photo: Mister No / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Panathenaic_Stadium_-_panoramio_(1).jpg"
  },
  "s109": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/LuzhnikiStadium.jpg/1280px-LuzhnikiStadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Luzhniki Stadium",
    credit: "Photo: Government of Moscow Press centre / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:LuzhnikiStadium.jpg"
  },
  "s110": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/1280px-SoFi_Stadium_2023.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of SoFi Stadium",
    credit: "Photo: Troutfarm27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:SoFi_Stadium_2023.jpg"
  },
  "us-athlete-101": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Downtown_Pontiac_MI.jpg/1280px-Downtown_Pontiac_MI.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Pontiac Silverdome",
    credit: "Photo: Lrgjr72 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Downtown_Pontiac_MI.jpg"
  },
  "us-athlete-102": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Newport_Casino.jpg/1280px-Newport_Casino.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Newport Casino",
    credit: "Photo: Daniel Case / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Newport_Casino.jpg"
  },
  "us-athlete-103": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Camping_World_Stadium.jpg/1280px-Camping_World_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Camping World Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Camping_World_Stadium.jpg"
  },
  "us-athlete-106": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Stanford_Stadium_new.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Stanford Stadium",
    credit: "Photo: NASA World Wind / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stanford_Stadium_new.jpg"
  },
  "us-athlete-107": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Yale_Bowl_aerial_view_2023_%28Quintin_Soloviev%29.jpg/1280px-Yale_Bowl_aerial_view_2023_%28Quintin_Soloviev%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Yale Bowl",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Yale_Bowl_aerial_view_2023_(Quintin_Soloviev).jpg"
  },
  "us-athlete-108": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Los_angeles_memorial_sports_arena1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Los Angeles Memorial Sports Arena",
    credit: "Photo: Richard H. Kim / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Los_angeles_memorial_sports_arena1.jpg"
  },
  "us-athlete-109": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Legion_Field_-_Birmingham%2C_Alabama.jpg/1280px-Legion_Field_-_Birmingham%2C_Alabama.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Legion Field",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Legion_Field_-_Birmingham,_Alabama.jpg"
  },
  "us-athlete-110": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/View_from_Top_o%27_Texas_Tower_September_2019_10_%28Cotton_Bowl%29.jpg/1280px-View_from_Top_o%27_Texas_Tower_September_2019_10_%28Cotton_Bowl%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Cotton Bowl",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:View_from_Top_o%27_Texas_Tower_September_2019_10_(Cotton_Bowl).jpg"
  },
  "us-athlete-111": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Sun_Devil_Stadium_B%26W_-_Tempe_Arizona.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Sun Devil Stadium",
    credit: "Photo: USGS / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sun_Devil_Stadium_B%26W_-_Tempe_Arizona.jpg"
  },
  "us-athlete-112": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Rice_Stadium_in_Houston%2C_Texas_2024.jpg/1280px-Rice_Stadium_in_Houston%2C_Texas_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Rice Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Rice_Stadium_in_Houston,_Texas_2024.jpg"
  },
  "us-athlete-113": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Johnnie_B._Wiley_Amateur_Athletic_Sports_Pavilion_-_fmr_War_Memorial_Stadium_-_Buffalo%2C_New_York_-_20200205.jpg/1280px-Johnnie_B._Wiley_Amateur_Athletic_Sports_Pavilion_-_fmr_War_Memorial_Stadium_-_Buffalo%2C_New_York_-_20200205.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of War Memorial Stadium",
    credit: "Photo: Andre Carrotflower / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Johnnie_B._Wiley_Amateur_Athletic_Sports_Pavilion_-_fmr_War_Memorial_Stadium_-_Buffalo,_New_York_-_20200205.jpg"
  },
  "us-athlete-114": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Cameron_Indoor_Stadium_north_entrance_%287792868%29.jpg/1280px-Cameron_Indoor_Stadium_north_entrance_%287792868%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Cameron Indoor Stadium",
    credit: "Photo: monsieuricon from Montr\xE9al, Canada / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cameron_Indoor_Stadium_north_entrance_(7792868).jpg"
  },
  "us-athlete-115": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Boston_braves_field_night_postcard.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Braves Field",
    credit: "Photo: Unknown author Unknown author / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Boston_braves_field_night_postcard.jpg"
  },
  "us-athlete-116": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Seals_Stadium_marquee.jpg/1280px-Seals_Stadium_marquee.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Seals Stadium",
    credit: "Photo: Megacheez / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Seals_Stadium_marquee.jpg"
  },
  "us-athlete-117": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Talladega_Alabama_Courthouse_Square.JPG/1280px-Talladega_Alabama_Courthouse_Square.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Talladega Superspeedway",
    credit: "Photo: Rivers Langley; SaveRivers / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Talladega_Alabama_Courthouse_Square.JPG"
  },
  "us-athlete-118": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Entrance%2C_American_League_Park_%28Hilltop_Park%29%2C_New_York_City_%28baseball%29_LCCN2014719443.jpg/1280px-Entrance%2C_American_League_Park_%28Hilltop_Park%29%2C_New_York_City_%28baseball%29_LCCN2014719443.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hilltop Park",
    credit: "Photo: Bain News Service, publisher / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Entrance,_American_League_Park_(Hilltop_Park),_New_York_City_(baseball)_LCCN2014719443.jpg"
  },
  "us-athlete-119": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/1st_Boston_Marathon_blast_seen_from_2nd_floor_and_a_half_block_away.jpg/1280px-1st_Boston_Marathon_blast_seen_from_2nd_floor_and_a_half_block_away.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Boston Marathon finish line",
    credit: "Photo: Aaron Tang / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:1st_Boston_Marathon_blast_seen_from_2nd_floor_and_a_half_block_away.jpg"
  },
  "us-out-001": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Aloha_Stadium_from_outside_-_oct_2015.jpg/1280px-Aloha_Stadium_from_outside_-_oct_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Aloha Stadium",
    credit: "Photo: Nesnad / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aloha_Stadium_from_outside_-_oct_2015.jpg"
  },
  "us-out-002": {
    url: "https://images.pexels.com/photos/35464439/pexels-photo-35464439.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "A cyclist in aerodynamic gear racing in wet conditions, showcasing speed and endurance.",
    credit: "Photo: Brandic Digital on Pexels",
    creditUrl: "https://www.pexels.com/photo/professional-cyclist-competing-in-rainy-race-35464439/",
    illustrative: true
  },
  "us-out-003": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Kapiolani_Park.jpg/1280px-Kapiolani_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kapiolani Park",
    credit: "Photo: Syced / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kapiolani_Park.jpg"
  },
  "us-out-004": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Diamond_Head_-_North_View.jpg/1280px-Diamond_Head_-_North_View.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Diamond Head",
    credit: "Photo: Eric Tessmer / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Diamond_Head_-_North_View.jpg"
  },
  "us-out-005": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Lahaina_Courthouse_Square.jpg/1280px-Lahaina_Courthouse_Square.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lahaina",
    credit: "Photo: Harry Alverson from Katonah, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lahaina_Courthouse_Square.jpg"
  },
  "us-out-007": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Hilo%2C_Hawaii_%284529155714%29.jpg/1280px-Hilo%2C_Hawaii_%284529155714%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hilo",
    credit: "Photo: Ken Lund from Reno, Nevada, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hilo,_Hawaii_(4529155714).jpg"
  },
  "us-out-008": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Lihue-hawaii-aerial.jpg/1280px-Lihue-hawaii-aerial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lihue",
    credit: "Photo: Christopher P. Becker aka Polihale at en.wikipedia / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lihue-hawaii-aerial.jpg"
  },
  "us-out-009": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Alyeska_Resort%2C_Alaska.jpg/1280px-Alyeska_Resort%2C_Alaska.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Alyeska Resort",
    credit: "Photo: Xnatedawgx / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Alyeska_Resort,_Alaska.jpg"
  },
  "us-out-010": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Sullivan_Arena_Exterior.jpg/1280px-Sullivan_Arena_Exterior.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sullivan Arena",
    credit: "Photo: Mikhail Siskoff / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sullivan_Arena_Exterior.jpg"
  },
  "us-out-011": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Alaska_Airlines_Center_2015.jpg/1280px-Alaska_Airlines_Center_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Alaska Airlines Center",
    credit: "Photo: University of Alaska Anchorage / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Alaska_Airlines_Center_2015.jpg"
  },
  "us-out-012": {
    url: "https://images.pexels.com/photos/28276496/pexels-photo-28276496.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "A seaplane flying over a misty forest with fog rolling over the mountains, capturing a scenic adventure mood.",
    credit: "Photo: Trac Vu on Pexels",
    creditUrl: "https://www.pexels.com/photo/a-small-plane-flying-over-a-forested-area-28276496/",
    illustrative: true
  },
  "us-out-013": {
    url: "https://images.pexels.com/photos/17592461/pexels-photo-17592461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Charming village set against snowcapped mountains, with clear skies and ocean view, perfect for travel and nature enthusiasts.",
    credit: "Photo: Jan Tang on Pexels",
    creditUrl: "https://www.pexels.com/photo/snowcapped-mountains-seen-from-road-17592461/",
    illustrative: true
  },
  "us-out-014": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Juneau_Alaska_Downtown_and_Valley.jpg/1280px-Juneau_Alaska_Downtown_and_Valley.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Juneau",
    credit: "Photo: Gillfoto / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Juneau_Alaska_Downtown_and_Valley.jpg"
  },
  "us-out-015": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Fairbanks%2C_Alaska_skyline.jpg/1280px-Fairbanks%2C_Alaska_skyline.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Fairbanks",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Fairbanks,_Alaska_skyline.jpg"
  },
  "us-story-003": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Squaw_Valley_California.JPG/1280px-Squaw_Valley_California.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Squaw Valley",
    credit: "Photo: No machine-readable author provided. Vanka5~commonswiki assumed (based on copyright claims / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Squaw_Valley_California.JPG"
  },
  "us-story-006": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Candlestick_Park_in_May_2015.jpg/1280px-Candlestick_Park_in_May_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Candlestick Park",
    credit: "Photo: Pete Forsyth / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Candlestick_Park_in_May_2015.jpg"
  },
  "us-story-008": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Shea_10-12-07.jpg/1280px-Shea_10-12-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Shea Stadium",
    credit: "Photo: Originally uploaded at Wikipedia (English) by Metsfan84 02:39, 29 October 2008 (UTC) 3,264 / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Shea_10-12-07.jpg"
  },
  "us-story-018": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Raymond_James_Stadium_Aerial_%282%29.jpg/1280px-Raymond_James_Stadium_Aerial_%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Raymond James Stadium",
    credit: "Photo: Devin Morris / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Raymond_James_Stadium_Aerial_(2).jpg"
  },
  "us-story-019": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Hersheypark_arena_outside1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Hershey Sports Arena",
    credit: "Photo: Hersheyarena4ever at English Wikipedia / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hersheypark_arena_outside1.jpg"
  },
  "us-story-020": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Forum_Inglewood.JPG/1280px-Forum_Inglewood.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Forum",
    credit: "Photo: Ritapepaj / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Forum_Inglewood.JPG"
  },
  "us-story-201": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Comiskey_Park%2C_Chicago.jpg/1280px-Comiskey_Park%2C_Chicago.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Comiskey Park",
    credit: "Photo: Curt Teich & Company / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Comiskey_Park,_Chicago.jpg"
  },
  "us-story-202": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Huntington_Avenue_Grounds_-_DPLA_-_3b0a08e40798406fbb67f1848cde9370.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Huntington Avenue Grounds",
    credit: "Photo: Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Huntington_Avenue_Grounds_-_DPLA_-_3b0a08e40798406fbb67f1848cde9370.jpg"
  },
  "us-story-203": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Griffith_Stadium_Grandstand.jpg/1280px-Griffith_Stadium_Grandstand.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Griffith Stadium",
    credit: "Photo: National Photo Company / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Griffith_Stadium_Grandstand.jpg"
  },
  "us-story-204": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Forbes_Field_exterior.jpg/1280px-Forbes_Field_exterior.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Forbes Field",
    credit: "Photo: Unknown author Unknown author / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Forbes_Field_exterior.jpg"
  },
  "us-story-205": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Qualcomm_Stadium%2C_San_Diego%2C_California_%285142127584%29.jpg/1280px-Qualcomm_Stadium%2C_San_Diego%2C_California_%285142127584%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Qualcomm Stadium",
    credit: "Photo: Ken Lund from Reno, Nevada, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Qualcomm_Stadium,_San_Diego,_California_(5142127584).jpg"
  },
  "us-story-206": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Citizens_Bank_Park_2021.jpg/1280px-Citizens_Bank_Park_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Citizens Bank Park",
    credit: "Photo: Chris6d / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Citizens_Bank_Park_2021.jpg"
  },
  "us-story-207": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Tulane_Stadium_Front_Trees_%283184214056%29.jpg/1280px-Tulane_Stadium_Front_Trees_%283184214056%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Tulane Stadium",
    credit: "Photo: Infrogmation of New Orleans from New Orleans / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Tulane_Stadium_Front_Trees_(3184214056).jpg"
  },
  "us-story-208": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Rosenblatt_Stadium%2C_Omaha%2C_Nebraska_%28August_2004%29.jpg/1280px-Rosenblatt_Stadium%2C_Omaha%2C_Nebraska_%28August_2004%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Rosenblatt Stadium",
    credit: "Photo: Workman / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Rosenblatt_Stadium,_Omaha,_Nebraska_(August_2004).jpg"
  },
  "us-story-209": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Ebbets_Field_Apartments_jeh.JPG/1280px-Ebbets_Field_Apartments_jeh.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ebbets Field",
    credit: "Photo: Jim.henderson / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ebbets_Field_Apartments_jeh.JPG"
  },
  "us-story-211": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Metropolitan_Stadium_1962.jpeg/1280px-Metropolitan_Stadium_1962.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Metropolitan Stadium",
    credit: "Photo: Unknown author Unknown author / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Metropolitan_Stadium_1962.jpeg"
  },
  "us-story-212": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Rupp_Arena_view_from_Triangle_Park.jpg/1280px-Rupp_Arena_view_from_Triangle_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Rupp Arena",
    credit: "Photo: Ezugger / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Rupp_Arena_view_from_Triangle_Park.jpg"
  },
  "us-story-213": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Kingdome_across_parking_lot_in_1996.jpg/1280px-Kingdome_across_parking_lot_in_1996.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kingdome",
    credit: "Photo: Blake Handley from Victoria, Canada / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kingdome_across_parking_lot_in_1996.jpg"
  },
  "us-story-214": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Cole_Fieldhouse_INSIDE.jpg/1280px-Cole_Fieldhouse_INSIDE.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Cole Field House",
    credit: "Photo: Greenstrat / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cole_Fieldhouse_INSIDE.jpg"
  },
  "us-story-215": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Courthouse_Darlington_County%2C_SC%2C_US.jpg/1280px-Courthouse_Darlington_County%2C_SC%2C_US.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Darlington Raceway",
    credit: "Photo: Jud McCranie / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Courthouse_Darlington_County,_SC,_US.jpg"
  },
  "us-story-216": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Grant_Park%2C_Chicago%2C_Illinois%2C_Estados_Unidos%2C_2012-10-20%2C_DD_03.jpg/1280px-Grant_Park%2C_Chicago%2C_Illinois%2C_Estados_Unidos%2C_2012-10-20%2C_DD_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Grant Park",
    credit: "Photo: Diego Delso / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Grant_Park,_Chicago,_Illinois,_Estados_Unidos,_2012-10-20,_DD_03.jpg"
  },
  "us-story-217": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Coors_Field_July_2015.jpg/1280px-Coors_Field_July_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Coors Field",
    credit: "Photo: Thelastcanadian / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Coors_Field_July_2015.jpg"
  },
  "us-story-218": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Choura_Events_builds_large_tent_for_car_show_WeatherTech_Raceway_Laguna_Seca.jpg/1280px-Choura_Events_builds_large_tent_for_car_show_WeatherTech_Raceway_Laguna_Seca.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of WeatherTech Raceway Laguna Seca",
    credit: "Photo: Vision360media / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Choura_Events_builds_large_tent_for_car_show_WeatherTech_Raceway_Laguna_Seca.jpg"
  },
  "us-story-219": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/USFL_Championship_midfield_panorama_2022.png/1280px-USFL_Championship_midfield_panorama_2022.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Tom Benson Hall of Fame Stadium",
    credit: "Photo: Cards84664 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:USFL_Championship_midfield_panorama_2022.png"
  },
  "us-story-220": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/LongBeachCircuit-NearEndOfSeaside_%2833976607063%29.jpg/1280px-LongBeachCircuit-NearEndOfSeaside_%2833976607063%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Long Beach street circuit",
    credit: "Photo: formulanone from Huntsville, United States / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:LongBeachCircuit-NearEndOfSeaside_(33976607063).jpg"
  },
  "us-story-221": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Pauley_Pavilion_%28Los_Angeles%2C_USA%29.JPG/1280px-Pauley_Pavilion_%28Los_Angeles%2C_USA%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Pauley Pavilion",
    credit: "Photo: Alton / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Pauley_Pavilion_(Los_Angeles,_USA).JPG"
  },
  "us-story-222": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Atlanta-Fulton_County_Stadium_%282897768910%29.jpg/1280px-Atlanta-Fulton_County_Stadium_%282897768910%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Atlanta\u2013Fulton County Stadium",
    credit: "Photo: rjcox / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Atlanta-Fulton_County_Stadium_(2897768910).jpg"
  },
  "us-story-223": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/King_Gizzard_and_the_Lizard_Wizard%2C_Forest_Hills%2C_8-2-2025_Crowd.jpg/1280px-King_Gizzard_and_the_Lizard_Wizard%2C_Forest_Hills%2C_8-2-2025_Crowd.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of West Side Tennis Club",
    credit: "Photo: Scu ba / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:King_Gizzard_and_the_Lizard_Wizard,_Forest_Hills,_8-2-2025_Crowd.jpg"
  },
  "us-story-224": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Sportsman%27s_Park_site_2011.jpg/1280px-Sportsman%27s_Park_site_2011.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sportsman\u2019s Park",
    credit: "Photo: Paul Sableman / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sportsman%27s_Park_site_2011.jpg"
  },
  "us-story-225": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Frank_Furness_-_Haverford%2C_PA_-_Merion_Cricket_Club_%284%29.jpg/1280px-Frank_Furness_-_Haverford%2C_PA_-_Merion_Cricket_Club_%284%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Merion Golf Club",
    credit: "Photo: Bmzuckerman / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Frank_Furness_-_Haverford,_PA_-_Merion_Cricket_Club_(4).jpg"
  },
  "us-story-226": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Market_Square_Arena%2C_Indianapolis%2C_1988.jpg/1280px-Market_Square_Arena%2C_Indianapolis%2C_1988.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Market Square Arena",
    credit: "Photo: Bob Hall / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Market_Square_Arena,_Indianapolis,_1988.jpg"
  },
  "us-story-227": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Francis_Field_in_snow.jpg/1280px-Francis_Field_in_snow.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Francis Field",
    credit: "Photo: Shubinator / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Francis_Field_in_snow.jpg"
  },
  "us-story-228": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Freedom_Hall_2024.jpg/1280px-Freedom_Hall_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Freedom Hall",
    credit: "Photo: BlueShirtz / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Freedom_Hall_2024.jpg"
  },
  "us-story-229": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Jon_M._Huntsman_Center_%2830987753554%29.jpg/1280px-Jon_M._Huntsman_Center_%2830987753554%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Jon M. Huntsman Center",
    credit: "Photo: Jeff Hitchcock from Seattle, WA, USA / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Jon_M._Huntsman_Center_(30987753554).jpg"
  },
  "us-story-232": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Waverley_Country_Club_Clubhouse_across_Willamette_-_Portland_Oregon.jpg/1280px-Waverley_Country_Club_Clubhouse_across_Willamette_-_Portland_Oregon.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of The Country Club",
    credit: "Photo: Ian Poellet / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Waverley_Country_Club_Clubhouse_across_Willamette_-_Portland_Oregon.jpg"
  },
  "us-story-233": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Franklin_Field_aerial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Franklin Field",
    credit: "Photo: NASA World Wind / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Franklin_Field_aerial.jpg"
  },
  "us-story-234": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Shinnecock_Hills_GC_01.jpg/1280px-Shinnecock_Hills_GC_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Shinnecock Hills Golf Club",
    credit: "Photo: Peetlesnumber1 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Shinnecock_Hills_GC_01.jpg"
  },
  "us-story-235": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/81/National_League_Park_%28Plain_Dealer_illustration%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of League Park",
    credit: "Photo: Unknown author Unknown author / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:National_League_Park_(Plain_Dealer_illustration).png"
  },
  "us-story-236": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Harvard_Stadium_from_above_2023_%28Quintin_Soloviev%29.png/1280px-Harvard_Stadium_from_above_2023_%28Quintin_Soloviev%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Harvard Stadium",
    credit: "Photo: Quintinsoloviev / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Harvard_Stadium_from_above_2023_(Quintin_Soloviev).png"
  },
  "us-story-237": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/National_Baseball_Hall_of_Fame_August_2005_01.jpg/1280px-National_Baseball_Hall_of_Fame_August_2005_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of National Baseball Hall of Fame",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:National_Baseball_Hall_of_Fame_August_2005_01.jpg"
  },
  "us-story-239": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Palisades_Park_%28Santa_Monica%29.jpg/1280px-Palisades_Park_%28Santa_Monica%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Santa Monica College",
    credit: "Photo: Simon Cobb / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Palisades_Park_(Santa_Monica).jpg"
  },
  "us-story-240": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Hinklefieldhouse5.JPG/1280px-Hinklefieldhouse5.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hinkle Fieldhouse",
    credit: "Photo: Peetlesnumber1 / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hinklefieldhouse5.JPG"
  },
  "us-venue-001": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg/1280px-Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of AT&T Stadium",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arlington_June_2020_4_(AT%26T_Stadium).jpg"
  },
  "us-venue-002": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Allegiant_Stadium_Street_View_on_Super_Bowl_LVIII.jpg/1280px-Allegiant_Stadium_Street_View_on_Super_Bowl_LVIII.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Allegiant Stadium",
    credit: "Photo: U.S. Customs and Border Protection / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Allegiant_Stadium_Street_View_on_Super_Bowl_LVIII.jpg"
  },
  "us-venue-003": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Aerial_view_of_Bank_of_America_Stadium_in_Charlotte.jpg/1280px-Aerial_view_of_Bank_of_America_Stadium_in_Charlotte.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Bank of America Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Bank_of_America_Stadium_in_Charlotte.jpg"
  },
  "us-venue-004": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Detroit_December_2015_09_%28Ford_Field%29.jpg/1280px-Detroit_December_2015_09_%28Ford_Field%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ford Field",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Detroit_December_2015_09_(Ford_Field).jpg"
  },
  "us-venue-005": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Commanders_vs_Giants_%2853345178211%29.jpg/1280px-Commanders_vs_Giants_%2853345178211%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Northwest Stadium",
    credit: "Photo: Maryland GovPics / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Commanders_vs_Giants_(53345178211).jpg"
  },
  "us-venue-006": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Gillette_Stadium_%28Top_View%29.jpg/1280px-Gillette_Stadium_%28Top_View%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Gillette Stadium",
    credit: "Photo: Art N. / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Gillette_Stadium_(Top_View).jpg"
  },
  "us-venue-007": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/1280px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hard Rock Stadium",
    credit: "Photo: elisfkc2 / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hard_Rock_Stadium_for_Super_Bowl_LIV_(49606710103).jpg"
  },
  "us-venue-008": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Acrisure_Stadium_2024.jpg/1280px-Acrisure_Stadium_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Acrisure Stadium",
    credit: "Photo: Cramerwiki / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Acrisure_Stadium_2024.jpg"
  },
  "us-venue-009": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Bills_Stadium_May26.jpg/1280px-Bills_Stadium_May26.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Highmark Stadium",
    credit: "Photo: Dekema / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bills_Stadium_May26.jpg"
  },
  "us-venue-010": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/FirstEnergy_Stadium_50_yardline_panorama.png/1280px-FirstEnergy_Stadium_50_yardline_panorama.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Huntington Bank Field",
    credit: "Photo: Cards84664 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:FirstEnergy_Stadium_50_yardline_panorama.png"
  },
  "us-venue-011": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg/1280px-2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lumen Field",
    credit: "Photo: SounderBruce / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg"
  },
  "us-venue-012": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/1280px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Levi's Stadium",
    credit: "Photo: U.S. Customs and Border Protection / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_(24398261729).jpg"
  },
  "us-venue-013": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Aerial_view_of_Indianapolis%2C_Indiana%2C_with_a_focus_on_Lucas_Oil_Stadium%2C_highsm.40934.jpg/1280px-Aerial_view_of_Indianapolis%2C_Indiana%2C_with_a_focus_on_Lucas_Oil_Stadium%2C_highsm.40934.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lucas Oil Stadium",
    credit: "Photo: Carol M. Highsmith / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Indianapolis,_Indiana,_with_a_focus_on_Lucas_Oil_Stadium,_highsm.40934.jpg"
  },
  "us-venue-014": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg/1280px-Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Mercedes-Benz Stadium",
    credit: "Photo: Atlanta Falcons / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg"
  },
  "us-venue-015": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/1280px-Metlife_stadium_%28Aerial_view%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of MetLife Stadium",
    credit: "Photo: Anthony Quintano from Hillsborough, NJ, United States / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Metlife_stadium_(Aerial_view).jpg"
  },
  "us-venue-016": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/M%26T_Bank_Stadium_in_Baltimore.jpg/1280px-M%26T_Bank_Stadium_in_Baltimore.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of M&T Bank Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:M%26T_Bank_Stadium_in_Baltimore.jpg"
  },
  "us-venue-017": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/NRG_Stadium%2C_Houston%2C_Texas%2C_United_States.jpg/1280px-NRG_Stadium%2C_Houston%2C_Texas%2C_United_States.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of NRG Stadium",
    credit: "Photo: https://www.cbp.gov/ / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:NRG_Stadium,_Houston,_Texas,_United_States.jpg"
  },
  "us-venue-018": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Paul_Brown_Stadium_interior_2017.jpg/1280px-Paul_Brown_Stadium_interior_2017.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Paycor Stadium",
    credit: "Photo: JonRidinger / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Paul_Brown_Stadium_interior_2017.jpg"
  },
  "us-venue-019": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Soldier_Field_S.jpg/1280px-Soldier_Field_S.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Soldier Field",
    credit: "Photo: Sea Cow / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Soldier_Field_S.jpg"
  },
  "us-venue-020": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/State_Farm_Stadium_2022.jpg/1280px-State_Farm_Stadium_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of State Farm Stadium",
    credit: "Photo: Troutfarm27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:State_Farm_Stadium_2022.jpg"
  },
  "us-venue-021": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg/1280px-Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of GEHA Field at Arrowhead Stadium",
    credit: "Photo: Ichabod / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg"
  },
  "us-venue-022": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/U.S._Bank_Stadium_%28cropped%29.jpg/1280px-U.S._Bank_Stadium_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of U.S. Bank Stadium",
    credit: "Photo: Lectrician2 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:U.S._Bank_Stadium_(cropped).jpg"
  },
  "us-venue-023": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Empower_Field_at_Mile_High_20241001.jpg/1280px-Empower_Field_at_Mile_High_20241001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Empower Field at Mile High",
    credit: "Photo: Pdubs.94 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Empower_Field_at_Mile_High_20241001.jpg"
  },
  "us-venue-024": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/LP_Field_Nashville.jpg/1280px-LP_Field_Nashville.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of LP Field",
    credit: "Photo: User:Crassic / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:LP_Field_Nashville.jpg"
  },
  "us-venue-025": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/EverBank_Stadium_aerial_view.jpg/1280px-EverBank_Stadium_aerial_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of EverBank Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:EverBank_Stadium_aerial_view.jpg"
  },
  "us-venue-026": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Lambeau_Field_-_Green_Bay_Packers_Football_Stadium_-_Wisconsin.jpg/1280px-Lambeau_Field_-_Green_Bay_Packers_Football_Stadium_-_Wisconsin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lambeau Field",
    credit: "Photo: Tony Webster / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lambeau_Field_-_Green_Bay_Packers_Football_Stadium_-_Wisconsin.jpg"
  },
  "us-venue-027": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Lincoln_Financial_Field%2C_Philadelphia%2C_Pennsylvania%2C_United_States.jpg/1280px-Lincoln_Financial_Field%2C_Philadelphia%2C_Pennsylvania%2C_United_States.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lincoln Financial Field",
    credit: "Photo: Dough4872 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Lincoln_Financial_Field,_Philadelphia,_Pennsylvania,_United_States.jpg"
  },
  "us-venue-029": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Dodger_Stadium_and_Chavez_Ravine_far_view%2C_Chicago_Cubs_at_Los_Angeles_Dodgers%2C_%28April_12%2C_2025%29.jpg/1280px-Dodger_Stadium_and_Chavez_Ravine_far_view%2C_Chicago_Cubs_at_Los_Angeles_Dodgers%2C_%28April_12%2C_2025%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Dodger Stadium",
    credit: "Photo: Spatms / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Dodger_Stadium_and_Chavez_Ravine_far_view,_Chicago_Cubs_at_Los_Angeles_Dodgers,_(April_12,_2025).jpg"
  },
  "us-venue-030": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Wrigley_Field%2C_Chicago%2C_United_States_%28Unsplash%29.jpg/1280px-Wrigley_Field%2C_Chicago%2C_United_States_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Wrigley Field",
    credit: "Photo: David Schap dschap75 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wrigley_Field,_Chicago,_United_States_(Unsplash).jpg"
  },
  "us-venue-031": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Chicago%2C_Illinois%2C_U.S._%282023%29_-_062.jpg/1280px-Chicago%2C_Illinois%2C_U.S._%282023%29_-_062.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Rate Field",
    credit: "Photo: Another Believer / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chicago,_Illinois,_U.S._(2023)_-_062.jpg"
  },
  "us-venue-032": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Busch_Stadium_2022.jpg/1280px-Busch_Stadium_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Busch Stadium",
    credit: "Photo: Lightmetro / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Busch_Stadium_2022.jpg"
  },
  "us-venue-033": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Kauffman2017.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Kauffman Stadium",
    credit: "Photo: Chibears85 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kauffman2017.jpg"
  },
  "us-venue-034": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Truist_Park_-_50588486371.jpg/1280px-Truist_Park_-_50588486371.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Truist Park",
    credit: "Photo: Tyler Lahti / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Truist_Park_-_50588486371.jpg"
  },
  "us-venue-035": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Target_Field%2C_Minneapolis%2C_Minnesota_%2843167053335%29.jpg/1280px-Target_Field%2C_Minneapolis%2C_Minnesota_%2843167053335%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Target Field",
    credit: "Photo: Ken Lund from Reno, Nevada, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Target_Field,_Minneapolis,_Minnesota_(43167053335).jpg"
  },
  "us-venue-036": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Cleveland_Guardians_vs._New_York_Yankees_on_Oct_17_2024_%2854102149292%29.jpg/1280px-Cleveland_Guardians_vs._New_York_Yankees_on_Oct_17_2024_%2854102149292%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Progressive Field",
    credit: "Photo: Erik Drost / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cleveland_Guardians_vs._New_York_Yankees_on_Oct_17_2024_(54102149292).jpg"
  },
  "us-venue-037": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Detroit_Tigers_opening_game_at_Comerica_Park%2C_2007.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Comerica Park",
    credit: "Photo: User MJCdetroit on en.wikipedia / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Detroit_Tigers_opening_game_at_Comerica_Park,_2007.jpg"
  },
  "us-venue-038": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Houston%2C_Texas_%282024%29_-_09.jpg/1280px-Houston%2C_Texas_%282024%29_-_09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Daikin Park",
    credit: "Photo: Another Believer / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Houston,_Texas_(2024)_-_09.jpg"
  },
  "us-venue-039": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Oracle_Park_2021.jpg/1280px-Oracle_Park_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Oracle Park",
    credit: "Photo: Chris6d / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Oracle_Park_2021.jpg"
  },
  "us-venue-040": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/SafecoFieldTop.jpg/1280px-SafecoFieldTop.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of T-Mobile Park",
    credit: "Photo: MyName ( Cacophony ) / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:SafecoFieldTop.jpg"
  },
  "us-venue-041": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/GlobeLifeField2021.jpg/1280px-GlobeLifeField2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Globe Life Field",
    credit: "Photo: slgckgc / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:GlobeLifeField2021.jpg"
  },
  "us-venue-042": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Reserve_A-10_Warthogs_Flyover_2023_World_Series_%288099146%29.jpg/1280px-Reserve_A-10_Warthogs_Flyover_2023_World_Series_%288099146%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Chase Field",
    credit: "Photo: U.S. Air Force photo by Staff Sgt. Tyler J. Bolken / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Reserve_A-10_Warthogs_Flyover_2023_World_Series_(8099146).jpg"
  },
  "us-venue-043": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Pittsburgh_Pirates_park_%28Unsplash%29.jpg/1280px-Pittsburgh_Pirates_park_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of PNC Park",
    credit: "Photo: Joshua Peacock jcpeacock / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Pittsburgh_Pirates_park_(Unsplash).jpg"
  },
  "us-venue-044": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/10Cincinnati_2015_%282%29.jpg/1280px-10Cincinnati_2015_%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Great American Ball Park",
    credit: "Photo: Laslovarga / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:10Cincinnati_2015_(2).jpg"
  },
  "us-venue-045": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Miller_Park_in_Milwaukee%2C_Wisconsin.jpg/1280px-Miller_Park_in_Milwaukee%2C_Wisconsin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of American Family Field",
    credit: "Photo: Carol H. Highsmith / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Miller_Park_in_Milwaukee,_Wisconsin.jpg"
  },
  "us-venue-046": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Petco_Park_Padres_Game.jpg/1280px-Petco_Park_Padres_Game.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Petco Park",
    credit: "Photo: Mds08011 / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Petco_Park_Padres_Game.jpg"
  },
  "us-venue-047": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Angelstadiummarch2019.jpg/1280px-Angelstadiummarch2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Angel Stadium",
    credit: "Photo: CrispyCream27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Angelstadiummarch2019.jpg"
  },
  "us-venue-048": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/OrioleParkatCamdenYardsSummer2025.jpg/1280px-OrioleParkatCamdenYardsSummer2025.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Camden Yards",
    credit: "Photo: Aspifi / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:OrioleParkatCamdenYardsSummer2025.jpg"
  },
  "us-venue-049": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Citi_Field_Day.jpg/1280px-Citi_Field_Day.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Citi Field",
    credit: "Photo: Sam Smith / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Citi_Field_Day.jpg"
  },
  "us-venue-050": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Nationals_Park_8.16.19_-_7.jpg/1280px-Nationals_Park_8.16.19_-_7.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Nationals Park",
    credit: "Photo: APK / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Nationals_Park_8.16.19_-_7.jpg"
  },
  "us-venue-051": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/53/LOAN_DEPOT_PARK.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of loanDepot park",
    credit: "Photo: Ven-Lib / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:LOAN_DEPOT_PARK.jpg"
  },
  "us-venue-052": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/PXL_20220528_205520913.jpg/1280px-PXL_20220528_205520913.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Tropicana Field",
    credit: "Photo: Vmartin12 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:PXL_20220528_205520913.jpg"
  },
  "us-venue-053": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg/1280px-Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sutter Health Park",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sutter_Health_Park_aerial_view_2023_(Quintin_Soloviev).jpg"
  },
  "us-venue-056": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Oakland_Coliseum_from_above_2024.png/1280px-Oakland_Coliseum_from_above_2024.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Oakland Coliseum",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Oakland_Coliseum_from_above_2024.png"
  },
  "us-venue-057": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Madison_Square_Garden_%28MSG%29_-_Full_%2848124330357%29.jpg/1280px-Madison_Square_Garden_%28MSG%29_-_Full_%2848124330357%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Madison Square Garden",
    credit: "Photo: Ajay Suresh from New York, NY, USA / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Madison_Square_Garden_(MSG)_-_Full_(48124330357).jpg"
  },
  "us-venue-058": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Crypto.com_Arena_exterior_2023.jpg/1280px-Crypto.com_Arena_exterior_2023.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Crypto.com Arena",
    credit: "Photo: Troutfarm27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Crypto.com_Arena_exterior_2023.jpg"
  },
  "us-venue-059": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/TD_Garden_%2854960947755%29.jpg/1280px-TD_Garden_%2854960947755%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of TD Garden",
    credit: "Photo: ajay_suresh / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:TD_Garden_(54960947755).jpg"
  },
  "us-venue-060": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/United_Center_1.jpg/1280px-United_Center_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of United Center",
    credit: "Photo: Alacoolwiki / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:United_Center_1.jpg"
  },
  "us-venue-061": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Chase_Center.jpg/1280px-Chase_Center.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Chase Center",
    credit: "Photo: dtstuff9 / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chase_Center.jpg"
  },
  "us-venue-062": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Barclays_Center_-_2026_%2855268559424%29.jpg/1280px-Barclays_Center_-_2026_%2855268559424%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Barclays Center",
    credit: "Photo: Ajay Suresh / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Barclays_Center_-_2026_(55268559424).jpg"
  },
  "us-venue-063": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/American_Airlines_Center_August_2015.jpg/1280px-American_Airlines_Center_August_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of American Airlines Center",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:American_Airlines_Center_August_2015.jpg"
  },
  "us-venue-064": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Texasdd.JPG/1280px-Texasdd.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Frost Bank Center",
    credit: "Photo: Tehumanetwork / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Texasdd.JPG"
  },
  "us-venue-065": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Ball_Arena_exterior_2022.jpg/1280px-Ball_Arena_exterior_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ball Arena",
    credit: "Photo: Troutfarm27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ball_Arena_exterior_2022.jpg"
  },
  "us-venue-066": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Mortgage_Matchup_Center.webp?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Mortgage Matchup Center",
    credit: "Photo: Wikifan3934564 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Mortgage_Matchup_Center.webp"
  },
  "us-venue-067": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Modacenter2019.jpg/1280px-Modacenter2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Moda Center",
    credit: "Photo: CrispyCream27 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Modacenter2019.jpg"
  },
  "us-venue-068": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Climate_Pledge_Arena_N.jpg/1280px-Climate_Pledge_Arena_N.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Climate Pledge Arena",
    credit: "Photo: Sea Cow / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Climate_Pledge_Arena_N.jpg"
  },
  "us-venue-069": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Detroit_August_2025_07_%28Little_Caesars_Arena%29.jpg/1280px-Detroit_August_2025_07_%28Little_Caesars_Arena%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Little Caesars Arena",
    credit: "Photo: Michael Barera / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Detroit_August_2025_07_(Little_Caesars_Arena).jpg"
  },
  "us-venue-070": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Capital_One_Arena_-_Washington%2C_D.C.jpg/1280px-Capital_One_Arena_-_Washington%2C_D.C.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Capital One Arena",
    credit: "Photo: APK / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Capital_One_Arena_-_Washington,_D.C.jpg"
  },
  "us-venue-071": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/FedExForum_at_night.jpg/1280px-FedExForum_at_night.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of FedExForum",
    credit: "Photo: Marco Espino-Ovalle / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:FedExForum_at_night.jpg"
  },
  "us-venue-072": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Kia_Center_12-22-24.jpg/1280px-Kia_Center_12-22-24.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kia Center",
    credit: "Photo: Csab6482 / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kia_Center_12-22-24.jpg"
  },
  "us-venue-073": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/State_Farm_%28Philips%29_Arena%2C_Atlanta%2C_GA_%2846558861525%29_-_2019.jpg/1280px-State_Farm_%28Philips%29_Arena%2C_Atlanta%2C_GA_%2846558861525%29_-_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of State Farm Arena",
    credit: "Photo: Warren LeMay from Cincinnati, OH, United States / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:State_Farm_(Philips)_Arena,_Atlanta,_GA_(46558861525)_-_2019.jpg"
  },
  "us-venue-074": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/New_Orleans_Arena%2C_exterior_view%2C_10_January_2022_%28cropped%29.jpg/1280px-New_Orleans_Arena%2C_exterior_view%2C_10_January_2022_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Smoothie King Center",
    credit: "Photo: Infrogmation of New Orleans / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:New_Orleans_Arena,_exterior_view,_10_January_2022_(cropped).jpg"
  },
  "us-venue-075": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Paycom_Center_exterior_aerial_view.jpg/1280px-Paycom_Center_exterior_aerial_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Paycom Center",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Paycom_Center_exterior_aerial_view.jpg"
  },
  "us-venue-076": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Toyota_Center_entr.jpg/1280px-Toyota_Center_entr.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Toyota Center",
    credit: "Photo: Ed Uthman from Houston, TX, USA / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Toyota_Center_entr.jpg"
  },
  "us-venue-077": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Delta_Center_2023.jpg/1280px-Delta_Center_2023.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Delta Center",
    credit: "Photo: Lomrjyo / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Delta_Center_2023.jpg"
  },
  "us-venue-078": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Target_Center_in_Minneapolis%2C_Minnesota_%2849113411356%29.jpg/1280px-Target_Center_in_Minneapolis%2C_Minnesota_%2849113411356%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Target Center",
    credit: "Photo: Tony Webster from Minneapolis, Minnesota, United States / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Target_Center_in_Minneapolis,_Minnesota_(49113411356).jpg"
  },
  "us-venue-079": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Bankers_Life_Fieldhouse%2C_Indian%C3%A1polis%2C_Estados_Unidos%2C_2012-10-22%2C_DD_02.jpg/1280px-Bankers_Life_Fieldhouse%2C_Indian%C3%A1polis%2C_Estados_Unidos%2C_2012-10-22%2C_DD_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Gainbridge Fieldhouse",
    credit: "Photo: Diego Delso / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bankers_Life_Fieldhouse,_Indian%C3%A1polis,_Estados_Unidos,_2012-10-22,_DD_02.jpg"
  },
  "us-venue-080": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Milwaukee_Fiserv_Forum.jpg/1280px-Milwaukee_Fiserv_Forum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Fiserv Forum",
    credit: "Photo: Fleyzk / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Milwaukee_Fiserv_Forum.jpg"
  },
  "us-venue-081": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Spectrum_Center_2018.jpg/1280px-Spectrum_Center_2018.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Spectrum Center",
    credit: "Photo: Matthew D. Britt from Ballston Lake, NY, U.S.A. / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Spectrum_Center_2018.jpg"
  },
  "us-venue-082": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Wells_Fargo_Center_-_2019_OWL_Grand_Finals.jpg/1280px-Wells_Fargo_Center_-_2019_OWL_Grand_Finals.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Xfinity Mobile Arena",
    credit: "Photo: Jen Smith / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wells_Fargo_Center_-_2019_OWL_Grand_Finals.jpg"
  },
  "us-venue-083": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Golden_1_Center_aerial_view.jpg/1280px-Golden_1_Center_aerial_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Golden 1 Center",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Golden_1_Center_aerial_view.jpg"
  },
  "us-venue-084": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/PPG_Paints_Arena_-_March_2017.jpg/1280px-PPG_Paints_Arena_-_March_2017.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of PPG Paints Arena",
    credit: "Photo: Jleedev / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:PPG_Paints_Arena_-_March_2017.jpg"
  },
  "us-venue-085": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Nationwide_Arena_exterior.jpg/1280px-Nationwide_Arena_exterior.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Nationwide Arena",
    credit: "Photo: Eric / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Nationwide_Arena_exterior.jpg"
  },
  "us-venue-086": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Xcel_Energy_Center_in_Downtown_St._Paul%2C_Minnesota_%2830388907187%29.jpg/1280px-Xcel_Energy_Center_in_Downtown_St._Paul%2C_Minnesota_%2830388907187%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Xcel Energy Center",
    credit: "Photo: Tony Webster from Minneapolis, Minnesota, United States / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Xcel_Energy_Center_in_Downtown_St._Paul,_Minnesota_(30388907187).jpg"
  },
  "us-venue-087": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/T_Mobile_Arena_The_Strip_Las_Vegas_%2829798246202%29.jpg/1280px-T_Mobile_Arena_The_Strip_Las_Vegas_%2829798246202%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of T-Mobile Arena",
    credit: "Photo: Tom\xE1s Del Coro from Las Vegas, Nevada, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:T_Mobile_Arena_The_Strip_Las_Vegas_(29798246202).jpg"
  },
  "us-venue-088": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/View_of_Amerant_Bank_Arena_from_Publix_Plaza_before_a_Florida_Panthers_game_during_the_2023-24_season..jpg/1280px-View_of_Amerant_Bank_Arena_from_Publix_Plaza_before_a_Florida_Panthers_game_during_the_2023-24_season..jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Amerant Bank Arena",
    credit: "Photo: Gatorfan252525 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:View_of_Amerant_Bank_Arena_from_Publix_Plaza_before_a_Florida_Panthers_game_during_the_2023-24_season..jpg"
  },
  "us-venue-089": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Belmont_Park_td_%282021-12-19%29_017_-_UBS_Arena.jpg/1280px-Belmont_Park_td_%282021-12-19%29_017_-_UBS_Arena.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of UBS Arena",
    credit: "Photo: Tdorante10 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Belmont_Park_td_(2021-12-19)_017_-_UBS_Arena.jpg"
  },
  "us-venue-090": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/SAP_Center_%2816609288898%29.jpg/1280px-SAP_Center_%2816609288898%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of SAP Center",
    credit: "Photo: Travis Wise from Bay Area, California, United States / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:SAP_Center_(16609288898).jpg"
  },
  "us-venue-091": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Honda_Center_2026.jpg/1280px-Honda_Center_2026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Honda Center",
    credit: "Photo: Troutfarm27 / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Honda_Center_2026.jpg"
  },
  "us-venue-092": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Scottrade_2015.jpg/1280px-Scottrade_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Enterprise Center",
    credit: "Photo: Lightmetro / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Scottrade_2015.jpg"
  },
  "us-venue-094": {
    url: "https://images.pexels.com/photos/28192812/pexels-photo-28192812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Houston college football match with vibrant crowd and fire effects. Captures the sports spirit.",
    credit: "Photo: Eddie O. on Pexels",
    creditUrl: "https://www.pexels.com/photo/houston-vs-unlv-28192812/",
    illustrative: true
  },
  "us-venue-095": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Beaver_Stadium_Penn_State_PA1.jpg/1280px-Beaver_Stadium_Penn_State_PA1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Beaver Stadium",
    credit: "Photo: Acroterion / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Beaver_Stadium_Penn_State_PA1.jpg"
  },
  "us-venue-096": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Memorial_Stadium%2C_Clemson_University_Tigers%2C_Clemson%2C_South_Carolina_%286119999377%29.jpg/1280px-Memorial_Stadium%2C_Clemson_University_Tigers%2C_Clemson%2C_South_Carolina_%286119999377%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Memorial Stadium",
    credit: "Photo: Ken Lund from Reno, Nevada, USA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Memorial_Stadium,_Clemson_University_Tigers,_Clemson,_South_Carolina_(6119999377).jpg"
  },
  "us-venue-097": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Aerial_view_of_Doak_Campbell_Stadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Doak Campbell Stadium",
    credit: "Photo: SeminoleNation / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Doak_Campbell_Stadium.jpg"
  },
  "us-venue-098": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Tiger_Stadium%2C_aka_Death_Valley%2C_Louisiana_State_University_%28LSU%29%2C_Baton_Rouge%2C_Louisiana_%283%29.jpg/1280px-Tiger_Stadium%2C_aka_Death_Valley%2C_Louisiana_State_University_%28LSU%29%2C_Baton_Rouge%2C_Louisiana_%283%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Tiger Stadium",
    credit: "Photo: Ken Lund / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Tiger_Stadium,_aka_Death_Valley,_Louisiana_State_University_(LSU),_Baton_Rouge,_Louisiana_(3).jpg"
  },
  "us-venue-099": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Bryant%E2%80%93Denny_Stadium%2C_Tuscaloosa_AL%2C_North_view_20160714_1.jpg/1280px-Bryant%E2%80%93Denny_Stadium%2C_Tuscaloosa_AL%2C_North_view_20160714_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Bryant-Denny Stadium",
    credit: "Photo: DXR / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bryant%E2%80%93Denny_Stadium,_Tuscaloosa_AL,_North_view_20160714_1.jpg"
  },
  "us-venue-100": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Neyland_Stadium%2C_University_of_Tennessee_at_Knoxville%2C_Fort_Sanders%2C_Knoxville%2C_TN.jpg/1280px-Neyland_Stadium%2C_University_of_Tennessee_at_Knoxville%2C_Fort_Sanders%2C_Knoxville%2C_TN.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Neyland Stadium",
    credit: "Photo: w_lemay / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Neyland_Stadium,_University_of_Tennessee_at_Knoxville,_Fort_Sanders,_Knoxville,_TN.jpg"
  },
  "us-venue-101": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Darrell_k_royal_stadium_west_deck.jpg/1280px-Darrell_k_royal_stadium_west_deck.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Darrell K Royal Stadium",
    credit: "Photo: Corpx / CC BY-SA 2.5, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Darrell_k_royal_stadium_west_deck.jpg"
  },
  "us-venue-102": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Ben_Hill_Griffin_Stadium_During_%22I_Won%27t_Back_Down%22_Tradition_%28Texas_A%26M_vs._Florida_-_October_14%2C_2017%29.jpg/1280px-Ben_Hill_Griffin_Stadium_During_%22I_Won%27t_Back_Down%22_Tradition_%28Texas_A%26M_vs._Florida_-_October_14%2C_2017%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Ben Hill Griffin Stadium",
    credit: "Photo: GATORFAN2525 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ben_Hill_Griffin_Stadium_During_%22I_Won%27t_Back_Down%22_Tradition_(Texas_A%26M_vs._Florida_-_October_14,_2017).jpg"
  },
  "us-venue-103": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Spartan_Stadium_in_2025_During_a_game_against_Western_Michigan.jpg/1280px-Spartan_Stadium_in_2025_During_a_game_against_Western_Michigan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Spartan Stadium",
    credit: "Photo: Stillnotjayjay / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Spartan_Stadium_in_2025_During_a_game_against_Western_Michigan.jpg"
  },
  "us-venue-104": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/NotreDameStadiumNight.jpg/1280px-NotreDameStadiumNight.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Notre Dame Stadium",
    credit: "Photo: Eccekevin / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:NotreDameStadiumNight.jpg"
  },
  "us-venue-105": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/UGA_vs._Marshall_2025_%28corner%29.jpg/1280px-UGA_vs._Marshall_2025_%28corner%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sanford Stadium",
    credit: "Photo: TarheelBornBred / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:UGA_vs._Marshall_2025_(corner).jpg"
  },
  "us-venue-106": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Kyle_Field_and_train_tracks_that_founded_College_Station.jpg/1280px-Kyle_Field_and_train_tracks_that_founded_College_Station.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kyle Field",
    credit: "Photo: Mikerussell / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kyle_Field_and_train_tracks_that_founded_College_Station.jpg"
  },
  "us-venue-107": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Folsom_Field_vs._Utah_2016.jpg/1280px-Folsom_Field_vs._Utah_2016.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Folsom Field",
    credit: "Photo: Thelastcanadian / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Folsom_Field_vs._Utah_2016.jpg"
  },
  "us-venue-108": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Husky_Stadium_-_March_19%2C_2016.jpg/1280px-Husky_Stadium_-_March_19%2C_2016.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Husky Stadium",
    credit: "Photo: Atomic Taco / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Husky_Stadium_-_March_19,_2016.jpg"
  },
  "us-venue-109": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Indianapolis-motor-speedway-1848561.jpg/1280px-Indianapolis-motor-speedway-1848561.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Indianapolis Motor Speedway",
    credit: "Photo: tpsdave / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Indianapolis-motor-speedway-1848561.jpg"
  },
  "us-venue-110": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Daytona_International_Speedway%2C_Daytona_Beach%2C_United_States_%28Unsplash%29.jpg/1280px-Daytona_International_Speedway%2C_Daytona_Beach%2C_United_States_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Daytona International Speedway",
    credit: "Photo: Andrew Pons a_pons / CC0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Daytona_International_Speedway,_Daytona_Beach,_United_States_(Unsplash).jpg"
  },
  "us-venue-111": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Circuit_of_the_Americas%2C_April_22%2C_2018_SkySat.jpg/1280px-Circuit_of_the_Americas%2C_April_22%2C_2018_SkySat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Circuit of the Americas",
    credit: "Photo: Planet Labs, Inc. / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Circuit_of_the_Americas,_April_22,_2018_SkySat.jpg"
  },
  "us-venue-112": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Sebring_International_Raceway_PNG.png/1280px-Sebring_International_Raceway_PNG.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Sebring International Raceway",
    credit: "Photo: Sirmktg01 / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sebring_International_Raceway_PNG.png"
  },
  "us-venue-114": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Road_America_%2810.25.08%29_-_Mid_Am_-17_Louie_Goss_in_the_pits.jpg/1280px-Road_America_%2810.25.08%29_-_Mid_Am_-17_Louie_Goss_in_the_pits.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Road America",
    credit: "Photo: Royal Broil / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Road_America_(10.25.08)_-_Mid_Am_-17_Louie_Goss_in_the_pits.jpg"
  },
  "us-venue-115": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/IMSA_Demonstrator_vehicles%2C_Lime_Rock_Park%2C_Lakeville%2C_Connecticut_%28USA%29_%2852227228917%29.jpg/1280px-IMSA_Demonstrator_vehicles%2C_Lime_Rock_Park%2C_Lakeville%2C_Connecticut_%28USA%29_%2852227228917%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Lime Rock Park",
    credit: "Photo: Charles from Port Chester, New York / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:IMSA_Demonstrator_vehicles,_Lime_Rock_Park,_Lakeville,_Connecticut_(USA)_(52227228917).jpg"
  },
  "us-venue-116": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Pocono_Raceway_aerial_2018.jpg/1280px-Pocono_Raceway_aerial_2018.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Pocono Raceway",
    credit: "Photo: ZappaOMati / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Pocono_Raceway_aerial_2018.jpg"
  },
  "us-venue-117": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Michigan_International_Speedway.jpg/1280px-Michigan_International_Speedway.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Michigan International Speedway",
    credit: "Photo: Jbrookma / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Michigan_International_Speedway.jpg"
  },
  "us-venue-118": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Texas_Motor_Speedway_Fort_Worth%2C_TX_%E2%80%93_Drivers_get_out_of_their_cars_to_discuses_cars_while_others_such_as_myself_are_just_happy_for_this_rare_opportunity_to_drive_my_own_car_at_the_distinguished_Texas_speedway._-_panoramio.jpg/1280px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Texas Motor Speedway",
    credit: "Photo: Dameon Hudson / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Texas_Motor_Speedway_Fort_Worth,_TX_%E2%80%93_Drivers_get_out_of_their_cars_to_discuses_cars_while_others_such_as_myself_are_just_happy_for_this_rare_opportunity_to_drive_my_own_car_at_the_distinguished_Texas_speedway._-_panoramio.jpg"
  },
  "us-venue-119": {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Churchill_Downs_-_Louisville_Kentucky.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Churchill Downs",
    credit: "Photo: TEDD LiGGETT / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Churchill_Downs_-_Louisville_Kentucky.jpg"
  },
  "us-venue-121": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Belmont_Park_aerial_2021.jpg/1280px-Belmont_Park_aerial_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Belmont Park",
    credit: "Photo: Antony-22 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Belmont_Park_aerial_2021.jpg"
  },
  "us-venue-122": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/142nd_Preakness_Stakes_at_Pimlico_Race_Course%2C_Jockeys_Joel_Rosario_and_Corey_Lanerie.jpg/1280px-142nd_Preakness_Stakes_at_Pimlico_Race_Course%2C_Jockeys_Joel_Rosario_and_Corey_Lanerie.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Pimlico Race Course",
    credit: "Photo: Maryland GovPics / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:142nd_Preakness_Stakes_at_Pimlico_Race_Course,_Jockeys_Joel_Rosario_and_Corey_Lanerie.jpg"
  },
  "us-venue-123": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Aqueduct_Racetrack.jpg/1280px-Aqueduct_Racetrack.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Aqueduct Racetrack",
    credit: "Photo: Ajfidelity / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aqueduct_Racetrack.jpg"
  },
  "us-venue-124": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Going_to_the_Whip_%283432322625%29.jpg/1280px-Going_to_the_Whip_%283432322625%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Santa Anita Park",
    credit: "Photo: Rennett Stowe from USA / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Going_to_the_Whip_(3432322625).jpg"
  },
  "us-venue-125": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Augusta_National_Golf_Club%2C_Augusta%2C_Georgia_%288342847473%29.jpg/1280px-Augusta_National_Golf_Club%2C_Augusta%2C_Georgia_%288342847473%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Augusta National Golf Club",
    credit: "Photo: Boston Public Library / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Augusta_National_Golf_Club,_Augusta,_Georgia_(8342847473).jpg"
  },
  "us-venue-126": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/View_From_Clubhouse_to_16_-_Flickr_-_schnaars.jpg/1280px-View_From_Clubhouse_to_16_-_Flickr_-_schnaars.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Cypress Point Golf Club",
    credit: "Photo: schnaars from San Jose, CA / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:View_From_Clubhouse_to_16_-_Flickr_-_schnaars.jpg"
  },
  "us-venue-127": {
    url: "https://images.pexels.com/photos/9366544/pexels-photo-9366544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Woman golfer stretching with club by ocean, wearing red polo and hat.",
    credit: "Photo: Mikhail Nilov on Pexels",
    creditUrl: "https://www.pexels.com/photo/woman-in-red-polo-shirt-holding-a-golf-club-9366544/",
    illustrative: true
  },
  "us-venue-128": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Pinehurst_No._2.JPG/1280px-Pinehurst_No._2.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Pinehurst No. 2",
    credit: "Photo: Zhans33 / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Pinehurst_No._2.JPG"
  },
  "us-venue-131": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Indian_Wells_Tennis_Garden%2C_Stadium_1.jpg/1280px-Indian_Wells_Tennis_Garden%2C_Stadium_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Indian Wells Tennis Garden",
    credit: "Photo: IvanAndreevich / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Indian_Wells_Tennis_Garden,_Stadium_1.jpg"
  },
  "us-venue-133": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/%2749ers_%2828791895142%29.jpg/1280px-%2749ers_%2828791895142%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kezar Stadium",
    credit: "Photo: Topher. / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:%2749ers_(28791895142).jpg"
  },
  "us-venue-134": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/No_Known_Restrictions_Polo_Grounds_during_World_Series_Game%2C_1913_from_the_Bain_Collection_%28LOC%29_%28434431507%29.jpg/1280px-No_Known_Restrictions_Polo_Grounds_during_World_Series_Game%2C_1913_from_the_Bain_Collection_%28LOC%29_%28434431507%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Polo Grounds",
    credit: "Photo: David Shapinsky from Washington, D.C., United States / CC BY-SA 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:No_Known_Restrictions_Polo_Grounds_during_World_Series_Game,_1913_from_the_Bain_Collection_(LOC)_(434431507).jpg"
  },
  "us-venue-227": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Gfp-texas-san-antonio-large-complex_%281%29.jpg/1280px-Gfp-texas-san-antonio-large-complex_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Alamodome",
    credit: "Photo: Yinan Chen / Public Domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Gfp-texas-san-antonio-large-complex_(1).jpg"
  },
  "us-venue-229": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Aerial_view_of_Nissan_Stadium_%28Tennessee_Titans%29.jpg/1280px-Aerial_view_of_Nissan_Stadium_%28Tennessee_Titans%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Nissan Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Nissan_Stadium_(Tennessee_Titans).jpg"
  },
  "us-venue-240": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/DHS_Agencies_Support_Super_Bowl_LIX_Security_February_2025_-_108.jpg/1280px-DHS_Agencies_Support_Super_Bowl_LIX_Security_February_2025_-_108.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Caesars Superdome",
    credit: "Photo: DHSgov / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:DHS_Agencies_Support_Super_Bowl_LIX_Security_February_2025_-_108.jpg"
  },
  "us-venue-242": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Assembly_Hall_-_Bloomington%2C_IN_-_December_2015.jpg/1280px-Assembly_Hall_-_Bloomington%2C_IN_-_December_2015.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Assembly Hall",
    credit: "Photo: Rhatsa26X / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Assembly_Hall_-_Bloomington,_IN_-_December_2015.jpg"
  },
  "us-venue-248": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/PayPal_Park_pregame_%28Apr_1%2C_2023%29.jpg/1280px-PayPal_Park_pregame_%28Apr_1%2C_2023%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of PayPal Park",
    credit: "Photo: goonerabroad / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:PayPal_Park_pregame_(Apr_1,_2023).jpg"
  },
  "us-venue-254": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Atlanta_Motor_Speedway.jpg/1280px-Atlanta_Motor_Speedway.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Atlanta Motor Speedway",
    credit: "Photo: Kelly A. Tyler / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Atlanta_Motor_Speedway.jpg"
  },
  "us-venue-255": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Hughes_Stadium%2C_Morgan_State_University.jpg/1280px-Hughes_Stadium%2C_Morgan_State_University.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Hughes Stadium",
    credit: "Photo: Marylandstater / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hughes_Stadium,_Morgan_State_University.jpg"
  },
  "us-venue-259": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/David_Booth_Kansas_Memorial_Stadium_aerial_view_2023_-_Quintin_Soloviev.jpg/1280px-David_Booth_Kansas_Memorial_Stadium_aerial_view_2023_-_Quintin_Soloviev.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of David Booth Kansas Memorial Stadium",
    credit: "Photo: Quintinsoloviev / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:David_Booth_Kansas_Memorial_Stadium_aerial_view_2023_-_Quintin_Soloviev.jpg"
  },
  "us-venue-260": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Williams_Stadium_%28Liberty_University%29.jpg/1280px-Williams_Stadium_%28Liberty_University%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Williams Stadium",
    credit: "Photo: Quintin Soloviev / CC BY 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Williams_Stadium_(Liberty_University).jpg"
  },
  "us-venue-261": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Darrell_K_Royal_%E2%80%93_Texas_Memorial_Stadium%2C_Austin%2C_TX_-_panoramio.jpg/1280px-Darrell_K_Royal_%E2%80%93_Texas_Memorial_Stadium%2C_Austin%2C_TX_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Darrell K Royal Texas Memorial Stadium",
    credit: "Photo: Robert Barlow / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Darrell_K_Royal_%E2%80%93_Texas_Memorial_Stadium,_Austin,_TX_-_panoramio.jpg"
  },
  "us-venue-263": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Matt_Knight_Arena_%28Eugene%2C_Oregon%29.jpg/1280px-Matt_Knight_Arena_%28Eugene%2C_Oregon%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Matthew Knight Arena",
    credit: "Photo: Visitor7 / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Matt_Knight_Arena_(Eugene,_Oregon).jpg"
  },
  "us-venue-270": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Baltimore_Memorial_Stadium_abandoned_1.jpg/1280px-Baltimore_Memorial_Stadium_abandoned_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Baltimore Memorial Stadium",
    credit: "Photo: Historic American Buildings Survey/Historic American Engineering Record / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Baltimore_Memorial_Stadium_abandoned_1.jpg"
  },
  "us-venue-303": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Cleveland_Browns_Stadium_2012.jpg/1280px-Cleveland_Browns_Stadium_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Cleveland Browns Stadium",
    credit: "Photo: Erik Drost / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cleveland_Browns_Stadium_2012.jpg"
  },
  "us-venue-311": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Kaseya_Center_Downtown_Miami_FL%2C_5_April_2024.jpg/1280px-Kaseya_Center_Downtown_Miami_FL%2C_5_April_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Kaseya Center",
    credit: "Photo: Phillip Pessar / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kaseya_Center_Downtown_Miami_FL,_5_April_2024.jpg"
  },
  "us-venue-318": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Camp_Randall_Aerial.jpg/1280px-Camp_Randall_Aerial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Camp Randall Stadium",
    credit: "Photo: Lectrician2 / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Camp_Randall_Aerial.jpg"
  },
  "us-venue-320": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Bright_House_Networks_Field_20070318_01.jpg/1280px-Bright_House_Networks_Field_20070318_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of BayCare Ballpark",
    credit: "Photo: P. Bauck ( Sliver7 ) / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bright_House_Networks_Field_20070318_01.jpg"
  },
  "us-venue-321": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/JokerMarchantStadiumLakelandFL.jpg/1280px-JokerMarchantStadiumLakelandFL.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Publix Field at Joker Marchant Stadium",
    credit: "Photo: Mike Russell / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:JokerMarchantStadiumLakelandFL.jpg"
  },
  "us-venue-322": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Stadium6.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Charlotte Sports Park",
    credit: "Photo: User HappyHarvick2962 on en.wikipedia / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stadium6.jpg"
  },
  "us-venue-403": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Shibe_Park_Fans.jpg/1280px-Shibe_Park_Fans.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Shibe Park",
    credit: "Photo: The Library of Congress / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Shibe_Park_Fans.jpg"
  },
  "us-venue-404": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Crosley_Field_1969.jpg/1280px-Crosley_Field_1969.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Crosley Field",
    credit: "Photo: Blake Bolinger from Central NJ, United States / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Crosley_Field_1969.jpg"
  },
  "us-venue-405": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Three_Rivers_Stadium_Pittsburgh_%2827241839874%29.jpg/1280px-Three_Rivers_Stadium_Pittsburgh_%2827241839874%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Three Rivers Stadium",
    credit: "Photo: Steve Tiesdell Legacy Collection / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Three_Rivers_Stadium_Pittsburgh_(27241839874).jpg"
  },
  "us-venue-406": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Riverfront_Stadium_in_Cincinnati%2C_Ohio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Riverfront Stadium",
    credit: "Photo: Flickr user Brent NAshville / CC BY 2.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Riverfront_Stadium_in_Cincinnati,_Ohio.jpg"
  },
  "us-venue-407": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/48/Veterans_stade.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    alt: "A photograph of Veterans Stadium",
    credit: "Photo: NASA / Public domain, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Veterans_stade.png"
  },
  "us-venue-408": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Reliant_Astrodome_in_January_2014.jpg/1280px-Reliant_Astrodome_in_January_2014.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Astrodome",
    credit: "Photo: EricEnfermero / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Reliant_Astrodome_in_January_2014.jpg"
  },
  "us-venue-409": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/BuschMemorialStadium.jpg/1280px-BuschMemorialStadium.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Busch Memorial Stadium",
    credit: "Photo: User Haaron755 on en.wikipedia / CC BY-SA 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:BuschMemorialStadium.jpg"
  },
  "us-venue-410": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Toyota_Stadium.jpeg/1280px-Toyota_Stadium.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Texas Stadium",
    credit: "Photo: Flavius Constantine / CC BY-SA 4.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Toyota_Stadium.jpeg"
  },
  "us-venue-411": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/East_Rutherford%2C_New_Jersey%2C_USA._%27Giants%27_Stadium._September_16%2C_2007_-_panoramio.jpg/1280px-East_Rutherford%2C_New_Jersey%2C_USA._%27Giants%27_Stadium._September_16%2C_2007_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of Giants Stadium",
    credit: "Photo: Gary Miotla / CC BY 3.0, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:East_Rutherford,_New_Jersey,_USA._%27Giants%27_Stadium._September_16,_2007_-_panoramio.jpg"
  },
  "us-venue-412": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/RFK_Stadium_from_Washington_Metro.jpg/1280px-RFK_Stadium_from_Washington_Metro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    alt: "A photograph of RFK Stadium",
    credit: "Photo: Ben Schumin / CC BY-SA 2.5, via Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:RFK_Stadium_from_Washington_Metro.jpg"
  }
};

// src/lib/question-pool.ts
var allQuestions = [
  ...baseQuestions,
  ...stadiumQuestions,
  ...eventQuestions,
  ...athleteQuestions,
  ...usaVenueQuestions,
  ...usaVenueQuestionsTwo,
  ...usaVenueQuestionsThree,
  ...usaOutlyingQuestions,
  ...usaStoryQuestions
];
var HELD_BACK = /* @__PURE__ */ new Set([
  "e1",
  "e12",
  "e32",
  "a11",
  "us-venue-093",
  "us-story-004",
  "us-story-005",
  "us-story-009",
  "us-story-010",
  "us-story-011",
  "us-story-012",
  "us-story-013",
  "us-story-014",
  "us-story-015",
  "us-story-016",
  "us-story-017",
  "us-story-021",
  "us-story-022",
  "us-story-024",
  "us-story-025",
  "us-story-026"
]);
function withoutRepeats(questions) {
  const seenVenues = /* @__PURE__ */ new Set();
  const seenPoints = /* @__PURE__ */ new Set();
  const kept = [];
  for (const question of questions) {
    if (HELD_BACK.has(question.id)) continue;
    const venue = (question.venue ?? "").trim().toLowerCase();
    if (venue && seenVenues.has(venue)) continue;
    if (venue) seenVenues.add(venue);
    let lat = question.lat;
    let lng = question.lng;
    let point = `${lat},${lng}`;
    let tries = 0;
    while (seenPoints.has(point) && tries < 40) {
      lat = Number((lat + 7e-4).toFixed(4));
      lng = Number((lng - 7e-4).toFixed(4));
      point = `${lat},${lng}`;
      tries += 1;
    }
    seenPoints.add(point);
    kept.push(
      tries === 0 ? question : { ...question, lat, lng }
    );
  }
  return kept;
}
var uniqueQuestions = withoutRepeats(allQuestions);
var questionPool = uniqueQuestions.map((question) => {
  const image = questionImages[question.id];
  return image && !question.image ? { ...question, image } : question;
});

// src/lib/numbers.ts
function roundScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

// src/lib/date-utils.ts
function dateKey(date = /* @__PURE__ */ new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}
function addDays(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function diffDays(from, to) {
  const start = parseDateKey(from).getTime();
  const end = parseDateKey(to).getTime();
  return Math.round((end - start) / 864e5);
}
function formatFullDayLabel(key) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

// src/lib/time-bonus.ts
var LOCATION_SHARE = 0.9;
var TIME_SHARE = 0.1;
var MAX_QUESTION_SCORE = 100;
var STAKE_SCHEDULE = [
  100,
  100,
  100,
  100,
  100,
  100,
  100,
  150,
  200,
  250
];
function stakeForQuestion(index) {
  const position = Math.max(0, Math.floor(Number(index) || 0));
  if (position < STAKE_SCHEDULE.length) return STAKE_SCHEDULE[position];
  return STAKE_SCHEDULE[STAKE_SCHEDULE.length - 1];
}
function maxRoundScore(questionCount) {
  const count = Math.max(0, Math.floor(Number(questionCount) || 0));
  let total = 0;
  for (let i = 0; i < count; i++) total += stakeForQuestion(i);
  return roundScore(total);
}
var MAX_TIME_POINTS_PER_QUESTION = MAX_QUESTION_SCORE * TIME_SHARE;

// src/lib/regions.ts
var REGIONS = [
  {
    id: "usa",
    label: "United States",
    shortLabel: "USA",
    emoji: "\u{1F1FA}\u{1F1F8}",
    countries: ["United States"],
    view: {
      center: [-96, 38],
      zoom: 3.4,
      // One country on a sphere is mostly empty space, so the American round
      // stays on the flat map.
      projection: "mercator",
      // The country itself, from the Pacific coast to the Atlantic and from
      // the Canadian border down to the Gulf. The map is framed on this, so
      // the whole of it is on the screen with room to spare.
      fit: [
        [-125.5, 24.5],
        [-66.5, 50]
      ],
      // How far the player may pan. It is much larger than the framed area
      // on purpose: a ground just over the border with Canada, in Florida or
      // in Mexico has to be reachable, and there has to be room to get there.
      //
      // Alaska and Hawaii are in here as well. They are far from the rest of
      // the country, but they are part of it, and a player has to be able to
      // reach a question about Anchorage or Honolulu.
      bounds: [
        [-172, 18],
        [-58, 71.5]
      ]
    }
  },
  {
    id: "world",
    label: "World",
    shortLabel: "World",
    emoji: "\u{1F30D}",
    countries: null,
    // The American questions have their own round. Mixing them into the
    // world round meant that half of it was about American football, which
    // put off everybody who was not American and added nothing for those
    // who were.
    excludeCountries: ["United States"],
    view: {
      // The middle of the framed world, so the map is already showing the
      // whole planet in the first frame - before the map has loaded and the
      // box below can be fitted to the screen. The globe leans towards
      // Europe and Africa, the part of the world most players read first.
      center: [20, 15],
      zoom: 0.6,
      // The world round is a globe. A flat map of the whole planet is a strip
      // that wraps around itself; the sphere is what "the world" looks like,
      // it never repeats the planet, and at this zoom it fits a phone screen
      // as well as a desktop one.
      projection: "globe",
      // Start closer than the fitted whole planet, with Europe and Africa
      // filling the view instead of a small ball in the middle.
      globeZoomBoost: 1.05,
      // The frame a flat map would use, if the round were ever played on one.
      // The globe is framed by its own size instead - see `globeFrame` in
      // map-framing - because a sphere fitted with bounds comes out a
      // different size on every screen. This box still describes the world
      // the round covers, and the tests check that every question is inside
      // it.
      fit: [
        [-180, -58],
        [180, 78]
      ],
      // Nothing to pan out of: the world round is the whole world.
      bounds: null
    }
  }
];
var DEFAULT_REGION = "usa";
function getRegion(id) {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}
function questionsForRegion(pool, region) {
  const resolved = typeof region === "string" ? getRegion(region) : region;
  const allowed = resolved.countries ? new Set(resolved.countries) : null;
  const excluded = resolved.excludeCountries ? new Set(resolved.excludeCountries) : null;
  if (!allowed && !excluded) return pool;
  return pool.filter((question) => {
    if (allowed) return allowed.has(question.country);
    if (excluded) return !excluded.has(question.country);
    return true;
  });
}
function regionSeed(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = hash * 31 + id.charCodeAt(i) | 0;
  }
  return hash >>> 0;
}

// src/lib/game-data.ts
function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dateToSeed(dateString) {
  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10) || 0;
  const month = parseInt(parts[1], 10) || 0;
  const day = parseInt(parts[2], 10) || 0;
  return year * 1e4 + month * 100 + day >>> 0;
}
var DAILY_QUESTION_COUNT = 10;
function venueKey(question) {
  if (question.venue) return question.venue.toLowerCase();
  return `${question.lat.toFixed(2)},${question.lng.toFixed(2)}`;
}
function getDailyQuestionsForDay(dayKey, regionId = DEFAULT_REGION) {
  const pool = questionsForRegion(questionPool, regionId);
  const offset = diffDays(ROTATION_START_DAY, dayKey);
  if (!Number.isFinite(offset) || offset < 0) {
    const seed = (dateToSeed(dayKey) ^ regionSeed(regionId)) >>> 0;
    return pickRound(shuffle(pool, seededRandom(seed)));
  }
  return pickRound(rotationOrder(pool, regionId, offset));
}
var ROTATION_START_DAY = "2026-11-01";
function rotationOrder(pool, regionId, offset) {
  const length = Math.max(1, Math.floor(pool.length / DAILY_QUESTION_COUNT));
  const cycle = Math.floor(offset / length);
  const position = offset % length;
  const rounds = roundsFor(pool, regionId, cycle, length);
  const round = rounds[position] ?? [];
  return [...round, ...rounds.flat().filter((question) => !round.includes(question))];
}
var roundsCache = /* @__PURE__ */ new Map();
function roundsFor(pool, regionId, cycle, length) {
  const key = `${regionId}:${pool.length}:${cycle}`;
  const cached = roundsCache.get(key);
  if (cached) return cached;
  const seed = (Math.imul(cycle + 1, 2654435761) ^ regionSeed(regionId)) >>> 0;
  let deck = shuffle(pool, seededRandom(seed));
  if (cycle > 0) {
    const previous = roundsFor(pool, regionId, cycle - 1, length);
    const lastDay = new Set(previous[length - 1] ?? []);
    deck = [
      ...deck.filter((question) => !lastDay.has(question)),
      ...deck.filter((question) => lastDay.has(question))
    ];
  }
  const rounds = [];
  let remaining = deck;
  for (let day = 0; day < length; day++) {
    const round = pickDistinct(remaining);
    rounds.push(round);
    remaining = remaining.filter((question) => !round.includes(question));
  }
  roundsCache.set(key, rounds);
  return rounds;
}
function shuffle(questions, random) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function pickDistinct(candidates) {
  const picked = [];
  const usedVenues = /* @__PURE__ */ new Set();
  const usedPoints = /* @__PURE__ */ new Set();
  for (const question of candidates) {
    if (picked.length >= DAILY_QUESTION_COUNT) break;
    const key = venueKey(question);
    const point = `${question.lat.toFixed(3)},${question.lng.toFixed(3)}`;
    if (usedVenues.has(key) || usedPoints.has(point)) continue;
    usedVenues.add(key);
    usedPoints.add(point);
    picked.push(question);
  }
  return picked;
}
function pickRound(shuffled) {
  const picked = pickDistinct(shuffled);
  if (picked.length < DAILY_QUESTION_COUNT) {
    for (const question of shuffled) {
      if (picked.length >= DAILY_QUESTION_COUNT) break;
      if (!picked.includes(question)) picked.push(question);
    }
  }
  return picked;
}

// src/lib/game-state.ts
var DAILY_QUESTION_COUNT2 = 10;
var MAX_DAILY_SCORE = maxRoundScore(DAILY_QUESTION_COUNT2);
var MAX_LOCATION_SCORE = Math.round(MAX_DAILY_SCORE * LOCATION_SHARE * 10) / 10;
var MAX_TIME_SCORE = MAX_TIME_POINTS_PER_QUESTION * DAILY_QUESTION_COUNT2;

// server/_lib/round.ts
var DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
function isDayKey(value) {
  return typeof value === "string" && DAY_PATTERN.test(value);
}
function nextDayKey(dayKey) {
  return shiftDayKey(dayKey, 1);
}
function shiftDayKey(dayKey, days) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// server/_lib/daily-rounds.ts
function isQuestion(value) {
  if (!value || typeof value !== "object") return false;
  const question = value;
  return typeof question.id === "string" && typeof question.text === "string" && typeof question.lat === "number" && typeof question.lng === "number";
}
var stored = /* @__PURE__ */ new Map();
async function storedRound(day, region) {
  const key = `${day}:${region}`;
  const cached = stored.get(key);
  if (cached) return cached;
  if (!isBackendConfigured()) return null;
  try {
    const response = await supabase(
      `/rest/v1/daily_rounds?select=questions&day_key=eq.${encodeURIComponent(day)}&region=eq.${region}&limit=1`
    );
    if (!response.ok) return null;
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const questions = rows[0].questions;
    if (!Array.isArray(questions) || questions.length === 0 || !questions.every(isQuestion)) {
      return null;
    }
    stored.set(key, questions);
    return questions;
  } catch {
    return null;
  }
}
async function dailyRound(day, region) {
  return await storedRound(day, region) ?? getDailyQuestionsForDay(day, region);
}

// src/lib/html.ts
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// newsletter/daily.ts
var WHITE_PIN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGESURBVFhH1devTgQxEMfxkydPnrxHQCJ5BCQSiUQicUgkhgSJ5BGQSIJCniQoJO47pEk3uf2x2z/baQKf5Nx25rbbTqer1X8FHJvZyeFPn3EXkgIPwJdNAL6BRzM71bFNzGwLPGnCFODZzI40VrX41h+aoESckTONWSx+22aL/oSZ7Za+uQozUf05ar95DvCqOWZ5Tf2Ec801KW4ld8CL5vrFzNbxm/Wy05wjscJ1k90RoYrpIE/ApeYcAS50kLNrzTkSpkhHOLvSnCMdt+AgvRXNbKMjnOUrYjzJ3AF7zTWp10IEbjTXrFC7NUCLeLCtNc+sDosxvfimhKKhUZYAbjV2sbBvNWAN4E5jVls6E8C9xloMeNMEKcBn1aLLqT2ksodOrdgnFPWIsZ/YaIxmpWuhadWnVHRLWx3rJrydZjsUumkd4ype01KzkD/tWs3dGYq6Xg/hLTV55HsrTtGeAXjXZ7rSwuReeEoMPUP1We9lKExVnY6nWJj2XQtPTvau99f9AP3u56Sa7JF7AAAAAElFTkSuQmCC";
var DAILY_COPY = {
  usa: {
    subject: "Today's USA Challenge \u2014 ten questions, 1,300 points",
    preheader: "Ten American questions about the places where sport happens. One map, one round, everyone gets the same ten.",
    headline: "The USA Challenge",
    intro: "Ten American questions about stadiums, ballparks, arenas and the races that decide them.",
    round: "Ten questions. 1,300 points. One map.",
    button: "Play today's round",
    boardHeading: "On the board",
    boardEmpty: "Nobody has put a score on the board yet today. The first one is yours.",
    mixHeading: "Today's mix",
    footer: "One email a day, every morning. Free, and you can leave whenever you like."
  },
  world: {
    subject: "Today's World Challenge \u2014 ten questions, the whole planet",
    preheader: "Ten questions about Formula 1, the Champions League and the rest of the world, on a globe.",
    headline: "The World Challenge",
    intro: "Ten questions about Formula 1, the Champions League and the rest of the world, on a globe.",
    round: "Ten questions. 1,300 points. The whole planet.",
    button: "Play today's round",
    boardHeading: "On the board",
    boardEmpty: "Nobody has put a score on the board yet today. The first one is yours.",
    mixHeading: "Today's mix",
    footer: "One email a day, every morning. Free, and you can leave whenever you like."
  }
};
function roundPath(region) {
  return region === "world" ? "/world" : "/daily";
}
function roundUrl(site, region, day) {
  const base = site.replace(/\/$/, "");
  return `${base}${roundPath(region)}?date=${encodeURIComponent(day)}&utm_source=newsletter&utm_medium=email&utm_campaign=${region}-daily&utm_content=${encodeURIComponent(day)}`;
}
function leaderboardUrl(site, region) {
  const base = site.replace(/\/$/, "");
  return `${base}/leaderboard?utm_source=newsletter&utm_medium=email&utm_campaign=${region}-daily&utm_content=leaderboard`;
}
var CATEGORY_NAMES = {
  stadium: "stadium",
  event: "event",
  club: "club",
  athlete: "athlete"
};
function categoryName(category) {
  const key = category.trim().toLowerCase();
  return CATEGORY_NAMES[key] ?? key;
}
function points(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}
function mixLine(categories) {
  const counts = /* @__PURE__ */ new Map();
  for (const category of categories) {
    const key = category.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(
    ([category, count]) => `${count} ${categoryName(category)}${count === 1 ? "" : "s"}`
  ).join(" \xB7 ");
}
function leaderboardPanel(entries, empty, link) {
  const top = entries.slice(0, 3).map((entry) => `${entry.nickname} ${points(entry.score)}`).join(" \xB7 ");
  const message = top ? `Top scores: ${top}. Can you top it?` : empty;
  return `<tr><td style="padding:26px 24px 0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#1F3447;border-radius:14px;">
<tr>
<td width="66" valign="top" style="width:66px;padding:20px 0 20px 18px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" valign="middle" width="48" height="48" bgcolor="#F5B82E" style="width:48px;height:48px;background:#F5B82E;border-radius:999px;font-size:23px;line-height:48px;">&#127942;</td>
</tr></table>
</td>
<td valign="middle" style="padding:18px 10px 18px 0;">
<p style="margin:0 0 5px 0;font-size:10px;line-height:15px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#F5B82E;">The leaderboard</p>
<p style="margin:0;font-size:14px;line-height:21px;color:#F7FAFC;">${escapeHtml(message)}</p>
</td>
<td width="52" align="right" valign="middle" style="width:52px;padding:18px 16px 18px 0;">
<a href="${escapeHtml(link)}" target="_blank" style="display:inline-block;width:34px;height:34px;border:1px solid #8FA5B5;border-radius:999px;color:#FFFFFF;font-size:17px;line-height:34px;text-align:center;text-decoration:none;">&#8594;</a>
</td>
</tr>
</table>
</td></tr>`;
}
function ctaButton(link, label, align = "center") {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${align}" style="padding:18px 0 0 0;text-align:${align};">
<a href="${escapeHtml(link)}" target="_blank" style="display:inline-block;background:#F4494F;border:1px solid #F4494F;border-radius:999px;color:#FFFFFF;font-size:14px;line-height:20px;font-weight:800;letter-spacing:0.03em;padding:15px 26px;text-decoration:none;text-transform:uppercase;">&#9655;&nbsp; ${escapeHtml(label)} &nbsp;&#8594;</a>
</td></tr></table>`;
}
function featuredBlock(featured, options) {
  if (!featured) return "";
  const badge = `<a href="${escapeHtml(featured.link)}" target="_blank" style="position:absolute;top:14px;left:14px;z-index:2;display:inline-block;background:#F4494F;border-radius:999px;padding:9px 14px;text-decoration:none;">
<p style="margin:0;font-size:10px;line-height:15px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#FFFFFF;"><img src="${WHITE_PIN}" width="10" height="13" alt="" style="display:inline-block;width:10px;height:13px;border:0;vertical-align:-1px;margin:0 5px 0 0;" />Today's challenge</p>
</a>`;
  const image = featured.image ? `<tr><td style="padding:0 18px 0;">
<div style="position:relative;">
${badge}
<a href="${escapeHtml(featured.link)}" target="_blank" style="display:block;text-decoration:none;">
<img src="${escapeHtml(featured.image.url)}" alt="${escapeHtml(featured.image.alt)}" width="516" style="display:block;width:100%;max-width:516px;height:auto;border:0;border-radius:12px;" />
</a>
</div>
</td></tr>` : `<tr><td style="padding:16px 18px 0;">${badge.replace("position:absolute;", "")}</td></tr>`;
  return `<tr><td style="padding:24px 24px 0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#FFFFFF;border:1px solid #F1E4DE;border-radius:17px;overflow:hidden;">
<tr><td style="padding:22px 22px 0;text-align:center;">
<a href="${escapeHtml(featured.link)}" target="_blank" style="display:block;color:#1F3447;text-decoration:none;">
<p style="margin:0 0 8px 0;font-size:11px;line-height:16px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#F4494F;">Question 1 of ${options.questionCount} &nbsp;&middot;&nbsp; ${points(options.maxScore)} points</p>
<h1 style="margin:0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:27px;line-height:35px;font-weight:800;letter-spacing:-0.5px;color:#1F3447;">${escapeHtml(featured.question)}</h1>
</a>
</td></tr>
${image}
<tr><td style="padding:12px 22px 18px;text-align:center;">
${ctaButton(featured.link, options.buttonLabel)}
<p style="margin:9px 0 0 0;font-size:12px;line-height:18px;color:#7B8A99;text-align:center;">Think you know American sport? Click the map, guess the stadium, and climb the leaderboard.</p>
</td></tr>
</table>
</td></tr>`;
}
function previousBlock(previous) {
  const cards = (previous ?? []).slice(0, 2);
  if (cards.length === 0) return "";
  const cells = cards.map((item, index) => {
    const title = index === 0 ? "Yesterday's Challenge" : "Earlier Challenge";
    const description = index === 0 ? "Revisit the previous round." : "Test your stadium knowledge.";
    const image = item.image ? `<tr><td style="padding:0;">
<img src="${escapeHtml(item.image.url)}" alt="${escapeHtml(item.image.alt)}" width="240" height="120" style="display:block;width:100%;height:120px;object-fit:cover;border:0;" />
</td></tr>` : "";
    return `<td class="challenge-card" width="50%" valign="top" style="width:50%;padding:${cards.length === 2 ? index === 0 ? "0 6px 0 0" : "0 0 0 6px" : "0"};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" title="${escapeHtml(item.question)}" style="width:100%;background:#FFFFFF;border:1px solid #F0E4DE;border-radius:12px;overflow:hidden;">
<tr><td style="height:4px;background:#F4494F;font-size:0;line-height:0;">&nbsp;</td></tr>
${image}
<tr><td style="padding:15px 15px 17px;">
<p style="margin:0 0 4px 0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:17px;line-height:23px;font-weight:800;color:#1F3447;">${escapeHtml(title)}</p>
<p style="margin:0 0 12px 0;font-size:12px;line-height:18px;color:#7B8A99;">${escapeHtml(description)}</p>
<a href="${escapeHtml(item.link)}" target="_blank" title="Play now" aria-label="Play now" style="display:inline-block;background:#FFFFFF;border:1px solid #F4494F;border-radius:999px;color:#F04450;font-size:11px;line-height:16px;font-weight:800;letter-spacing:0.06em;padding:10px 16px;text-decoration:none;text-transform:uppercase;text-align:left;">Play again &nbsp;&#8594;</a>
</td></tr>
</table>
</td>`;
  }).join("");
  return `<tr><td style="padding:30px 43px 0 43px;">
<p style="margin:0 0 4px 0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:20px;line-height:27px;font-weight:800;letter-spacing:-0.2px;color:#1F3447;">Your next challenge</p>
<p style="margin:0 0 14px 0;font-size:13px;line-height:20px;color:#7B8A99;">Missed a day? The action continues.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
</td></tr>`;
}
function buildDailyNewsletter(input) {
  const region = input.region ?? "usa";
  const copy = DAILY_COPY[region];
  const site = input.site.replace(/\/$/, "");
  const link = roundUrl(site, region, input.day);
  const primaryLink = input.featured?.link ?? link;
  const maxScore = input.maxScore ?? 1300;
  const questionCount = input.questionCount ?? 10;
  const entries = (input.entries ?? []).slice(0, 3);
  const dayLabel = formatFullDayLabel(input.day);
  const mix = mixLine(input.categories ?? []);
  const featuredButton = region === "usa" ? "Play today's USA challenge" : "Play today's world challenge";
  const featuredMarkup = featuredBlock(input.featured, {
    maxScore,
    questionCount,
    buttonLabel: featuredButton
  });
  const previousMarkup = previousBlock(input.previous);
  const leaderboardMarkup = leaderboardPanel(
    entries,
    copy.boardEmpty,
    leaderboardUrl(site, region)
  );
  const standaloneCta = input.featured ? "" : `<tr><td align="center" style="padding:24px 24px 0 24px;">${ctaButton(primaryLink, copy.button)}</td></tr>`;
  const extraMarkup = input.featured ? "" : `<tr><td align="center" style="padding:14px 24px 0 24px;">
${mix ? `<p style="margin:0 0 7px 0;font-size:11px;line-height:17px;color:#9AA1B2;">${escapeHtml(mix)}</p>` : ""}
<p style="margin:0;font-size:11px;line-height:17px;color:#9AA1B2;">A perfect round is worth <strong>${points(maxScore)} points</strong>. Same ten questions for everyone.</p>
</td></tr>`;
  const subject = copy.subject;
  const preheader = copy.preheader;
  const html = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<style type="text/css">
@media only screen and (max-width: 520px) {
  .challenge-card { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
}
</style>
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F7;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#F5F5F7;border-collapse:collapse;">
<tr><td align="center" style="padding:24px 10px 30px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFDFB;border:1px solid #F1E4DE;border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">

<tr><td align="center" style="background:#FAF7F2;padding:26px 24px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
<td width="66" valign="middle" style="width:66px;padding:0 10px 0 0;">
<img src="${escapeHtml(site)}/email-icon.png" width="64" height="64" alt="USA GeoArena" style="display:block;width:64px;height:64px;border:0;" />
</td>
<td valign="middle" style="text-align:left;">
<img src="${escapeHtml(site)}/email-wordmark-site.png" width="190" height="33" alt="USA GeoArena" style="display:block;width:190px;max-width:100%;height:auto;border:0;" />
</td>
</tr></table>
<p style="margin:10px 0 0 0;font-size:10px;line-height:16px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#F4494F;">${escapeHtml(dayLabel)}</p>
</td></tr>

<tr><td style="padding:0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#F4494F" style="height:1px;background:#F4494F;font-size:0;line-height:0;">&nbsp;</td></tr></table>
</td></tr>

<tr><td align="center" style="padding:9px 24px 0;">
<p style="margin:0;font-size:10px;line-height:16px;color:#9AA1B2;">Not Interested? Reply STOP to unsubscribe</p>
</td></tr>

${featuredMarkup}

${standaloneCta}

${extraMarkup}

${previousMarkup}

${leaderboardMarkup}

<tr><td align="center" style="padding:28px 24px 24px;background:#FAF7F2;border-top:1px solid #F1E4DE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;"><tr>
<td width="40" valign="middle" style="width:40px;padding:0 8px 0 0;"><img src="${escapeHtml(site)}/email-icon.png" width="36" height="36" alt="USA GeoArena" style="display:block;width:36px;height:36px;border:0;" /></td>
<td valign="middle" style="text-align:left;"><img src="${escapeHtml(site)}/email-wordmark-site.png" width="110" height="19" alt="USA GeoArena" style="display:block;width:110px;max-width:100%;height:auto;border:0;" /></td>
</tr></table>
<p style="margin:0 0 12px 0;font-size:11px;line-height:18px;color:#68798A;">
<a href="${escapeHtml(site)}/about" target="_blank" title="About USA GeoArena" style="color:#52677A;text-decoration:none;">About</a> &nbsp;|&nbsp;
<a href="${escapeHtml(site)}/terms" target="_blank" style="color:#52677A;text-decoration:none;">Terms</a> &nbsp;|&nbsp;
<a href="${escapeHtml(site)}/privacy" target="_blank" style="color:#52677A;text-decoration:none;">Privacy</a> &nbsp;|&nbsp;
<a href="*|UPDATE_PROFILE|*" target="_blank" style="color:#52677A;text-decoration:none;">Email Preferences</a> &nbsp;|&nbsp;
<a href="*|UNSUB|*" target="_blank" style="color:#52677A;text-decoration:none;">Unsubscribe</a>
</p>
<p style="margin:0 0 8px 0;font-size:12px;line-height:19px;color:#7B8A99;">One map. Ten questions. Your next personal best.</p>
<p title="Disclaimer" style="margin:0 0 12px 0;font-size:10px;line-height:16px;color:#9AA1B2;">USA GeoArena is a free daily sports geography game. Content is for entertainment and general knowledge only. Team and league marks belong to their owners.</p>
<p style="margin:0;font-size:10px;line-height:16px;color:#9AA1B2;">&copy; ${escapeHtml(input.day.slice(0, 4))} USA GeoArena. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
  const textLines = [
    `USA GeoArena - ${copy.headline}`,
    dayLabel,
    "",
    ...input.featured ? [
      input.featured.label.toUpperCase(),
      input.featured.question,
      primaryLink,
      ""
    ] : [],
    copy.round,
    copy.intro,
    "",
    featuredButton.toUpperCase(),
    primaryLink,
    "",
    ...input.previous?.length ? [
      "YOUR NEXT CHALLENGE",
      ...input.previous.flatMap((item) => [
        `${item.label}: ${item.question}`,
        item.link
      ]),
      ""
    ] : [],
    copy.boardHeading.toUpperCase(),
    ...entries.length ? entries.map((entry, index) => `${index + 1}. ${entry.nickname} - ${points(entry.score)} points`) : [copy.boardEmpty],
    ...mix ? ["", copy.mixHeading.toUpperCase(), mix] : [],
    "",
    `A perfect round is worth ${points(maxScore)} points. Everybody gets the same ten questions, so nobody can play early and win.`,
    "",
    "---",
    copy.footer,
    "",
    "ABOUT USA GEOARENA",
    "At USA GeoArena, every question is a new adventure. Dive into a world of excitement where quick thinking and sports knowledge collide. Whether you are testing your memory, exploring new places, or chasing your personal best - USA GeoArena makes learning feel like play.",
    "",
    "DISCLAIMER",
    "Access to USA GeoArena emails, website, and materials is subject to our Terms of Use and Privacy Policy. Content is for general knowledge and entertainment only - not a substitute for professional advice.",
    "",
    "Update your email preferences or unsubscribe here: *|UNSUB|*",
    `(c) ${input.day.slice(0, 4)} USA GeoArena. All rights reserved. - ${site}`
  ];
  return { subject, preheader, html, text: textLines.join("\n") };
}

// server/_lib/daily-email.ts
function siteUrl() {
  return String(process.env.SITE_URL || "https://geo-arena-six.vercel.app").replace(/\/$/, "");
}
function todayKey2() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function questionsFor(day, region) {
  try {
    return await dailyRound(day, region);
  } catch {
    return [];
  }
}
async function categoriesFor(day, region) {
  return (await questionsFor(day, region)).map((question) => question.category);
}
async function questionCard(day, region, label) {
  const question = (await questionsFor(day, region))[0];
  if (!question) return null;
  return {
    question: question.text,
    link: roundUrl(siteUrl(), region, day),
    label,
    image: question.image
  };
}
async function boardEntries(day, region) {
  if (!isBackendConfigured()) return [];
  try {
    const days = encodeURIComponent(`(${day},${nextDayKey(day)})`);
    const response = await supabase(
      `/rest/v1/global_scores?select=score,accuracy,nickname&day_key=in.${days}&region=eq.${region}&order=score.desc&limit=3`
    );
    if (!response.ok) return [];
    const rows = await response.json();
    if (!Array.isArray(rows)) return [];
    return rows.slice(0, 3).map((row) => {
      const record = row;
      return {
        nickname: String(record.nickname ?? "Anonymous"),
        score: Number(record.score) || 0,
        accuracy: Number(record.accuracy) || 0
      };
    });
  } catch {
    return [];
  }
}
async function buildDailyEmail(day, region) {
  const site = siteUrl();
  const featured = await questionCard(day, region, "Today's first question");
  const previous = (await Promise.all([
    questionCard(addDays(day, -1), region, "Yesterday"),
    questionCard(addDays(day, -2), region, "Two days ago")
  ])).filter((item) => Boolean(item));
  return buildDailyNewsletter({
    day,
    site,
    region,
    entries: await boardEntries(day, region),
    categories: await categoriesFor(day, region),
    featured: featured ?? void 0,
    previous
  });
}

// server/_lib/node-adapter.ts
function requestHeaders(request) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === void 0) continue;
    if (Array.isArray(value)) {
      for (const part of value) headers.append(name, part);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}
async function requestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return void 0;
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : void 0;
}
function universal(webHandler) {
  return async function handler2(requestOrRequest, response) {
    if (requestOrRequest instanceof Request) {
      return webHandler(requestOrRequest);
    }
    if (!response) {
      throw new Error("The Node response object is missing.");
    }
    const request = requestOrRequest;
    const protocol = String(request.headers["x-forwarded-proto"] || "https");
    const host = String(request.headers.host || "localhost");
    const webRequest = new Request(`${protocol}://${host}${request.url || "/"}`, {
      method: request.method,
      headers: requestHeaders(request),
      body: await requestBody(request)
    });
    const webResponse = await handler2(webRequest);
    if (!(webResponse instanceof Response)) {
      throw new Error("The handler did not return a Response.");
    }
    response.statusCode = webResponse.status;
    webResponse.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(Buffer.from(await webResponse.arrayBuffer()));
  };
}

// server/admin/newsletter.ts
function sameToken(provided, expected) {
  if (provided.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}
function isAdmin(request) {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;
  return sameToken(request.headers.get("x-admin-token") ?? "", expected);
}
async function handler(request) {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    return json({ error: "ADMIN_SECRET is not set on this deployment." }, 503);
  }
  if (!isAdmin(request)) {
    return json({ error: "That admin token is not valid." }, 401);
  }
  if (request.method !== "GET") {
    return json({ error: "That is not something this route does." }, 405);
  }
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") === "world" ? "world" : "usa";
  const asked = searchParams.get("day");
  const day = isDayKey(asked) ? asked : todayKey2();
  const download = searchParams.get("download") === "1" || searchParams.get("format") === "html";
  const email = await buildDailyEmail(day, region);
  if (download) {
    return new Response(email.html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
        "content-disposition": `attachment; filename="geoarena-${day}-${region}.html"`
      }
    });
  }
  return new Response(
    JSON.stringify({
      day,
      region,
      subject: email.subject,
      preheader: email.preheader,
      html: email.html,
      text: email.text
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex"
      }
    }
  );
}
var newsletter_default = universal(handler);
module.exports = module.exports.default ?? module.exports;
