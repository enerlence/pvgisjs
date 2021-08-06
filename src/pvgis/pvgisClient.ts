/* tslint:disable:no-unused-expression */
import {
  HourlyPVGISJSONOutput,
  PVGISJSONSeriesCalcResponse,
  SeriesCalcOptions,
  SeriesCalcParams,
  SeriesCalcParamsAddapted,
} from '..';
import { CacheHandler } from '../cache/cacheHandler';
import {
  booleanPVCalcParametrs,
  PVCalcParams,
  PVCalcParamsAddapted,
  PVGISJSONPVCalcResponse,
} from '../model/tools/PVcalc';
import { PVGISTools } from '../model/tools/pvgisTools';
import { buildPath, createUUID } from '../utils';
import { fetchJson, HTTPMethod } from '../utils/fetch';

export interface PVGisCunstructorOptions {
  pvgisEndPoint?: string;
  enableCache: boolean;
}
export class PVGISClient {
  constructor(options?: PVGisCunstructorOptions) {
    if (options) {
      options.pvgisEndPoint && this.setpvgisEndPoint(options.pvgisEndPoint);
    }
    this.initializeCache();
  }

  private pvgisEndPoint: string = 'https://re.jrc.ec.europa.eu/api';
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
   * @return {Promise<PVGISJSONSeriesCalcResponse>} PVGis seriescalc tool response
   */
  async seriesCalc(params: SeriesCalcParams): Promise<PVGISJSONSeriesCalcResponse | undefined>;
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
  ): Promise<{ data: PVGISJSONSeriesCalcResponse | undefined; url: string } | undefined>;
  async seriesCalc(
    params: SeriesCalcParams,
    param1?: any,
  ): Promise<
    PVGISJSONSeriesCalcResponse | undefined | void | { data: PVGISJSONSeriesCalcResponse | undefined; url: string }
  > {
    // process params
    // default response format is json
    params = {
      outputformat: 'json',
      ...params,
    };
    // check requested request params
    if (checkRequestSeriesCalcParams(params)) {
      throw new Error('Incorrect requested params ');
    }
    // transform boolean params ti integer (0 ir 1)
    const transformedParams = transformBooleanSeriesCalcParamsToIntCode(params);
    // compound the path based on parameters
    const queryPath = buildPath(transformedParams);
    if (queryPath) {
      // construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.seriescalc + queryPath;
      // fetch data (checking cache)
      const seriesCalcResponse = this.cache?.getItem(url)
        ? this.cache?.getItem<PVGISJSONSeriesCalcResponse>(url)!
        : await fetchJson<PVGISJSONSeriesCalcResponse | undefined>(HTTPMethod.GET, url);
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

  // PV CALC TOOL:

  /**
   * Executes pv calc PVGis tool request and return response
   * @async
   * @param params Request configuration parameters
   * @param callBackFn function to be executed when response is recieved
   * @return {Promise<PVGISJSONSeriesCalcResponse>} PVGis seriescalc tool response
   */
  async pvCalc(params: PVCalcParams): Promise<PVGISJSONPVCalcResponse | undefined>;
  /**
   * Executes pv calc PVGis tool request and return an object with request url and response
   * @async
   * @param params Request configuration parameters
   * @param callBackFn function to be executed when response is recieved
   * @return {Promise<Object>} PVGis seriescalc tool response
   */
  async pvCalc(
    params: PVCalcParams,
    options: { returnUrl: boolean },
  ): Promise<{ data: PVGISJSONPVCalcResponse | undefined; url: string } | undefined>;
  async pvCalc(
    params: PVCalcParams,
    param1?: any,
  ): Promise<PVGISJSONPVCalcResponse | undefined | void | { data: PVGISJSONPVCalcResponse | undefined; url: string }> {
    // process params
    // default response format is json
    params = {
      outputformat: 'json',
      ...params,
    };
    // check requested request params
    if (checkRequestPVCalcParams(params)) {
      throw new Error('Incorrect requested params ');
    }
    // transform boolean params ti integer (0 ir 1)
    const transformedParams = transformBooleanPVCalcParamsToIntCode(params);
    // compound the path based on parameters
    const queryPath = buildPath(transformedParams);
    if (queryPath) {
      // construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.PVcalc + queryPath;
      // fetch data (checking cache)
      const pvCalcResponse = this.cache?.getItem(url)
        ? this.cache?.getItem<PVGISJSONPVCalcResponse>(url)!
        : await fetchJson<PVGISJSONPVCalcResponse | undefined>(HTTPMethod.GET, url);
      // store in cache
      this.cache && this.cache.setItem(url, JSON.stringify(pvCalcResponse));

      if (param1?.returnUrl) {
        return {
          data: pvCalcResponse,
          url,
        };
      }
      if (typeof param1 === 'function') {
        param1(pvCalcResponse?.outputs);
        return;
      }
      return pvCalcResponse;
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
    if (checkRequestSeriesCalcParams(params)) {
      throw new Error('Incorrect requested params');
    }

    // transform boolean params ti integer (0 ir 1)
    const transformedParams = transformBooleanSeriesCalcParamsToIntCode(params);
    const queryPath = buildPath(transformedParams);
    if (queryPath) {
      // construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.seriescalc + queryPath;

      const seriesCalcResponse = this.cache?.getItem<PVGISJSONSeriesCalcResponse>(url)
        ? this.cache?.getItem<PVGISJSONSeriesCalcResponse>(url)
        : await fetchJson<PVGISJSONSeriesCalcResponse | undefined>(HTTPMethod.GET, url);
      // store in cache
      this.cache && this.cache.setItem(url, JSON.stringify(seriesCalcResponse));
      if (seriesCalcResponse?.inputs?.mounting_system?.fixed) {
        const { azimuth, slope } = seriesCalcResponse.inputs.mounting_system.fixed;

        return { azimuth: azimuth.value, slope: slope.value };
      }
    }
  }

  clearCache() {
    this.cache && this.cache.clear();
  }
}
/**
 * Check that mandatory parameters of series calc method are present and correctly defined
 * @param params
 * @returns
 */
function checkRequestSeriesCalcParams(params: SeriesCalcParams) {
  const { lat, lon } = params;

  if (!lat || !lon || typeof lat !== 'number' || typeof lon !== 'number') return false;
}
/**
 * Check that mandatory parameters of pv calc method are present and correctly defined
 * @param params
 * @returns
 */
function checkRequestPVCalcParams(params: PVCalcParams) {
  const { lat, lon, peakpower, loss } = params;

  if (
    !lat ||
    !lon ||
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    !peakpower ||
    typeof peakpower !== 'number' ||
    !loss ||
    typeof loss !== 'number'
  )
    return false;
}

/**
 * Transform series calc boolean parameters to 1 or 0 integers to be processed by pvgis end points
 * @param params
 */

function transformBooleanSeriesCalcParamsToIntCode(params: SeriesCalcParams): SeriesCalcParamsAddapted {
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

function transformBooleanPVCalcParamsToIntCode(params: PVCalcParams): PVCalcParamsAddapted {
  const addaptedParams: PVCalcParamsAddapted = { ...params } as unknown as PVCalcParamsAddapted;

  try {
    const BOOLEAN_PARAMETERS: booleanPVCalcParametrs[] = [
      'browser',
      'inclined_axis',
      'inclined_optimum',
      'optimalangles',
      'optimalinclination',
      'pvprice',
      'twoaxis',
      'usehorizon',
      'vertical_axis',
      'vertical_optimum',
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
