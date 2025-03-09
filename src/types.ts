import { FeatureCollection } from 'geojson';

export interface KMLStats {
  Placemark: number;
  Point: number;
  LineString: number;
  Polygon: number;
  MultiLineString: number;
  [key: string]: number;
}

export interface DetailedStats {
  type: string;
  length?: number;
}

export interface KMLViewerState {
  geoJSON: FeatureCollection | null;
  stats: KMLStats;
  detailedStats: DetailedStats[];
}