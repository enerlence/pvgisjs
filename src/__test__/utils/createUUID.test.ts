import { createUUID } from '../../utils';

test('It creates UUID correctly', () => {
  const uuid1 = createUUID();
  const uuid2 = createUUID();

  expect(uuid1).toBeDefined();
  expect(uuid2).toBeDefined();
  expect(uuid1).not.toEqual(uuid2);
});
