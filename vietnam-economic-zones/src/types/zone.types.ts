export interface EconomicZone {
  id: string;
  name: string;
  nameVi: string;
  region: string;
  color: string;
  coordinates: [number, number];
  boundaries?: GeoJSON.FeatureCollection;
  industries: string[];
  population: number;
  gdp: number;
  keyFacts: string[];
  description: string;
  descriptionVi: string;
  establishedYear: number;
  majorCities: string[];
  area: number; // in km²
  economicActivities: {
    agriculture: number;
    industry: number;
    services: number;
  };
}

export interface MapState {
  selectedZone: string | null;
  mapCenter: [number, number];
  zoomLevel: number;
  zones: EconomicZone[];
  isLoading: boolean;
  error: string | null;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  zoneId: string;
  content: string; // base64 encoded
  uploadDate: string;
  tags: string[];
}

export interface QAItem {
  id: string;
  question: string;
  questionVi: string;
  answer: string;
  answerVi: string;
  zoneId: string;
  category: string;
  tags: string[];
}