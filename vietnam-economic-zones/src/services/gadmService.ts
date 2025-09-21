import { ZONE_PROVINCES, ZONE_METADATA, type ZoneId } from '@/utils/zoneProvinces';

export interface GADMFeature {
  type: 'Feature';
  properties: {
    GID_1: string;
    GID_0: string;
    COUNTRY: string;
    NAME_1: string;
    VARNAME_1?: string;
    NL_NAME_1?: string;
    TYPE_1: string;
    ENGTYPE_1: string;
    CC_1?: string;
    HASC_1?: string;
  };
  geometry: {
    type: 'MultiPolygon' | 'Polygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GADMData {
  type: 'FeatureCollection';
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GADMFeature[];
}

export interface ZoneGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      id: ZoneId;
      name: string;
      nameVi: string;
      color: string;
      provinces: string[];
    };
    geometry: {
      type: 'MultiPolygon';
      coordinates: number[][][][];
    };
  }>;
}

class GADMService {
  private gadmData: GADMData | null = null;
  private loading = false;

  async loadGADMData(): Promise<GADMData> {
    if (this.gadmData) {
      return this.gadmData;
    }

    if (this.loading) {
      // Wait for the current loading to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.gadmData!;
    }

    try {
      this.loading = true;
      console.log('Loading GADM data...');

      const response = await fetch('/vietnam-map-data/gadm41_VNM_1.json');
      if (!response.ok) {
        throw new Error(`Failed to load GADM data: ${response.statusText}`);
      }

      this.gadmData = await response.json();
      console.log(`Loaded ${this.gadmData!.features.length} administrative features`);

      return this.gadmData;
    } catch (error) {
      console.error('Error loading GADM data:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  filterFeaturesByProvince(gadmData: GADMData, provinceNames: string[]): GADMFeature[] {
    return gadmData.features.filter(feature =>
      provinceNames.includes(feature.properties.NAME_1)
    );
  }

  mergeProvinceGeometries(features: GADMFeature[]): number[][][][] {
    const allCoordinates: number[][][][] = [];

    features.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        allCoordinates.push(...feature.geometry.coordinates as number[][][][]);
      } else if (feature.geometry.type === 'Polygon') {
        allCoordinates.push([feature.geometry.coordinates as number[][][]]);
      }
    });

    return allCoordinates;
  }

  async generateZoneGeoJSON(): Promise<ZoneGeoJSON> {
    const gadmData = await this.loadGADMData();

    const zoneFeatures = Object.entries(ZONE_PROVINCES).map(([zoneId, provinces]) => {
      const metadata = ZONE_METADATA[zoneId as ZoneId];

      // Filter GADM features for this zone's provinces
      const provinceFeatures = this.filterFeaturesByProvince(gadmData, provinces);

      // Merge all province geometries into a single MultiPolygon
      const mergedCoordinates = this.mergeProvinceGeometries(provinceFeatures);

      return {
        type: 'Feature' as const,
        properties: {
          id: zoneId as ZoneId,
          name: metadata.name,
          nameVi: metadata.nameVi,
          color: metadata.color,
          provinces: provinces
        },
        geometry: {
          type: 'MultiPolygon' as const,
          coordinates: mergedCoordinates
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features: zoneFeatures
    };
  }

  async getProvinceList(): Promise<string[]> {
    const gadmData = await this.loadGADMData();
    const provinces = new Set<string>();

    gadmData.features.forEach(feature => {
      provinces.add(feature.properties.NAME_1);
    });

    return Array.from(provinces).sort();
  }
}

export const gadmService = new GADMService();