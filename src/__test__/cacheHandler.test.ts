import { CacheHandler } from '../cache/cacheHandler';
import { PVGISClient } from '../pvgis';

describe('Cache handler test', () => {
  //instanciate cacheHandler
  const cache = new CacheHandler({ maxSizeCache: 2 * 10485760 });
  const client = new PVGISClient();
  it('store keys correcty', async () => {
    {
      const response = await client.seriesCalc(
        { lat: 43.475324983359855, lon: -3.822893345487924 },
        {
          returnUrl: true,
        },
      );

      if (response) {
        cache.setItem(response.url, JSON.stringify(response.data));
        console.log(cache?.getSize() + '/' + cache?.getMaxSize());
        //console.log(cache);
        expect(cache.getItem(response.url)).toBeDefined();
      } else {
        expect(response).toBeDefined();
      }
    }
  }, 30000);
  it('clears cache correctly when full keys correcty', async () => {
    {
      const response = await client.seriesCalc(
        { lat: 43.475324983359855, lon: -3.822893345487924 },
        {
          returnUrl: true,
        },
      );
      if (response) {
        cache.setItem(response.url, JSON.stringify(response.data));
        console.log(cache?.getSize() + '/' + cache?.getMaxSize());
        cache.setItem(response.url + '1', JSON.stringify(response.data));
        console.log(cache?.getSize() + '/' + cache?.getMaxSize());
        cache.setItem(response.url + '2', JSON.stringify(response.data));
        console.log(cache?.getSize() + '/' + cache?.getMaxSize());
        //console.log(cache);
        expect(cache.getItem(response.url)).toBeDefined();
      } else {
        expect(response).toBeDefined();
      }
    }
  }, 30000);
});
