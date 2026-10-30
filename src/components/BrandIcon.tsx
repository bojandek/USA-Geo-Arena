/**
 * The brand mark.
 *
 * A dark app tile with a globe, the United States picked out in the brand
 * red and a brand-red orbit ring around it. The shape of the country is drawn
 * from real geographic data and projected onto the sphere the way a globe is
 * actually seen from space, so the meridians curve and the country sits on
 * the surface rather than on a flat map.
 *
 * The drawing itself lives in `public/brand-icon.svg`. It is a separate file
 * because the path data is far too big to sit in the JavaScript bundle, and
 * the browser caches it on its own.
 *
 * An emoji flag was never an option: on a machine without an emoji font it
 * falls back to the letters "US", which is not what a mark should do.
 */

interface BrandIconProps {
  className?: string;
  /** Used when the icon is the only thing that says what the site is. */
  title?: string;
}

export default function BrandIcon({ className, title }: BrandIconProps) {
  return (
    <img
      src="/brand-icon.svg"
      className={className}
      alt={title ?? ''}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    />
  );
}