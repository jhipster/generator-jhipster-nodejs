import { describe, expect, it } from 'expect-node';

import { idType } from './validators.js';

describe('idType', () => {
  it('should give the JSON type of each type of primary key', () => {
    expect(idType({ type: 'Long' })).toBe('integer');
    expect(idType({ type: 'Integer' })).toBe('integer');
    expect(idType({ type: 'UUID' })).toBe('uuid');
    expect(idType({ type: 'String' })).toBe('string');
  });
});
