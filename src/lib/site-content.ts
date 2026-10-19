/**
 * Content and link definitions for the informational (non-game) pages.
 *
 * The header dropdown and the footer both read their links from here, so the
 * navigation can never drift out of sync with the pages that exist.
 */

export interface SitePageSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Reference links rendered under the section (e.g. a partner's policy). */
  links?: { label: string; href: string }[];
}

export interface SitePage {
  /** URL path, without a leading slash. */
  path: string;
  /** Document title, also used as the page heading. */
  title: string;
  /** One-line summary shown under the heading. */
  lede: string;
  /** "Last updated" line. */
  updated: string;
  sections: SitePageSection[];
}

/** Contact address used across the informational pages. */
export const CONTACT_EMAIL = 'contact@geoarena.com';

export const SITE_PAGES: SitePage[] = [
  {
    path: 'about',
    title: 'About Us',
    lede: 'GeoArena is a free geography quiz about the places where sport actually happens.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'GeoArena is a daily geography game. You get ten questions about stadiums, race circuits, record-breaking performances and sporting landmarks, you click a spot on the world map, and the closer your guess is to the real location, the more points you score.',
          'Every player gets exactly the same ten questions on the same day. The selection is generated deterministically from the date, so the challenge is genuinely the same for everyone and there is no advantage in playing early.',
        ],
      },
      {
        heading: 'What we are not',
        paragraphs: [
          'GeoArena has no accounts, no sign-up and no in-app purchases. It is free, and it is kept free by the advertising you see on the site. Your progress is stored only in your own browser, on your own device. If you clear your browser data, your progress goes with it, and we have no copy of it.',
        ],
      },
      {
        heading: 'What we do',
        bullets: [
          'A daily challenge of ten questions, identical for every player',
          'A practice mode that never affects your score or streak',
          'A battle mode against a simulated opponent',
          'An archive that lets you replay any of the last thirty days',
          'A "no labels" map mode, so the map never gives the answer away',
          'Local stats, levels, streaks and achievements',
        ],
      },
      {
        heading: 'The map',
        paragraphs: [
          'Base map tiles are served by CARTO, a third-party mapping provider. Requests for those tiles go to CARTO and their servers see your IP address and the area of the map you are looking at. We do not receive that information and we do not store it.',
        ],
      },
    ],
  },
  {
    path: 'team',
    title: 'Our Team',
    lede: 'A small independent project built by a handful of people.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'GeoArena is a small, independent project. There is no company behind it, no investors and no growth team. The people below cover every part of the product.',
        ],
      },
      {
        heading: 'Editorial',
        paragraphs: [
          'Chooses the locations, writes the questions, verifies that every coordinate points at the right venue and keeps the facts accurate. If a stadium is renamed or a record is broken, the question pool is updated.',
        ],
      },
      {
        heading: 'Engineering',
        paragraphs: [
          'Builds and maintains the app, the deterministic daily question generator, the scoring rules and the local-first progress storage.',
        ],
      },
      {
        heading: 'Design',
        paragraphs: [
          'Responsible for the look and feel of the game, the map interactions and the accessibility of the interface on small screens.',
        ],
      },
      {
        heading: 'Community',
        paragraphs: [
          'Plays the game, reports a wrong location, a bad coordinate or an out-of-date fact, and tells us when a question is too hard. Every correction that comes from a report ends up in the next release.',
        ],
      },
      {
        heading: 'Work with us',
        paragraphs: [
          'If you found a mistake in a question, or you want to suggest a location we are missing, get in touch. Correcting the data is the most useful thing anyone can do for this project.',
        ],
      },
    ],
  },
  {
    path: 'editorial',
    title: 'Editorial Policy',
    lede: 'How every question, coordinate and fact in GeoArena is selected and checked.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'This page explains the rules we follow when we write and maintain the questions. A geography game is only worth playing if the locations it asks about are real and the coordinates are correct, so the criteria below are deliberately strict.',
        ],
      },
      {
        heading: 'What makes a good location',
        bullets: [
          'It is a real, well-documented place that can be pointed at on a map',
          'It has a stable, widely agreed-upon location - a stadium, a circuit, an arena, a monument',
          'It is meaningful to a general sports fan, not only to a specialist',
          'It is not so obscure that the question becomes a guessing exercise',
        ],
      },
      {
        heading: 'How coordinates are set',
        paragraphs: [
          'Every coordinate refers to the venue itself, not to the city centre and not to a nearby landmark. For a stadium that means the centre of the pitch area inside the bowl. Where a large venue has several distinct sites, we use the one that the question is actually about and we say so in the hint.',
        ],
      },
      {
        heading: 'How facts are checked',
        paragraphs: [
          'Every fact is drawn from the public record: the venue official site, the governing body, the competition organiser or a reputable reference work. We do not use facts we cannot attribute. We also avoid facts that are likely to change within months, such as a current tenant or a scheduled renovation, unless the fact itself is about a change.',
        ],
      },
      {
        heading: 'How the daily set is chosen',
        paragraphs: [
          'The question pool is shuffled with a random number generator seeded by the calendar date, and the first ten are served. The same seed always produces the same ten questions, which is why every player sees an identical challenge on any given day. The pool is large enough that consecutive days do not repeat.',
        ],
      },
      {
        heading: 'Corrections',
        paragraphs: [
          'If a coordinate is wrong, a fact is out of date or a question is unfair, we want to know. Reports are acted on and the fix ships in the next update. We do not remove a question because it turned out to be difficult - difficulty is the point - but we do remove one that is ambiguous or that cannot be answered from the hint alone.',
        ],
      },
    ],
  },
  {
    path: 'contact',
    title: 'Contact Us',
    lede: 'Corrections, questions, bug reports and everything else.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'The fastest way to reach us is email. We read everything, and we answer most messages within a few working days.',
        ],
      },
      {
        heading: 'Get in touch',
        paragraphs: [
          `Email: ${CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'What to write about',
        bullets: [
          'A wrong location, a wrong coordinate or an out-of-date fact - please include the question text',
          'A question that you think is unfair, ambiguous or impossible to answer',
          'A bug, with the browser and device you saw it on',
          'A location you think belongs in the pool',
          'Everything else',
        ],
      },
      {
        heading: 'What we cannot do',
        paragraphs: [
          'We cannot restore a progress history that was cleared from your browser, and we cannot see the progress of any individual player, because progress is stored only on your own device and is never sent to us.',
        ],
      },
    ],
  },
  {
    path: 'privacy',
    title: 'Privacy Policy',
    lede: 'What we collect, what our ad partners collect, and how to control it.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'GeoArena is free and supported by advertising. That means an advertising network is involved, and this page explains exactly what that means for your data.',
          'The short version: your game progress never leaves your device and we never see it. Our advertising partner - Google AdSense - does collect information about how you use this site, and may share that information with other companies.',
        ],
      },
      {
        heading: 'What is stored on your device',
        paragraphs: [
          'When you play, the app writes your scores, streak, level, achievements and daily history into your browser local storage, under the key geoarena-storage. Your map style preference, your cookie choice and the day on which the streak popup was last shown are stored there as well.',
          'This data stays in your browser. It is never uploaded, and it is never visible to us. Clearing your browser data for this site deletes it permanently, and there is no backup we could restore it from.',
        ],
      },
      {
        heading: 'What we do not collect',
        bullets: [
          'No name, email address or any other identifier that you give us',
          'No account, and no sign-in of any kind',
          'No location data from your device - the map marker is where you clicked, not where you are',
          'No copy of your game progress, your scores or your history',
        ],
      },
      {
        heading: 'Advertising and cookies',
        paragraphs: [
          'This site uses Google AdSense to display advertisements. Google and its partners use cookies, device identifiers and similar technologies to collect and use information as you visit this and other sites.',
          'The consent banner is shown before any advertising cookie is set, and nothing is loaded from Google until you have chosen. If you pick "Necessary only", ads still appear but they are not personalised and you are not added to an interest-based audience. You can change your choice at any time with the "Privacy settings" link in the footer.',
          'You can also opt out of personalised advertising in the Google Ads Settings, through the Your Online Choices tool, or by using a browser that sends the Global Privacy Control signal.',
        ],
        links: [
          { label: 'Google - How Google uses data when you use our partners sites', href: 'https://policies.google.com/technologies/partner-sites' },
          { label: 'Google - Privacy & Terms', href: 'https://policies.google.com/privacy' },
          { label: 'Your Online Choices (EU consent)', href: 'https://www.youronlinechoices.com/' },
          { label: 'Google Ads Settings', href: 'https://adssettings.google.com/' },
        ],
      },
      {
        heading: 'What our advertising partners collect',
        bullets: [
          'Your IP address',
          'The device and browser you use, and your screen size',
          'The pages you visit on this site and the ads you interact with',
          'The referring page and, if you arrived from a search engine, your search query',
          'An approximate location, usually derived from your IP address',
        ],
      },
      {
        heading: 'Third parties',
        paragraphs: [
          'Google uses vendors and advertising partners that may set or read cookies in your browser in order to serve ads. Google publishes the current list of participating vendors, and you can opt out of individual vendors there.',
          'Base map tiles are served by CARTO, a third-party mapping provider. Loading map tiles sends a request to CARTO servers, which necessarily see your IP address and the part of the map you are viewing. That is a relationship between you and CARTO, governed by their privacy policy, not by this one. We do not receive or store that information.',
        ],
        links: [
          { label: 'Google - List of advertising partners and vendors', href: 'https://www.google.com/adsense/partner-vendors' },
          { label: 'CARTO - Privacy Policy', href: 'https://carto.com/privacy/' },
        ],
      },
      {
        heading: 'Legal bases (GDPR)',
        paragraphs: [
          'Where the GDPR applies, we rely on your consent for advertising and analytics cookies and for the processing of personal data by Google for personalised advertising. You may withdraw that consent at any time using "Privacy settings" in the footer. You also have the right to lodge a complaint with your national data protection authority.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'GeoArena is not directed at children under 13, and we do not knowingly collect personal information from them. Because our advertising partners may use cookies and device identifiers, this site is not suitable for children, so please do not let a child under 13 use it. If you believe a child has given us personal information, contact us and we will help you get it removed.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Under the GDPR and the CCPA you have rights over your personal information, including the right to access, correct, delete, and opt out of its sale or sharing. For your game progress, clearing your browser data is all that is required. For advertising data, you can opt out through the consent banner, the Google Ads Settings, the Your Online Choices tool, or a browser that supports the Global Privacy Control signal.',
          'We hold no personal information about you ourselves, so we cannot serve a subject access request for it. We can pass such a request on to Google, who will handle it in line with their own procedures.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'If we change what is collected - for example by adding accounts or a global leaderboard - this page will be updated before that feature ships, and the change will be dated.',
        ],
      },
    ],
  },
  {
    path: 'terms',
    title: 'Terms of Use',
    lede: 'The agreement between you and GeoArena.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'By using GeoArena you agree to the terms below. If you do not agree with them, please do not use the site.',
        ],
      },
      {
        heading: 'The service',
        paragraphs: [
          'GeoArena is provided free of charge, for personal, non-commercial use. It is a game, and it is provided as is. We may change, suspend or withdraw any part of it at any time, and we may change these terms at any time by updating this page.',
        ],
      },
      {
        heading: 'Advertising',
        paragraphs: [
          'GeoArena is free and is supported by advertising. Third-party vendors, including Google, display advertisements on this site. They may use cookies or similar technologies to serve and measure ads, and may personalise them based on your prior visits to this and other websites.',
          'You can opt out of personalised advertising through the "Privacy settings" link in the footer, in the Google Ads Settings, or through the Your Online Choices tool. Ads served through this site are not endorsements by GeoArena of the products or services that are advertised, and we do not control or endorse third-party content, links or privacy practices.',
        ],
      },
      {
        heading: 'Your progress',
        paragraphs: [
          'Your progress is stored only in your browser. You are responsible for your own device and your own data. We cannot recover progress that has been cleared, and we cannot transfer it between devices or browsers.',
        ],
      },
      {
        heading: 'Acceptable use',
        bullets: [
          'Do not attempt to disrupt the service or gain unauthorised access to it',
          'Do not scrape, republish or resell the question content as your own',
          'Do not use the site to break the law or to infringe the rights of others',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The GeoArena name, the design of the site, and the original question wording and facts are owned by the project and protected by copyright. Facts about stadiums, competitions and athletes are themselves largely public information, and are used here in an editorial way. Third-party names, logos and trademarks belong to their respective owners and are used to identify the locations and organisations the questions are about.',
        ],
      },
      {
        heading: 'No warranty',
        paragraphs: [
          'GeoArena is provided without warranty of any kind, express or implied, including fitness for a particular purpose. The location data, while carefully checked, may still contain errors, and the game is not a substitute for a reliable atlas.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by law, the project is not liable for any indirect or consequential loss arising from your use of GeoArena.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of the jurisdiction in which the project is based, without regard to conflict of law rules.',
        ],
      },
    ],
  },
  {
    path: 'do-not-sell',
    title: 'Do Not Sell My Personal Information',
    lede: 'How to opt out of the sale or sharing of your personal information.',
    updated: 'October 19, 2026',
    sections: [
      {
        paragraphs: [
          'This site is supported by advertising, and our advertising partner may share information about your use of this site with other companies in ways that are treated as a "sale" or "sharing" under the California Consumer Privacy Act and similar laws. This page explains how to opt out.',
          'The simplest way to opt out is to use the "Privacy settings" link in the footer and choose "Necessary only". You can do this at any time and it takes effect immediately.',
        ],
      },
      {
        heading: 'What happens when you opt out',
        paragraphs: [
          'Ads will still appear on this site, but they will not be personalised and you will not be added to an interest-based audience for remarketing. Your browser will still be allowed to store the strictly necessary cookies that keep the site working.',
        ],
      },
      {
        heading: 'Other ways to opt out',
        bullets: [
          'Visit the Google Ads Settings and turn on "Do not personalise ads" - this applies to your Google account across the web',
          'Use the Your Online Choices tool to opt out of participating vendors',
          'Use a browser or extension that sends the Global Privacy Control signal',
          'Block third-party cookies for this site in your browser settings',
        ],
        links: [
          { label: 'Google Ads Settings', href: 'https://adssettings.google.com/' },
          { label: 'Your Online Choices', href: 'https://www.youronlinechoices.com/' },
        ],
      },
      {
        heading: 'The one exception, and it is not yours',
        paragraphs: [
          'Base map tiles are served by CARTO. Loading those tiles sends a request to CARTO servers, which necessarily sees your IP address and the area of the map being viewed. That information is handled by CARTO under their own privacy policy.',
        ],
      },
      {
        heading: 'Requests',
        paragraphs: [
          'If you would like a copy of any information you believe we hold, or you have a question about this page, contact us and we will respond. We hold no personal information about you ourselves, so in practice the answer is always the same: we hold none.',
        ],
      },
    ],
  },
];

/** Look-up by path segment, e.g. "about" -> the About Us page. */
export function getSitePage(path: string): SitePage | undefined {
  return SITE_PAGES.find((page) => page.path === path);
}

/**
 * Informational pages shown in the header dropdown and in the mobile menu.
 * The game modes are deliberately NOT repeated here - they live in the header
 * only, so that the two navigations never compete.
 */
export const HEADER_INFO_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/team', label: 'Our Team' },
  { to: '/editorial', label: 'Editorial Policy' },
  { to: '/contact', label: 'Contact Us' },
];

/** The footer carries company and legal links only - never the game modes. */
export const FOOTER_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms Of Use' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/do-not-sell', label: 'Do Not Sell My Personal Information' },
];
