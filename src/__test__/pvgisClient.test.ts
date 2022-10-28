import { PVGISClient } from '../index';
describe('PVGISClient Tests', () => {
  test('It constructs correctly', () => {
    const pvgisClient = new PVGISClient();

    expect(pvgisClient.clientUUID).toBeDefined();
  });
  test('It constructs correctly with options', () => {
    const pvgisClient = new PVGISClient({
      enableCache: false,
    });

    expect(pvgisClient.cache).toBeUndefined();
  });

  test('Executes series calc correctly', async () => {
    const pvgisClient = new PVGISClient();

    const response = await pvgisClient.seriesCalc({ lat: 43.475324983359855, lon: -3.822893345487924 });
    expect(response).toBeDefined();
  }, 30000);

  test('Executes series calc correctly with callback', async () => {
    const pvgisClient = new PVGISClient();
    let hourlyData;
    const response = await pvgisClient.seriesCalc({ lat: 43.475324983359855, lon: -3.822893345487924 }, (data) => {
      hourlyData = data;
    });
    expect(hourlyData).toBeDefined();
    expect(response).not.toBeDefined();
  }, 30000); //set timeout to 30s

  test('Executes series calc optimzation of orientation and inclination', async () => {
    const pvgisClient = new PVGISClient();
    const response = await pvgisClient.calculateOptimalAngles({ lat: 43.475324983359855, lon: -3.822893345487924 });

    expect(response?.azimuth).toBeDefined();
    expect(response?.slope).toBeDefined();
  }, 30000);

  test('Make correct use of cache', async () => {
    const pvgisClient = new PVGISClient();

    const starttime1 = new Date().getTime();

    const response = await pvgisClient.calculateOptimalAngles({ lat: 43.475324983359855, lon: -3.822893345487924 });
    const endTime1 = new Date().getTime();

    const starttime2 = new Date().getTime();

    const response1 = await pvgisClient.calculateOptimalAngles({ lat: 43.475324983359855, lon: -3.822893345487924 });
    const endTime2 = new Date().getTime();

    //console.log('first response', endTime1 - starttime1 + ' ms');
    //console.log('second response', endTime2 - starttime2 + ' ms');
    expect(endTime2 - starttime2).toBeLessThan(endTime1 - starttime1);
  }, 30000);
});
