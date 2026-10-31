/**
 * The picture of a finished round.
 *
 * A link preview is the same branded card for everybody, because the social
 * networks never run any code. A picture is different: it is drawn here, in
 * the browser, with the player's own score on it, and it can be posted to a
 * story, a group chat or anywhere else a link would be ignored.
 *
 * The squares are drawn rather than typed as emoji, because every phone
 * draws emoji differently and some canvases do not draw them at all.
 */

/** One square per question, in the same bands as the shared emoji grid. */
export type GridColour = 'green' | 'yellow' | 'orange' | 'red' | 'black';

export const GRID_HEX: Record<GridColour, string> = {
  green: '#22c55e',
  yellow: '#facc15',
  orange: '#fb923c',
  red: '#ef4444',
  black: '#3f3f46',
};

/** The colour of each question, in the bands `shareGrid` uses. */
export function gridColours(
  answers: ReadonlyArray<{ distance: number; gaveUp?: boolean }>,
): GridColour[] {
  return answers.map(({ distance, gaveUp }) => {
    if (gaveUp || !Number.isFinite(distance)) return 'black';
    if (distance < 100) return 'green';
    if (distance < 500) return 'yellow';
    if (distance < 2000) return 'orange';
    return 'red';
  });
}

/** What goes on the card. */
export interface ResultCardData {
  /** The name of the round, such as "World Challenge" or a custom name. */
  title: string;
  score: number;
  maxScore: number;
  accuracy: number;
  answers: ReadonlyArray<{ distance: number; gaveUp?: boolean }>;
  /** A short line under the grid, such as the outcome of a challenge. */
  footnote?: string;
  /** The address the card points people at. */
  site: string;
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const BACKGROUND = '#12141A';
const ACCENT = '#FF4655';

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

/** Draws the card and hands it back as a PNG, or null where there is no canvas. */
export async function renderResultCard(data: ResultCardData): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const font = (weight: number, size: number) =>
    `${weight} ${size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  // The background, with a glow of the brand colour in the top corner.
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glow = context.createRadialGradient(CARD_WIDTH, 0, 40, CARD_WIDTH, 0, 900);
  glow.addColorStop(0, 'rgba(255, 70, 85, 0.45)');
  glow.addColorStop(1, 'rgba(255, 70, 85, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';

  // The brand.
  context.fillStyle = ACCENT;
  context.font = font(800, 44);
  context.fillText('USA GEOARENA', CARD_WIDTH / 2, 130);

  context.fillStyle = 'rgba(255, 255, 255, 0.75)';
  context.font = font(600, 46);
  context.fillText(data.title.slice(0, 36), CARD_WIDTH / 2, 205);

  // The score.
  context.fillStyle = '#ffffff';
  context.font = font(900, 210);
  context.fillText(Math.round(data.score).toLocaleString('en-US'), CARD_WIDTH / 2, 430);

  context.fillStyle = 'rgba(255, 255, 255, 0.6)';
  context.font = font(600, 48);
  context.fillText(
    `of ${Math.round(data.maxScore).toLocaleString('en-US')} points  ·  ${Math.round(data.accuracy)}% accuracy`,
    CARD_WIDTH / 2,
    510,
  );

  // The grid, in rows of five.
  const colours = gridColours(data.answers);
  const size = 132;
  const gap = 22;
  const perRow = 5;
  const rows = Math.max(1, Math.ceil(colours.length / perRow));
  const top = 590 + (2 - Math.min(2, rows)) * ((size + gap) / 2);
  colours.forEach((colour, index) => {
    const row = Math.floor(index / perRow);
    const inRow = Math.min(perRow, colours.length - row * perRow);
    const rowWidth = inRow * size + (inRow - 1) * gap;
    const x = (CARD_WIDTH - rowWidth) / 2 + (index % perRow) * (size + gap);
    const y = top + row * (size + gap);
    context.fillStyle = GRID_HEX[colour];
    roundedRect(context, x, y, size, size, 26);
    context.fill();
  });

  if (data.footnote) {
    context.fillStyle = '#ffffff';
    context.font = font(700, 50);
    context.fillText(data.footnote.slice(0, 40), CARD_WIDTH / 2, 1000);
  }

  // The call to play.
  const buttonWidth = 640;
  const buttonX = (CARD_WIDTH - buttonWidth) / 2;
  context.fillStyle = ACCENT;
  roundedRect(context, buttonX, 1060, buttonWidth, 120, 60);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = font(800, 54);
  context.fillText('Can you beat me?', CARD_WIDTH / 2, 1138);

  context.fillStyle = 'rgba(255, 255, 255, 0.55)';
  context.font = font(600, 38);
  context.fillText(data.site.replace(/^https?:\/\//, '').replace(/\/$/, ''), CARD_WIDTH / 2, 1260);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}
