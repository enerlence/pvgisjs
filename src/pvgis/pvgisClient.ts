import { HourlyPVGISJSONOutput, PVGISJSONResponse, SeriesCalcOptions, SeriesCalcParams } from '..';
import { CacheHandler } from '../cache/cacheHandler';
import { PVGISTools } from '../model/tools/pvgisTools';
import { buildPath, createUUID } from '../utils';
import { fetchJson, HTTPMethod } from '../utils/fetch';

export interface PVGisCunstructorOptions {
  pvgisEndPoint?: string;
  enableCache: boolean;
}
//TODO: Make test for params error
export class PVGISClient {
  constructor(options?: PVGisCunstructorOptions) {
    if (options) {
      options.pvgisEndPoint && this.setpvgisEndPoint(options.pvgisEndPoint);
    }
  }

  private pvgisEndPoint: string = 'https://re.jrc.ec.europa.eu/api';
  //internal identifier of pvgis client
  readonly clientUUID = createUUID();
  //sets pvgis end point by the constructor
  private setpvgisEndPoint(pvgisEndPoint: string) {
    this.pvgisEndPoint = pvgisEndPoint;
  }

  private cache?: CacheHandler;
  /******************* 
  //TOOLS REQUEST METHODS
  ******************* */

  //HOURLY RADIATION TOOL
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
    //process params
    //default response format is json
    params = {
      outputformat: 'json',
      ...params,
    };
    //check requested request params
    if (checkRequestParams(params)) {
      throw new Error('Incorrect requested params ');
    }
    //compound the path based on parameters
    const queryPath = buildPath(params);
    if (queryPath) {
      //construct the base uri based on tool
      const url = this.pvgisEndPoint + '/' + PVGISTools.seriescalc + queryPath;
      //fetch data
      const seriesCalcResponse = await fetchJson<PVGISJSONResponse | undefined>(HTTPMethod.GET, url);
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

  initializeCache(): void {
    this.cache = new CacheHandler();
  }
}

function checkRequestParams(params: SeriesCalcParams) {
  const { lat, lon } = params;

  if (!lat || !lon || typeof lat !== 'number' || typeof lon !== 'number') return false;
}
