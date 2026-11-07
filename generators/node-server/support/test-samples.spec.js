import { describe, expect, it } from 'vitest';

import { sampleVariations } from './test-samples.js';

describe('sampleVariations', () => {
  const variations = (fields, values) => sampleVariations({ fields }, values);

  it('should vary the id the client gives, keeping the length of a text', () => {
    expect(variations([{ fieldName: 'slug', id: true }], { slug: 'main' })).toEqual([
      { fieldName: 'slug', value: '`${sampleWithNewData.slug.slice(`${samples}`.length)}${samples}`' },
    ]);
  });

  it('should vary the unique fields, a number under its maximum', () => {
    const fields = [
      { fieldName: 'rank', fieldValidateRules: ['unique'] },
      { fieldName: 'level', fieldValidateRules: ['unique', 'max'], fieldValidateRulesMax: 10 },
    ];
    expect(variations(fields, { rank: 1, level: 5 })).toEqual([
      { fieldName: 'rank', value: 'sampleWithNewData.rank + samples' },
      { fieldName: 'level', value: 'sampleWithNewData.level - samples' },
    ]);
  });

  it('should leave the other fields, a generated id and a value of a pattern', () => {
    const fields = [
      { fieldName: 'id', id: true },
      { fieldName: 'name' },
      { fieldName: 'isbn', fieldValidateRules: ['unique', 'pattern'], fieldValidateRulesPattern: '[0-9]+' },
    ];
    expect(variations(fields, { name: 'a', isbn: '1' })).toEqual([]);
  });
});
