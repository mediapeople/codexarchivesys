type LoremapAtlasPoint = {
  x: number;
  y: number;
};

type LoremapAtlasRoute = LoremapAtlasPoint[];

type LoremapAtlasLayout = {
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
};

type LoremapAtlasVariant = 'page' | 'card';

const DEFAULT_ROUTE: LoremapAtlasRoute = [
  { x: 0, y: 80 },
  { x: 13, y: 67 },
  { x: 25, y: 56 },
  { x: 38, y: 45 },
  { x: 50, y: 34 },
  { x: 63, y: 24 },
  { x: 75, y: 16 },
  { x: 88, y: 8 },
  { x: 100, y: 0 },
];

const DEFAULT_TERRAIN: LoremapAtlasRoute[] = [
  [
    { x: 0, y: 26 },
    { x: 18, y: 18 },
    { x: 35, y: 14 },
    { x: 53, y: 10 },
    { x: 72, y: 12 },
    { x: 100, y: 18 },
  ],
  [
    { x: 6, y: 92 },
    { x: 20, y: 84 },
    { x: 37, y: 76 },
    { x: 54, y: 72 },
    { x: 76, y: 70 },
    { x: 100, y: 74 },
  ],
];

const DEFAULT_MARKER: LoremapAtlasPoint = { x: 62, y: 27 };

const LAYOUTS: Record<LoremapAtlasVariant, LoremapAtlasLayout> = {
  page: {
    plotX: 30,
    plotY: 44,
    plotWidth: 256,
    plotHeight: 74,
  },
  card: {
    plotX: 48,
    plotY: 52,
    plotWidth: 238,
    plotHeight: 92,
  },
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function isPoint(value: unknown): value is LoremapAtlasPoint {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'x' in value &&
      'y' in value &&
      typeof (value as { x: unknown }).x === 'number' &&
      typeof (value as { y: unknown }).y === 'number'
  );
}

function normalizePoint(point: LoremapAtlasPoint): LoremapAtlasPoint {
  return {
    x: clampPercent(point.x),
    y: clampPercent(point.y),
  };
}

function normalizeRoute(value: unknown, fallback: LoremapAtlasRoute): LoremapAtlasRoute {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const route = value.filter(isPoint).map(normalizePoint);
  return route.length >= 2 ? route : fallback;
}

function normalizeTerrain(value: unknown): LoremapAtlasRoute[] {
  if (!Array.isArray(value)) {
    return DEFAULT_TERRAIN;
  }

  const routes = value
    .filter((route): route is unknown[] => Array.isArray(route))
    .map((route) => route.filter(isPoint).map(normalizePoint))
    .filter((route) => route.length >= 2);

  return routes.length > 0 ? routes.slice(0, 4) : DEFAULT_TERRAIN;
}

function scalePoint(point: LoremapAtlasPoint, layout: LoremapAtlasLayout): LoremapAtlasPoint {
  return {
    x: layout.plotX + (point.x / 100) * layout.plotWidth,
    y: layout.plotY + (point.y / 100) * layout.plotHeight,
  };
}

function toPointString(route: LoremapAtlasRoute, layout: LoremapAtlasLayout): string {
  return route
    .map((point) => scalePoint(point, layout))
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
}

function readString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toHudLabel(value: string, fallback: string, maxLength: number): string {
  const source = (value || fallback).trim() || fallback;
  const compact = source
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  return compact.slice(0, maxLength) || fallback;
}

export function getLoremapAtlasRender(
  data: Record<string, unknown>,
  fallbackTitle: string,
  variant: LoremapAtlasVariant
) {
  const location = readString(data.location, fallbackTitle);
  const terrain = readString(data.terrain, 'terrain pending');
  const geo = readString(data.geo, 'coordinates pending');
  const atlasRaw = data.atlas;
  const atlas = atlasRaw && typeof atlasRaw === 'object' ? (atlasRaw as Record<string, unknown>) : {};
  const layout = LAYOUTS[variant];
  const route = normalizeRoute(atlas.route, DEFAULT_ROUTE);
  const terrainRoutes = normalizeTerrain(atlas.terrain);
  const marker = isPoint(atlas.marker) ? normalizePoint(atlas.marker) : DEFAULT_MARKER;
  const scaledMarker = scalePoint(marker, layout);
  const hudLocationLength = variant === 'page' ? 28 : 26;
  const hudTerrainLength = variant === 'page' ? 28 : 26;
  const hudGeoLength = variant === 'page' ? 28 : 24;

  return {
    location,
    terrain,
    geo,
    hudLocation: toHudLabel(location, 'FIELD', hudLocationLength),
    hudTerrain: toHudLabel(terrain, 'TERRAIN', hudTerrainLength),
    hudGeo: geo.slice(0, hudGeoLength),
    routePoints: toPointString(route, layout),
    terrainPoints: terrainRoutes.map((terrainRoute) => toPointString(terrainRoute, layout)),
    markerX: scaledMarker.x.toFixed(1),
    markerY: scaledMarker.y.toFixed(1),
  };
}
