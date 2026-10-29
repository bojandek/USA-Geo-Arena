import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BRAND_NAME, SITE_URL } from '@/lib/site-content';

/**
 * Sets the document title, the meta description and the Open Graph tags for
 * the current route.
 *
 * The app is a single page application, so the static tags in index.html only
 * ever describe the home page. Search engines and social networks that render
 * a link preview need the tags of the page the link actually points at, so
 * every route sets its own.
 */

interface SeoProps {
  /** Page title, without the site name suffix. */
  title: string;
  /** Short description used for the meta description and the OG description. */
  description: string;
  /** Absolute or relative path of the page, e.g. "/daily". */
  path: string;
  /** Whether this page should be kept out of the index. */
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function setMetaTag(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function Seo({ title, description, path, noIndex = false }: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    // A title that already carries the brand is left alone, so the home page
    // does not end up with the name twice.
    const fullTitle = title.startsWith(BRAND_NAME) ? title : `${title} - ${BRAND_NAME}`;
    const url = `${SITE_URL}${path === '/' ? '' : path}`;

    document.title = fullTitle;

    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // Open Graph - Facebook, Discord, WhatsApp, Slack and LinkedIn.
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND_NAME);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');

    // Twitter / X card.
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);

    // Canonical URL.
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Keep the game pages out of the index - they are thin, and the daily
    // challenge would otherwise compete with the home page.
    setMetaTag('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, follow' : 'index, follow');
  }, [title, description, path, noIndex, location.pathname]);

  return null;
}
