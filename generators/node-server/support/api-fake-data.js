/**
 * The fake values of the fields of an entity as the API exchanges them, the values of the JSON of JHipster Spring Boot,
 * for the tests storing an entity in the database and reading it back.
 */

/** The bytes of a binary blob fitted to its minbytes and maxbytes, like the @Size of JHipster Spring Boot validates them. */
const fitBytes = (field, bytes) => {
  const min = field.fieldValidationMinbytes ? Number(field.fieldValidateRulesMinbytes) : 0;
  const max = field.fieldValidationMaxbytes ? Number(field.fieldValidateRulesMaxbytes) : Infinity;
  const size = Math.min(Math.max(bytes.length, min), max);
  return Buffer.from(Array.from({ length: size }, (_, index) => bytes[index % bytes.length] ?? 0));
};

/** A fake value of a field, as the API exchanges it. */
export const apiValue = (field, value) => {
  // The text of a TextBlob, a String of JHipster Spring Boot: json-serializable gives the base64 of any byte[].
  if (field.fieldTypeBlobContent === 'text' && typeof value === 'string') return Buffer.from(value, 'base64').toString();
  // A binary blob within its minbytes and maxbytes: its bytes repeated or cut to fit, base64.
  if (field.fieldTypeBinary && typeof value === 'string' && (field.fieldValidationMinbytes || field.fieldValidationMaxbytes)) {
    return fitBytes(field, Buffer.from(value, 'base64')).toString('base64');
  }
  // Seconds without milliseconds: the datetime columns of MySQL do not keep them.
  if (value instanceof Date) return `${value.toISOString().slice(0, 19)}.000Z`;
  return value;
};

/** The value of a field in a request and in the response reading it back. */
export const apiFakeValue = field => apiValue(field, field.generateFakeData('json-serializable'));

/**
 * The values of the fields of an entity in a request (the content type of a blob one of them), and the fields compared approximately:
 * a Float is a single precision number of some databases (MySQL).
 */
export const apiFakeEntity = entity => {
  const values = {};
  // A generated id is not sent, an id the client gives is.
  for (const field of entity.fields.filter(field => !field.transient && !field.autoGenerate)) {
    const value = apiFakeValue(field);
    if (value === undefined || value === null) continue;
    values[field.fieldName] = value;
  }
  const approximateFields = entity.fields
    .filter(field => field.fieldType === 'Float' && field.fieldName in values)
    .map(field => field.fieldName);
  return { values, approximateFields };
};

/**
 * The mutations of a relationship of an entity: the values of the related record its relationship test of the database
 * end-to-end tests posts, as the API exchanges them, drawn with a seed of that test. JHipster keeps the unique values of a
 * field for the whole generation: the same seed in every test would draw them again, until a unique field is left without
 * one (from the fifth relationship to the same entity).
 */
export const mutateRelatedValues = entity => ({
  __override__: false,
  nodejsRelatedValues: ({ otherEntity, propertyName }) => {
    // An authority of the test: the name is its id, and JHipster has no fake value for it.
    if (otherEntity.builtInAuthority) return { name: `ROLE_${entity.entityInstance}_${propertyName}`.toUpperCase() };
    // A related record the test posts through the REST API of the other entity.
    if (!otherEntity.entityRestLayer) return undefined;
    otherEntity.resetFakerSeed(`nodejs-database-e2e-${entity.entityInstance}-${propertyName}`);
    return apiFakeEntity(otherEntity).values;
  },
});
