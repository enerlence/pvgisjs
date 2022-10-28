import { PVGISClient } from '../index';
describe('PVGISClient Version Tests', () => {
  test('Change pvgis version correctly', async () => {
    const pvgisClient = new PVGISClient({ pvgisVersion: 'v5_1' });

    const response = await pvgisClient.seriesCalc(
      { lat: 43.475324983359855, lon: -3.822893345487924 },
      { returnUrl: true },
    );
    if (response) {
      console.log(response.url);
    }
    expect(response).toBeDefined();
  }, 30000);
});
