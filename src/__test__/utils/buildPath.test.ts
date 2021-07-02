import { buildPath } from '../../utils';

test('It builds paths correctly', () => {
  const path = buildPath({ test: 1, foo: false, bar: undefined });
  expect(path).toBe('?test=1&foo=false');
});
