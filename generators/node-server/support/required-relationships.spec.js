import { describe, expect, it } from 'vitest';

import { mutateData } from 'generator-jhipster/utils';

import { mutateRequiredRelationship, mutateRequiredRelationshipsEntity, requiredRecords } from './required-relationships.js';

/** An entity with the properties JHipster prepares, its relationships given. */
const entity = (entityClass, properties = {}) => ({
  name: entityClass,
  entityClass,
  entityInstance: entityClass.toLowerCase(),
  entityApiUrl: `${entityClass.toLowerCase()}s`,
  primaryKey: { name: 'id', fields: [{ fieldName: 'id', generateFakeData: () => 42 }] },
  fields: [],
  relationships: [],
  resetFakerSeed: () => {},
  ...properties,
});

/** A relationship this entity stores, required, as the mutations of JHipster and of the blueprint prepare it. */
const stored = (propertyName, otherEntity, properties = {}) => {
  const relationship = {
    propertyName,
    relationshipName: propertyName,
    otherEntity,
    relationshipRequired: true,
    persistableRelationship: true,
    ...properties,
  };
  // The columnRequired of jhipster:base-application:database-bootstrap.
  relationship.columnRequired ??= relationship.relationshipRequired;
  mutateData(relationship, mutateRequiredRelationship);
  return relationship;
};

describe('mutateRequiredRelationship', () => {
  it('should give the mocked tests a reference of the type of the id of the other entity', () => {
    expect(stored('country', entity('Country')).nodejsMockReference).toBe('{ id: 42 }');
    expect(stored('tags', entity('Tag'), { collection: true }).nodejsMockReference).toBe('[{ id: 42 }]');
    expect(stored('country', entity('Country'), { relationshipRequired: false }).nodejsMockReference).toBeUndefined();
    // A required relationship the other entity stores.
    expect(stored('cities', entity('City'), { persistableRelationship: false }).nodejsMockReference).toBeUndefined();
  });
});

describe('requiredRecords', () => {
  it('creates the records of the required relationships first, those they reference before them', () => {
    const country = entity('Country');
    const region = entity('Region');
    region.relationships = [stored('country', country)];
    const city = entity('City');
    city.relationships = [stored('region', region), stored('tags', entity('Tag'), { relationshipRequired: false })];

    const { records, references } = requiredRecords([city]);
    expect(records.map(record => record.name)).toEqual(['requiredCountry', 'requiredRegion']);
    expect(records[1].references).toEqual([{ property: 'country', record: 'requiredCountry', id: 'id', collection: undefined }]);
    expect(references).toEqual({ city: [{ property: 'region', record: 'requiredRegion', id: 'id', collection: undefined }] });
  });

  it('creates a record once, for the entities of the tests too, and a user for a required relationship with the built-in User', () => {
    const user = entity('User', { builtIn: true, builtInUser: true });
    const country = entity('Country');
    const region = entity('Region');
    region.relationships = [stored('country', country), stored('owner', user)];
    const city = entity('City');
    city.relationships = [stored('country', country), stored('region', region, { relationshipRequired: false })];

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
    a.relationships = [stored('b', b), stored('parent', a)];
    b.relationships = [stored('a', a)];

    const { records, references } = requiredRecords([a]);
    expect(records.map(record => record.name)).toEqual(['requiredB']);
    expect(records[0].references).toEqual([]);
    expect(references).toEqual({ a: [{ property: 'b', record: 'requiredB', id: 'id', collection: undefined }] });
  });
});

describe('mutateRequiredRelationshipsEntity', () => {
  it('should prepare the records, their bodies and the values the database tests send, as the template renders them', () => {
    const country = entity('Country');
    const region = entity('Region');
    region.relationships = [stored('country', country)];
    const city = entity('City');
    city.relationships = [stored('region', region), stored('owner', entity('User', { builtIn: true, builtInUser: true }))];
    mutateData(city, mutateRequiredRelationshipsEntity({ databaseTypeSql: true }));

    expect(city.nodejsRequiredRelationships.map(relationship => relationship.propertyName)).toEqual(['region', 'owner']);
    expect(city.nodejsRequiredRecords).toMatchObject({
      records: [
        { name: 'requiredCountry', creator: 'createRequiredCountry', shared: true, entityApiUrl: 'countrys', values: {}, body: '{}' },
        {
          name: 'requiredRegion',
          creator: 'createRequiredRegion',
          shared: true,
          entityApiUrl: 'regions',
          values: {},
          body: '{ ...{}, country: { id: requiredCountry.id } }',
        },
        { name: 'requiredUser', creator: 'createRequiredUser', shared: true, user: true, login: 'city-required-e2e' },
      ],
      references: [
        { instance: 'city', literal: 'region: { id: requiredRegion.id }, owner: { id: requiredUser.id }', creating: false },
        { instance: 'region', literal: 'country: { id: requiredCountry.id }', creating: false },
      ],
      anyUser: true,
      createdValues: '{ ...createdValues, ...(await required.city()) }',
      relatedValues: {
        city: '{ ...relatedValues, ...(await required.city()) }',
        region: '{ ...relatedValues, ...(await required.region()) }',
      },
    });
  });

  it('should reference a new record for each record of a required one-to-one relationship, whose join column is unique', () => {
    const profile = entity('Profile');
    const owner = entity('Owner');
    owner.relationships = [stored('profile', profile, { relationshipOneToOne: true })];
    const report = entity('Report');
    report.relationships = [stored('owner', owner)];
    mutateData(report, mutateRequiredRelationshipsEntity({ databaseTypeSql: true }));

    expect(report.nodejsRequiredRecords).toMatchObject({
      records: [
        { name: 'requiredProfile', creator: 'createRequiredProfile', shared: false },
        { name: 'requiredOwner', shared: true, body: '{ ...{}, profile: { id: (await createRequiredProfile()).id } }' },
      ],
      references: [
        { instance: 'report', literal: 'owner: { id: requiredOwner.id }', creating: false },
        // The owners of the relationship tests of the report, each with a new profile.
        { instance: 'owner', literal: 'profile: { id: (await createRequiredProfile()).id }', creating: true },
      ],
    });
  });

  it('should create a record of the entity of the tests another entity of the tests requires', () => {
    const tag = entity('Tag');
    const owner = entity('Owner');
    owner.relationships = [stored('profile', tag, { relationshipOneToOne: true })];
    tag.relationships = [
      { propertyName: 'owner', otherEntity: owner, persistableRelationship: false, otherRelationship: { propertyName: 'profile' } },
    ];
    mutateData(tag, mutateRequiredRelationshipsEntity({ databaseTypeSql: true }));

    expect(tag.nodejsRequiredRecords).toMatchObject({
      records: [{ name: 'requiredTag', shared: false }],
      references: [{ instance: 'owner', literal: 'profile: { id: (await createRequiredTag()).id }', creating: true }],
    });
  });

  it('should send the values of an entity without required relationships as they are', () => {
    const note = entity('Note');
    mutateData(note, mutateRequiredRelationshipsEntity({ databaseTypeSql: true }));
    expect(note.nodejsRequiredRecords).toEqual({
      records: [],
      references: [],
      anyUser: false,
      anyRequested: false,
      spreads: {},
      createdValues: 'createdValues',
      relatedValues: {},
    });
  });
});
