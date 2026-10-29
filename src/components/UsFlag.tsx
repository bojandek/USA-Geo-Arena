/**
 * A tiny United States flag.
 *
 * The 🇺🇸 emoji is not reliable: on Windows it renders as the letters "US",
 * which is exactly what the navigation must not look like. An inline SVG is
 * the same flag everywhere and does not need an emoji font.
 */
export default function UsFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 14"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="14" rx="1.5" fill="#ffffff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1" fill="#b22234" />
      ))}
      <rect width="9" height="7" fill="#3c3b6e" />
      {[1.2, 3.2, 5.2, 7.2].map((x) =>
        [1.2, 3.2, 5.2].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.42" fill="#ffffff" />
        )),
      )}
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="13"
        rx="1"
        fill="none"
        stroke="rgba(0,0,0,0.16)"
      />
    </svg>
  );
}
