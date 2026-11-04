import { hasCyclicRequiredRelationship, isRequiredRelationship } from 'generator-jhipster/generators/base-application/support';

import { apiFakeEntity } from './api-fake-data.js';

/**
 * The test samples of the entities (e2e/samples), like the test samples of the Angular client of JHipster: a sample of a
 * new record and the references of its required relationships to the stored samples of the other entities, like the
 * createEntity of the resource tests of JHipster Spring Boot. The mutations of the relationships (relationshipDefaults)
 * and of the entities (entityDefaults) the templates render.
 */

/** Whether a relationship is a required one the entity stores, its join column not null. */
const isStoredRequired = relationship => Boolean(isRequiredRelationship(relationship) && relationship.persistableRelationship);

/**
 * Whether the samples store a record for a required relationship: of another entity of the application or the built-in
 * User, the related entities of a cycle of required relationships left out like the createEntity of JHipster Spring Boot.
 */
const isSampleRelationship = relationship =>
  isStoredRequired(relationship) &&
  !hasCyclicRequiredRelationship(relationship.otherEntity) &&
  (relationship.otherEntity.builtInUser || relationship.otherEntity.entityRestLayer);

/** The mutations of a relationship. */
export const mutateRequiredReference = {
  __override__: false,
  // The reference the mocked controller tests send for a required relationship the entity stores, an id of the type of
  // the other entity: the service is a mock, any id of that type.
  nodejsMockReference: relationship => {
    if (!isStoredRequired(relationship)) return undefined;
    const { otherEntity, collection, relationshipName } = relationship;
    const idField = otherEntity.primaryKey.fields[0];
    otherEntity.resetFakerSeed(`nodejs-e2e-mock-${relationshipName}`);
    const reference = `{ ${idField.fieldName}: ${idField.generateFakeData('ts')} }`;
    return collection ? `[${reference}]` : reference;
  },
};

/**
 * The mutations of an entity, delayed until the relationships of the entities are prepared.
 * @param {{ databaseTypeSql?: boolean }} application
 */
export const mutateTestSamples = ({ databaseTypeSql }) => ({
  __override__: false,
  // The test samples of the entity: the values of a new record, the references of its required relationships (the stored
  // sample, a new one for a one-to-one relationship, whose join column is unique, a new user for the built-in User), and
  // the samples of the other entities they import.
  nodejsTestSample: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    entity.resetFakerSeed('nodejs-test-samples');
    const relationships = entity.relationships.filter(isSampleRelationship);
    return {
      values: JSON.stringify(apiFakeEntity(entity).values),
      references: relationships.map(({ propertyName, collection, relationshipOneToOne, otherEntity }) => {
        const id = otherEntity.primaryKey.name;
        const record = otherEntity.builtInUser
          ? 'storeUser(app)'
          : `${otherEntity.entityInstance}Samples.${relationshipOneToOne ? 'storeSample' : 'storedSample'}(app)`;
        const reference = `{ ${id}: (await ${record}).${id} }`;
        return { propertyName, reference: collection ? `[${reference}]` : reference };
      }),
      otherEntities: [...new Set(relationships.map(({ otherEntity }) => otherEntity).filter(otherEntity => !otherEntity.builtInUser))],
      user: relationships.some(({ otherEntity }) => otherEntity.builtInUser),
    };
  },
  // The samples the database end-to-end tests read the required references from: the entity, the related records of its
  // relationship tests (on a SQL database) and the owners of its mappedBy one-to-one relationships.
  nodejsRequiredSamples: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    const related = entity.relationships.filter(
      relationship =>
        relationship.relationshipOneToOne ||
        (databaseTypeSql && (relationship.persistableRelationship || relationship.otherRelationship?.propertyName)),
    );
    const sampleEntities = [...new Set([entity, ...related.map(({ otherEntity }) => otherEntity)])].filter(
      sampleEntity => sampleEntity.entityRestLayer && sampleEntity.relationships.some(isSampleRelationship),
    );
    return {
      entities: sampleEntities.map(({ entityInstance, entityFileName }) => ({ entityInstance, entityFileName })),
      // The spread of the references into the values a test sends.
      spreads: Object.fromEntries(
        sampleEntities.map(({ entityInstance }) => [entityInstance, `, ...(await ${entityInstance}Samples.requiredReferences(app))`]),
      ),
    };
  },
});
