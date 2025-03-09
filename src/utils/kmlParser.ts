import { kml } from '@tmcw/togeojson';
import { Feature, FeatureCollection } from 'geojson';
import { KMLStats, DetailedStats } from '../types';

export const parseKMLFile = (file: File): Promise<Document> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parser = new DOMParser();
      const kmlDoc = parser.parseFromString(e.target?.result as string, 'text/xml');
      resolve(kmlDoc);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const calculateStats = (geoJSON: FeatureCollection): KMLStats => {
  const stats: KMLStats = {
    Placemark: 0,
    Point: 0,
    LineString: 0,
    Polygon: 0,
    MultiLineString: 0,
  };

  geoJSON.features.forEach((feature) => {
    stats.Placemark++;
    if (feature.geometry) {
      stats[feature.geometry.type]++;
    }
  });

  return stats;
};

export const calculateLength = (feature: Feature): number => {
  let length = 0;
  if (feature.geometry.type === 'LineString') {
    const coordinates = feature.geometry.coordinates;
    for (let i = 1; i < coordinates.length; i++) {
      const [lon1, lat1] = coordinates[i - 1];
      const [lon2, lat2] = coordinates[i];
      length += calculateDistance(lat1, lon1, lat2, lon2);
    }
  } else if (feature.geometry.type === 'MultiLineString') {
    feature.geometry.coordinates.forEach(lineString => {
      for (let i = 1; i < lineString.length; i++) {
        const [lon1, lat1] = lineString[i - 1];
        const [lon2, lat2] = lineString[i];
        length += calculateDistance(lat1, lon1, lat2, lon2);
      }
    });
  }
  return length;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const getDetailedStats = (geoJSON: FeatureCollection): DetailedStats[] => {
  return geoJSON.features
    .filter(feature => ['LineString', 'MultiLineString'].includes(feature.geometry.type))
    .map(feature => ({
      type: feature.geometry.type,
      length: calculateLength(feature),
    }));
};