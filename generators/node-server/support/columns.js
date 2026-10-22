/** The precision and the scale of a BigDecimal column of JHipster Spring Boot (decimal(21,2)). */
export const bigDecimalPrecision = { precision: 21, scale: 2 };

/**
 * The transformer of the column of a field (src/domain/base/column-transformers.ts), so the API gives the values of the
 * JSON of JHipster Spring Boot whatever the SQL database: undefined when the driver gives them already.
 * - number: a bigint or a decimal, which the PostgreSQL and MySQL drivers give as a string;
 * - duration: the nanoseconds of a bigint column, an ISO-8601 duration (PT1H30M) in the API;
 * - blob: a blob column, which the drivers give as a Buffer, the base64 or text string the API received.
 */
export const columnTransformer = ({ fieldType, nodejsColumnType }) => {
  if (fieldType === 'Duration') return 'duration';
  if (['Long', 'BigDecimal'].includes(fieldType)) return 'number';
  if (nodejsColumnType === 'blob') return 'blob';
  return undefined;
};

/** The validation rules of a field the column of its entity follows: required (not nullable) and unique. */
export const columnRules = field => {
  const rules = field.fieldValidate ? field.fieldValidateRules : [];
  return { required: rules.includes('required'), unique: rules.includes('unique'), maxlength: rules.includes('maxlength') };
};

/**
 * The databases with column types of JHipster Spring Boot better-sqlite3 (dev and test) has not, chosen at runtime by
 * src/domain/base/column-types.ts: the long blobs and texts and the microseconds of MySQL and MariaDB.
 */
const runtimeColumnTypeDatabases = ['mysql', 'mariadb'];

/** Whether the columns of an application get their types at runtime (see runtimeColumnTypeDatabases). */
export const hasRuntimeColumnTypes = ({ databaseTypeSql, prodDatabaseType }) =>
  Boolean(databaseTypeSql) && runtimeColumnTypeDatabases.includes(prodDatabaseType);

/** Whether the column of a field has a type chosen at runtime: a blob, a text, or the precision of an instant. */
const runtimeColumnType = field => ['blob', 'text'].includes(field.nodejsColumnType);
const runtimeDatetimePrecision = field => ['Instant', 'ZonedDateTime'].includes(field.fieldType);

/** The helpers of src/domain/base/column-types.ts the @Column decorator of a field uses. */
export const fieldColumnTypeImports = (field, application) => {
  if (!hasRuntimeColumnTypes(application)) return [];
  return [runtimeColumnType(field) && 'columnType', runtimeDatetimePrecision(field) && 'datetimePrecision'].filter(Boolean);
};

/**
 * The options of the @Column decorator of a field. A MongoDB column has no name: TypeORM writes the documents by the names
 * of the properties and reads them by the names of the columns, so a document would be read without its fields.
 */
export const fieldColumnOptions = (field, application) => {
  const { databaseTypeSql } = application;
  const { required, unique, maxlength } = columnRules(field);
  const runtime = hasRuntimeColumnTypes(application);
  const options = [];
  if (field.nodejsColumnType) {
    options.push(
      runtime && runtimeColumnType(field) ? `type: columnType('${field.nodejsColumnType}')` : `type: '${field.nodejsColumnType}'`,
    );
  }
  if (runtime && runtimeDatetimePrecision(field)) options.push('precision: datetimePrecision()');
  if (databaseTypeSql) options.push(`name: '${field.fieldNameAsDatabaseColumn}'`);
  if (field.fieldIsEnum) {
    options.push(`enum: ${field.fieldType}`);
  } else if (field.fieldType === 'BigDecimal') {
    options.push(`precision: ${bigDecimalPrecision.precision}`, `scale: ${bigDecimalPrecision.scale}`);
  } else if (!['Instant', 'ZonedDateTime', 'LocalDate'].includes(field.fieldType) && maxlength) {
    options.push(`length: ${field.fieldValidateRulesMaxlength}`);
  }
  if (!required) options.push('nullable: true');
  if (unique) options.push('unique: true');
  if (field.nodejsColumnTransformer) options.push(`transformer: ${field.nodejsColumnTransformer}Transformer`);
  return options;
};

/** The options of the @Column decorator of the content type of a binary blob. */
export const contentTypeColumnOptions = (field, { databaseTypeSql }) => {
  const { required } = columnRules(field);
  return [databaseTypeSql && `name: '${field.fieldNameAsDatabaseColumn}_content_type'`, !required && 'nullable: true'].filter(Boolean);
};
