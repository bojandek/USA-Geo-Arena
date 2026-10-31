/**
 * Framing the map on two points.
 *
 * After a guess the map has to show both the guess and the real place. The
 * distance between the two ranges from a few metres to most of the way round
 * the planet, and a hand-picked zoom level puts one of them off the screen.
 *
 * The camera is therefore worked out from the projection of the map itself:
 * the two points are measured in the map's own pixel space, the shorter way
 * round the globe is taken, and the zoom is adjusted until both of them fit
 * into the area that the interface leaves free.
 *
 * The maths lives here, away from React, so it can be tested.
 */

/**
 * The zoom that shows a venue at street level.
 *
 * The vector tiles carry their detail up to this level, so going further only
 * stretches the picture. It is the zoom at which the outline of a stadium and
 * the streets around it become recognisable.
 */
export const CLOSE_UP_ZOOM = 15;

/**
 * The room a marker needs around itself.
 *
 * The camera is worked out from where the two points are, but a point is not
 * the same thing as a marker. The marker is a pin about the size of a thumb
 * and it stands on the point, so it needs a little room around it. Without
 * that room a marker that lands on the edge of the free area is cut in half
 * by the question card above it, or runs off the side of the screen.
 *
 * The two markers are the same shape - one is the guess and the other is the
 * real place - so the room is the same on every side.
 */
export const MARKER_CLEARANCE = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

/** A point in the projected pixel space of the map. */
export interface ProjectedPoint {
  x: number;
  y: number;
}

/** The area of the map that the interface covers and cannot be used. */
export interface MapPadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FramingInput {
  /** The first point, in the projected pixel space of the map. */
  a: ProjectedPoint;
  /** The second point, in the same space. */
  b: ProjectedPoint;
  /** The width of the whole world in pixels at the current zoom. */
  worldWidth: number;
  /** The zoom the map is at right now. */
  zoom: number;
  /** The size of the map container, in pixels. */
  width: number;
  height: number;
  /** The area covered by the interface. */
  padding: MapPadding;
  /**
   * Whether the camera itself has to be moved into the free area.
   *
   * A map that has the padding set already puts the point it looks at in the
   * middle of the free area. Moving the camera again would count the same
   * offset twice and push the markers out of it. A caller that is only using
   * the padding for the maths leaves this on.
   */
  accountForPadding?: boolean;
  /** The closest the map is allowed to get. */
  minZoom?: number;
  /** The furthest the map is allowed to get. */
  maxZoom?: number;
}

export interface Framing {
  /**
   * The point that the camera looks at, in the same projected space.
   *
   * It is not the middle of the two points: it is the middle of them, moved
   * so that they land in the middle of the free area rather than the middle
   * of the screen. When the question card is taller than the space below it,
   * that is the difference between both markers being visible and one of
   * them hiding behind the card.
   */
  midpoint: ProjectedPoint;
  /** The zoom at which both points fit into the free area. */
  zoom: number;
  /**
   * True when the shorter way between the two points crosses the edge of the
   * world, which is the case whenever they are more than half a world apart.
   */
  crossesEdge: boolean;
}

/**
 * Keeps a padding inside the map.
 *
 * The padding says how much of the map the interface covers. A card that is
 * taller than the window asks for a free area that does not exist, and the
 * camera would be framed for nothing at all. Each side is therefore kept to
 * half of the map, so there is always some of the map left to look at.
 */
export function clampPadding(
  padding: MapPadding,
  width: number,
  height: number,
): MapPadding {
  const half = (size: number, total: number) =>
    Math.max(0, Math.min(size, Math.floor(total / 2)));
  return {
    top: half(padding.top, height),
    bottom: half(padding.bottom, height),
    left: half(padding.left, width),
    right: half(padding.right, width),
  };
}

/**
 * Works out the camera that shows both points.
 *
 * The result is the point the camera looks at and the zoom at which the two
 * markers exactly fill the free area. Both are clamped, so the map never
 * zooms out to the whole planet or so far in that the two markers turn into
 * one dot.
 */
export function frameTwoPoints(input: FramingInput): Framing {
  const {
    a,
    b,
    worldWidth,
    zoom,
    width,
    height,
    padding,
    accountForPadding = true,
    minZoom = 1.5,
    maxZoom = 13,
  } = input;

  const usableWidth = Math.max(60, width - padding.left - padding.right);
  const usableHeight = Math.max(60, height - padding.top - padding.bottom);

  // The world is a fixed width at a given zoom, so when the two points are
  // more than half a world apart the shorter way round is the one that goes
  // over the edge. Without this, a guess on the far side of the planet would
  // frame almost the whole world and push a marker off the screen.
  const rawDx = Math.abs(a.x - b.x);
  const crossesEdge = rawDx > worldWidth / 2;
  const dx = crossesEdge ? Math.max(0, worldWidth - rawDx) : rawDx;
  const dy = Math.abs(a.y - b.y);

  // The zoom at which the two points exactly fill the free area. The smaller
  // of the two is the one that fits both of them.
  const zoomX = zoom + Math.log2(usableWidth / Math.max(dx, 0.001));
  const zoomY = zoom + Math.log2(usableHeight / Math.max(dy, 0.001));
  const fitted = Math.max(minZoom, Math.min(Math.min(zoomX, zoomY), maxZoom));

  const midpoint: ProjectedPoint = {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
  if (crossesEdge) {
    // The middle of the long way round sits on the far side of the world, so
    // it has to be moved half a world to the side the short way goes.
    //
    // Which way the short way goes is worked out from the two positions
    // themselves: it goes east from the first point when the distance from
    // the first to the second, going east and round the world, is less than
    // half a world. The middle of the long way is then half a world east of
    // that, or half a world west of it.
    const eastwards = (((b.x - a.x) % worldWidth) + worldWidth) % worldWidth;
    midpoint.x += eastwards < worldWidth / 2 ? worldWidth / 2 : -worldWidth / 2;
  }

  // The camera looks at the middle of the free area, not at the middle of
  // the screen. The card sits at the top of the map, so the free area is
  // lower down, and the two markers have to be moved down with it.
  //
  // The offset is given in screen pixels, and the zoom has changed, so it is
  // converted into the projected space of the new zoom. When the map already
  // has this padding, the projection has taken care of it and this is left
  // out - otherwise the same offset is counted twice.
  if (accountForPadding) {
    const scale = Math.pow(2, zoom - fitted);
    midpoint.x += ((padding.right - padding.left) / 2) * scale;
    midpoint.y += ((padding.bottom - padding.top) / 2) * scale;
  }

  return {
    midpoint,
    zoom: fitted,
    crossesEdge,
  };
}

/**
 * The points of a curve between two points.
 *
 * The curve is worked out in the pixel space of the map, so it looks the same
 * on the screen whatever the map is projected to. A straight line between two
 * places reads as a measurement; a curve reads as a journey, which is what it
 * is. It also stays clear of the markers at either end, which a line that
 * simply joined them up would run straight through.
 *
 * The curve bows away from the straight line by the middle, and comes back to
 * it at both ends.
 */
export function arcPoints(
  a: ProjectedPoint,
  b: ProjectedPoint,
  /** How far the curve bows away from the straight line, in pixels. */
  bow: number,
  /** How many pieces the curve is made of. */
  segments = 48,
  /**
   * Two points closer together than this are treated as being in the same
   * place, and no curve is drawn between them.
   *
   * The default suits a space measured in pixels, where anything under a
   * pixel is the same spot. A space measured as a fraction of the world is
   * much smaller, so it passes a much smaller limit.
   */
  minLength = 1,
): ProjectedPoint[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  // Two points on top of each other have no curve to draw.
  if (length < minLength) return [a, b];

  // The direction the curve bows in, which is at right angles to the line.
  const normalX = -dy / length;
  const normalY = dx / length;

  const points: ProjectedPoint[] = [];
  for (let step = 0; step <= segments; step += 1) {
    const t = step / segments;
    // The bow is nothing at the ends and the most in the middle.
    const push = Math.sin(Math.PI * t) * bow;
    points.push({
      x: a.x + dx * t + normalX * push,
      y: a.y + dy * t + normalY * push,
    });
  }

  return points;
}

/**
 * The part of a line that has been drawn so far.
 *
 * The line is drawn on by hand, a piece at a time, so that it grows out from
 * the guess towards the real place. The easing makes it slow down as it
 * arrives, which reads as the line settling on the answer rather than
 * snapping to it.
 *
 * The head is the point at the tip of the drawn part, which is where the
 * small travelling dot sits.
 */
/**
 * Where the tip of the line is, and the point it sits between.
 *
 * The line is made of a fixed number of points. Taking the last point that
 * has been reached as the tip makes it hop from one point to the next, and a
 * line that grows in hops looks like a stutter - so the tip is worked out
 * between two points instead.
 */
function tipPosition(
  line: [number, number][],
  progress: number,
): { index: number; between: number; point: [number, number] } {
  const t = Math.max(0, Math.min(1, progress));
  // The slow-down at the end is what makes the line feel like it arrives.
  const eased = 1 - Math.pow(1 - t, 3);

  const position = eased * (line.length - 1);
  const index = Math.min(line.length - 2, Math.max(0, Math.floor(position)));
  const between = position - index;
  const from = line[index];
  const to = line[index + 1];

  return {
    index,
    between,
    point: [
      from[0] + (to[0] - from[0]) * between,
      from[1] + (to[1] - from[1]) * between,
    ],
  };
}

export function revealLine(
  line: [number, number][],
  progress: number,
): { drawn: [number, number][]; head: [number, number] } {
  if (line.length === 0) {
    return { drawn: [], head: [0, 0] };
  }
  if (line.length === 1) {
    return { drawn: line, head: line[0] };
  }

  // The drawn line is the points up to the tip, and the tip itself. Because
  // the tip is worked out between two points, the line grows the whole way
  // instead of jumping from one point to the next.
  const { index, point } = tipPosition(line, progress);
  const drawn = line.slice(0, index + 1).concat([point]);

  return { drawn, head: point };
}

/**
 * Only the moving tip of the line, without allocating the drawn polyline.
 *
 * The map animation needs this point on every frame. Returning the whole
 * drawn line as well would allocate a new array each time for no benefit.
 */
export function revealPoint(
  line: [number, number][],
  progress: number,
): [number, number] {
  if (line.length === 0) return [0, 0];
  if (line.length === 1) return line[0];
  return tipPosition(line, progress).point;
}
/**
 * A line on the map, in the shape the map library wants.
 */
export interface MapLineFeature {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

/** A single point on the map, in the shape the map library wants. */
export interface MapPointFeature {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

/** Wraps a list of places as a line for the map. */
export function toLineFeature(coordinates: [number, number][]): MapLineFeature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates },
  };
}

/** Wraps one place as a point for the map. */
export function toPointFeature(coordinate: [number, number]): MapPointFeature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: coordinate },
  };
}

/**
 * How far the curve between two points should bow away.
 *
 * It grows with the distance between the points, so a long journey gets a
 * long sweep, but it is capped, so a guess on the far side of the planet does
 * not throw a loop across the map.
 *
 * The zoom matters too. A map zoomed right in is showing a short journey,
 * and a short journey does not need much of a sweep, while a map pulled all
 * the way back is showing a long one and can afford a wide arc.
 */
export function bowForDistance(distanceInPixels: number, zoom = 3): number {
  const base = Math.min(70, distanceInPixels * 0.18);
  // The curve never takes up more than a third of the way between the two
  // points, so it cannot loop back over itself.
  const limit = Math.max(12, distanceInPixels * 0.33);
  const zoomScale = Math.max(0.25, 1 - (zoom - 3) / 20);
  return Math.max(0, Math.min(limit, base * zoomScale));
}

/**
 * A longitude and latitude, in the Mercator projection, as a fraction of the
 * world.
 *
 * The whole world is one unit square, so the numbers here do not depend on
 * the zoom or on the size of the screen. That is what makes the curve below
 * the same shape on every device and at every zoom level.
 */
export interface NormalisedPoint {
  x: number;
  y: number;
}

/** Turns a place into the normalised Mercator square. */
export function toNormalised(lng: number, lat: number): NormalisedPoint {
  const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
  const s = Math.sin((clamped * Math.PI) / 180);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI),
  };
}

/** Turns the normalised Mercator square back into a place. */
export function fromNormalised(x: number, y: number): [number, number] {
  const lng = x * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

/**
 * The curve between two places, in real coordinates.
 *
 * Unlike a curve worked out in screen pixels, this one is the same wherever
 * it is calculated: the shape comes from where the two places are, not from
 * how far the map happens to be zoomed in. So the line does not twitch while
 * the camera is moving.
 *
 * The shorter way round the world is taken, so a guess on the far side of the
 * planet gets a short sweep rather than one right across the map.
 */
export function arcCoordinates(
  from: [number, number],
  to: [number, number],
  /** How far the curve bows, as a part of the distance between the two. */
  bowFraction = 0.18,
): [number, number][] {
  let a = toNormalised(from[0], from[1]);
  let b = toNormalised(to[0], to[1]);

  // The world is one unit wide, so points more than half a unit apart are
  // closer the other way round.
  if (Math.abs(b.x - a.x) > 0.5) {
    if (a.x > b.x) a = { ...a, x: a.x - 1 };
    else b = { ...b, x: b.x + 1 };
  }

  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  if (distance < 1e-9) return [from, to];

  // The world is a fraction of a unit across, so the "these two points are in
  // the same place" limit has to be tiny here.
  const points = arcPoints(a, b, distance * bowFraction, 48, 1e-9);
  return points.map((point) => fromNormalised(point.x, point.y));
}

/**
 * The width of the whole world, in pixels, at the current zoom.
 *
 * It is worked out from the projection of the map itself rather than from a
 * hard coded tile size, because the two do not have to agree: a projection
 * that is not the standard Mercator one would throw the whole calculation
 * off. The two points and the number of degrees between them give the answer
 * whatever the projection is.
 */
/**
 * The width of the whole world, in pixels, at the current zoom.
 *
 * It is worked out from the projection of the map itself rather than from a
 * hard coded tile size, because the two do not have to agree: a projection
 * that is not the standard Mercator one would throw the whole calculation
 * off. The two points and the number of degrees between them give the answer
 * whatever the projection is.
 */
export function worldWidthInPixels(
  a: ProjectedPoint,
  b: ProjectedPoint,
  /** The signed number of degrees between the two points. */
  degreesApart: number,
  /** Used when the two points sit on the same meridian. */
  fallback: number,
): number {
  const span = Math.abs(degreesApart);
  // The comparison is written so that a broken number falls back as well.
  if (!(span >= 0.0001)) return fallback;
  return (Math.abs(a.x - b.x) * 360) / span;
}

/**
 * The globe.
 *
 * The world round is drawn on a sphere rather than on the flat map: a flat map
 * of the whole planet is a strip that wraps round on itself, and the sphere is
 * what "the world" looks like. Everything below is about fitting that sphere
 * on the screen the player has.
 *
 * The numbers were measured from the rendered map rather than taken from a
 * formula, because the sphere does not grow like a flat map does: the camera
 * pulls back as the globe grows. Measured across MapLibre 5.24 the sphere is
 * 158 px across at zoom 0, about 300 px at zoom 1 and about 555 px at zoom 2 -
 * a growth of 2^0.905 (about 1.87) per zoom level rather than the 2 of a flat
 * map - and, which is what makes one rule work everywhere, it is the same size
 * in CSS pixels whatever the screen is, wide or narrow, retina or not.
 */
const GLOBE_DIAMETER_AT_ZOOM_0 = 158;
const GLOBE_GROWTH_PER_ZOOM = 0.905;

/** How much of the free area the globe fills when it is framed. */
export const GLOBE_FILL = 0.94;

/** The width of the globe, in CSS pixels, at a zoom level. */
export function globeDiameter(zoom: number): number {
  return GLOBE_DIAMETER_AT_ZOOM_0 * Math.pow(2, GLOBE_GROWTH_PER_ZOOM * zoom);
}

/** The zoom level at which the globe is a given width on the screen. */
export function globeZoomForDiameter(diameter: number): number {
  if (!(diameter > 0)) return 0;
  return Math.log2(diameter / GLOBE_DIAMETER_AT_ZOOM_0) / GLOBE_GROWTH_PER_ZOOM;
}

/**
 * The zoom level at which the whole globe fits an area.
 *
 * The shorter side of the area decides: the sphere is round, so a wide screen
 * with a short window is held back by the height, and a phone by its width.
 * The frame is a little smaller than the area so the edge of the sphere is
 * never tight against a card.
 */
export function globeZoomForArea(width: number, height: number, fill = GLOBE_FILL): number {
  const side = Math.min(width, height);
  if (!(side > 0)) return 0;
  return globeZoomForDiameter(side * fill);
}

/** A place on the globe, in degrees. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** What the globe answer camera is asked for. */
export interface GlobeAnswerInput {
  guess: GeoPoint;
  answer: GeoPoint;
  width: number;
  height: number;
  /** The part of the map the interface covers. */
  padding: MapPadding;
  /** The closest the map may come. Above this MapLibre leaves the sphere. */
  maxZoom?: number;
  /** Room kept around a marker, in pixels. */
  clearance?: number;
}

/** Where the globe has to look, and how far in. */
export interface GlobeAnswerFrame {
  /** Centre of the view, as [longitude, latitude]. */
  center: [number, number];
  zoom: number;
}

/**
 * The highest zoom the answer view may use while the globe is on.
 *
 * MapLibre's globe is a sphere up to zoom 11 and becomes a flat map at 12.
 * Staying well below that is what keeps the answer on the globe - the map
 * must not turn into a flat chart just because the player is looking at the
 * answer.
 */
export const GLOBE_ANSWER_MAX_ZOOM = 8;

/** Room kept for the marker itself, on top of the clearance. */
const GLOBE_MARKER_ROOM = 34;

/**
 * The radius of the globe on the screen, in CSS pixels.
 *
 * MapLibre scales the sphere so that features at the centre of the map are
 * the same size as they would be on the flat map, which makes the radius
 * depend on the latitude of the centre as well as on the zoom. This is the
 * same formula the map itself uses.
 */
export function globeRadiusForZoom(zoom: number, latitude = 0): number {
  const safeLat = Math.max(-85, Math.min(85, latitude));
  const cosLat = Math.cos((safeLat * Math.PI) / 180);
  return (256 / (Math.PI * cosLat)) * Math.pow(2, zoom);
}

/** The zoom at which the globe has a given radius at a latitude. */
export function globeZoomForRadius(radius: number, latitude = 0): number {
  if (!(radius > 0)) return 0;
  const safeLat = Math.max(-85, Math.min(85, latitude));
  const cosLat = Math.cos((safeLat * Math.PI) / 180);
  return Math.log2((radius * Math.PI * cosLat) / 256);
}

/** A place as a unit vector pointing out of the middle of the earth. */
function toUnitVector(point: GeoPoint): [number, number, number] {
  const lat = (Math.max(-90, Math.min(90, point.lat)) * Math.PI) / 180;
  const lng = (point.lng * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return [cosLat * Math.cos(lng), cosLat * Math.sin(lng), Math.sin(lat)];
}

/** A unit vector back into degrees. */
function fromUnitVector(vector: [number, number, number]): [number, number] {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  const x = vector[0] / length;
  const y = vector[1] / length;
  const z = Math.max(-1, Math.min(1, vector[2] / length));
  return [(Math.atan2(y, x) * 180) / Math.PI, (Math.asin(z) * 180) / Math.PI];
}

/**
 * The place halfway between two points along the shorter way round.
 *
 * The two points are treated as directions from the middle of the earth and
 * the middle direction is taken, which is the midpoint of the great circle
 * between them. Two points exactly opposite each other have no single
 * midpoint, so a point a quarter of the way round from the first is used -
 * it is the same distance from both, which is all the camera needs.
 */
export function globeMidpoint(a: GeoPoint, b: GeoPoint): [number, number] {
  const va = toUnitVector(a);
  const vb = toUnitVector(b);
  const sum: [number, number, number] = [
    va[0] + vb[0],
    va[1] + vb[1],
    va[2] + vb[2],
  ];
  const length = Math.hypot(sum[0], sum[1], sum[2]);

  if (length > 1e-9) return fromUnitVector(sum);

  // Opposite points: any direction at right angles to the first one is as
  // good a middle as any other.
  const axis: [number, number, number] =
    Math.abs(va[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  const cross: [number, number, number] = [
    va[1] * axis[2] - va[2] * axis[1],
    va[2] * axis[0] - va[0] * axis[2],
    va[0] * axis[1] - va[1] * axis[0],
  ];
  return fromUnitVector(cross);
}

/**
 * The globe camera that shows the guess and the real place together.
 *
 * The globe is a sphere, so the flat-map framing cannot be used on it: the
 * pixels between two places do not grow with the zoom the same way, and the
 * old code got round that by turning the globe into a flat map for the
 * answer. This keeps the sphere and works the camera out on the sphere.
 *
 * The camera looks at the middle of the two places. Both are then the same
 * angle from the middle of the screen, and the globe is made just small
 * enough for that angle to fit inside the free area. The result is the
 * sphere, the two markers and nothing turning flat.
 */
export function globeAnswerFrame(input: GlobeAnswerInput): GlobeAnswerFrame {
  const maxZoom = input.maxZoom ?? GLOBE_ANSWER_MAX_ZOOM;
  const clearance = input.clearance ?? MARKER_CLEARANCE.left;
  const room = clearance + GLOBE_MARKER_ROOM;

  const guess = toUnitVector(input.guess);
  const answer = toUnitVector(input.answer);
  const dot = Math.max(
    -1,
    Math.min(1, guess[0] * answer[0] + guess[1] * answer[1] + guess[2] * answer[2]),
  );
  const apart = Math.acos(dot);
  const half = Math.max(1e-7, apart / 2);

  const freeWidth = Math.max(40, input.width - input.padding.left - input.padding.right);
  const freeHeight = Math.max(40, input.height - input.padding.top - input.padding.bottom);
  // A marker needs room around it, so the usable radius is a little less
  // than half of the smaller side.
  const usableRadius = Math.max(20, Math.min(freeWidth, freeHeight) / 2 - room);

  // On the sphere, a place half the separation away from the centre sits
  // `R * sin(half)` pixels from the middle of the globe. Making that equal
  // to the usable radius is what puts both markers in the free area.
  const center = globeMidpoint(input.guess, input.answer);
  const radius = usableRadius / Math.sin(half);
  const zoom = globeZoomForRadius(radius, center[1]);

  return {
    center,
    zoom: Math.max(0, Math.min(maxZoom, zoom)),
  };
}
/**
 * The zoom the map has to be at for the whole planet to be on the screen.
 *
 * Kept apart from the area maths so a test can show that the sphere ends up
 * the size it was asked for at every screen size.
 */
export function globeFrame(
  width: number,
  height: number,
  fill = GLOBE_FILL,
): { zoom: number; diameter: number } {
  const zoom = globeZoomForArea(width, height, fill);
  return { zoom, diameter: globeDiameter(zoom) };
}

/** Below this width the screen is a phone held upright. */
const NARROW_SCREEN = 640;

/**
 * The room kept around the country while a question is open.
 *
 * The card at the top and the button at the bottom need the same room on
 * every screen. The sides do not: on a phone the country is limited by the
 * width, and 70 pixels a side took away more than a third of it, so the
 * coasts ended up off the edge of the screen. The card is also taller on a
 * phone, so the country is moved down under it, off the empty sea below.
 */
export function flatFramePadding(width: number): MapPadding {
  if (width < NARROW_SCREEN) return { top: 260, bottom: 90, left: 12, right: 12 };
  return { top: 130, bottom: 130, left: 70, right: 70 };
}

/**
 * A pan limit, widened so that a whole camera view fits inside it.
 *
 * The map refuses to show anything outside its limit, and on a tall, narrow
 * screen it zooms in until the limit fills the height. The country then no
 * longer fits across the width. Widening the limit to the view the map is
 * framed on keeps the frame as it was meant to be, and the player can still
 * pan as far as before.
 */
export function boundsCoveringView(
  bounds: [[number, number], [number, number]],
  center: [number, number],
  zoom: number,
  width: number,
  height: number,
): [[number, number], [number, number]] {
  const middle = toNormalised(center[0], center[1]);
  // A little extra, so rounding in the map never pulls the camera back in.
  const world = worldSizeAtZoom(zoom) / 1.02;
  const [west, north] = fromNormalised(
    middle.x - width / 2 / world,
    middle.y - height / 2 / world,
  );
  const [east, south] = fromNormalised(
    middle.x + width / 2 / world,
    middle.y + height / 2 / world,
  );
  return [
    [Math.max(-180, Math.min(bounds[0][0], west)), Math.max(-85, Math.min(bounds[0][1], south))],
    [Math.min(180, Math.max(bounds[1][0], east)), Math.min(85, Math.max(bounds[1][1], north))],
  ];
}

/** The width of the whole flat world in pixels, with 512-pixel tiles. */
function worldSizeAtZoom(zoom: number): number {
  return 512 * 2 ** zoom;
}
