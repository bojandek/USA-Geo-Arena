#!/usr/bin/env node
/**
 * Find a photograph for every question on Wikimedia Commons.
 *
 * A quiz question is about one place, so the picture has to be of that place,
 * not of a town with a similar name and not of the metro station next door.
 * The lookup therefore starts with the Wikipedia pages around the question's
 * coordinates, keeps the page whose title matches the venue, and only then
 * asks Commons for the licence of the page's lead image.
 *
 * When no page is a confident match the question is left without a picture.
 * That is deliberate: a wrong photograph teaches the wrong thing.
 *
 * Usage:
 *   npm run images:fetch
 *   npm run images:fetch -- --limit 20
 *   npm run images:fetch -- --only 1,2,3
 *   npm run images:fetch -- --refresh
 *
 * The script writes src/lib/question-images.ts and keeps its lookup cache in
 * scripts/.question-images-cache.json (ignored by git).
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { questionPool } from '../src/lib/question-pool.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'src', 'lib', 'question-images.ts');
const CACHE = path.join(ROOT, 'scripts', '.question-images-cache.json');

const WIKIPEDIA = 'https://en.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const PEXELS = 'https://api.pexels.com/v1/search';
const USER_AGENT =
  process.env.WIKIMEDIA_USER_AGENT ??
  'GeoArena/1.0 (https://geoarena.com; hello@geoarena.com) photo lookup';

const args = process.argv.slice(2);
const limit = numberArg('--limit');
const only = listArg('--only');
const refresh = args.includes('--refresh');
const debug = args.includes('--debug');
const fillPexels = args.includes('--fill-pexels');

/** Words that say nothing about which place a page is about. */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'at', 'in', 'on', 'de', 'del', 'della',
  'der', 'die', 'das', 'du', 'des', 'la', 'le', 'les', 'el', 'los', 'las',
  'da', 'do', 'dos', 'di', 'van', 'von', 'st', 'saint',
]);

/** Words that describe a kind of place rather than a particular one. */
const VENUE_WORDS = new Set([
  'stadium', 'stade', 'arena', 'ground', 'grounds', 'park', 'olympic',
  'olympics', 'national', 'club', 'centre', 'center', 'city', 'circuit',
  'autodromo', 'estadio', 'estadi', 'parc', 'speedway', 'sports', 'sport',
  'complex', 'international', 'grand', 'prix', 'nacional', 'nazionale',
  'olimpico', 'olimpica', 'metropolitano', 'municipal', 'communal',
  'provincial', 'regional', 'central', 'banco', 'street', 'road',
]);

/** The word that tells a stadium page from the gym next door to it. */
const TYPE_WORDS = new Set([
  'stadium', 'stade', 'arena', 'ground', 'estadio', 'estadi', 'circuit',
  'autodromo', 'speedway', 'court', 'club', 'park', 'center', 'centre',
  'field',
]);

const PAGE_HINTS = new RegExp(
  '\\b(stadium|arena|ground|sports?|venue|football|soccer|baseball|' +
    'basketball|hockey|tennis|golf|racing|race|circuit|track|olympic|' +
    'complex|park|lake|resort|island|theatre|theater|concert|hall|club)\\b',
  'i',
);

const BAD_PAGE_WORDS = [
  'metro', 'station', 'museum', 'funicular', 'tram', 'bus', 'airport',
  'hotel', 'disambiguation', 'trophy', 'award', 'film', 'song', 'album',
  'book', 'video game', 'company', 'school', 'university', 'hospital',
  'church', 'cathedral', 'cemetery', 'list of', 'training', 'theatre',
  'theater', 'proposed', 'planned', 'future', 'under construction',
  'demolition', 'demolished', 'city hall', 'federal building', 'courthouse',
  'post office', 'theme park', 'amusement park',
];

const BAD_FILE_WORDS = [
  'logo', 'map', 'diagram', 'plan', 'flag', 'crest', 'seal', 'ticket',
  'poster', 'program', 'stamp', 'badge', 'icon', 'board', 'sign', 'plaque',
  'notice', 'banner', 'training', 'theatre', 'theater', 'maqueta', 'model',
  'render', 'rendering', 'construction', 'under construction', 'demolition',
  'ruin', 'ruins', 'emblem', 'escudo', 'bust', 'statue', 'monument',
];

/** Buildings that are in a town but do not show the town. */
const CITY_BAD_FILE_WORDS = [
  'hall', 'building', 'church', 'library', 'museum', 'hotel', 'school',
  'house', 'station', 'airport', 'bank', 'post office', 'federal',
  'courthouse', 'sign',
];

const WIDE_VIEW = /downtown|skyline|aerial|panorama|waterfront|harbou?r|valley|view|coast|beach|mountain/i;

/**
 * Places whose names are shared by several real places, where an automatic
 * Commons match kept picking the wrong one. They need a person to choose the
 * picture; until then the card simply has no photo.
 */
const MANUAL_REVIEW = new Set([
  'us-venue-094', // Ohio Stadium: an ornament, not the stadium
  'us-venue-120', // Saratoga Race Course: picked a speedway in Malta
  'us-venue-256', // Eastern Michigan Stadium: picked Michigan Stadium
  'us-venue-306', // "Domestic" is not a place
  'us-out-012', // Ketchikan: a shuttle bus
  'us-out-013', // Homer, Alaska: picked Homer, Nebraska
  'us-out-016', // Nomé: picked a painting
  'us-story-002', // Centennial Olympic Stadium: picked a different stadium
  'us-story-007', // Pontiac Silverdome: picked the city
  'us-story-023', // North Avenue Pool: picked a pool in Hong Kong
  's86', // Nürburgring: a 1927 drawing of the old track
  'us-venue-113', // Watkins Glen International: picked the state park
  'us-venue-127', // Pebble Beach Golf Links: picked an equestrian centre
  'us-venue-129', // Torrey Pines Golf Course: picked the nature reserve
  'us-venue-130', // Bandon Dunes: picked a state natural area
  'us-venue-267', // Neyland Field: picked McGee Field
  'us-out-006', // Wailuku: picked a mission, not the town
]);

/** A better stock query for the places Commons could not identify. */
const PEXELS_MANUAL_QUERY = new Map([
  ['s86', 'Nürburgring race track Germany'],
  ['us-venue-094', 'American football stadium Ohio State'],
  ['us-venue-113', 'Watkins Glen International race track'],
  ['us-venue-120', 'Saratoga Race Course horse racing'],
  ['us-venue-127', 'Pebble Beach golf course'],
  ['us-venue-129', 'golf course ocean cliffs California'],
  ['us-venue-130', 'Bandon Dunes golf course Oregon'],
  ['us-venue-256', 'Eastern Michigan football stadium'],
  ['us-venue-267', 'American football stadium Tennessee'],
  ['us-venue-306', 'Atlanta Georgia city skyline'],
  ['us-out-006', 'Wailuku Maui Hawaii town'],
  ['us-out-012', 'Ketchikan Alaska'],
  ['us-out-013', 'Homer Alaska town'],
  ['us-out-016', 'Alaska landscape'],
  ['us-story-002', 'Atlanta stadium skyline'],
  ['us-story-007', 'American football stadium Michigan'],
  ['us-story-023', 'swimming pool lanes'],
]);

const waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function numberArg(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = Number(args[index + 1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function listArg(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return new Set(
    (args[index + 1] ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalise(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(venue) {
  return normalise(venue)
    .split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function looksLikeEvent(question) {
  const venue = normalise(question.venue);
  const hasVenueType = words(question.venue).some((word) => TYPE_WORDS.has(word));
  if (hasVenueType) return false;

  const hasYear = /\b(?:18|19|20)\d{2}\b/.test(venue);
  const eventWord =
    /\b(world series|world cup|final|championship|super bowl|ncaa|all star|tournament|pennant|trials?|olympic games|games)\b/.test(
      venue,
    );
  return hasYear || eventWord;
}

function hasBadWord(text, venue, list) {
  const haystack = ` ${normalise(text)} `;
  const venueWords = ` ${normalise(venue)} `;
  return list.some(
    (word) =>
      haystack.includes(` ${normalise(word)} `) &&
      !venueWords.includes(` ${normalise(word)} `),
  );
}

function hasBadFileWord(text, venue) {
  const haystack = normalise(text);
  const venueText = normalise(venue);
  return BAD_FILE_WORDS.some(
    (word) =>
      haystack.includes(normalise(word)) && !venueText.includes(normalise(word)),
  );
}

function titleScore(page, question) {
  const venue = question.venue;
  const title = normalise(page.title);
  const description = page.pageprops?.['wikibase-shortdesc'] ?? '';
  const descriptionText = normalise(description);
  if (hasBadWord(`${page.title} ${description}`, venue, BAD_PAGE_WORDS)) {
    return -Infinity;
  }
  if (page.pageprops?.disambiguation) return -Infinity;

  const venueText = normalise(venue);
  const isOld =
    /\b(former|demolished|demolition|defunct|closed|gamla)\b/.test(
      `${title} ${descriptionText}`,
    ) && !/\b(old|former|gamla)\b/.test(venueText);
  if (isOld) return -Infinity;

  const venueWords = words(venue);
  const pageText = `${title} ${descriptionText}`;
  const venueTypes = venueWords.filter((word) => TYPE_WORDS.has(word));
  const wantedTypes =
    venueTypes.length > 0
      ? venueTypes
      : question.category === 'stadium'
        ? [...TYPE_WORDS]
        : [];
  const wantsVenue = wantedTypes.length > 0;
  const hasVenueType = wantedTypes.some((word) => pageText.includes(word));
  if (wantsVenue && !hasVenueType) return -Infinity;
  if (venueTypes.length > 0) {
    const typeInTitle =
      venueTypes.some((word) => title.includes(word)) ||
      title === venueText ||
      venueText.startsWith(`${title} `);
    if (!typeInTitle) return -Infinity;
  }

  const hits = venueWords.filter((word) => title.includes(word));
  if (hits.length === 0) return -Infinity;

  const exact = title === venueText;
  const distinctive = venueWords.filter(
    (word) => !VENUE_WORDS.has(word) && word.length >= 5,
  );
  const distinctiveHit = distinctive.some((word) => title.includes(word));
  if (!exact && !title.includes(venueText) && !distinctiveHit) {
    // "Estadio Nacional" is the name of a dozen grounds. A page that only
    // shares the words "estadio" and "nacional" is not this ground.
    return -Infinity;
  }

  let score = hits.length * 10;
  if (exact) score += 40;
  else if (title.includes(venueText)) score += 20;
  if (PAGE_HINTS.test(description)) score += 15;
  const typeHit = venueWords.some(
    (word) =>
      TYPE_WORDS.has(word) &&
      (title.includes(word) || descriptionText.includes(word)),
  );
  if (typeHit) score += 20;
  if (/\bformer\b|\bdemolished\b/.test(normalise(description))) return -Infinity;
  if (/\b(?:18|19|20)\d{2}\b/.test(title) && !/\b(?:18|19|20)\d{2}\b/.test(venueText)) {
    return -Infinity;
  }
  return score;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLng = (lng2 - lng1) * radians;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}


let lastRequest = 0;

async function api(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams({
    ...params,
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    maxlag: '5',
  }).toString();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const wait = 180 - (Date.now() - lastRequest);
    if (wait > 0) await waiting(wait);
    lastRequest = Date.now();

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Api-User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.error?.code === 'maxlag') {
        await waiting(2000 * (attempt + 1));
        continue;
      }
      return data;
    }

    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }
    await waiting(1500 * (attempt + 1));
  }

  throw new Error(`Wikimedia kept failing: ${url}`);
}

function pagesNear(question) {
  return api(WIKIPEDIA, {
    generator: 'geosearch',
    ggscoord: `${question.lat}|${question.lng}`,
    ggsradius: '10000',
    ggsnamespace: '0',
    ggslimit: '50',
    prop: 'coordinates|pageimages|pageprops',
    piprop: 'thumbnail|name',
    pithumbsize: '1200',
    ppprop: 'wikibase-shortdesc|disambiguation',
    colimit: 'max',
  }).then((data) => data.query?.pages ?? []);
}

function pagesBySearch(question) {
  return api(WIKIPEDIA, {
    generator: 'search',
    gsrsearch: `${question.venue} ${question.country}`,
    gsrlimit: '12',
    gsrnamespace: '0',
    prop: 'coordinates|pageimages|pageprops',
    piprop: 'thumbnail|name',
    pithumbsize: '1200',
    ppprop: 'wikibase-shortdesc|disambiguation',
    colimit: 'max',
  }).then((data) => data.query?.pages ?? []);
}

function pageWithinReach(page, question) {
  const coordinates = page.coordinates?.[0];
  if (coordinates) {
    return (
      distanceKm(question.lat, question.lng, coordinates.lat, coordinates.lon) <= 50
    );
  }

  // Some Wikipedia pages have no coordinates in the API response. Accept one
  // only when its title is the venue itself, or when a distinctive word from
  // the venue appears together with a venue word in its description.
  const title = normalise(page.title);
  if (title === normalise(question.venue)) return true;
  const distinctive = words(question.venue).filter(
    (word) => !VENUE_WORDS.has(word) && word.length >= 5,
  );
  return (
    distinctive.some((word) => title.includes(word)) &&
    PAGE_HINTS.test(page.pageprops?.['wikibase-shortdesc'] ?? '')
  );
}

function rankedPages(pages, question) {
  return pages
    .filter((page) => page.pageimage && pageWithinReach(page, question))
    .map((page) => {
      const coordinates = page.coordinates?.[0];
      return {
        page,
        score: titleScore(page, question),
        distance: coordinates
          ? distanceKm(question.lat, question.lng, coordinates.lat, coordinates.lon)
          : null,
      };
    })
    .filter((entry) => Number.isFinite(entry.score))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.distance ?? Infinity) - (b.distance ?? Infinity) ||
        a.page.title.length - b.page.title.length,
    )
    .map((entry) => entry.page);
}

function commonsFilesNear(question) {
  return api(COMMONS, {
    generator: 'geosearch',
    ggscoord: `${question.lat}|${question.lng}`,
    ggsradius: '1000',
    ggsnamespace: '6',
    ggslimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1200',
  }).then((data) => data.query?.pages ?? []);
}

function commonsFilesBySearch(question) {
  return api(COMMONS, {
    generator: 'search',
    gsrsearch: `${question.venue} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1200',
  }).then((data) => data.query?.pages ?? []);
}

function commonsInfo(fileName) {
  return api(COMMONS, {
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1200',
  }).then((data) => data.query?.pages?.[0]?.imageinfo?.[0] ?? null);
}

function fileTitleScore(file, question) {
  const title = normalise(String(file.title ?? '').replace(/^File:/, ''));
  if (hasBadFileWord(title, question.venue)) return -Infinity;

  const venueWords = words(question.venue);
  const cityLike = !venueWords.some((word) => TYPE_WORDS.has(word));
  if (cityLike && hasBadWord(title, question.venue, CITY_BAD_FILE_WORDS)) {
    return -Infinity;
  }
  const distinctive = venueWords.filter(
    (word) => !VENUE_WORDS.has(word) && word.length >= 3,
  );
  const strongHits = distinctive.filter((word) => title.includes(word));
  if (strongHits.length === 0) return -Infinity;
  if (distinctive.length > 1 && strongHits.length < 2) return -Infinity;

  const hits = venueWords.filter((word) => title.includes(word));
  const exactVenue = title.includes(normalise(question.venue));
  const typeWords = venueWords.filter((word) => TYPE_WORDS.has(word));
  const typeHit = typeWords.some((word) => title.includes(word));
  if (
    (typeWords.length > 0 || question.category === 'stadium') &&
    !typeHit &&
    !exactVenue
  ) {
    return -Infinity;
  }

  let score = hits.length * 10 + strongHits.length * 20;
  if (exactVenue) score += 30;
  if (title.startsWith(normalise(question.venue))) score += 20;
  if (cityLike && WIDE_VIEW.test(title)) score += 20;

  const hintWords = words(question.hint ?? '').filter(
    (word) => word.length >= 4 && !VENUE_WORDS.has(word),
  );
  const hintHits = hintWords.filter((word) => title.includes(word));
  score += Math.min(hintHits.length, 2) * 15;

  return score;
}

function licenceOf(metadata) {
  const name = cleanText(
    metadata?.LicenseShortName?.value ?? metadata?.License?.value ?? '',
  );
  const key = normalise(name);
  const free =
    key === 'cc0' ||
    key.includes('public domain') ||
    key.startsWith('pd ') ||
    key.startsWith('cc by');
  const forbidden = /gfdl|\bfal\b|non free|copyright|fair use/.test(key);
  return free && !forbidden ? name : null;
}

function imageFromInfo(info, question, fileName) {
  if (!info) return { image: null, reason: 'Commons has no image info' };
  if (hasBadFileWord(fileName, question.venue)) {
    return { image: null, reason: 'file looks like a logo or a map' };
  }
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) {
    return { image: null, reason: `unsupported mime ${info.mime ?? '?'}` };
  }
  if (info.width < 800 || info.height < 450) {
    return { image: null, reason: `too small (${info.width}x${info.height})` };
  }
  const ratio = info.width / info.height;
  if (ratio < 0.5 || ratio > 4) {
    return { image: null, reason: `unusual aspect ratio ${ratio.toFixed(2)}` };
  }

  const metadata = info.extmetadata ?? {};
  const licence = licenceOf(metadata);
  if (!licence) {
    return { image: null, reason: 'no free licence on Commons' };
  }

  const artist = cleanText(
    metadata.Artist?.value ?? metadata.Credit?.value ?? '',
  ).slice(0, 90);
  const requiresCredit =
    /^(cc by|cc by sa)/.test(normalise(licence)) ||
    normalise(metadata.AttributionRequired?.value ?? '') === 'true';
  if (requiresCredit && !artist) {
    return { image: null, reason: 'licence needs an author that is missing' };
  }

  const url = info.thumburl ?? info.url;
  if (!url || !info.descriptionurl) {
    return { image: null, reason: 'Commons gave no image URL' };
  }

  return {
    image: {
      url,
      alt: `A photograph of ${question.venue}`,
      credit: artist
        ? `Photo: ${artist} / ${licence}, via Wikimedia Commons`
        : `Photo: ${licence}, via Wikimedia Commons`,
      creditUrl: info.descriptionurl,
    },
    source: {
      file: fileName,
      licence,
      page: info.descriptionurl,
    },
  };
}

async function resolveQuestion(question) {
  if (MANUAL_REVIEW.has(String(question.id))) {
    return {
      image: null,
      reason: 'needs a human-checked picture',
    };
  }
  if (looksLikeEvent(question)) {
    return {
      image: null,
      reason: 'venue describes an event, not a place',
    };
  }

  const near = await pagesNear(question);
  const search = await pagesBySearch(question);
  const pages = [...near, ...search].filter(
    (page, index, all) =>
      all.findIndex((other) => other.pageid === page.pageid) === index,
  );

  let pageReason = 'no matching Wikipedia page';
  const ranked = rankedPages(pages, question);
  if (debug) {
    console.log(
      `  pages: ${ranked
        .slice(0, 5)
        .map((page) => page.title)
        .join(' | ') || 'none'}`,
    );
  }
  for (const page of ranked.slice(0, 5)) {
    const info = await commonsInfo(page.pageimage);
    const built = imageFromInfo(info, question, page.pageimage);
    if (built.image) {
      return { ...built, source: { ...built.source, pageTitle: page.title } };
    }
    pageReason = built.reason;
  }

  // A distinctive venue name is enough to search Commons directly. Generic
  // names ("Estadio Nacional") are not: the same name exists in many cities.
  const nearFiles = await commonsFilesNear(question);
  const searchFiles = await commonsFilesBySearch(question);
  if (debug) {
    console.log(
      `  commons raw: near ${nearFiles.length}, search ${searchFiles.length}; ` +
        `${searchFiles
          .slice(0, 5)
          .map((file) => file.title)
          .join(' | ')}`,
    );
  }
  const candidates = [
    ...nearFiles.map((file) => ({ file, bonus: 15 })),
    ...searchFiles.map((file) => ({ file, bonus: 0 })),
  ]
    .filter((entry) => entry.file.imageinfo?.[0])
    .map((entry) => {
      const score = fileTitleScore(entry.file, question);
      if (debug && Number.isFinite(score)) {
        console.log(`  scored: ${entry.file.title} (${score + entry.bonus})`);
      }
      return { file: entry.file, score: score + entry.bonus };
    })
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (debug) {
    console.log(
      `  commons: ${candidates
        .slice(0, 8)
        .map((entry) => `${entry.file.title} (${entry.score})`)
        .join(' | ') || 'none'}`,
    );
  }

  let lastReason = pageReason;
  for (const candidate of candidates.slice(0, 8)) {
    const built = imageFromInfo(
      candidate.file.imageinfo[0],
      question,
      candidate.file.title,
    );
    if (built.image) return built;
    lastReason = built.reason;
  }

  return { image: null, reason: lastReason };
}

function pexelsQuery(question) {
  const manual = PEXELS_MANUAL_QUERY.get(String(question.id));
  if (manual) return manual;
  const venue = question.venue.replace(/^the\s+/i, '').trim();
  if (venue.length >= 3) return venue;
  return question.text.replace(/[?.]$/g, '').slice(0, 80);
}

async function resolvePexels(question) {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    return { image: null, reason: 'PEXELS_API_KEY is not set' };
  }

  const queries = [pexelsQuery(question)];
  if (!looksLikeEvent(question)) {
    queries.push(`${pexelsQuery(question)} ${question.country}`);
  }

  let lastReason = 'Pexels returned no photo';
  for (const query of queries) {
    const url = new URL(PEXELS);
    url.search = new URLSearchParams({
      query,
      per_page: '15',
      orientation: 'landscape',
      size: 'large',
    }).toString();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(url, {
        headers: {
          Authorization: key,
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
      });

      if (response.status === 429) {
        await waiting(5000 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        lastReason = `Pexels ${response.status} for “${query}”`;
        break;
      }

      const data = await response.json();
      const photo = (data.photos ?? []).find(
        (item) => item.src?.large && item.src?.original,
      );
      if (!photo) {
        lastReason = `Pexels found no photo for “${query}”`;
        break;
      }

      const alt = cleanText(photo.alt ?? '').slice(0, 160);
      const creditUrl = photo.url;
      if (!creditUrl?.startsWith('https://www.pexels.com/')) {
        lastReason = 'Pexels photo has no page link';
        break;
      }

      return {
        image: {
          url: photo.src.large2x ?? photo.src.large ?? photo.src.original,
          alt: alt || `An illustrative photograph for ${question.venue}`,
          credit: `Photo: ${photo.photographer || 'Pexels'} on Pexels`,
          creditUrl,
          illustrative: true,
        },
        source: {
          provider: 'pexels',
          photo: photo.id,
          query,
        },
      };
    }
  }

  return { image: null, reason: lastReason };
}

function render(entries) {
  const lines = [
    '/**',
    ' * Photographs of the places in the quiz.',
    ' *',
    ' * Generated from Wikimedia Commons by scripts/fetch-question-images.mjs.',
    ' * Missing places may fall back to a Pexels stock photo; those are marked',
    ' * as illustrative, because a stock photo is not proof of the exact place.',
    ' * Run `npm run images:fetch` after changing the question pool; do not edit',
    ' * this file by hand.',
    ' *',
    ' * A picture is only shown once the answer is known, and the credit links',
    ' * back to the Commons file page. The licence is part of the credit.',
    ' */',
    '',
    "import type { Question } from './question-types.ts';",
    '',
    "type QuestionImage = NonNullable<Question['image']>;",
    '',
    'export const questionImages: Record<string, QuestionImage> = {',
  ];

  for (const [id, image] of entries) {
    lines.push(`  ${JSON.stringify(id)}: {`);
    lines.push(`    url: ${JSON.stringify(image.url)},`);
    lines.push(`    alt: ${JSON.stringify(image.alt)},`);
    lines.push(`    credit: ${JSON.stringify(image.credit)},`);
    lines.push(`    creditUrl: ${JSON.stringify(image.creditUrl)},`);
    if (image.illustrative) lines.push('    illustrative: true,');
    lines.push('  },');
  }

  lines.push('};', '');
  return lines.join('\n');
}

const CACHE_VERSION = 1;

async function readCache() {
  try {
    const parsed = JSON.parse(await readFile(CACHE, 'utf8'));
    if (parsed.version === CACHE_VERSION && parsed.entries) return parsed.entries;
  } catch {
    // No cache yet, or it was written by an older version. Start fresh.
  }
  return {};
}

async function writeCache(entries) {
  await writeFile(
    CACHE,
    `${JSON.stringify({ version: CACHE_VERSION, entries }, null, 2)}\n`,
    'utf8',
  );
}

async function main() {
  const cache = await readCache();
  let questions = questionPool.filter(
    (question) => !only || only.has(String(question.id)),
  );
  if (limit) questions = questions.slice(0, limit);
  if (fillPexels) {
    questions = questions.filter(
      (question) => refresh || !cache[question.id]?.image,
    );
  }
  if (refresh) {
    for (const question of questions) delete cache[question.id];
  }

  const entries = [];
  const misses = [];

  for (const [index, question] of questions.entries()) {
    const label = `${String(index + 1).padStart(3, ' ')}/${questions.length}`;
    const cached = cache[question.id];

    if (!fillPexels && cached && !refresh) {
      if (cached.image) entries.push([String(question.id), cached.image]);
      else misses.push({ question, reason: cached.reason });
      console.log(`${label} ${question.id} ${question.venue} (cached)`);
      continue;
    }

    let result;
    try {
      result = fillPexels
        ? await resolvePexels(question)
        : await resolveQuestion(question);
    } catch (error) {
      result = {
        image: null,
        reason: error instanceof Error ? error.message : String(error),
      };
    }

    cache[question.id] = { ...result, checkedAt: new Date().toISOString() };
    await writeCache(cache);

    if (result.image) {
      entries.push([String(question.id), result.image]);
      console.log(`${label} ${question.id} ${question.venue} ✓`);
    } else {
      misses.push({ question, reason: result.reason });
      console.log(`${label} ${question.id} ${question.venue} — ${result.reason}`);
    }
  }

  const finalEntries = questionPool
    .map((question) => {
      const cached = cache[question.id];
      return cached?.image ? [String(question.id), cached.image] : null;
    })
    .filter(Boolean);

  const finalMisses = questionPool
    .filter((question) => !cache[question.id]?.image)
    .map((question) => ({
      question,
      reason: cache[question.id]?.reason ?? 'no picture',
    }));

  finalEntries.sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  await writeFile(OUTPUT, render(finalEntries), 'utf8');

  console.log('');
  console.log(
    `Wrote ${finalEntries.length} pictures to src/lib/question-images.ts; ` +
      `${finalMisses.length} questions have no picture.`,
  );
  if (finalMisses.length > 0) {
    console.log('Questions left without a picture:');
    for (const { question, reason } of finalMisses) {
      console.log(`  ${question.id} | ${question.venue} | ${reason}`);
    }
  }
}

await main();

