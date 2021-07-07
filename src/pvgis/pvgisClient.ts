/* tslint:disable:no-unused-expression */
import {
  HourlyPVGISJSONOutput,
  PVGISJSONResponse,
  SeriesCalcOptions,
  SeriesCalcParams,
  SeriesCalcParamsAddapted,
} from '..';
import { CacheHandler } from '../cache/cacheHandler';
import { PVGISTools } from '../model/tools/pvgisTools';
import { buildPath, createUUID } from '../utils';
import { fetchJson, HTTPMethod } from '../utils/fetch';

export interface PVGisCunstructorOptions {
  pvgisEndPoint?: string;
  enableCache: boolean;
}
// TODO: Make test for params error
export class PVGISClient {
  constructor(options?: PVGisCunstructorOptions) {
    if (options) {
      options.pvgisEndPoint && this.setpvgisEndPoint(options.pvgisEndPoint);
    }
    this.initializeCache();
  }

  private pvgisEndPoint: string = 'https:// re.jrc.ec.europa.eu/api';
  // internal identifier of pvgis client
  readonly clientUUID = createUUID();
  // sets pvgis end point by the constructor
  private setpvgisEndPoint(pvgisEndPoint: string) {
    this.pvgisEndPoint = pvgisEndPoint;
  }

  private cache?: CacheHandler;
  /******************* 
  // TOOLS REQUEST METHODS
  ******************* */

  // HOURLY RADIATION TOOL
  /**
   * Executes series calc PVGis tool request and calls callBackFn with response
   * @param params Request configuration parameters
   * @param callBackFn function to be executed when response is recieved
   * @returns {Promise<Void>}
   */
  async seriesCalc(
    params: SeriesCalcParams,
    callBackFn: (hourlyData?: HourlyPVGISJSONOutput[] | undefined) => void,
  ): Promise<void>;
  /**
   * Executes series calc PVGis tool request and return response
   * @async
   * @param params Request configuration parameters
   * @param callBackFn function to be executed when response is recieved
   * @return {Promise<PVGISJSONResponse>} PVGis seriescalc tool response
   */
  async seriesCalc(params: SeriesCalcParams): Promise<PVGISJSONResponse | undefined>;
  /**
   * Executes series calc PVGis tool request and return an object with request url and response
   * @async
   * @param params Request configuration parameters
   * @param callBackFn function to be executed when response is recieved
   * @return {Promise<Object>} PVGis seriescalc tool response
   */
  async seriesCalc(
    params: SeriesCalcParams,
    options: { returnUrl: boolean },
  ): Promise<{ data: PVGISJSONResponse | undefined; url: string } | undefined>;
  async seriesCalc(
    params: SeriesCalcParams,
    param1?: any,
  ): Promise<PVGISJSONResponse | undefined | void | { data: PVGISJSONResponse | undefined; url: string }> {
    // process params
    // default response format is json
    params = {
      outputformat: 'json',
      ...params,
    };
    // check requested request params
    if (checkRequestParams(params)) {
      throw new Error('Incorrect requested params ');
    }
    // transform boolean params ti integer (0 ir 1)
    const transformedParams = transformBooleanParamsToIntCode(params);
    // compound the path based on parameters
    const queryPath = buildPath(transformedParams);
    if (queryPath) {
      // construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.seriescalc + queryPath;
      // fetch data (checking cache)
      const seriesCalcResponse = this.cache?.getItem(url)
        ? this.cache?.getItem<PVGISJSONResponse>(url)!
        : await fetchJson<PVGISJSONResponse | undefined>(HTTPMethod.GET, url);
      // store in cache
      this.cache && this.cache.setItem(url, JSON.stringify(seriesCalcResponse));

      if (param1?.returnUrl) {
        return {
          data: seriesCalcResponse,
          url,
        };
      }
      if (typeof param1 === 'function') {
        param1(seriesCalcResponse?.outputs?.hourly);
        return;
      }
      return seriesCalcResponse;
    }
  }

  /**
   * Initializes cache handler for the client
   */
  initializeCache(): void {
    this.cache = new CacheHandler();
  }

  /**
   * Calculates optimal inclination and orientation making a seriesCalc request with parameters optimalinclination and optimalangles
   * and returns only that information
   */
  async calculateOptimalAngles(params: SeriesCalcParams): Promise<{ azimuth: number; slope: number } | undefined> {
    // process params
    // default response format is json
    params = {
      outputformat: 'json',
      ...params,
      optimalangles: true,
      optimalinclination: true,
    };
    // check requested request params
    if (checkRequestParams(params)) {
      throw new Error('Incorrect requested params');
    }

    // transform boolean params ti integer (0 ir 1)
    const transformedParams = transformBooleanParamsToIntCode(params);
    const queryPath = buildPath(transformedParams);
    if (queryPath) {
      // construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.seriescalc + queryPath;

      const seriesCalcResponse = this.cache?.getItem<PVGISJSONResponse>(url)
        ? this.cache?.getItem<PVGISJSONResponse>(url)
        : await fetchJson<PVGISJSONResponse | undefined>(HTTPMethod.GET, url);
      // store in cache
      this.cache && this.cache.setItem(url, JSON.stringify(seriesCalcResponse));
      if (seriesCalcResponse?.inputs?.mounting_system?.fixed) {
        const { azimuth, slope } = seriesCalcResponse.inputs.mounting_system.fixed;

        return { azimuth: azimuth.value, slope: slope.value };
      }
    }
  }
}

function checkRequestParams(params: SeriesCalcParams) {
  const { lat, lon } = params;

  if (!lat || !lon || typeof lat !== 'number' || typeof lon !== 'number') return false;
}

/**
 * Transform series calc boolean parameters to 1 or 0 integers to be processed by pvgis end points
 * @param params
 */

function transformBooleanParamsToIntCode(params: SeriesCalcParams): SeriesCalcParamsAddapted {
  const addaptedParams: SeriesCalcParamsAddapted = { ...params } as unknown as SeriesCalcParamsAddapted;

  try {
    const BOOLEAN_PARAMETERS: (keyof SeriesCalcParams)[] = [
      'usehorizon',
      'pvcalculation',
      'optimalinclination',
      'optimalangles',
      'components',
    ];
    // transform those parameters from boolean to int
    const booleanToInt = (bool: boolean) => (bool ? 1 : 0);
    BOOLEAN_PARAMETERS.forEach((b) => {
      (addaptedParams as any)[b] = booleanToInt(params[b] as any);
    });
    return addaptedParams;
  } catch (_) {
    return addaptedParams;
  }
}
