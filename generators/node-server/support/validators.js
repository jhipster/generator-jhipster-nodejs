/** An ISO-8601 duration, like Duration.parse of Java: the pattern of parseDuration (src/common/database/column-transformers.ts). */
const ISO_DURATION = String.raw`/^([-+]?)P(?:([-+]?\d+)D)?(?:T(?:([-+]?\d+)H)?(?:([-+]?\d+)M)?(?:([-+]?)(\d+)(?:[.,](\d{0,9}))?S)?)?$/i`;

/**
 * The class-validator decorators of the type of each field type, like the JSON deserialization of JHipster Spring Boot refuses
 * a value of another type (400), instead of the error of the database or of a column transformer (500): a number, a
 * boolean, a UUID, an ISO-8601 instant, a yyyy-MM-dd date, a HH:mm:ss time or an ISO-8601 duration. A pattern of a type
 * tells it by its context (UNREADABLE), a pattern of the JDL being a validation: a value of another type is a body that
 * is not read, not a validation error (validationException of src/common/errors/problem.exception.ts).
 */
const typeValidators = {
  Integer: ['@IsInt()'],
  Long: ['@IsInt()'],
  Float: ['@IsNumber()'],
  Double: ['@IsNumber()'],
  BigDecimal: ['@IsNumber()'],
  Boolean: ['@IsBoolean()'],
  UUID: ['@IsUUID()'],
  Instant: ['@IsISO8601()'],
  ZonedDateTime: ['@IsISO8601()'],
  LocalDate: [String.raw`@Matches(/^\d{4}-\d{2}-\d{2}$/, UNREADABLE)`, '@IsISO8601({ strict: true })'],
  LocalTime: [String.raw`@Matches(/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/, UNREADABLE)`],
  Duration: [`@Matches(${ISO_DURATION}, UNREADABLE)`],
};

/** A binary blob (not a TextBlob): base64 in JSON, like the byte[] of JHipster Spring Boot. */
const isBinaryBlob = field => field.fieldTypeBinary && field.fieldTypeBlobContent !== 'text';

/**
 * The class-validator decorators of the type of a field: none for a text, a TextBlob or an enum (@IsEnum). A binary blob is
 * base64, the text of another value a body that is not read, like Jackson refuses it.
 */
export const fieldTypeValidators = field => {
  if (field.fieldIsEnum) return [];
  if (isBinaryBlob(field)) return ['@IsBase64({}, UNREADABLE)'];
  return typeValidators[field.fieldType] ?? [];
};

/** A value of another type than each validated field type, which its validators refuse: for the tests of the 400. */
const invalidTypeValues = {
  Integer: 'abc',
  Long: 'abc',
  Float: 'abc',
  Double: 'abc',
  BigDecimal: 'abc',
  Boolean: 'yes',
  UUID: 'not-a-uuid',
  Instant: 'not-an-instant',
  ZonedDateTime: 'not-an-instant',
  LocalDate: '2020-13-45',
  LocalTime: 'eight',
  Duration: '1h',
};

/** A value of another type than the field, which its type validators refuse, or undefined for a field without them. */
export const invalidTypeValue = field => {
  if (fieldTypeValidators(field).length === 0) return undefined;
  return isBinaryBlob(field) ? 'not base64!' : invalidTypeValues[field.fieldType];
};
