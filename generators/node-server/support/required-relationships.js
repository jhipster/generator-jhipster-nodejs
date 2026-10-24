import { apiFakeEntity } from './api-fake-data.js';

/**
 * The required relationships of the entities, like the @NotNull relationships of JHipster Spring Boot, and the records the
 * end-to-end tests create first for them, like the createEntity methods of its resource tests: the mutations of the
 * relationships (relationshipDefaults) and of the entities (entityDefaults) the templates render.
 */

/** The TypeScript of a value of a test, like the literals of the e2e templates. */
const literal = value => JSON.stringify(value);

/** The TypeScript of the references of the required relationships of an entity to the records of the tests. */
const referencesLiteral = references =>
  references
    .map(
      ({ property, record, id, collection }) =>
        `${property}: ${collection ? `[{ ${id}: ${record}.${id} }]` : `{ ${id}: ${record}.${id} }`}`,
    )
    .join(', ');

/** The mutations of a relationship. */
export const mutateRequiredRelationship = {
  __override__: false,
  // A required relationship the entity stores, its join column not null, like the columnRequired of the Liquibase
  // changelogs of JHipster Spring Boot: the @NotNull relationship of its DTO, the optional = false relationship of its entity.
  columnRequired: ({ relationshipRequired, persistableRelationship }) => Boolean(relationshipRequired && persistableRelationship),
  // The reference the mocked controller tests send for a required relationship, an id of the type of the other entity: the
  // service is a mock, any id of that type.
  nodejsMockReference: ({ columnRequired, collection, otherEntity, relationshipName }) => {
    if (!columnRequired) return undefined;
    const idField = otherEntity.primaryKey.fields[0];
    otherEntity.resetFakerSeed(`nodejs-e2e-mock-${relationshipName}`);
    const reference = `{ ${idField.fieldName}: ${idField.generateFakeData('ts')} }`;
    return collection ? `[${reference}]` : reference;
  },
};

/**
 * The records the tests of some entities create before storing them, for their required relationships: each record is
 * created after the records it references (records), and each entity references its records (references, by entity
 * instance name). A record is created once for every entity referencing it; the entity of the tests is not one (a test
 * gives its own reference), nor an entity of a cycle of required relationships, left out like the JUnit tests of JHipster
 * for its hasCyclicRequiredRelationship (computed after the mutations of the entities, so not read here).
 * @param {any[]} entities the entity of the tests first, then the entities its tests store too
 */
export const requiredRecords = entities => {
  const [tested] = entities;
  const records = [];
  const recordOf = new Map();
  const visiting = new Set([tested.name]);

  const recordFor = entity => {
    if (recordOf.has(entity.name)) return recordOf.get(entity.name);
    if (visiting.has(entity.name) || (entity.builtIn && !entity.builtInUser)) return undefined;
    visiting.add(entity.name);
    const record = { name: `required${entity.entityClass}`, entity, user: Boolean(entity.builtInUser) };
    record.references = entity.builtIn ? [] : referencesOf(entity);
    visiting.delete(entity.name);
    records.push(record);
    recordOf.set(entity.name, record);
    return record;
  };

  const referencesOf = entity =>
    entity.relationships
      .filter(relationship => relationship.columnRequired)
      .flatMap(relationship => {
        const record = recordFor(relationship.otherEntity);
        return record
          ? [
              {
                property: relationship.propertyName,
                record: record.name,
                id: relationship.otherEntity.primaryKey.name,
                collection: relationship.collection,
              },
            ]
          : [];
      });

  const references = Object.fromEntries(
    entities
      .filter((entity, index) => entities.findIndex(other => other.name === entity.name) === index && !entity.builtIn)
      .map(entity => [entity.entityInstance, referencesOf(entity)])
      .filter(([, entityReferences]) => entityReferences.length > 0),
  );
  return { records, references };
};

/**
 * The mutations of an entity of an application: the records its database end-to-end tests create first for the required
 * relationships of the entities they store (the entity, the related records of its relationship tests on a SQL database),
 * as the template renders them, delayed until the relationships of the entities are prepared.
 */
export const mutateRequiredRelationshipsEntity = ({ databaseTypeSql }) => ({
  __override__: false,
  // The required relationships the entity stores (columnRequired).
  nodejsRequiredRelationships: ({ relationships }, { delayMarker }) =>
    delayMarker ?? relationships.filter(relationship => relationship.columnRequired),
  nodejsRequiredRecords: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    const related = databaseTypeSql
      ? entity.relationships
          .filter(
            relationship =>
              relationship.persistableRelationship || (!relationship.otherEntity.builtIn && relationship.otherRelationship?.propertyName),
          )
          .map(relationship => relationship.otherEntity)
      : [];
    const { records, references } = requiredRecords([entity, ...related]);
    const spreads = Object.fromEntries(Object.keys(references).map(instance => [instance, `, ...required.${instance}`]));
    const login = `${entity.entityInstance.toLowerCase()}-required-e2e`;
    return {
      records: records.map(({ name, entity: recordEntity, user, references: recordReferences }) => {
        if (user) return { name, user, login, email: `${login}@localhost` };
        // A seed of the tests of this entity: JHipster keeps the unique values of a field for the whole generation.
        recordEntity.resetFakerSeed(`nodejs-database-e2e-required-${entity.entityInstance}`);
        const { values } = apiFakeEntity(recordEntity);
        return {
          name,
          entityApiUrl: recordEntity.entityApiUrl,
          values,
          body: recordReferences.length > 0 ? `{ ...${literal(values)}, ${referencesLiteral(recordReferences)} }` : literal(values),
        };
      }),
      references: Object.entries(references).map(([instance, entityReferences]) => ({
        instance,
        literal: referencesLiteral(entityReferences),
      })),
      anyUser: records.some(record => record.user),
      // The spread of the references of an entity into the values a test sends, by entity instance name, and the values
      // the tests send with them: the values of the entity, of its related records.
      spreads,
      createdValues: spreads[entity.entityInstance] ? `{ ...createdValues${spreads[entity.entityInstance]} }` : 'createdValues',
      relatedValues: Object.fromEntries(Object.entries(spreads).map(([instance, spread]) => [instance, `{ ...relatedValues${spread} }`])),
    };
  },
});
