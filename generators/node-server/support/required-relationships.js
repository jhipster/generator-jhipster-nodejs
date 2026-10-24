/**
 * The required relationships of the entities, like the @NotNull relationships of JHipster Spring Boot, and the records the
 * end-to-end tests create first for them, like the createEntity methods of its resource tests.
 */

/** The relationships an entity is not stored without: the required ones it stores (its join column or its join table). */
export const requiredRelationships = entity =>
  (entity.persistableRelationships ?? []).filter(relationship => relationship.relationshipRequired);

/**
 * The records the tests of some entities create before storing them, for their required relationships: each record is
 * created after the records it references (records), and each entity references its records (references, by entity
 * instance name). A record is created once for every entity referencing it; a cycle of required relationships, or a required
 * relationship of an entity with itself, is left out, like the entity of the tests (the test gives its own reference).
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
    const record = {
      name: `required${entity.entityClass}`,
      entity,
      user: Boolean(entity.builtInUser),
      references: entity.builtIn ? [] : referencesOf(entity),
    };
    visiting.delete(entity.name);
    records.push(record);
    recordOf.set(entity.name, record);
    return record;
  };

  const referencesOf = entity =>
    requiredRelationships(entity).flatMap(relationship => {
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

/** The TypeScript of the references of the required relationships of an entity, to the records of the tests. */
export const requiredReferencesLiteral = references =>
  references
    .map(
      ({ property, record, id, collection }) =>
        `${property}: ${collection ? `[{ ${id}: ${record}.${id} }]` : `{ ${id}: ${record}.${id} }`}`,
    )
    .join(', ');
