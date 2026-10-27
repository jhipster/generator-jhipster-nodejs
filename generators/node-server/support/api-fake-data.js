/**
 * The fake values of the fields of an entity as the API exchanges them, the values of the JSON of JHipster Spring Boot,
 * for the tests storing an entity in the database and reading it back.
 */

/** The value of a field in a request and in the response reading it back. */
export const apiFakeValue = field => {
  // An ISO-8601 duration (PT10M), the JSON of a Duration of JHipster Spring Boot.
  if (field.fieldType === 'Duration') return field.generateFakeData('cypress');
  const value = field.generateFakeData('json-serializable');
  // The text of a TextBlob, a String of JHipster Spring Boot: json-serializable gives the base64 of any byte[].
  if (field.fieldTypeBlobContent === 'text' && typeof value === 'string') return Buffer.from(value, 'base64').toString();
  // Seconds without milliseconds: the datetime columns of MySQL do not keep them.
  if (value instanceof Date) return `${value.toISOString().slice(0, 19)}.000Z`;
  return value;
};

/** The content type of a binary blob, like the JHipster clients send it. */
const contentTypeOf = field => (field.fieldTypeBlobContent === 'image' ? 'image/png' : 'application/octet-stream');

/**
 * The values of the fields of an entity in a request (and their content types), and the fields compared approximately:
 * a Float is a single precision number of some databases (MySQL).
 */
export const apiFakeEntity = entity => {
  const values = {};
  for (const field of entity.fields.filter(field => !field.id && !field.transient && !field.autoGenerate)) {
    const value = apiFakeValue(field);
    if (value === undefined || value === null) continue;
    values[field.fieldName] = value;
    if (['byte[]', 'ByteBuffer'].includes(field.fieldType) && field.fieldTypeBlobContent !== 'text') {
      values[`${field.fieldName}ContentType`] = contentTypeOf(field);
    }
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
    if (otherEntity.builtIn) return undefined;
    otherEntity.resetFakerSeed(`nodejs-database-e2e-${entity.entityInstance}-${propertyName}`);
    return apiFakeEntity(otherEntity).values;
  },
});
