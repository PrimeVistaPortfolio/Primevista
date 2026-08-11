/**
 * Coarse world land mask, as [lon, lat] polygons.
 *
 * This exists so the globe's dots can be generated procedurally instead of
 * sampling a bitmap — no texture to ship, no CORS, and the dot density stays
 * tunable. The outlines are deliberately low-poly: at the ~4k dots a hero
 * globe renders, anything finer is invisible.
 */

// Landmasses. Each is a closed ring of [lon, lat]; the first point is repeated
// implicitly, so don't bother closing them by hand.
const LAND = [
  // North America (Alaska → Canada → US → Mexico → Central America)
  [
    [-168, 66], [-162, 70], [-156, 71], [-148, 70], [-136, 69], [-128, 70],
    [-115, 69], [-105, 68], [-95, 68], [-85, 70], [-80, 73], [-70, 73],
    [-62, 66], [-64, 60], [-78, 62], [-79, 55], [-66, 58], [-56, 52],
    [-60, 47], [-66, 45], [-70, 42], [-74, 39], [-76, 35], [-81, 31],
    [-80, 26], [-82, 25], [-83, 29], [-88, 30], [-94, 29], [-97, 26],
    [-97, 21], [-91, 19], [-87, 21], [-88, 16], [-84, 16], [-83, 10],
    [-79, 9], [-80, 8], [-86, 11], [-92, 15], [-96, 16], [-105, 20],
    [-110, 24], [-114, 28], [-117, 32], [-121, 35], [-124, 41], [-124, 48],
    [-131, 53], [-136, 58], [-145, 60], [-152, 59], [-158, 56], [-164, 60],
  ],
  // South America
  [
    [-81, -4], [-79, 0], [-77, 8], [-71, 12], [-64, 10], [-60, 8], [-52, 5],
    [-50, 0], [-44, -2], [-38, -5], [-35, -8], [-39, -14], [-45, -23],
    [-48, -25], [-53, -34], [-58, -38], [-62, -40], [-65, -45], [-68, -50],
    [-70, -55], [-75, -52], [-73, -45], [-73, -38], [-71, -30], [-70, -20],
    [-76, -14], [-81, -6],
  ],
  // Africa
  [
    [-17, 15], [-16, 20], [-10, 26], [-5, 31], [0, 35], [10, 37], [20, 32],
    [25, 32], [32, 31], [35, 27], [38, 18], [43, 12], [51, 12], [51, 7],
    [43, 3], [41, -2], [40, -10], [36, -18], [33, -26], [27, -33], [20, -35],
    [18, -33], [13, -23], [12, -16], [9, -1], [3, 4], [-5, 5], [-8, 4],
    [-13, 8],
  ],
  // Eurasia (Iberia → Scandinavia → Siberia → China → SE Asia → India →
  // Arabia → Anatolia → Italy → back). Inland seas are cut out below.
  [
    [-10, 37], [-9, 44], [-1, 44], [0, 49], [4, 52], [8, 54], [10, 58],
    [15, 65], [22, 70], [28, 71], [40, 68], [55, 70], [70, 73], [80, 74],
    [95, 78], [105, 77], [113, 74], [130, 72], [142, 72], [160, 70],
    [172, 67], [178, 66], [172, 62], [165, 60], [158, 58], [155, 52],
    [150, 54], [142, 54], [135, 45], [130, 42], [128, 38], [122, 38],
    [122, 30], [118, 24], [110, 20], [108, 15], [105, 10], [103, 1],
    [100, 6], [98, 12], [95, 16], [90, 22], [87, 21], [80, 15], [77, 8],
    [73, 15], [70, 21], [65, 25], [61, 25], [57, 25], [57, 22], [52, 17],
    [45, 13], [43, 15], [39, 21], [35, 28], [34, 31], [36, 36], [30, 36],
    [26, 38], [23, 40], [19, 40], [13, 38], [16, 41], [12, 44], [8, 44],
    [3, 43], [0, 41], [-3, 37],
  ],
  // Greenland
  [
    [-45, 60], [-42, 65], [-30, 68], [-22, 70], [-20, 75], [-28, 80],
    [-40, 83], [-58, 82], [-68, 78], [-62, 70], [-52, 65],
  ],
  // Australia
  [
    [113, -22], [114, -27], [118, -35], [125, -32], [131, -31], [137, -33],
    [140, -38], [145, -38], [150, -37], [153, -32], [153, -25], [146, -19],
    [142, -11], [136, -12], [130, -11], [125, -14], [121, -19],
  ],
  // Antarctica — a wobbly circumpolar band; the peninsula is the notch at -60.
  [
    [-180, -72], [-150, -75], [-120, -73], [-90, -73], [-60, -63], [-30, -70],
    [0, -70], [30, -68], [60, -67], [90, -66], [120, -66], [150, -73],
    [180, -72], [180, -90], [-180, -90],
  ],
  // Great Britain / Ireland / Iceland
  [[-5, 50], [1, 51], [0, 54], [-2, 58], [-5, 58], [-6, 55]],
  [[-10, 52], [-6, 52], [-6, 55], [-10, 55]],
  [[-24, 65], [-14, 65], [-14, 66.5], [-22, 66.5]],
  // Japan
  [
    [130, 32], [133, 34], [137, 35], [141, 39], [142, 43], [145, 44],
    [141, 45], [139, 38], [135, 34],
  ],
  // Maritime SE Asia
  [[95, 5], [99, 3], [104, -2], [106, -6], [102, -6], [97, 2]],            // Sumatra
  [[105, -6], [114, -8], [114, -9], [105, -7]],                            // Java
  [[109, 2], [117, 4], [119, -1], [116, -4], [110, -3]],                   // Borneo
  [[119, 1], [125, 1], [123, -5], [120, -3]],                              // Sulawesi
  [[120, 18], [123, 14], [126, 8], [122, 6], [120, 12]],                   // Philippines
  [[131, -1], [141, -3], [147, -6], [150, -10], [143, -9], [137, -8], [131, -5]], // New Guinea
  // Odds and ends that read as recognisable at this scale
  [[145, -41], [148, -41], [148, -43], [145, -43]],                        // Tasmania
  [[172, -34], [178, -38], [177, -41], [172, -40]],                        // NZ north
  [[166, -46], [172, -41], [174, -42], [168, -47]],                        // NZ south
  [[43, -12], [50, -15], [49, -25], [45, -25], [43, -18]],                 // Madagascar
  [[80, 6], [82, 7], [82, 9], [80, 9]],                                    // Sri Lanka
  [[-85, 22], [-77, 20], [-74, 20], [-80, 23]],                            // Cuba
];

// Inland water that the coarse outlines above swallow. Subtracted from LAND.
const SEA = [
  [[-94, 57], [-88, 55], [-80, 52], [-77, 57], [-78, 63], [-86, 64], [-94, 60]], // Hudson Bay
  [[28, 41], [41, 41], [41, 45], [31, 46]],                                       // Black Sea
  [[47, 37], [54, 40], [53, 46], [48, 46]],                                       // Caspian
  [[12, 55], [20, 55], [26, 60], [22, 66], [17, 60]],                             // Baltic
];

/** Ray-casting point-in-polygon over [lon, lat] pairs. */
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** True when the given coordinate falls on land. */
export function isLand(lat, lon) {
  if (SEA.some((ring) => inRing(lon, lat, ring))) return false;
  return LAND.some((ring) => inRing(lon, lat, ring));
}

/**
 * Land points spread evenly over a unit sphere, as a flat XYZ array.
 *
 * Uses a Fibonacci spiral rather than a lat/lon grid: a grid bunches its dots
 * at the poles, which makes the Arctic look denser than the tropics.
 */
export function landPointsOnSphere(samples = 16000, radius = 1) {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2; // 1 → -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = Math.atan2(z, x) * (180 / Math.PI);
    if (!isLand(lat, lon)) continue;

    out.push(x * radius, y * radius, z * radius);
  }

  return new Float32Array(out);
}

/**
 * Lat/lon → position on a sphere of the given radius.
 *
 * Must stay the exact inverse of the projection in `landPointsOnSphere`, or
 * markers drift off the coastlines the dots draw.
 */
export function latLonToVec3(lat, lon, radius = 1) {
  const phi = lat * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  const r = Math.cos(phi);
  return [radius * r * Math.cos(theta), radius * Math.sin(phi), radius * r * Math.sin(theta)];
}
