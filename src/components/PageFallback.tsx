/**
 * What a page shows while its code is still on the way.
 *
 * It is drawn inside the layout, under the header, so opening a game does not
 * blank the whole screen for a moment and read as a flicker.
 */
export default function PageFallback() {
  return (
    <div className="h-full min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
