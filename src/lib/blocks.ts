import { getDb } from "./db";
import type {
  BlockDetail,
  BlockSummary,
  BlockFeature,
  NoiseData,
  ConstructionData,
  FoodData,
  TransitData,
  WalkabilityData,
  ScoreDimension,
  Neighborhood,
  Borough,
} from "@/types";
import { seedBlocks } from "@/data/seed";

// Get all blocks as GeoJSON features for the map
export async function getBlockFeatures(): Promise<BlockFeature[]> {
  const db = getDb();

  if (db) {
    try {
      const result = await db.execute(
        "SELECT id, street_name, from_cross, to_cross, neighborhood, borough, geometry_json, block_score FROM blocks"
      );

      return result.rows.map((row) => ({
        type: "Feature" as const,
        geometry: JSON.parse(row.geometry_json as string),
        properties: {
          id: row.id as string,
          name: `${row.street_name} between ${row.from_cross} and ${row.to_cross}`,
          neighborhood: row.neighborhood as string,
          borough: row.borough as string,
          blockScore: row.block_score as number | null,
        },
      }));
    } catch {
      // Store unreachable or not migrated; the bundled seed answers instead.
    }
  }

  return seedBlocks.map((b) => ({
    type: "Feature" as const,
    geometry: b.geometryJson,
    properties: {
      id: b.id,
      name: `${b.streetName} between ${b.fromCross} and ${b.toCross}`,
      neighborhood: b.neighborhood,
      borough: b.borough,
      blockScore: b.blockScore,
    },
  }));
}

// Get block summaries for the list view
export async function getBlockSummaries(): Promise<BlockSummary[]> {
  const db = getDb();

  if (db) {
    try {
      const blocksResult = await db.execute(
        `SELECT id, street_name, from_cross, to_cross, neighborhood, borough,
                centroid_lat, centroid_lng, block_score
         FROM blocks ORDER BY block_score DESC`
      );

      const summaries: BlockSummary[] = [];

      for (const row of blocksResult.rows) {
        const scoresResult = await db.execute({
          sql: `SELECT dimension, score FROM block_scores
                WHERE block_id = ? ORDER BY week_of DESC`,
          args: [row.id as string],
        });

        const scores: Partial<Record<ScoreDimension, number | null>> = {};
        for (const scoreRow of scoresResult.rows) {
          const dim = scoreRow.dimension as ScoreDimension;
          if (!(dim in scores)) {
            scores[dim] = scoreRow.score as number;
          }
        }

        summaries.push({
          id: row.id as string,
          streetName: row.street_name as string,
          fromCross: row.from_cross as string,
          toCross: row.to_cross as string,
          neighborhood: row.neighborhood as Neighborhood,
          borough: row.borough as Borough,
          centroidLat: row.centroid_lat as number,
          centroidLng: row.centroid_lng as number,
          blockScore: row.block_score as number | null,
          scores,
        });
      }

      return summaries;
    } catch {
      // Store unreachable or not migrated; the bundled seed answers instead.
    }
  }

  return seedBlocks.map((b) => ({
    id: b.id,
    streetName: b.streetName,
    fromCross: b.fromCross,
    toCross: b.toCross,
    neighborhood: b.neighborhood,
    borough: b.borough,
    centroidLat: b.centroidLat,
    centroidLng: b.centroidLng,
    blockScore: b.blockScore,
    scores: b.scores,
  }));
}

// Get full block detail with all deep-dive data
export async function getBlockDetail(
  blockId: string
): Promise<BlockDetail | null> {
  const db = getDb();

  if (db) {
    try {
      const blockResult = await db.execute({
        sql: "SELECT * FROM blocks WHERE id = ?",
        args: [blockId],
      });

      if (blockResult.rows.length === 0) {
        // Try seed data
        const seedBlock = seedBlocks.find((b) => b.id === blockId);
        if (!seedBlock) return null;
        return buildBlockDetailFromSeed(seedBlock);
      }

      const row = blockResult.rows[0];

      // Get latest scores
      const scoresResult = await db.execute({
        sql: `SELECT dimension, score, component_data_json
              FROM block_scores WHERE block_id = ?
              ORDER BY week_of DESC`,
        args: [blockId],
      });

      const scores: Record<ScoreDimension, number | null> = {
        noise: null,
        transit: null,
        food: null,
        walk: null,
        construction: null,
      };

      let noiseData: NoiseData | null = null;
      let constructionData: ConstructionData | null = null;
      let foodData: FoodData | null = null;
      let transitData: TransitData | null = null;
      let walkabilityData: WalkabilityData | null = null;

      for (const scoreRow of scoresResult.rows) {
        const dim = scoreRow.dimension as ScoreDimension;
        if (scores[dim] === null) {
          scores[dim] = scoreRow.score as number;
          const componentData = JSON.parse(
            scoreRow.component_data_json as string
          );

          switch (dim) {
            case "noise":
              noiseData = componentData as NoiseData;
              break;
            case "construction":
              constructionData = componentData as ConstructionData;
              break;
            case "food":
              foodData = componentData as FoodData;
              break;
            case "transit":
              transitData = componentData as TransitData;
              break;
            case "walk":
              walkabilityData = componentData as WalkabilityData;
              break;
          }
        }
      }

      return {
        id: row.id as string,
        streetName: row.street_name as string,
        fromCross: row.from_cross as string,
        toCross: row.to_cross as string,
        neighborhood: row.neighborhood as Neighborhood,
        borough: row.borough as Borough,
        centroidLat: row.centroid_lat as number,
        centroidLng: row.centroid_lng as number,
        geometryJson: JSON.parse(row.geometry_json as string),
        blockScore: row.block_score as number | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        scores,
        noise: noiseData,
        construction: constructionData,
        food: foodData,
        transit: transitData,
        walkability: walkabilityData,
      };
    } catch {
      // Store unreachable or not migrated; the bundled seed answers instead.
    }
  }

  const seedBlock = seedBlocks.find((b) => b.id === blockId);
  if (!seedBlock) return null;
  return buildBlockDetailFromSeed(seedBlock);
}

// Build BlockDetail from seed data entry
function buildBlockDetailFromSeed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seed: any
): BlockDetail {
  return {
    id: seed.id,
    streetName: seed.streetName,
    fromCross: seed.fromCross,
    toCross: seed.toCross,
    neighborhood: seed.neighborhood,
    borough: seed.borough,
    centroidLat: seed.centroidLat,
    centroidLng: seed.centroidLng,
    geometryJson: seed.geometryJson,
    blockScore: seed.blockScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scores: seed.scores,
    noise: seed.noise,
    construction: seed.construction,
    food: seed.food,
    transit: seed.transit,
    walkability: seed.walkability,
  };
}
