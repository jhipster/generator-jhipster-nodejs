import { hasCyclicRequiredRelationship, isRequiredRelationship } from 'generator-jhipster/generators/base-application/support';

import { apiFakeEntity, apiFakeValue } from './api-fake-data.js';

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

/**
 * The value of a field in the sample number `samples`, for the fields no two records share: the id the client gives and
 * the unique fields. A text keeps its length, a number stays under its maximum, and a value of a pattern is left as it is.
 */
const sampleVariation = (field, value) => {
  const sample = `sampleWithNewData.${field.fieldName}`;
  if (field.fieldValidateRulesPattern) return undefined;
  if (typeof value === 'number') return `${sample} ${field.fieldValidateRulesMax === undefined ? '+' : '-'} samples`;
  return typeof value === 'string' ? `\`\${${sample}.slice(\`\${samples}\`.length)}\${samples}\`` : undefined;
};

/** The fields of a new record of the sample that differ from the records stored before, with their values. */
export const sampleVariations = (entity, values) =>
  entity.fields
    .filter(field => field.fieldName in values && (field.id || field.fieldValidateRules?.includes('unique')))
    .map(field => ({ fieldName: field.fieldName, value: sampleVariation(field, values[field.fieldName]) }))
    .filter(({ value }) => value);

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
    const { values } = apiFakeEntity(entity);
    return {
      values: JSON.stringify(values),
      variations: sampleVariations(entity, values),
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
  // The fake data of the mocked end-to-end tests, reproducible (the faker of the entity is seeded): distinct ids of the type
  // of the primary key, as TypeScript literals, a value for each field as the API exchanges it, an id the pipe of the path
  // rejects (neither a number nor a UUID), the user a partial update sets as the last modifier, and the valid values of the
  // validated fields, for the global ValidationPipe.
  nodejsMockE2e: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    if (!entity.entityRestLayer) return undefined;
    const { faker, fields, primaryKey } = entity;
    const definedValues = (items, name) =>
      items.map(field => [field[name], apiFakeValue(field)]).filter(([, value]) => value !== undefined && value !== null);
    entity.resetFakerSeed('nodejs-e2e-mock');
    const [idField] = primaryKey.fields;
    const [entityId, unknownId, anotherId] = [
      idField.generateFakeData('ts'),
      idField.generateFakeData('ts'),
      idField.generateFakeData('ts'),
    ];
    const fakeFields = definedValues(
      fields.filter(field => !field.id && !field.transient && !field.collection),
      'propertyName',
    );
    const invalidId = faker.lorem.word({ length: { min: 5, max: 10 } });
    const patcher = faker.internet.username();
    entity.resetFakerSeed('nodejs-e2e');
    const validatedFields = fields.filter(field => !field.id && field.fieldValidate && field.fieldType !== 'byte[]');
    return {
      entityId,
      unknownId,
      anotherId,
      fakeFields,
      invalidId,
      patcher,
      validatedFields,
      validValues: Object.fromEntries(definedValues(validatedFields, 'fieldName')),
    };
  },
  // The values of a creation and of an update of the database end-to-end tests, as the API exchanges them.
  nodejsDatabaseE2e: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    if (!entity.entityRestLayer) return undefined;
    entity.resetFakerSeed('nodejs-database-e2e');
    return { created: apiFakeEntity(entity), updated: apiFakeEntity(entity) };
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
