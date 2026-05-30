// Core domain types for BlockScore

export type Borough = "Brooklyn" | "Manhattan";

export type Neighborhood =
  | "Williamsburg"
  | "Bushwick"
  | "Greenpoint"
  | "Park Slope"
  | "Crown Heights"
  | "Bed-Stuy"
  | "Cobble Hill"
  | "Lower East Side"
  | "East Village"
  | "West Village"
  | "Chelsea"
  | "Harlem"
  | "UWS"
  | "UES"
  | "Hell's Kitchen";

export type ScoreDimension =
  | "noise"
  | "transit"
  | "food"
  | "walk"
  | "construction";

export type NoiseType =
  | "Loud Music/Party"
  | "Construction"
  | "Commercial"
  | "Barking Dog"
  | "Other";

export type NoiseTrend = "improving" | "worsening" | "stable";

export type PermitType =
  | "New Building"
  | "Alteration Type I"
  | "Alteration Type II"
  | "Demolition";

export type InspectionGrade = "A" | "B" | "C" | "Z" | "P" | "Not Yet Graded";

export interface Block {
  id: string;
  streetName: string;
  fromCross: string;
  toCross: string;
  neighborhood: Neighborhood;
  borough: Borough;
  centroidLat: number;
  centroidLng: number;
  geometryJson: GeoJSON.LineString;
  blockScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockScore {
  blockId: string;
  dimension: ScoreDimension;
  score: number;
  componentData: Record<string, unknown>;
  weekOf: string;
}

export interface NoiseData {
  totalComplaints: number;
  breakdown: Record<NoiseType, number>;
  daytimePercent: number;
  nighttimePercent: number;
  trend: NoiseTrend;
  priorYearTotal: number;
  neighborhoodAvg: number;
}

export interface ConstructionData {
  activePermits: number;
  completedPermits24mo: number;
  permitTypes: Record<PermitType, number>;
  heavyConstruction: boolean;
}

export interface FoodData {
  restaurantCount: number;
  topCuisines: string[];
  recentOpenings: number;
  cuisineDiversityScore: number;
  gradeDistribution: Record<InspectionGrade, number>;
}

export interface TransitData {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  nearestSubway: SubwayStation[];
  citiBikeStations: CitiBikeStation[];
}

export interface WalkabilityData {
  walkScore: number;
  description: string;
}

export interface SubwayStation {
  name: string;
  lines: string[];
  walkMinutes: number;
  distance: number;
}

export interface CitiBikeStation {
  name: string;
  dockCount: number;
  distanceMeters: number;
}

export interface BlockDetail extends Block {
  scores: Record<ScoreDimension, number | null>;
  noise: NoiseData | null;
  construction: ConstructionData | null;
  food: FoodData | null;
  transit: TransitData | null;
  walkability: WalkabilityData | null;
}

export interface BlockSummary {
  id: string;
  streetName: string;
  fromCross: string;
  toCross: string;
  neighborhood: Neighborhood;
  borough: Borough;
  centroidLat: number;
  centroidLng: number;
  blockScore: number | null;
  scores: Partial<Record<ScoreDimension, number | null>>;
}

// Map feature for Mapbox rendering
export interface BlockFeature {
  type: "Feature";
  geometry: GeoJSON.LineString;
  properties: {
    id: string;
    name: string;
    neighborhood: string;
    borough: string;
    blockScore: number | null;
  };
}

// Subway line colors (MTA standard)
export const SUBWAY_LINES: Record<string, string> = {
  "1": "#EE352E",
  "2": "#EE352E",
  "3": "#EE352E",
  "4": "#00933C",
  "5": "#00933C",
  "6": "#00933C",
  "7": "#B933AD",
  A: "#2850AD",
  C: "#2850AD",
  E: "#2850AD",
  B: "#FF6319",
  D: "#FF6319",
  F: "#FF6319",
  M: "#FF6319",
  G: "#6CBE45",
  J: "#996633",
  Z: "#996633",
  L: "#A7A9AC",
  N: "#FCCC0A",
  Q: "#FCCC0A",
  R: "#FCCC0A",
  W: "#FCCC0A",
  S: "#808183",
};

// Score color thresholds (preserved from v1)
export function getScoreColor(score: number | null): string {
  if (score === null) return "#525252";
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#eab308";
  if (score >= 50) return "#f97316";
  return "#ef4444";
}

export function getScoreLabel(score: number | null): string {
  if (score === null) return "No data";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

// Letter grade keyed off the same thresholds as the color and word label,
// so the hero ring can show a single-glance verdict (A through D).
export function getScoreGrade(score: number | null): string {
  if (score === null) return "?";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}
