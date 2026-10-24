import { describe, expect, it } from 'vitest';

import { requiredRecords, requiredReferencesLiteral } from './required-relationships.js';

/** An entity with the properties JHipster prepares, its persistable relationships given. */
const entity = (entityClass, properties = {}) => ({
  name: entityClass,
  entityClass,
  entityInstance: entityClass.toLowerCase(),
  primaryKey: { name: 'id' },
  persistableRelationships: [],
  ...properties,
});

/** A relationship this entity stores. */
const stored = (propertyName, otherEntity, properties = {}) => ({ propertyName, otherEntity, relationshipRequired: true, ...properties });

describe('requiredRecords', () => {
  it('creates the records of the required relationships first, those they reference before them', () => {
    const country = entity('Country');
    const region = entity('Region');
    region.persistableRelationships = [stored('country', country)];
    const city = entity('City');
    city.persistableRelationships = [stored('region', region), stored('tags', entity('Tag'), { relationshipRequired: false })];

    const { records, references } = requiredRecords([city]);
    expect(records.map(record => record.name)).toEqual(['requiredCountry', 'requiredRegion']);
    expect(records[1].references).toEqual([{ property: 'country', record: 'requiredCountry', id: 'id', collection: undefined }]);
    expect(references).toEqual({ city: [{ property: 'region', record: 'requiredRegion', id: 'id', collection: undefined }] });
  });

  it('creates a record once, for the entities of the tests too, and a user for a required relationship with the built-in User', () => {
    const user = entity('User', { builtIn: true, builtInUser: true });
    const country = entity('Country');
    const region = entity('Region');
    region.persistableRelationships = [stored('country', country), stored('owner', user)];
    const city = entity('City');
    city.persistableRelationships = [stored('country', country), stored('region', region, { relationshipRequired: false })];

    const { records, references } = requiredRecords([city, region, country]);
    expect(records.map(record => [record.name, record.user])).toEqual([
      ['requiredCountry', false],
      ['requiredUser', true],
    ]);
    expect(Object.keys(references)).toEqual(['city', 'region']);
  });

  it('leaves out a cycle of required relationships and a required relationship of the entity with itself', () => {
    const a = entity('A');
    const b = entity('B');
    a.persistableRelationships = [stored('b', b), stored('parent', a)];
    b.persistableRelationships = [stored('a', a)];

    const { records, references } = requiredRecords([a]);
    expect(records.map(record => record.name)).toEqual(['requiredB']);
    expect(records[0].references).toEqual([]);
    expect(references).toEqual({ a: [{ property: 'b', record: 'requiredB', id: 'id', collection: undefined }] });
  });
});

describe('requiredReferencesLiteral', () => {
  it('gives the references of the relationships by the id of the records, in an array for a collection', () => {
    expect(
      requiredReferencesLiteral([
        { property: 'region', record: 'requiredRegion', id: 'id' },
        { property: 'tags', record: 'requiredTag', id: 'uuid', collection: true },
      ]),
    ).toBe('region: { id: requiredRegion.id }, tags: [{ uuid: requiredTag.uuid }]');
  });
});
