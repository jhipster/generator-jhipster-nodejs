import { describe, expect, it } from 'expect-node';

import { idType, numberFromText } from './validators.js';

describe('idType', () => {
  it('should give the JSON type of each type of primary key', () => {
    expect(idType({ type: 'Long' })).toBe('long');
    expect(idType({ type: 'Integer' })).toBe('integer');
    expect(idType({ type: 'UUID' })).toBe('uuid');
    expect(idType({ type: 'String' })).toBe('string');
  });
});

describe('numberFromText', () => {
  it('should take a Long and a BigDecimal as a text too, not an Integer, a Float nor a Double', () => {
    expect(['Long', 'BigDecimal', 'Integer', 'Float', 'Double'].filter(fieldType => numberFromText({ fieldType }))).toEqual([
      'Long',
      'BigDecimal',
    ]);
  });
});
