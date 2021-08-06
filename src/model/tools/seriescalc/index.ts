import { PVGISRadiationDatabase } from '../../pvgisRadiationDatabases';
import { PVGISPVTechnologies } from '../../pvgisTechnologies';
import { PVGISTrackingTypes } from '../../pvgisTrackingTypes';

export interface PVGISJSONSeriesCalcResponse {
  inputs: InputsPVGISJSONOutput;
  outputs: {
    hourly: HourlyPVGISJSONOutput[];
  };
  meta: MetadataPVGISJSONSeriesCalcOutput;
}
export type PVGISMagnitude = 'P' | 'G(i)' | 'H_sun' | 'T2m' | 'WS10m' | 'Int';
export interface HourlyPVGISJSONOutput extends Record<PVGISMagnitude, number> {
  time: string; // Format example "20160101:0010"
  P: number;
  'G(i)': number;
  H_sun: number;
  T2m: number;
  WS10m: number;
  Int: number;
}

export type MonutingSystemsTypes = 'fixed' | 'inclined_axis' | 'two_axis' | 'vertical_axis';
export type InputsPVGISJSONOutput = {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  meteo_data: {
    radiation_db: string;
    meteo_db: string;
    year_min: number;
    year_max: number;
    use_horizon: boolean;
    horizon_db: string;
    horizon_data: string;
  };
  mounting_system: {
    [key in MonutingSystemsTypes]: {
      slope: {
        value: number;
        optimal: boolean;
      };
      azimuth: {
        value: number;
        optimal: boolean;
      };
      type: string;
    };
  };
  pv_module: {
    technology: string;
    peak_power: number;
    system_loss: number;
  };
};

export type MetadataPVGISJSONSeriesCalcOutput = {
  inputs: {
    location: {
      description: string;
      variables: {
        latitude: {
          description: string;
          units: string;
        };
        longitude: {
          description: string;
          units: string;
        };
        elevation: {
          description: string;
          units: string;
        };
      };
    };
    meteo_data: {
      description: string;
      variables: {
        radiation_db: {
          description: string;
        };
        meteo_db: {
          description: string;
        };
        year_min: {
          description: string;
        };
        year_max: {
          description: string;
        };
        use_horizon: {
          description: string;
        };
        horizon_db: {
          description: string;
        };
      };
    };
    mounting_system: {
      description: string;
      choices: string;
      fields: {
        slope: {
          description: string;
          units: string;
        };
        azimuth: {
          description: string;
          units: string;
        };
      };
    };
    pv_module: {
      description: string;
      variables: {
        technology: {
          description: string;
        };
        peak_power: {
          description: string;
          units: string;
        };
        system_loss: {
          description: string;
          units: string;
        };
      };
    };
  };
  outputs: {
    hourly: {
      type: string;
      timestamp: string;
      variables: {
        P: {
          description: string;
          units: string;
        };
        'G(i)': {
          description: string;
          units: string;
        };
        H_sun: {
          description: string;
          units: string;
        };
        T2m: {
          description: string;
          units: string;
        };
        WS10m: {
          description: string;
          units: string;
        };
        Int: {
          description: string;
        };
      };
    };
  };
};

// defines options for the methos seriesCalc of PVGISClient
export type SeriesCalcOptions = {
  raw?: boolean;
};
// Defines the PVGIS query parameters available for the series calc request
export type SeriesCalcParams = {
  // Latitude, in decimal degrees, south is negative.
  lat: number;
  // Longitude, in decimal degrees, west is negative.
  lon: number;
  // Calculate taking into account shadows from high horizon. Value of 1 for "yes".
  usehorizon?: boolean;
  // Name of the radiation database (DB):
  raddatabase?: PVGISRadiationDatabase;
  // TODO: Add temporal covergae based on databases (https:// ec.europa.eu/jrc/en/PVGIS/docs/usermanual#tab:db-years)
  // First year of the output of hourly averages.
  startyear?: number;
  // Final year of the output of hourly averages.
  endyear?: number;
  pvcalculation?: boolean;
  // Nominal power of the PV system, in kW.
  peakpower?: number;
  // PV technology. Choices are: "crystSi", "CIS", "CdTe" and "Unknown".
  pvtechchoice?: PVGISPVTechnologies;
  mountingplace?: 'free' | 'free-standing' | undefined;
  // Sum of system losses, in percent.
  loss?: number;
  // Type of suntracking used
  trackingtype?: PVGISTrackingTypes;
  // Inclination angle from horizontal plane. Not relevant for 2-axis tracking.
  angle?: number;
  // Orientation (azimuth) angle of the (fixed) plane, 0=south, 90=west, -90=east. Not relevant for tracking planes.
  aspect?: number;
  // Calculate the optimum inclination angle
  optimalinclination?: boolean;
  // Calculate the optimum inclination AND orientation angles.
  optimalangles?: boolean;
  // If true outputs beam, diffuse and reflected radiation components. Otherwise, it outputs only global values.
  components?: boolean;
  // default 'json'
  outputformat?: 'csv' | 'basic' | 'json';
  // Use this with a value of true if you access the web service from a web browser and want to save the data to a file.
  browser?: boolean;
};

/**
 * Interface like SeriesCalcParams with int value on boolean parameters
 */
type booleanSeriesCalcParametrs =
  | 'usehorizon'
  | 'pvcalculation'
  | 'optimalinclination'
  | 'optimalangles'
  | 'components';

interface SeriesCalcParamsAddaptedI extends Omit<SeriesCalcParams, booleanSeriesCalcParametrs> {
  optimalangles?: number;
  usehorizon?: number;
  optimalinclination?: number;
  components?: number;
  pvcalculation?: number;
}
export type SeriesCalcParamsAddapted = SeriesCalcParamsAddaptedI & Record<string, any>;
