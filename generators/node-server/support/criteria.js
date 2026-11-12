/**
 * The criteria of the lists of the entities, like the filtering of JHipster Spring Boot (`filter` of the JDL,
 * jpaMetamodelFiltering): the properties a request filters on (`name.contains=a&countryId.in=1,2`), their operators and the
 * type of their values (src/common/database/criteria.ts of the server).
 */

/**
 * The kind of a property, its operators like the filters of JHipster Spring Boot (tech.jhipster.service.filter): a
 * StringFilter, a RangeFilter, or a Filter of the other types.
 */
const kindOf = ({
  fieldType,
  fieldTypeCharSequence,
  fieldTypeNumeric,
  fieldTypeTemporal,
  fieldTypeDuration,
  fieldTypeLocalTime,
  fieldTypeBlobContent,
}) => {
  // A UUID is a Filter of JHipster Spring Boot (UUIDFilter), a TextBlob a StringFilter.
  if (fieldType === 'UUID') return 'equality';
  if (fieldTypeCharSequence || fieldTypeBlobContent === 'text') return 'string';
  if (fieldTypeNumeric || fieldTypeTemporal || fieldTypeDuration || fieldTypeLocalTime) return 'range';
  return 'equality';
};

/** The type of the values of a property in the request, validated and converted for the query. */
const valueTypeOf = ({ fieldType, fieldTypeNumeric, fieldTypeBoolean, fieldTypeTimed }) => {
  if (fieldTypeNumeric) return 'number';
  if (fieldTypeBoolean) return 'boolean';
  // An Instant or a ZonedDateTime, a Date of the entity.
  if (fieldTypeTimed) return 'date';
  if (fieldType === 'LocalDate') return 'localDate';
  if (fieldType === 'UUID') return 'uuid';
  return 'string';
};

/**
 * Whether a field is filterable, like the filterableField of JHipster Spring Boot: not a binary blob (a TextBlob is a text),
 * nor transient.
 */
const isFilterableField = field => !field.transient && (!field.fieldTypeBinary || field.fieldTypeBlobContent === 'text');

/**
 * A property of the criteria: its name in the request, the property of the entity declaring it (its @Filterable
 * decorator), the property the query filters (the id of the related record for a relationship), its kind and the type of
 * its values.
 */
const criteriaProperty = (name, { key, property, kind, type, values, approximate }) => ({
  name,
  key,
  property,
  kind,
  type,
  values,
  approximate,
});

/**
 * The properties of the criteria of an entity: its fields, its id and its relationships to one record by the id of the
 * related record (`countryId`), like the criteria of JHipster Spring Boot. The relationships to many records are left out.
 */
const criteriaProperties = entity => {
  const { primaryKey } = entity;
  const idKind = primaryKey.fields[0].fieldTypeNumeric ? 'range' : 'equality';
  const idType = primaryKey.fields[0].fieldTypeNumeric ? 'number' : 'string';
  return [
    criteriaProperty(primaryKey.name, { key: primaryKey.name, property: primaryKey.name, kind: idKind, type: idType }),
    ...entity.fields
      .filter(field => !field.id && isFilterableField(field))
      .map(field =>
        criteriaProperty(field.fieldName, {
          key: field.fieldName,
          property: field.fieldName,
          kind: field.fieldValues ? 'equality' : kindOf(field),
          type: field.fieldValues ? 'string' : valueTypeOf(field),
          // The values of an enum, the ones of its class: another one is a value of another type.
          values: field.fieldValues ? `Object.values(${field.fieldType})` : undefined,
          // A Float is approximate on the databases keeping it in single precision: its tests read no equal value.
          approximate: field.fieldType === 'Float' || undefined,
        }),
      ),
    ...entity.relationships
      .filter(relationship => !relationship.collection)
      .map(relationship => {
        const otherId = relationship.otherEntity.primaryKey;
        const numeric = otherId.fields[0].fieldTypeNumeric;
        return criteriaProperty(`${relationship.relationshipFieldName}Id`, {
          key: relationship.relationshipFieldName,
          property: `${relationship.propertyName}.${otherId.name}`,
          kind: numeric ? 'range' : 'equality',
          type: numeric ? 'number' : 'string',
        });
      }),
  ];
};

/**
 * The mutations of an entity (entityDefaults), delayed until its fields and relationships are prepared.
 * @param {{ databaseTypeSql?: boolean }} application
 */
export const mutateCriteria = ({ databaseTypeSql }) => ({
  __override__: false,
  // The properties of the criteria of the entity, filtered by its lists: with `filter` (jpaMetamodelFiltering), on a SQL
  // database like JHipster Spring Boot.
  nodejsCriteria: (entity, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    if (!databaseTypeSql || !entity.jpaMetamodelFiltering) return undefined;
    const properties = criteriaProperties(entity);
    return {
      // The @Filterable decorator of each property of the entity, by its name.
      decorators: Object.fromEntries(
        properties.map(({ key, kind, type, values }) => [
          key,
          `@Filterable({ kind: '${kind}', type: '${type}'${values ? `, values: ${values}` : ''} })`,
        ]),
      ),
      // The properties the end-to-end tests filter on, by their kind.
      tests: JSON.stringify(
        properties.map(({ name, property, kind, approximate }) => ({ name, property, kind, ...(approximate ? { approximate } : {}) })),
        null,
        2,
      ),
    };
  },
});
