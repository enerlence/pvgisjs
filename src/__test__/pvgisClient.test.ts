import { PVGISClient } from '../index';
describe('PVGISClient Tests', () => {
  test('It constructs correctly', () => {
    const pvgisClient = new PVGISClient();

    expect(pvgisClient.clientUUID).toBeDefined();
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
});
