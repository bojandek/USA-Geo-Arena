/**
 * The confetti.
 *
 * It is drawn on a canvas that is added to the page for the moment it lasts
 * and then removed, so nothing is left behind and nothing has to be cleaned
 * up by hand. The pieces are plain squares in the brand colours: a bit of
 * confetti is worth more than a photograph of confetti, and it costs nothing
 * to download.
 */

const BRAND_COLOURS = ['#FF4655', '#FF8B3D', '#FFD700', '#FFFFFF', '#FF6B9D'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colour: string;
  spin: number;
  angle: number;
  /** How far the piece has already fallen, in turns. */
  turn: number;
}

/**
 * Throws a burst of confetti.
 *
 * It does nothing in a browser that has no canvas, so it is safe to call
 * from anywhere.
 */
export function celebrate(options: { pieces?: number; durationMs?: number } = {}): void {
  if (typeof document === 'undefined') return;
  if (typeof requestAnimationFrame !== 'function') return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const total = options.pieces ?? 90;
  const duration = options.durationMs ?? 2600;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  // The pieces start along the top edge and fall, with a sideways drift.
  const pieces: Piece[] = [];
  for (let i = 0; i < total; i++) {
    pieces.push({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.4,
      vx: (Math.random() - 0.5) * 2.6,
      vy: 2.4 + Math.random() * 2.6,
      size: 6 + Math.random() * 7,
      colour: BRAND_COLOURS[Math.floor(Math.random() * BRAND_COLOURS.length)],
      spin: (Math.random() - 0.5) * 0.3,
      angle: Math.random() * Math.PI,
      turn: Math.random(),
    });
  }

  const started = Date.now();

  const draw = () => {
    const elapsed = Date.now() - started;
    context.clearRect(0, 0, width, height);

    for (const piece of pieces) {
      piece.x += piece.vx;
      piece.y += piece.vy;
      // A little sideways sway, so the fall does not look like rain.
      piece.vx += Math.sin((elapsed / 400) + piece.turn * 6) * 0.02;
      piece.angle += piece.spin;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.colour;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      context.restore();
    }

    if (elapsed < duration) {
      requestAnimationFrame(draw);
      return;
    }
    canvas.remove();
  };

  requestAnimationFrame(draw);
}