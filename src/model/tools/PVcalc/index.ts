import { PVGISRadiationDatabase } from '../../pvgisRadiationDatabases';
import { PVGISPVTechnologies } from '../../pvgisTechnologies';
import { InputsPVGISJSONOutput, MonutingSystemsTypes } from '../seriescalc';

// Defines the PVGIS query parameters available for the PV calc request
export type PVCalcParams = {
  // Latitude, in decimal degrees, south is negative.
  lat: number;
  // Longitude, in decimal degrees, west is negative.
  lon: number;
  // Calculate taking into account shadows from high horizon. Value of 1 for "yes".
  usehorizon?: boolean;
  // Name of the radiation database (DB):
  raddatabase?: PVGISRadiationDatabase;
  // Nominal power of the PV system, in kW.
  peakpower: number;
  // PV technology. Choices are: "crystSi", "CIS", "CdTe" and "Unknown".
  pvtechchoice?: PVGISPVTechnologies;
  mountingplace?: 'free' | 'free-standing' | undefined;
  // Sum of system losses, in percent.
  loss: number;
  // Type of suntracking used
  fixed?: boolean;
  // Inclination angle from horizontal plane. Not relevant for 2-axis tracking.
  angle?: number;
  // Orientation (azimuth) angle of the (fixed) plane, 0=south, 90=west, -90=east. Not relevant for tracking planes.
  aspect?: number;
  // Calculate the optimum inclination angle
  optimalinclination?: boolean;
  // Calculate the optimum inclination AND orientation angles.
  optimalangles?: boolean;
  // Calculate a single inclined axis system.
  // TODO: Transform to int 1 or 0
  inclined_axis?: boolean;
  // 	Calculate optimum angle for a single inclined axis system.
  // TODO: Transform to int 1 or 0
  inclined_optimum?: boolean;
  // 	Inclination angle for a single inclined axis system. Ignored if the optimum angle should be calculated (parameter "inclined_optimum").
  inclinedaxisangle?: number;
  // Calculate a single vertical axis system.
  vertical_axis?: boolean;
  // Calculate optimum angle for a single vertical axis system.
  vertical_optimum?: boolean;
  // Inclination angle for a single vertical axis system. Ignored if the optimum angle should be calculated (parameter "vertical_optimum" set to 1).
  verticalaxisangle?: number;
  // Calculate a two axis tracking system
  twoaxis?: boolean;
  // Calculate the PV electricity price [kwh/year] in the currency introduced by the user for the system cost.
  pvprice?: boolean;
  // Total cost of installing the PV system [your currency].
  systemcost?: number;
  // Interest in %/year
  interest?: number;
  // Expected lifetime of the PV system in years.
  lifetime?: number;
  // default 'json'
  outputformat?: 'csv' | 'basic' | 'json';
  // Use this with a value of true if you access the web service from a web browser and want to save the data to a file.
  browser?: boolean;
};

/**
 * Interface like SeriesCalcParams with int value on boolean parameters
 */
export type booleanPVCalcParametrs =
  | 'usehorizon'
  | 'optimalinclination'
  | 'inclined_axis'
  | 'optimalangles'
  | 'inclined_optimum'
  | 'vertical_axis'
  | 'vertical_optimum'
  | 'twoaxis'
  | 'browser'
  | 'pvprice';
interface PVCalcParamsAddaptedI extends Omit<PVCalcParams, booleanPVCalcParametrs> {
  usehorizon: number;
  optimalinclination: number;
  inclined_axis: number;
  optimalangles: number;
  inclined_optimum: number;
  vertical_axis: number;
  vertical_optimum: number;
  twoaxis: number;
  browser: number;
  pvprice: number;
}
export type PVCalcParamsAddapted = PVCalcParamsAddaptedI & Record<string, any>;

export interface PVGISJSONPVCalcResponse {
  inputs: InputsPVGISJSONOutput;
  outputs: MonthlyPVGISJSONOutput;
  meta: MetadataPVGISJSONPVCalcOutput;
}

interface MonthlyPVGISJSONOutput {
  monthly: {
    [key in MonutingSystemsTypes]: MonthlyPVGISJSONValues[];
  };
  totals: {
    [key in MonutingSystemsTypes]: YearlyPVGISJSONValues;
  };
}

export interface MonthlyPVGISJSONValues {
  month: number;
  E_d: number;
  E_m: number;
  'H(i)_d': number;
  'H(i)_m': number;
  SD_m: number;
}

export interface YearlyPVGISJSONValues {
  E_d: number;
  E_m: number;
  // anual production
  E_y: number;
  'H(i)_d': number;
  'H(i)_m': number;
  'H(i)_y': number;
  SD_m: number;
  SD_y: number;
  // Reduction on production due to incidence angle
  l_aoi: number;
  // Reduction on production due to spectral effects
  l_spec: number;
  // Reduction on production due to temperatures and low irradiance (%)
  l_tg: number;
  // Total losses
  l_total: number;
}

interface MetadataPVGISJSONPVCalcOutput {
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
    economic_data: {
      description: string;
      variables: {
        system_cost: {
          description: string;
          units: string;
        };
        interest: {
          description: string;
          units: string;
        };
        lifetime: {
          description: string;
          units: string;
        };
      };
    };
  };
  outputs: {
    monthly: {
      type: string;
      timestamp: string;
      variables: {
        E_d: {
          description: string;
          units: string;
        };
        E_m: {
          description: string;
          units: string;
        };
        E_y: {
          description: string;
          units: string;
        };
        'H(i)_d': {
          description: string;
          units: string;
        };
        'H(i)_m': {
          description: string;
          units: string;
        };
        'H(i)_y': {
          description: string;
          units: string;
        };
        SD_m: {
          description: string;
          units: string;
        };
        SD_y: {
          description: string;
          units: string;
        };
        l_aoi: {
          description: string;
          units: string;
        };
        l_spec: {
          description: 'Spectral loss';
          units: string;
        };
        l_tg: {
          description: 'Temperature and irradiance loss';
          units: string;
        };
        l_total: {
          description: 'Total loss';
          units: string;
        };
      };
    };
  };
}
