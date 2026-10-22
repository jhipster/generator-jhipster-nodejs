import { describe, expect, it } from 'vitest';

import { serverEnumInfo } from './enums.js';

describe('serverEnumInfo', () => {
  it('should give each value of the enum its name, the custom values being labels of the client', () => {
    const field = { fieldType: 'Size', fieldValues: 'SMALL (small_size),LARGE (large_size)', fieldIsEnum: true, enumFileName: 'size' };
    expect(serverEnumInfo(field).enumValues.map(({ name, value }) => [name, value])).toEqual([
      ['SMALL', 'SMALL'],
      ['LARGE', 'LARGE'],
    ]);
  });
});
