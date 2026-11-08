import { describe, expect, it } from 'expect-node';

import { uniqueSamples } from './test-samples.js';

/** A field of a prepared entity, giving the values in turn and undefined after them. */
const fakeField = (field, values) => {
  const left = [...values];
  return { propertyName: field.fieldName, generateFakeData: () => left.shift(), ...field };
};
const samples = (fields, count) =>
  uniqueSamples(
    { fields, resetFakerSeed: () => undefined },
    Object.fromEntries(fields.map(({ fieldName }) => [fieldName, 'sampled'])),
    count,
  );

describe('uniqueSamples', () => {
  it('should give each sample the id the client gives and the unique fields', () => {
    const fields = [
      fakeField({ fieldName: 'slug', id: true }, ['a', 'b']),
      fakeField({ fieldName: 'rank', fieldValidateRules: ['unique'], unique: true }, [1, 2]),
      fakeField({ fieldName: 'name' }, ['x', 'y']),
    ];
    expect(samples(fields, 2)).toEqual([
      { slug: 'a', rank: 1 },
      { slug: 'b', rank: 2 },
    ]);
  });

  it('should give the values as the API exchanges them', () => {
    const fields = [
      fakeField({ fieldName: 'since', fieldValidateRules: ['unique'], unique: true }, [new Date('2026-01-02T03:04:05.678Z')]),
    ];
    expect(samples(fields, 1)).toEqual([{ since: '2026-01-02T03:04:05.000Z' }]);
  });

  it('should clear a unique field without a value left', () => {
    const fields = [
      fakeField({ fieldName: 'slug', id: true }, ['a', 'b']),
      fakeField({ fieldName: 'level', fieldValidateRules: ['unique'], unique: true }, [1]),
    ];
    expect(samples(fields, 2)).toEqual([
      { slug: 'a', level: 1 },
      { slug: 'b', level: null },
    ]);
  });

  it('should have nothing for an entity without such fields', () => {
    expect(samples([fakeField({ fieldName: 'name' }, ['x'])], 1)).toBeUndefined();
  });

  it('should leave out a field the values of the sample do not have', () => {
    const fields = [fakeField({ fieldName: 'slug', id: true }, ['a'])];
    expect(uniqueSamples({ fields, resetFakerSeed: () => undefined }, {}, 1)).toBeUndefined();
  });
});
