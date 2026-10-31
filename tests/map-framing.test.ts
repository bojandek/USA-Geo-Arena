/**
 * Unit tests for the camera that frames both markers.
 *
 * Run with: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  arcPoints,
  arcCoordinates,
  bowForDistance,
  frameTwoPoints,
  MARKER_CLEARANCE,
  revealLine,
  revealPoint,
  toLineFeature,
  toPointFeature,
  worldWidthInPixels,
  globeDiameter,
  globeFrame,
  globeZoomForArea,
  globeZoomForDiameter,
  globeAnswerFrame,
  globeMidpoint,
  globeRadiusForZoom,
  GLOBE_ANSWER_MAX_ZOOM,
  clampPadding,
  flatFramePadding,
  boundsCoveringView,
  GLOBE_FILL,
} from '../src/lib/map-framing.ts';

const PADDING = { top: 140, bottom: 140, left: 100, right: 100 };

/** A point in the projected pixel space of a map at zoom 2. */
function point(x: number, y: number) {
  return { x, y };
}

describe('the camera really does keep both markers in the free area', () => {
  // A plain Mercator projection, so the whole thing can be worked out here
  // without a browser. The numbers below are the same ones the map uses.
  const TILE = 512;

  function mercatorY(lat: number): number {
    const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
    const s = Math.sin((clamped * Math.PI) / 180);
    return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  }

  /**
   * How far east of the centre a place is, in degrees.
   *
   * The world goes round and round, so a place on the far side is close to the
   * centre rather than most of the way away from it. The map draws the world
   * more than once when it has to, and this is the same idea.
   */
  function lngDelta(lng: number, centerLng: number): number {
    let delta = lng - centerLng;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  }

  function project(
    lng: number,
    lat: number,
    center: [number, number],
    zoom: number,
    width: number,
    height: number,
  ) {
    const worldWidth = TILE * Math.pow(2, zoom);
    return {
      // The raw distance, not the short one round the world: the map draws
      // the world more than once when it has to, and the camera is worked out
      // from where the two places actually are on that long strip.
      x: ((lng - center[0]) / 360) * worldWidth + width / 2,
      y: (mercatorY(lat) - mercatorY(center[1])) * worldWidth + height / 2,
    };
  }

  /**
   * Runs the whole thing: the camera is worked out, the map moves there, and
   * the two points are measured again to see where they ended up.
   */
  function run(
    guess: [number, number],
    answer: [number, number],
    start: { center: [number, number]; zoom: number },
    width: number,
    height: number,
    padding: { top: number; bottom: number; left: number; right: number },
  ) {
    const a = project(guess[0], guess[1], start.center, start.zoom, width, height);
    const b = project(answer[0], answer[1], start.center, start.zoom, width, height);

    const worldWidth = worldWidthInPixels(
      a,
      b,
      answer[0] - guess[0],
      TILE * Math.pow(2, start.zoom),
    );

    const framing = frameTwoPoints({
      a,
      b,
      worldWidth,
      zoom: start.zoom,
      width,
      height,
      padding,
    });

    // The camera goes to the middle of the two points, moved so that they land
    // in the middle of the free area.
    //
    // The middle is in the projected space of the zoom the map is at now, so
    // it is turned back into a place at that same zoom and at that same
    // centre.
    const worldNow = TILE * Math.pow(2, start.zoom);
    const targetLng =
      start.center[0] + ((framing.midpoint.x - width / 2) / worldNow) * 360;
    const targetMercY =
      mercatorY(start.center[1]) + (framing.midpoint.y - height / 2) / worldNow;
    const n = Math.PI - 2 * Math.PI * targetMercY;
    const targetLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    const afterGuess = project(guess[0], guess[1], [targetLng, targetLat], framing.zoom, width, height);
    const afterAnswer = project(answer[0], answer[1], [targetLng, targetLat], framing.zoom, width, height);

    return {
      guess: afterGuess,
      answer: afterAnswer,
      zoom: framing.zoom,
      cameraLng: targetLng,
    };
  }

  /**
   * Checks that both markers are on screen and clear of the question card.
   *
   * The camera is worked out so that the two points exactly fill the free
   * area, which means the outer one lands right on its edge - that is what
   * makes the picture as large as it can be. So a point is allowed to be on
   * the edge, and what matters is that the marker standing on it is whole.
   */
  function checkBoth(
    result: Record<string, { x: number; y: number }>,
    width: number,
    height: number,
    cardBottom: number,
  ) {
    for (const [name, point] of Object.entries(result)) {
      if (name === 'zoom' || name === 'cameraLng') continue;
      // Both markers are the same pin, about 28 across, standing on the
      // point they mark.
      const markerLeft = point.x - 14;
      const markerRight = point.x + 14;
      const markerTop = point.y - 14;
      const markerBottom = point.y + 14;

      assert.ok(markerLeft >= 0, `the ${name} marker runs off the left at x=${Math.round(markerLeft)}`);
      assert.ok(markerRight <= width, `the ${name} marker runs off the right at x=${Math.round(markerRight)}`);
      assert.ok(markerTop >= cardBottom, `the ${name} marker hides behind the card at y=${Math.round(markerTop)}`);
      assert.ok(markerBottom <= height, `the ${name} marker runs off the bottom at y=${Math.round(markerBottom)}`);
    }
  }

  test('both markers end up in the free area under a tall card', () => {
    // A phone, with the question card covering the top half.
    const width = 414;
    const height = 735;
    const cardHeight = 388;
    const padding = {
      top: cardHeight + 20 + MARKER_CLEARANCE.top,
      bottom: 120 + MARKER_CLEARANCE.bottom,
      left: 50 + MARKER_CLEARANCE.left,
      right: 50 + MARKER_CLEARANCE.right,
    };

    const result = run(
      [-101.8, 43.25],
      [-88.44, 43.73],
      { center: [-96.5, 39.5], zoom: 3.55 },
      width,
      height,
      padding,
    );

    checkBoth(result, width, height, cardHeight);
  });

  test('both markers end up in the free area when the card is short', () => {
    const width = 414;
    const height = 735;
    const cardHeight = 135;
    const padding = {
      top: cardHeight + 20 + MARKER_CLEARANCE.top,
      bottom: 120 + MARKER_CLEARANCE.bottom,
      left: 50 + MARKER_CLEARANCE.left,
      right: 50 + MARKER_CLEARANCE.right,
    };

    const result = run(
      [-101.8, 43.25],
      [-88.44, 43.73],
      { center: [-96.5, 39.5], zoom: 3.55 },
      width,
      height,
      padding,
    );

    checkBoth(result, width, height, cardHeight);
  });

  test('two places on opposite sides of the country both stay on screen', () => {
    // A guess on the west coast and the answer on the east coast, which is the
    // widest spread the game can have inside one country.
    const width = 414;
    const height = 735;
    const cardHeight = 388;
    const padding = {
      top: cardHeight + 20 + MARKER_CLEARANCE.top,
      bottom: 120 + MARKER_CLEARANCE.bottom,
      left: 50 + MARKER_CLEARANCE.left,
      right: 50 + MARKER_CLEARANCE.right,
    };

    const result = run(
      [-122.42, 37.77],
      [-74.0, 40.71],
      { center: [-98.5, 39.5], zoom: 3.55 },
      width,
      height,
      padding,
    );

    checkBoth(result, width, height, cardHeight);
  });

  test('a guess on the far side of the planet is framed the short way round', () => {
    const width = 414;
    const height = 735;
    const cardHeight = 388;
    const padding = {
      top: cardHeight + 20 + MARKER_CLEARANCE.top,
      bottom: 120 + MARKER_CLEARANCE.bottom,
      left: 50 + MARKER_CLEARANCE.left,
      right: 50 + MARKER_CLEARANCE.right,
    };

    // Tokyo against Los Angeles. The short way between them goes east over
    // the Pacific, about 102 degrees, and not west the long way round the
    // planet. The camera has to look at the short way, or it ends up showing
    // the wrong side of the world.
    const result = run(
      [139.69, 35.68],
      [-118.24, 34.05],
      { center: [-98.5, 39.5], zoom: 3.55 },
      width,
      height,
      padding,
    );

    // The camera has to sit between the two places, on the short path, so it
    // is about the same distance from both of them and that distance is half
    // of 102 degrees rather than half of 258.
    const toTokyo = Math.abs(lngDelta(139.69, result.cameraLng));
    const toLosAngeles = Math.abs(lngDelta(-118.24, result.cameraLng));

    assert.ok(
      Math.abs(toTokyo - toLosAngeles) < 2,
      `the camera should sit between the two places the short way, but it is at ${result.cameraLng.toFixed(1)}`,
    );
    assert.ok(
      toTokyo < 60,
      `the camera should be near the short way, but it is ${toTokyo.toFixed(1)} degrees away`,
    );
  });
});

describe('the line between the guess and the answer', () => {
  test('it starts at the guess and ends at the answer', () => {
    const line = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    assert.ok(line.length > 10);
    const first = line[0];
    const last = line[line.length - 1];
    assert.ok(Math.abs(first[0] + 87.63) < 0.01);
    assert.ok(Math.abs(first[1] - 41.88) < 0.01);
    assert.ok(Math.abs(last[0] + 74.0) < 0.01);
    assert.ok(Math.abs(last[1] - 40.71) < 0.01);
  });

  test('the same two places always give the same line', () => {
    // The line used to be worked out in screen pixels, so it changed shape
    // whenever the map was zoomed. It must not.
    const first = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    const second = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    assert.deepEqual(first, second);
  });

  test('it bows away from the straight line', () => {
    const line = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    const middle = line[Math.floor(line.length / 2)];
    // The straight line between the two ends, at the same fraction along.
    const straightLng = (-87.63 + -74.0) / 2;
    assert.ok(
      Math.abs(middle[0] - straightLng) > 0.05,
      'the middle of the line should not sit on the straight line',
    );
  });

  test('two places on top of each other make no curve', () => {
    const line = arcCoordinates([-87.63, 41.88], [-87.63, 41.88]);
    assert.equal(line.length, 2);
  });

  test('a guess on the far side of the world takes the short way round', () => {
    // Tokyo and Los Angeles are on opposite sides of the planet.
    const line = arcCoordinates([139.69, 35.68], [-118.24, 34.05]);
    for (const [lng] of line) {
      assert.ok(lng > 130 || lng < -100, 'the line should not cross the whole world');
    }
  });

  test('the line is drawn on a piece at a time', () => {
    const line = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    const start = revealLine(line, 0);
    const half = revealLine(line, 0.5);
    const end = revealLine(line, 1);

    assert.ok(start.drawn.length <= half.drawn.length);
    assert.ok(half.drawn.length < end.drawn.length);
    assert.equal(end.drawn.length, line.length);
  });

  test('the head of the line is at the tip of the drawn part', () => {
    const line = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    const half = revealLine(line, 0.5);
    const tip = half.drawn[half.drawn.length - 1];
    assert.deepEqual(half.head, tip);
  });

  test('the line never shrinks past the guess', () => {
    const line = arcCoordinates([-87.63, 41.88], [-74.0, 40.71]);
    const nothing = revealLine(line, 0);
    assert.ok(nothing.drawn.length >= 2);
  });

  test('the line grows the whole way instead of in steps', () => {
    const line: [number, number][] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ];

    // It starts at the guess and ends at the real place.
    const start = revealLine(line, 0);
    const end = revealLine(line, 1);
    assert.deepEqual(start.head, [0, 0]);
    assert.deepEqual(end.head, [3, 0]);
    assert.equal(end.drawn.length, line.length);

    // The tip moves on every single step, and it only ever moves forward.
    // Taking the last point of the curve that has been reached instead would
    // make it hop, and a line that grows in hops looks like a stutter.
    let previous = -1;
    for (let step = 0; step <= 20; step += 1) {
      const { head } = revealLine(line, step / 20);
      assert.ok(head[0] > previous, `the tip stopped at ${head[0]}`);
      previous = head[0];
    }
  });

  test('the moving tip can be asked for without the whole line', () => {
    const line: [number, number][] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ];

    assert.deepEqual(revealPoint(line, 0), [0, 0]);
    assert.deepEqual(revealPoint(line, 1), [3, 0]);

    const middle = revealPoint(line, 0.5);
    assert.ok(middle[0] > 0);
    assert.ok(middle[0] < 3);
  });

  test('a line with nothing in it has no tip', () => {
    assert.deepEqual(revealLine([], 0.5).head, [0, 0]);
    assert.deepEqual(revealLine([[1, 2]], 0.5).head, [1, 2]);
  });

  test('the shapes handed to the map are the ones the map wants', () => {
    const line = toLineFeature([[-87.63, 41.88], [-74.0, 40.71]]);
    assert.equal(line.type, 'Feature');
    assert.equal(line.geometry.type, 'LineString');
    assert.equal(line.geometry.coordinates.length, 2);

    const point = toPointFeature([-87.63, 41.88]);
    assert.equal(point.type, 'Feature');
    assert.equal(point.geometry.type, 'Point');
    assert.deepEqual(point.geometry.coordinates, [-87.63, 41.88]);
  });
});

describe('framing two points', () => {
  test('two points in the same part of the world are framed in the middle', () => {
    const framing = frameTwoPoints({
      a: point(400, 500),
      b: point(700, 600),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    assert.equal(framing.midpoint.x, 550);
    assert.equal(framing.midpoint.y, 550);
    assert.equal(framing.crossesEdge, false);
  });

  test('points more than half a world apart are framed the short way round', () => {
    // The two points are 1041 pixels apart in a world that is 2048 wide, so
    // the short way round goes over the edge. The short way runs east from the
    // first point, so the middle of it is past the first point and not behind
    // the second one.
    const framing = frameTwoPoints({
      a: point(1123, 883),
      b: point(82, 456),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    assert.equal(framing.crossesEdge, true);
    // The short way is 1007 pixels, so the middle of it is half of that past
    // the first point.
    assert.ok(
      Math.abs(framing.midpoint.x - (1123 + 1007 / 2)) < 0.01,
      `the midpoint should be on the short way, it is ${framing.midpoint.x}`,
    );
  });

  test('the short way is taken whichever way round the two points are', () => {
    // The same two places, the other way round, must give the same answer.
    const forwards = frameTwoPoints({
      a: point(1123, 883),
      b: point(82, 456),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    const backwards = frameTwoPoints({
      a: point(82, 456),
      b: point(1123, 883),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    // The two are a whole world apart, so the same place is reached by a
    // different number of degrees.
    assert.equal(forwards.zoom, backwards.zoom);
    assert.equal(forwards.crossesEdge, backwards.crossesEdge);
  });

  test('the zoom is the one at which both points fit the free area', () => {
    // The free area is 1080 by 555 pixels. The points are 1000 apart, so the
    // zoom has to grow by log2(1080 / 1000).
    const framing = frameTwoPoints({
      a: point(500, 500),
      b: point(1500, 500),
      worldWidth: 4096,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    const expected = 2 + Math.log2(1080 / 1000);
    assert.ok(Math.abs(framing.zoom - expected) < 0.001, `the zoom is ${framing.zoom}`);
  });

  test('the vertical distance can be the one that decides the zoom', () => {
    const framing = frameTwoPoints({
      a: point(600, 100),
      b: point(640, 800),
      worldWidth: 4096,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    const expected = 2 + Math.log2(555 / 700);
    assert.ok(Math.abs(framing.zoom - expected) < 0.001, `the zoom is ${framing.zoom}`);
  });

  test('two points on top of each other are framed at the closest zoom', () => {
    const framing = frameTwoPoints({
      a: point(500, 500),
      b: point(500, 500),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    assert.equal(framing.zoom, 13, 'the map does not zoom in further than this');
    assert.equal(framing.midpoint.x, 500);
  });

  test('the map never zooms out past the whole world', () => {
    const framing = frameTwoPoints({
      a: point(0, 0),
      b: point(2048, 2048),
      worldWidth: 2048,
      zoom: 2,
      width: 1280,
      height: 835,
      padding: PADDING,
    });

    assert.ok(framing.zoom >= 1.5, `the zoom is ${framing.zoom}`);
  });

  test('a small screen is framed with the same rule', () => {
    const framing = frameTwoPoints({
      a: point(200, 200),
      b: point(300, 250),
      worldWidth: 2048,
      zoom: 2,
      width: 414,
      height: 700,
      padding: { top: 120, bottom: 120, left: 50, right: 50 },
    });

    assert.ok(framing.zoom > 2, 'the points are closer than the screen, so it zooms in');
    assert.ok(framing.zoom <= 13);
  });
});

describe('the width of the world', () => {
  test('it is worked out from the projection and the degrees between the points', () => {
    // 1041 pixels for 183 degrees of longitude, so the world is 2048 wide.
    const width = worldWidthInPixels(point(1123, 0), point(82, 0), -183, 2048);
    assert.ok(Math.abs(width - 2048) < 1, `the width is ${width}`);
  });

  test('two points on the same meridian use the fallback', () => {
    const width = worldWidthInPixels(point(100, 0), point(100, 500), 0, 2048);
    assert.equal(width, 2048);
  });

  test('a broken number of degrees does not produce a broken width', () => {
    const width = worldWidthInPixels(point(100, 0), point(100, 0), Number.NaN, 2048);
    assert.equal(width, 2048);
  });
});

describe('the globe', () => {
  test('it is the width the map was measured at', () => {
    // 158 px at zoom 0 and 555 px at zoom 2, measured from the rendered map.
    assert.ok(Math.abs(globeDiameter(0) - 158) < 1);
    assert.ok(Math.abs(globeDiameter(2) - 555) < 12, `it is ${globeDiameter(2)}`);
    assert.ok(globeDiameter(1) > globeDiameter(0));
  });

  test('asking for the zoom of a width gives the width back', () => {
    for (const diameter of [120, 240, 360, 555, 800]) {
      const zoom = globeZoomForDiameter(diameter);
      const actual = globeDiameter(zoom);
      assert.ok(Math.abs(actual - diameter) < 0.01, `${diameter} -> ${actual}`);
    }
  });

  test('the whole globe fits the shorter side of the area', () => {
    for (const [width, height] of [
      [1140, 575], // a desktop, with the card and the button taken off
      [320, 519], // a phone
      [1000, 200], // a short, wide window
    ]) {
      const frame = globeFrame(width, height);
      const side = Math.min(width, height);
      assert.ok(
        frame.diameter <= side + 0.01,
        `the globe is ${frame.diameter} in a ${width}x${height} area`,
      );
      assert.ok(frame.diameter >= side * GLOBE_FILL - 0.01, 'it fills the area it was given');
    }
  });

  test('a phone gets a smaller globe than a desktop', () => {
    const phone = globeZoomForArea(320, 519);
    const desktop = globeZoomForArea(1140, 575);
    assert.ok(phone < desktop, 'a narrow screen has to zoom out further');
  });

  test('an empty area does not ask for a broken zoom', () => {
    assert.equal(globeZoomForArea(0, 0), 0);
    assert.equal(globeZoomForDiameter(0), 0);
  });
});

describe('the globe answer camera', () => {
  const PADDING = { top: 180, bottom: 120, left: 40, right: 40 };
  const SIZE = { width: 800, height: 600 };

  /** How far apart two places are, in radians along the sphere. */
  function apart(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const toRad = (degrees: number) => (degrees * Math.PI) / 180;
    const va = [
      Math.cos(toRad(a.lat)) * Math.cos(toRad(a.lng)),
      Math.cos(toRad(a.lat)) * Math.sin(toRad(a.lng)),
      Math.sin(toRad(a.lat)),
    ];
    const vb = [
      Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng)),
      Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng)),
      Math.sin(toRad(b.lat)),
    ];
    const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
    return Math.acos(dot);
  }

  test('the middle of two places is between them', () => {
    const middle = globeMidpoint(
      { lat: 51.5072, lng: -0.1276 },
      { lat: 48.8566, lng: 2.3522 },
    );

    assert.ok(middle[0] > 0.4 && middle[0] < 1.6, `lng ${middle[0]}`);
    assert.ok(middle[1] > 49 && middle[1] < 52, `lat ${middle[1]}`);
  });

  test('two places opposite each other still get a camera', () => {
    const middle = globeMidpoint({ lat: 0, lng: 0 }, { lat: 0, lng: 180 });
    assert.ok(Number.isFinite(middle[0]));
    assert.ok(Number.isFinite(middle[1]));

    const frame = globeAnswerFrame({
      guess: { lat: 0, lng: 0 },
      answer: { lat: 0, lng: 180 },
      ...SIZE,
      padding: PADDING,
    });
    assert.ok(Number.isFinite(frame.zoom));
    assert.ok(frame.zoom <= GLOBE_ANSWER_MAX_ZOOM);
  });

  test('both markers fit inside the free area', () => {
    for (const pair of [
      [{ lat: 51.5072, lng: -0.1276 }, { lat: 48.8566, lng: 2.3522 }],
      [{ lat: 40.7128, lng: -74.006 }, { lat: 51.5072, lng: -0.1276 }],
      [{ lat: 34.0522, lng: -118.2437 }, { lat: 35.6895, lng: 139.6917 }],
    ] as const) {
      const frame = globeAnswerFrame({
        guess: pair[0],
        answer: pair[1],
        ...SIZE,
        padding: PADDING,
      });
      const radius = globeRadiusForZoom(frame.zoom, frame.center[1]);
      const separation = 2 * radius * Math.sin(apart(pair[0], pair[1]) / 2);
      const freeSide = Math.min(
        SIZE.width - PADDING.left - PADDING.right,
        SIZE.height - PADDING.top - PADDING.bottom,
      );

      assert.ok(
        separation <= freeSide + 0.01,
        `the markers are ${separation} apart in ${freeSide} of free room`,
      );
    }
  });

  test('a closer pair is zoomed in further than a distant one', () => {
    const near = globeAnswerFrame({
      guess: { lat: 51.5072, lng: -0.1276 },
      answer: { lat: 48.8566, lng: 2.3522 },
      ...SIZE,
      padding: PADDING,
    });
    const far = globeAnswerFrame({
      guess: { lat: 34.0522, lng: -118.2437 },
      answer: { lat: 35.6895, lng: 139.6917 },
      ...SIZE,
      padding: PADDING,
    });

    assert.ok(near.zoom > far.zoom, `${near.zoom} is not above ${far.zoom}`);
  });

  test('the camera never leaves the globe for a flat map', () => {
    const frame = globeAnswerFrame({
      guess: { lat: 40.7128, lng: -74.006 },
      answer: { lat: 40.7138, lng: -74.007 },
      ...SIZE,
      padding: PADDING,
    });
    assert.ok(frame.zoom <= GLOBE_ANSWER_MAX_ZOOM);
    assert.ok(GLOBE_ANSWER_MAX_ZOOM < 12, 'it has to stay below the flat-map switch');
  });
});

describe('the curve between the two markers', () => {
  test('it starts and ends at the two points', () => {
    const a = { x: 100, y: 200 };
    const b = { x: 400, y: 600 };
    const points = arcPoints(a, b, 40);
    assert.deepEqual(points[0], a);
    assert.deepEqual(points[points.length - 1], b);
  });

  test('it bows away from the straight line in the middle', () => {
    const a = { x: 100, y: 200 };
    const b = { x: 400, y: 200 };
    const points = arcPoints(a, b, 40);
    const middle = points[Math.floor(points.length / 2)];
    // The straight line is at y = 200, so the curve is away from it.
    assert.ok(Math.abs(middle.y - 200) > 20);
  });

  test('two points on top of each other make no curve', () => {
    const a = { x: 100, y: 200 };
    const points = arcPoints(a, { x: 100.2, y: 200.2 }, 40);
    assert.equal(points.length, 2);
  });

  test('the bow never takes up more than a third of the way', () => {
    assert.ok(bowForDistance(1000) <= 1000 * 0.33);
    assert.ok(bowForDistance(100) <= 100 * 0.33);
    // And it is never more than the cap.
    assert.ok(bowForDistance(100000) <= 70);
  });

  test('a map zoomed right in needs less of a sweep', () => {
    const wide = bowForDistance(600, 3);
    const close = bowForDistance(600, 15);
    assert.ok(close < wide);
  });
});

describe('the camera looks at the middle of the free area', () => {
  test('a map that already has the padding is not moved a second time', () => {
    const input = {
      a: point(200, 200),
      b: point(600, 700),
      worldWidth: 2048,
      zoom: 4,
      width: 800,
      height: 800,
      padding: { top: 240, bottom: 120, left: 100, right: 100 },
    };

    const virtual = frameTwoPoints(input);
    const alreadyPadded = frameTwoPoints({ ...input, accountForPadding: false });

    // Only the camera changes: the zoom is the same either way.
    assert.equal(virtual.zoom, alreadyPadded.zoom);
    assert.notDeepEqual(virtual.midpoint, alreadyPadded.midpoint);
  });

  test('a tall card at the top pushes the markers down', () => {
    const a = { x: 100, y: 100 };
    const b = { x: 100, y: 300 };
    const even = frameTwoPoints({
      a,
      b,
      worldWidth: 1000,
      zoom: 3,
      width: 800,
      height: 600,
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
    });
    const tall = frameTwoPoints({
      a,
      b,
      worldWidth: 1000,
      zoom: 3,
      width: 800,
      height: 600,
      padding: { top: 400, bottom: 100, left: 50, right: 50 },
    });
    // With a tall card the free area is lower down, so the camera looks
    // higher up in the world, and the markers appear lower on the screen.
    assert.ok(tall.midpoint.y < even.midpoint.y);
  });

  test('a card that is the same at the top and the bottom does not move the camera', () => {
    const a = { x: 100, y: 100 };
    const b = { x: 100, y: 300 };
    const framing = frameTwoPoints({
      a,
      b,
      worldWidth: 1000,
      zoom: 3,
      width: 800,
      height: 600,
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
    });
    assert.equal(framing.midpoint.y, 200);
    assert.equal(framing.midpoint.x, 100);
  });
});

describe('a padding that is bigger than the map is kept inside it', () => {
  test('a padding that fits is left alone', () => {
    const padding = { top: 100, bottom: 120, left: 50, right: 50 };
    assert.deepEqual(clampPadding(padding, 800, 600), padding);
  });

  test('a card taller than the window leaves some map to look at', () => {
    const clamped = clampPadding(
      { top: 900, bottom: 140, left: 50, right: 50 },
      800,
      600,
    );
    // Half the height is the most that can be taken away.
    assert.equal(clamped.top, 300);
    assert.equal(clamped.bottom, 140);
  });

  test('the sides are kept inside the width as well', () => {
    const clamped = clampPadding(
      { top: 100, bottom: 100, left: 500, right: 90 },
      800,
      600,
    );
    assert.equal(clamped.left, 400);
    assert.equal(clamped.right, 90);
  });

  test('a broken size does not make a broken padding', () => {
    const clamped = clampPadding(
      { top: 100, bottom: 100, left: 50, right: 50 },
      0,
      0,
    );
    assert.deepEqual(clamped, { top: 0, bottom: 0, left: 0, right: 0 });
  });
});

describe('flatFramePadding', () => {
  test('keeps the sides narrow on a phone, so the coasts fit', () => {
    assert.equal(flatFramePadding(375).left, 12);
    assert.equal(flatFramePadding(375).right, 12);
  });

  test('moves the country down under the taller card on a phone', () => {
    const padding = flatFramePadding(375);
    assert.ok(padding.top > padding.bottom);
  });

  test('keeps the wider frame from a tablet up', () => {
    assert.deepEqual(flatFramePadding(1024), { top: 130, bottom: 130, left: 70, right: 70 });
  });
});

describe('boundsCoveringView', () => {
  const mainland: [[number, number], [number, number]] = [[-133, 19], [-58, 53.5]];

  test('widens the limit to a tall phone view of the whole country', () => {
    // About the zoom that fits the country across a 375-pixel phone.
    const [[west, south], [east, north]] = boundsCoveringView(mainland, [-96, 38], 2.1, 375, 812);
    assert.ok(south < 19 && north > 53.5, 'the limit covers the height of the screen');
    assert.equal(west, -133);
    assert.equal(east, -58);
  });

  test('leaves a limit that already covers the view as it is', () => {
    assert.deepEqual(boundsCoveringView(mainland, [-96, 38], 6, 1280, 800), mainland);
  });

  test('never goes past the edge of the world', () => {
    const [[west, south], [east, north]] = boundsCoveringView(mainland, [-96, 38], 0, 4000, 4000);
    assert.ok(west >= -180 && east <= 180 && south >= -85 && north <= 85);
  });
});
